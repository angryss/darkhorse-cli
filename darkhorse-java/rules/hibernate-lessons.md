# Hibernate / JPA Lessons Learned

## 1. Never use `@OneToMany @JoinColumn` (unidirectional) with `orphanRemoval = true` on a `NOT NULL` FK

### What happened
`WorkItemTypeConfigEntity` declared a unidirectional `@OneToMany @JoinColumn(name = "config_id")` relationship to `WorkItemTypeEntryEntity`, with `cascade = CascadeType.ALL, orphanRemoval = true`.

Hibernate 6 (Quarkus 3.x) "owns" the FK column via `@JoinColumn`, so it excludes `config_id` from the child's `INSERT` statement. It inserts the child row with `config_id = NULL`, then issues a second `UPDATE` to set the FK. The `NOT NULL` constraint on `config_id` kills the first insert:

```
ERROR: null value in column "config_id" of relation "work_item_type_entries"
       violates not-null constraint
```

### Compound problem with collection replacement
An earlier attempt to fix the above by replacing the collection reference (`entity.setEntries(newList)`) caused a different Hibernate error:

```
HibernateException: A collection with cascade="all-delete-orphan" was no longer
referenced by the owning entity instance
```

Hibernate tracks orphan-removal on the **original** collection object. Replacing the reference (assigning a new `List`) detaches Hibernate's tracking, causing the exception at flush time.

### Fix
Bypass `@OneToMany` collection cascade entirely for write operations. Manage child rows directly via JPQL:

```java
// 1. Ensure parent exists, flush so the parent row is committed before child inserts
em.persist(new ParentEntity(parentId, ...));
em.flush();

// 2. Delete all existing children directly (bypasses orphanRemoval tracking)
em.createQuery("DELETE FROM ChildEntity c WHERE c.parentId = :pid")
  .setParameter("pid", parentId)
  .executeUpdate();

// 3. Persist each child with the FK set explicitly in the constructor
entries.forEach(e -> em.persist(new ChildEntity(UUID.randomUUID(), parentId, ...)));
```

The `@OneToMany` mapping on the parent entity can be kept for **read** purposes (lazy loading via `findByWorkspaceId`) — just never let Hibernate manage child inserts through it.

### Rule for new code
- Do **not** rely on `@OneToMany` cascade for write operations when the child FK is `NOT NULL`.
- Prefer bidirectional `@ManyToOne` on the child (child sets its own FK), or manage children via JPQL delete+insert as shown above.
- If `orphanRemoval = true` is required, always mutate the existing collection **in place** (`clear()` + `addAll()`) — never replace the collection reference.

---

## 2. Flush before inserting children in the same transaction

When persisting a new parent and its children in the same transaction, call `em.flush()` after persisting the parent. Without it, Hibernate may attempt to insert children before the parent row exists, causing FK constraint violations.

```java
em.persist(parentEntity);
em.flush(); // commit parent row before child inserts
children.forEach(c -> em.persist(c));
```

---

## 3. Never use `em.clear()` Inside a JTA Transaction with Agroal

Calling `em.clear()` inside a JTA-managed transaction detaches all entities from the persistence context, including those that Agroal's XA connection enlistment is tracking. Subsequent operations on those entities or their associations throw:

```
ARJUNA016039: onePhaseCommit on ... failed with XAException.XA_RBROLLBACK
Caused by: Enlisted connection used without active transaction
```

**Root cause:** `em.clear()` severs the link between the L1 cache and the active transaction. The connection enlisted by Agroal for the transaction can no longer be found when Hibernate tries to flush.

**Fix:** Replace any pattern using JPQL bulk DELETE + `em.clear()` with `em.remove()` per-entity:

```java
// ❌ BROKEN — em.clear() inside JTA breaks Agroal connection enlistment
em.createQuery("DELETE FROM ChildEntity c WHERE c.parentId = :id")
  .setParameter("id", parentId)
  .executeUpdate();
em.clear(); // ← severs JTA connection tracking

// ✅ CORRECT — remove each entity individually; L1 cache stays consistent
List<ChildEntity> existing = em.createQuery(
    "SELECT c FROM ChildEntity c WHERE c.parentId = :id", ChildEntity.class)
  .setParameter("id", parentId)
  .getResultList();
existing.forEach(em::remove);
```

**Rule:** Never call `em.clear()` inside a `@Transactional` method in any Quarkus microservice. If the L1 cache size is a concern, reduce transaction scope instead.

---

## Normative Rules — ORM and Persistence

> These rules are derived from the lessons above and are **enforceable hard constraints**.

### R-ORM-1: Do Not Replace Managed Collections

Never replace a Hibernate-managed collection with a new `List` or `Set` instance. Hibernate tracks orphan-removal and cascade operations on the **original** collection object. Replacing it causes:

```
HibernateException: A collection with cascade="all-delete-orphan" was no longer
referenced by the owning entity instance
```

**Always mutate the existing collection in place:**

```java
// ✅ CORRECT
entity.getItems().clear();
entity.getItems().addAll(newItems);

// ❌ WRONG
entity.setItems(new ArrayList<>(newItems));  // replaces managed collection
```

### R-ORM-2: Do Not Combine cascade + orphanRemoval + Manual JPQL Deletes

Using `cascade = ALL` and `orphanRemoval = true` on a relationship and then also issuing JPQL `DELETE` statements for the same entities creates conflicting lifecycle management. Hibernate's orphanRemoval expects to manage deletions via collection mutations; JPQL bulk deletes bypass this. The result is unpredictable flush ordering and constraint violations.

Choose exactly ONE approach:
- **Option A:** Use Hibernate collection cascade (`orphanRemoval = true`) — mutate collection in place
- **Option B:** Use explicit JPQL delete/insert — remove `orphanRemoval` and manage lifecycle manually

### R-ORM-3: Control Persistence Lifecycle Explicitly When Using JPQL Delete+Insert

When using the explicit delete/insert pattern (Option B above), the lifecycle must be controlled explicitly:

```java
// 1. Flush parent first (if newly persisted in same tx)
em.persist(parent);
em.flush();

// 2. Delete children via JPQL
em.createQuery("DELETE FROM Child c WHERE c.parentId = :id")
  .setParameter("id", parentId)
  .executeUpdate();

// 3. Persist new children with FK set in constructor
newChildren.forEach(c -> em.persist(new Child(UUID.randomUUID(), parentId, ...)));
// Note: do NOT call em.clear() between steps
```

### R-ORM-4: Never Use em.clear() Inside a JTA Transaction

See Lesson 3 above. This is a hard constraint: `em.clear()` inside `@Transactional` is prohibited in all Quarkus microservices.

### R-ORM-5: Explicit Sequence Generator Names for BIGSERIAL Columns

Hibernate auto-generates a sequence name from the entity and column name (e.g., `entity_name_column_name_seq`). PostgreSQL's BIGSERIAL creates a sequence named `<table>_<column>_seq`. These names will differ unless declared explicitly.

```java
// ✅ CORRECT — matches the actual sequence name created by BIGSERIAL
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "entry_id_seq")
@SequenceGenerator(name = "entry_id_seq", sequenceName = "work_item_type_entries_read_entry_id_seq", allocationSize = 1)
private Long entryId;

// ❌ WRONG — Hibernate guesses the sequence name; may not match BIGSERIAL name
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE)
private Long entryId;
```

**Rule:** Any `@GeneratedValue(strategy = SEQUENCE)` on a column backed by a PostgreSQL BIGSERIAL MUST include an explicit `@SequenceGenerator` with the exact `sequenceName` matching the BIGSERIAL-created sequence.
