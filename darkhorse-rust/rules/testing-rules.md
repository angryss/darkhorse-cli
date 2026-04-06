# Testing Rules — Rust/Tauri Desktop

> Testing strategy and requirements for Dark Horse Rust/Tauri projects.

## Test Organization

| Layer | Test Scope | How to Run | Notes |
|-------|-----------|------------|-------|
| Domain | Pure unit tests | `cargo test -p <prefix>-domain` | No I/O, no mocks needed |
| Application | Unit + mock ports | `cargo test -p <prefix>-application` | Use trait-based mock implementations |
| Infrastructure | Integration | `cargo test -p <prefix>-infrastructure` | In-memory SQLite |
| Desktop | Tauri e2e | Manual or Tauri test driver | Command dispatch verification |

## Domain Tests

Domain tests verify pure business logic:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn project_name_must_not_be_empty() {
        let result = ProjectName::new("");
        assert!(result.is_err());
    }
}
```

Rules:
- No async. No filesystem. No database.
- Test entity invariants, value object validation, domain service logic.
- Place tests in the same file as the code they test (Rust convention).

## Application Tests

Application tests verify command handlers using mock port implementations:

```rust
struct MockProjectRepo { ... }

impl ProjectRepository for MockProjectRepo {
    async fn save(&self, project: &Project) -> Result<(), AppError> {
        Ok(())
    }
}

#[tokio::test]
async fn create_project_stores_in_repository() {
    let repo = MockProjectRepo::new();
    let cmd = CreateProjectCommand { name: "test".into() };
    let result = handle_create_project(cmd, &repo).await;
    assert!(result.is_ok());
}
```

Rules:
- Mock all port traits. Never call real infrastructure.
- Test command validation, handler orchestration, error mapping.

## Infrastructure Tests

Infrastructure tests verify real I/O against controlled environments:

```rust
fn in_memory_db() -> Connection {
    let conn = Connection::open_in_memory().unwrap();
    run_migrations(&conn).unwrap();
    conn
}

#[test]
fn save_and_load_project() {
    let conn = in_memory_db();
    let repo = SqliteProjectRepository::new(conn);
    // ... test persistence round-trip
}
```

Rules:
- Use in-memory SQLite for database tests.
- Clean up temp files after filesystem tests.
- Test migration scripts explicitly.

## Test Naming

Use descriptive test names that read as sentences:

```rust
#[test]
fn project_with_duplicate_name_returns_conflict_error() { ... }

#[test]
fn completed_project_cannot_be_modified() { ... }
```

## Coverage Expectations

- Domain: High coverage (≥90%). Pure logic is easy to test.
- Application: Good coverage (≥80%). Command handlers and orchestration.
- Infrastructure: Reasonable coverage (≥70%). Database operations and I/O.
- Desktop: Lower coverage (≥50%). Tauri command dispatching.
