# AMQP Messaging — Lessons Learned

> Applies to: SmallRye Reactive Messaging (AMQP) channels in microservices, apis (read models), and the BFF.

---

## 1. Extending a Domain Record Breaks All Existing Test Constructors

**Problem:** When a Java `record` is extended with new fields (e.g. `SyncConfig` gained `targetBoardId`, `syncDirection`, `fieldMappings`), every existing call to `new SyncConfig(...)` in tests and production code fails to compile because the canonical constructor signature has changed.

**Solution:** Add a named static factory method for the original 3-field signature (e.g. `SyncConfig.basic(baseUrl, projectKey, extraSettings)`). Update all pre-existing callers — tests included — to use the factory. The factory sets new fields to their defaults (null / enum default / empty list).

**Rule:** When extending a record that has existing consumers, always:
1. Add a backward-compatible static factory before merging.
2. Search for all `new RecordName(` usages across `src/main` and `src/test`.
3. Update every call site before the PR is complete.

---

## 2. BFF Test Profile Must Override Every Declared AMQP Channel

**Problem:** The BFF `@Channel` emitter injection fails at Quarkus test startup if any declared channel is not overridden in `%test.*` properties. The error surfaces as a CDI injection failure, not a configuration error, making it hard to diagnose.

**Observed gap:** `integrations-commands-store-credential` was declared as an `@Channel` emitter but was missing from the BFF `%test` section, which would cause the entire test suite to fail at container startup.

**Rule:** Every `mp.messaging.outgoing.<channel-name>.connector=smallrye-amqp` and `mp.messaging.incoming.<channel-name>.connector=smallrye-amqp` entry must have a corresponding `%test.<channel-name>.connector=smallrye-in-memory` override. When adding a new channel, add the test override in the same commit.

**Checklist when adding a new AMQP channel:**
- [ ] Add `mp.messaging.outgoing.<channel>.connector=smallrye-amqp` + `.address=...` (service or BFF)
- [ ] Add `%test.mp.messaging.outgoing.<channel>.connector=smallrye-in-memory` (BFF or service)
- [ ] Add `mp.messaging.incoming.<channel>.connector=smallrye-amqp` + `.address=...` (listener side)
- [ ] Add `%test.mp.messaging.incoming.<channel>.connector=smallrye-in-memory` (listener side)

---

## 3. Channel Naming Convention

Channels follow a consistent naming pattern. Deviating from it causes silent address mismatches between BFF emitters and service listeners.

| Side | Pattern | Example |
|------|---------|---------|
| BFF outgoing channel name | `{context}-commands-{verb}` | `integrations-commands-configure-field-mappings` |
| BFF outgoing address | `{context}.commands.{verb}` | `integrations.commands.configure-field-mappings` |
| Service incoming channel name | `{context}-{verb}` (no "commands-") | `integrations-configure-field-mappings` |
| Service incoming address | `{context}.commands.{verb}` (must match BFF) | `integrations.commands.configure-field-mappings` |
| Reply outgoing (service) | `{context}-replies` | `integrations-replies` |
| Reply incoming (BFF) | `{context}-replies` | `integrations-replies` |
| Events outgoing (service) | `{context}-events` | `integrations-events` |
| Events incoming (read model API) | `{context}-events` | `integrations-events` |

**Address must match exactly** — the address is the AMQP queue/topic name on the broker. Channel name is only the SmallRye logical identifier.

---

## 4. Command Endpoints Must Be Placed in the Commands Section

**Problem:** During code generation, a new `PUT` command endpoint (`configureFieldMappings`) was placed under the `// ── Queries ──` code section in `ExternalSourceResource.java` because it followed a pattern similar to updates.

**Rule:** Section markers in BFF resources are structural contracts:
- `// ── Commands ──` — dispatch to AMQP, return `202 No Content` or `201 Created`
- `// ── Queries ──` — call downstream read API, return `200 OK` with body

A PUT that dispatches a command belongs in Commands, not Queries, regardless of HTTP verb.

---

## 5. JSONB in H2 Test Mode

**Problem:** PostgreSQL `JSONB` columns are not supported by H2 even in `MODE=PostgreSQL`.

**Solution:** Declare `columnDefinition = "text"` on the JPA `@Column` annotation. Postgres accepts text-to-jsonb coercion transparently; H2 stores it as plain text. Use a Jackson `AttributeConverter` to serialize/deserialize:

```java
@Convert(converter = FieldMappingJsonConverter.class)
@Column(columnDefinition = "text")
private List<FieldMapping> fieldMappings;
```

**Rule:** Any `JSONB` column added in a Flyway migration must:
1. Use `text` as the SQL column type in the migration (H2 doesn't support `JSONB` DDL at all)
2. Use separate `ALTER TABLE ... ADD COLUMN` statements — H2 does NOT support multiple `ADD COLUMN` clauses in a single `ALTER TABLE` (e.g. `ADD COLUMN a ..., ADD COLUMN b ...`)
3. Never use `@Column(columnDefinition = "jsonb")` — it will break H2 tests

```sql
-- WRONG (multi-column ALTER fails in H2):
ALTER TABLE t ADD COLUMN a UUID, ADD COLUMN b text;

-- CORRECT (separate statements):
ALTER TABLE t ADD COLUMN a UUID;
ALTER TABLE t ADD COLUMN b text NOT NULL DEFAULT '[]';
```

---

## 6. Read Model Must Not Import Domain Value Objects From Write Side

**Problem:** The read model API (`integrations-api`) and the microservice (`integrations-service`) are separate Maven modules. Importing `FieldMapping` (a domain VO) from the service into the read model creates an illegal cross-module dependency.

**Solution:** Use `List<Map<String, Object>>` raw maps in the read model entity and converter. The event payload already carries field mapping data as plain maps (serialized by the event publisher). The read model stores and returns them as-is.

**Rule:** Read model APIs (archetype: `api`) must NEVER import classes from a sibling microservice. They may only depend on their own domain and shared library modules.

---

## 7. BFF JAX-RS Resources Must Have Class-Level `@Path` to Avoid CDI Unused Bean Removal

**Problem:** A BFF resource class (`ExternalSourceResource`) was created without a class-level `@Path` annotation. Quarkus's CDI bean removal (`quarkus.arc.remove-unused-beans=all` by default) removes any `@ApplicationScoped` bean that has no reachable injection points. Without `@Path`, the resource is NOT a JAX-RS root resource, so its `@Inject` fields don't count as injection points. As a result, `IntegrationsAmqpCommandSender` was removed, and `@InjectMock IIntegrationsCommandSender` in tests failed with "could not resolve the bean of type".

**Observed error:**
```
java.lang.IllegalStateException: Invalid use of io.quarkus.test.InjectMock -
could not resolve the bean of type: IIntegrationsCommandSender.
```

**Fix:** Add `@Path("/")` at class level. All existing method-level `@Path` annotations remain unchanged.

**Rule:** Every BFF JAX-RS resource class **must** have `@Path("/")` at class level (or a more specific path prefix). Without it:
1. The class is not a JAX-RS root resource
2. Its injected dependencies are never discovered
3. Those dependencies are removed as unused beans
4. `@InjectMock` fails silently in tests and the endpoints may not be registered in production

**Checklist when creating a new BFF resource:**
- [ ] Add `@Path("/")` (or specific prefix) at class level
- [ ] Add `@Blocking`, `@Produces`, `@Consumes` at class level
- [ ] Verify the resource appears in Quarkus dev console endpoint list after startup

---

## 8. @Transactional Must Be on the @Blocking Listener Method, Not Only on the Handler

**Problem:** `@Transactional` on a command handler (CDI subclass) called from a `@Blocking` reactive messaging listener is intermittently unreliable. The `XAResource` commit throws `Enlisted connection used without active transaction` because the JTA interceptor fires inside a nested CDI proxy invocation after the blocking thread boundary — the transaction is not guaranteed to be active at commit time.

**Observed error:**
```
ARJUNA016039: onePhaseCommit ... failed with exception XAException.XA_RBROLLBACK:
  Enlisted connection used without active transaction
Caused by: jakarta.transaction.RollbackException: Could not commit transaction.
```

**Fix:** Add `@Transactional` directly to the `@Blocking` listener method. The handler's own `@Transactional(REQUIRED)` will join the already-active transaction (no nested transaction is created).

```java
@Incoming("project-create-board")
@Blocking
@Transactional          // ← transaction starts here, at the entry point
public void onCreateBoard(Map<String, Object> body) {
    createBoardHandler.handle(cmd); // handler's @Transactional joins existing tx
}
```

**Rule:** Every `@Blocking` + `@Incoming` listener method in every microservice **must** carry `@Transactional`. This applies to all services: project, workspace, identity, planning, integrations, people. When adding a new listener method, always include `@Transactional`.

**Checklist when adding a new @Blocking listener method:**
- [ ] `@Transactional` annotation present on the listener method
- [ ] `import jakarta.transaction.Transactional;` present in the file
- [ ] Handler's own `@Transactional` retained (it will use `REQUIRED` propagation and join)

---

## 9. New Channels and Env Vars Must Be Wired in Deployment Artifacts in the Same PR

**Problem (MVP 1.4 post-review):** Several deployment gaps were found after MVP 1.4 was fully implemented:

1. **BFF `IntegrationsAmqpCommandSender`** was missing `@Channel` emitter injections and `resolveEmitter` switch cases for `retry-sync-job` (REQ-1.4-008) and `configure-polling-interval` (REQ-1.4-009). These would throw `IllegalArgumentException` at runtime for those endpoints.
2. **BFF `application.properties`** was missing the `integrations-commands-retry-sync-job` outgoing AMQP config (main profile) and was missing `configure-type-config`, `store-workspace-credential`, and `retry-sync-job` from the `%test` in-memory overrides.
3. **`docker-compose.yml`** `integrations-service` environment block was missing `INTEGRATIONS_ENCRYPTION_KEY`, meaning credential encryption would silently fall back to the hardcoded default even in "production-like" docker compose runs.
4. **`.env.example` and `.env`** had no mention of `INTEGRATIONS_ENCRYPTION_KEY`, leaving operators unaware the variable must be changed before exposing outside localhost.

**Root cause:** Implementation tasks focused on application code; deployment wiring was treated as an afterthought rather than part of the same task.

**Rule:** When any implementation task introduces a new AMQP command channel OR a new env var:

| Artifact | Required update |
|----------|----------------|
| `IntegrationsAmqpCommandSender.java` | Add `@Channel` emitter field + `resolveEmitter` switch case |
| `bffs/application.properties` (main) | Add `mp.messaging.outgoing.<channel>.*` lines |
| `bffs/application.properties` (test) | Add `%test.mp.messaging.outgoing.<channel>.connector=smallrye-in-memory` |
| `microservices/<service>/application.properties` (main) | Add `mp.messaging.incoming.<channel>.*` lines |
| `microservices/<service>/application.properties` (test) | Add `%test.mp.messaging.incoming.<channel>.connector=smallrye-in-memory` |
| `deployment/docker-compose.yml` | Add env var to the service's `environment:` block using `${VAR:-default}` syntax |
| `deployment/.env.example` | Document the var with a safe default and a comment explaining when/how to change it |
| `deployment/.env` | Mirror the `.env.example` entry so the local dev stack starts cleanly |

**Checklist when adding a new AMQP command channel to the BFF:**
- [ ] `@Channel` emitter field added to `IntegrationsAmqpCommandSender` (or equivalent sender)
- [ ] `resolveEmitter` switch case added
- [ ] Main channel config added to `application.properties`
- [ ] Test profile override added to `application.properties`
- [ ] `docker-compose.yml` service env block updated if any new env var is introduced
- [ ] `.env.example` updated with documentation
- [ ] `.env` updated to mirror `.env.example`

**Checklist when adding a new sensitive env var (encryption key, secret, API key):**
- [ ] Env var has a clearly labelled insecure dev-only default in `application.properties` (`${VAR:dev-fallback}`)
- [ ] `docker-compose.yml` passes the var through from compose env (`${VAR:-dev-fallback}`)
- [ ] `.env.example` documents the var with a comment that it MUST be changed before exposing outside localhost
- [ ] `.env` has the var so `docker compose up` works out of the box without manual edits

---

## 10. Fanout Event Exchange: Shared AMQP Queue Causes Round-Robin Message Loss

**Problem (MVP 1.4 — "board created but never shows in UI"):** Multiple services subscribed to the same AMQP queue name (e.g. `project.events`) causes RabbitMQ to round-robin messages across all consumers. Only 1 of N services receives each event, so the read-model projector in `project-api` misses ~75% of `BoardCreatedEvent` messages.

**Example:** `project.events` queue had 4 consumers:
- `project-api` (BoardEventListener)
- `planning-service`
- `planning-api`
- `integrations-service`

Only 1 in 4 board creations was reflected in the read model.

**Fix:** Replace shared queues with **fanout exchanges + dedicated per-service queues**:
1. Create a fanout exchange named `project.events` (durable, non-auto-delete).
2. Create one dedicated queue per consumer, e.g. `project.events.project-api`, `project.events.planning-service`, etc. — declare as **durable=false** (matches SmallRye's auto-declare default).
3. Add exchange-to-queue bindings (empty routing key for fanout).
4. Update consumer `address` in `application.properties` to the dedicated queue name.
5. Update publisher `address` to `/exchange/project.events` (see Lesson 11).
6. Persist the exchange/queue/binding configuration in `deployment/rabbitmq/definitions.json`.

**Rule:** Any time two or more services need the same domain events, a fanout exchange is mandatory. Never share a single AMQP queue between multiple consumer services.

---

## 11. AMQP 1.0 Publisher Address Must Use `/exchange/` Prefix to Route Through a Named Exchange

**Problem:** After setting up the `project.events` fanout exchange, project-service was still publishing to a queue named `project.events` instead of the exchange. With bare address `project.events`, RabbitMQ AMQP 1.0 routes through the default exchange with routing key `project.events` — which delivers only to a queue with that exact name. If no queue exists with that name, messages are silently dropped.

**Root cause:** RabbitMQ AMQP 1.0 address resolution:
- `project.events` (bare) → default exchange, routing key `project.events` → queue named `project.events`
- `/exchange/project.events` → named fanout exchange `project.events` → all bound queues

**Fix:** Set the publisher address to `/exchange/<exchange-name>`:
```properties
# project-service application.properties
mp.messaging.outgoing.project-events.address=/exchange/project.events
```
Or override in docker-compose.yml without rebuilding:
```yaml
environment:
  MP_MESSAGING_OUTGOING_PROJECT_EVENTS_ADDRESS: /exchange/project.events
```

**Rule:** Any outgoing SmallRye AMQP channel that targets a named RabbitMQ exchange must use `/exchange/<name>` as the address. Bare exchange names only work if no queue with the same name exists.

---

## 12. RabbitMQ `load_definitions` (Management Plugin) Replaces ALL Users If Users Section Is Absent

**Problem:** After creating `deployment/rabbitmq/definitions.json` and configuring RabbitMQ to load it via `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS: -rabbitmq_management load_definitions "..."`, on next RabbitMQ restart the `guest` user was deleted. All services lost AMQP connectivity with `PLAIN login refused: user 'guest' - invalid credentials`.

**Root cause:** The management plugin's `load_definitions` replaces the entire management configuration, including users. If the definitions file has no `users` section, all existing users are removed.

**Fix:** Always include a `users` and `permissions` section in `definitions.json`:
```json
{
  "users": [
    {
      "name": "guest",
      "password_hash": "<hash-from-rabbitmqctl-export>",
      "hashing_algorithm": "rabbit_password_hashing_sha256",
      "tags": ["administrator"]
    }
  ],
  "permissions": [
    {"user": "guest", "vhost": "/", "configure": ".*", "write": ".*", "read": ".*"}
  ],
  ...
}
```

**How to get the password hash:** After setting up a user with `rabbitmqctl add_user`, export via:
```
GET http://localhost:15672/api/users  # returns password_hash and hashing_algorithm
```

**Rule:** Every `definitions.json` used with `load_definitions` must include all users that need to exist. The file fully replaces the management database on load. Treat it as the source of truth for all RabbitMQ configuration.

---

## 13. SmallRye AMQP Channels Fail-Stop on Unhandled Exceptions

**Problem:** When a test message was published via the RabbitMQ HTTP management API (for debugging), it arrived as `io.vertx.core.json.JsonObject` instead of `Map<String, Object>`. The consumer method (`BoardEventListener#onEvent`) expected `Map<String, Object>`, causing a `ClassCastException`. SmallRye's fail-stop behavior then closed the entire AMQP channel permanently.

```
SRMSG16219: A message sent to channel `project-events` has been nacked,
  rejecting the AMQP message and fail-stop
```
After this, no further events were delivered until the service was restarted.

**Root cause:** The RabbitMQ HTTP management API sends messages using a different AMQP encoding than the SmallRye Quarkus publisher. Messages sent via `POST /api/exchanges/.../publish` arrive as `JsonObject`, not a `Map`.

**Two rules:**
1. Never use the RabbitMQ management HTTP API to test AMQP consumers. Use the actual producing service instead (e.g. call the BFF endpoint), or write a dedicated test.
2. If a fail-stop occurs, restart the affected service. The channel will NOT self-heal.

---

## Normative Rules — Message and Event Architecture

> These rules are derived from the lessons above and are **enforceable hard constraints**, not guidelines. Violations are architecture defects.

### R-MSG-1: Publish to Exchanges, Never to Direct Queues

Services MUST publish integration events to **named fanout exchanges**, not directly to queues. Publishing to a bare queue name bypasses the fanout topology and delivers to at most one consumer.

```
✅ publisher address: /exchange/project.events
❌ publisher address: project.events  (routes to queue, not exchange)
```

### R-MSG-2: Every Consumer Has Its Own Dedicated Queue

Each service that consumes an integration event type MUST have its own queue bound to the fanout exchange. Sharing a queue with another service causes round-robin message theft — only one service receives each event.

```
✅ project.events.project-api        (project-api gets every event)
✅ project.events.planning-service   (planning-service gets every event)
❌ project.events                    (shared — only 1 of N services gets each event)
```

### R-MSG-3: Missing Binding Is an Architecture Defect, Not a Timing Issue

If a service does not receive events it is supposed to consume, the first diagnosis is: **check whether the queue exists and is bound to the exchange**. This is never a timing issue. Do not add retries as a workaround — add the missing binding.

### R-MSG-4: Do Not Fix Messaging Failures With Retries

Messaging topology failures (missing exchange, wrong address, missing binding, round-robin theft) must be fixed by correcting the topology. Retries do not fix structural problems — they only delay the discovery of the root cause.

| Symptom | Root Cause | Correct Fix |
|---------|-----------|-------------|
| Service never receives events | Missing queue or binding | Add queue + binding to definitions.json |
| Only some events are received | Shared queue (round-robin) | Switch to fanout exchange + dedicated queue |
| Events silently dropped | Wrong publisher address (bare name) | Change to `/exchange/<name>` |
| Consumer disconnects on startup | Queue declared `durable:true` mismatches SmallRye auto-declare | Set `durable:false` in definitions.json |

### R-MSG-5: Test Profile Must Mirror Production Channel Configuration

Every production AMQP channel declaration must have a corresponding `%test.*` in-memory override. Omitting a test override causes CDI injection failure at test container startup — not a runtime messaging error. Add both declarations in the same commit.

### R-MSG-6: Deployment Artifacts Are Part of the Change

Introducing a new channel is incomplete until the following artifacts are updated in the same PR:
- `application.properties` (main + test profile) for publisher and consumer
- `deployment/rabbitmq/definitions.json` (exchange, queue, binding)
- `deployment/docker-compose.yml` (env vars if address is externalized)

A channel that works in isolation but breaks in Docker Compose is not delivered.
