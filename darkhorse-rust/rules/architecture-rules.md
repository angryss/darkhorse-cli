# Architecture Rules — Rust/Tauri Desktop

> Mandatory architecture rules for all Dark Horse Rust/Tauri projects.

## Rule 1: Clean Architecture — 4-Layer Crate Model

Every generated project uses a Cargo workspace with four crates:

| Layer | Crate | Depends On | Responsibility |
|-------|-------|-----------|----------------|
| Domain | `<prefix>-domain` | None | Entities, value objects, policies, domain services |
| Application | `<prefix>-application` | Domain | Commands, handlers, port traits, orchestration |
| Infrastructure | `<prefix>-infrastructure` | Domain, Application | SQLite, filesystem, settings, logging |
| Desktop | `<prefix>-desktop` | All three above + Tauri | Tauri host, command bridge, state, plugins |

### Dependency Rule

Dependencies flow **inward only**: Desktop → Infrastructure → Application → Domain.

No crate may depend on a crate in an outer layer. The domain crate has **zero** dependencies on other project crates.

## Rule 2: Domain Purity

The domain crate:

- Contains **only** entities, value objects, policies, and domain services.
- Has **no** dependencies on infrastructure, Tauri, or any I/O library.
- Allowed external crates: `serde`, `chrono`, `uuid`, `thiserror`.
- All logic is synchronous and pure where possible.
- Error types use `thiserror` for strongly typed domain errors.

## Rule 3: Port-Adapter Pattern

The application crate defines **port traits** (interfaces) for everything it needs from infrastructure:

```rust
// In application/src/ports/
pub trait ProjectRepository: Send + Sync {
    async fn find_by_id(&self, id: Uuid) -> Result<Project, AppError>;
    async fn save(&self, project: &Project) -> Result<(), AppError>;
}
```

The infrastructure crate **implements** these traits:

```rust
// In infrastructure/src/database/
impl ProjectRepository for SqliteProjectRepository {
    async fn find_by_id(&self, id: Uuid) -> Result<Project, AppError> { ... }
    async fn save(&self, project: &Project) -> Result<(), AppError> { ... }
}
```

## Rule 4: Command-Oriented Flow

All user-initiated actions go through application commands:

1. **Frontend** sends a Tauri IPC call
2. **Desktop crate** receives the Tauri command, constructs an application command
3. **Application crate** handles the command using domain logic and port calls
4. **Response** flows back through the same path

No event-driven architecture by default. Commands are request-response.

```rust
// Application command
pub struct CreateProjectCommand {
    pub name: String,
    pub description: String,
}

// Handler uses port traits — never infrastructure directly
pub async fn handle_create_project(
    cmd: CreateProjectCommand,
    repo: &dyn ProjectRepository,
) -> Result<ProjectId, AppError> { ... }
```

## Rule 5: Local-First Persistence

- **SQLite** via `rusqlite` with WAL mode for concurrent reads.
- Database file lives in the application data directory.
- Migrations are embedded in the infrastructure crate and run at startup.
- No ORM. Write SQL directly with `rusqlite`.
- Filesystem operations for artifact/document storage.

## Rule 6: Tauri Commands Are Thin

Tauri `#[tauri::command]` functions in the desktop crate are **thin wrappers**:

```rust
#[tauri::command]
async fn create_project(state: State<'_, AppState>, name: String) -> Result<ProjectId, String> {
    let cmd = CreateProjectCommand { name, description: String::new() };
    handle_create_project(cmd, &*state.repo)
        .await
        .map_err(|e| e.to_string())
}
```

No business logic in Tauri commands. They validate input format, dispatch to the application layer, and map errors for the frontend.

## Rule 7: Error Handling

- Domain errors: `thiserror` enums in `errors.rs`
- Application errors: `thiserror` enums that wrap domain errors + add application-level variants
- Infrastructure errors: `thiserror` or `anyhow` for I/O failures
- Desktop errors: Map application errors to Tauri-friendly strings/JSON

Never use `unwrap()` or `expect()` in production code paths. Reserve them for truly impossible states (with a comment explaining why).

## Rule 8: Testing Strategy

| Layer | Test Type | Location |
|-------|-----------|----------|
| Domain | Unit tests | `#[cfg(test)]` in domain crate |
| Application | Unit + integration | `#[cfg(test)]` with mock port implementations |
| Infrastructure | Integration | `#[cfg(test)]` with in-memory SQLite |
| Desktop | E2E (manual/Tauri test) | Separate test harness or manual |

Domain and application tests must not require I/O. Use trait-based mocks for ports.
