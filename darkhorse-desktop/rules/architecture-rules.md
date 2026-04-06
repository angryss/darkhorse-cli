# Architecture Rules (v1.0)

**Mandatory architectural rules for all Tauri desktop development.**

> **Clean Architecture First**: All architecture decisions must respect layered, inside-out design principles.

---

## Rule 1: Clean Architecture Layers

**Dependency Rule**: Dependencies always point inward. Domain is the core and has ZERO outward dependencies.

```
┌──────────────────────────────────────────┐
│           Desktop Shell (Tauri)           │
│  ┌────────────────────────────────────┐  │
│  │       Infrastructure Layer         │  │
│  │  ┌──────────────────────────────┐  │  │
│  │  │     Application Layer        │  │  │
│  │  │  ┌────────────────────────┐  │  │  │
│  │  │  │   Domain Layer (CORE)  │  │  │  │
│  │  │  └────────────────────────┘  │  │  │
│  │  └──────────────────────────────┘  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### Rust Crate Mapping

| Layer | Crate | Depends On |
|-------|-------|------------|
| **Domain** | `<prefix>-domain` | **NONE** — zero crate dependencies (only std + serde/chrono/uuid/thiserror) |
| **Application** | `<prefix>-application` | Domain |
| **Infrastructure** | `<prefix>-infrastructure` | Application, Domain |
| **Desktop Shell** | `<prefix>-desktop` | All crates + Tauri + plugins |

### Violations to Prevent

- Domain depending on any other crate
- Application depending on Infrastructure
- Business logic in Tauri bridge commands
- Direct SQLite access from Desktop Shell (go through application commands)
- Framework dependencies in Domain (no Tauri types, no rusqlite)
- Infrastructure types leaking into Domain

---

## Rule 2: Ubiquitous Language

### Enforcement

| Location | Language Usage |
|----------|----------------|
| **Domain Layer** | Entity names, method names, errors MUST use domain terms |
| **Application Layer** | Commands and handlers use domain vocabulary |
| **Bridge Commands** | Tauri command names reflect domain language |
| **Database** | Table/column names align with domain terms |
| **Frontend** | Page names, labels, and IPC calls use domain terms |

### Examples

```
✅ CORRECT (Ubiquitous Language):
   - project.transition_status(InProgress)
   - CreatePhotobookCommand
   - "create_photobook" (Tauri command)

❌ WRONG (Technical/Generic Terms):
   - project.update_field("status", "active")
   - InsertRecordCommand
   - "insert_record" (Tauri command)
```

---

## Rule 3: CQRS Pattern (Tauri Commands)

### Commands (Writes)
- Defined in Application layer
- Modify state through domain entities
- Return result or ID
- Use domain language: `CreatePhotobookCommand`, not `InsertPhotobookCommand`

### Queries (Reads)
- Defined in Application layer
- Return data (DTOs or domain summaries)
- MUST NOT modify state
- Query names reflect domain intent: `ListActiveProjectsQuery`, not `SelectProjectsWhereActive`

### Bridge Commands (Desktop Shell)
- Thin wrappers that deserialize Tauri args → call application commands → serialize results
- MUST NOT contain business logic
- MUST NOT access infrastructure directly

---

## Rule 4: Repository Pattern

- Define port traits in Application layer
- Implement in Infrastructure layer
- Traits work with domain entities, not database rows
- One repository per Aggregate Root (not per table)

---

## Rule 5: SOLID Principles

| Principle | Requirement |
|-----------|-------------|
| **S**ingle Responsibility | One reason to change per struct/module |
| **O**pen/Closed | Open for extension, closed for modification |
| **L**iskov Substitution | Trait implementations must be substitutable |
| **I**nterface Segregation | Specific traits over general |
| **D**ependency Inversion | Depend on traits (ports in Application, implementations in Infrastructure) |

---

## Rule 6: Error Handling

### Layer-Specific Errors

| Layer | Error Type | Purpose |
|-------|-----------|---------|
| Domain | `DomainError` | Business rule violations, invalid state transitions |
| Application | `AppError` | Use case failures wrapping domain errors |
| Infrastructure | `InfraError` | Database, filesystem, serialization failures |
| Desktop Shell | `String` | Tauri bridge maps AppError to String for frontend |

### Error Flow

```
Domain → DomainError
  ↑ wrapped by
Application → AppError
  ↑ wrapped by
Infrastructure → InfraError → AppError
  ↑ mapped to
Desktop Shell → String (for Tauri IPC)
```

---

## Rule 7: SQLite Patterns

- WAL mode for concurrent read/write
- Foreign keys enforced (`PRAGMA foreign_keys=ON`)
- Embedded migrations via `include_str!`
- Sequential migration numbering: `001_`, `002_`, etc.
- Connection wrapped in `Mutex<Connection>` for thread safety

---

## Rule 8: Frontend Patterns

- Pages are render functions returning HTML strings
- Tauri IPC via typed `invoke()` wrapper
- CSS custom properties for theming (no hardcoded colors)
- Dev-mock fallback when running outside Tauri

---

## Rule 9: Module Organization

Each bounded context gets its own module within each crate:

```
crates/<prefix>-domain/src/
├── <context_a>/
│   ├── mod.rs
│   ├── entities.rs
│   ├── values.rs
│   └── errors.rs
├── <context_b>/
│   └── ...
├── errors.rs          # Shared domain errors
├── services.rs        # Cross-context domain services
└── lib.rs
```

No cross-context imports within the same layer. If contexts need to communicate, define an explicit integration point.

---

*Rule Version: 1.0 — Tauri 2 + Rust Desktop*
