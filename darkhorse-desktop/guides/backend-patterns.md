# Backend Patterns Guide

**Architecture and implementation patterns for Rust + Tauri desktop backend development.**

---

## Clean Architecture (Onion Architecture)

### Layer Structure

```
Infrastructure ──→ Application ──→ Domain
     ↓                  ↑
Desktop Shell ─────────┘
```

**Dependency Rule**: Outer layers depend on inner layers ONLY. Domain has ZERO dependencies on other crates.

### Rust Crate Mapping

| Layer | Crate | Dependencies |
|-------|-------|--------------|
| **Domain** | `<prefix>-domain` | NONE (only std + serde/chrono/uuid) |
| **Application** | `<prefix>-application` | Domain |
| **Infrastructure** | `<prefix>-infrastructure` | Application, Domain |
| **Desktop Shell** | `<prefix>-desktop` | All crates + Tauri |

---

## CQRS Pattern (Tauri Commands)

### Command (Write Path)

```rust
// Application layer — command definition
pub struct CreateProjectCommand {
    pub name: String,
    pub description: Option<String>,
}

// Application layer — command handler
pub fn handle_create_project(
    repo: &dyn ProjectRepository,
    cmd: CreateProjectCommand,
) -> Result<String, AppError> {
    let project = Project::new(cmd.name, cmd.description);
    repo.save(&project)?;
    Ok(project.id.to_string())
}
```

### Query (Read Path)

```rust
// Application layer — query
pub fn handle_list_projects(
    repo: &dyn ProjectRepository,
) -> Result<Vec<ProjectSummary>, AppError> {
    repo.find_all()
}
```

### Bridge Layer (Desktop Shell)

```rust
// Desktop shell — Tauri bridge command
#[tauri::command]
pub fn create_project(
    state: tauri::State<'_, AppState>,
    name: String,
    description: Option<String>,
) -> Result<String, String> {
    let cmd = CreateProjectCommand { name, description };
    handle_create_project(&*state.project_repo, cmd)
        .map_err(|e| e.to_string())
}
```

---

## Repository Pattern

### Trait (Domain / Application Layer)

```rust
// Port trait — defined in application, depends on domain types
pub trait ProjectRepository: Send + Sync {
    fn save(&self, project: &Project) -> Result<(), AppError>;
    fn find_by_id(&self, id: &str) -> Result<Option<Project>, AppError>;
    fn find_all(&self) -> Result<Vec<ProjectSummary>, AppError>;
    fn delete(&self, id: &str) -> Result<(), AppError>;
}
```

### Implementation (Infrastructure Layer)

```rust
// SQLite implementation — infrastructure layer
pub struct SqliteProjectRepo {
    conn: Arc<DbConnection>,
}

impl ProjectRepository for SqliteProjectRepo {
    fn save(&self, project: &Project) -> Result<(), AppError> {
        self.conn.with_conn(|conn| {
            conn.execute(
                "INSERT INTO projects (id, name, description, status, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)
                 ON CONFLICT(id) DO UPDATE SET name=?2, description=?3, status=?4, updated_at=?6",
                params![project.id, project.name, project.description,
                        project.status.as_str(), project.created_at, project.updated_at],
            )?;
            Ok(())
        }).map_err(|e| AppError::Persistence(e.to_string()))
    }
}
```

---

## Entity Design

### Aggregate Root

```rust
// Domain layer — entity with behavior
pub struct Project {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub status: ProjectStatus,
    pub created_at: String,
    pub updated_at: String,
}

impl Project {
    pub fn new(name: String, description: Option<String>) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            description,
            status: ProjectStatus::Draft,
            created_at: now.clone(),
            updated_at: now,
        }
    }

    pub fn transition_status(&mut self, new_status: ProjectStatus) -> Result<(), DomainError> {
        if !self.status.can_transition_to(&new_status) {
            return Err(DomainError::InvalidStateTransition {
                from: self.status.as_str().to_string(),
                to: new_status.as_str().to_string(),
            });
        }
        self.status = new_status;
        self.updated_at = chrono::Utc::now().to_rfc3339();
        Ok(())
    }
}
```

### Value Object

```rust
// Domain layer — immutable value
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ProjectStatus {
    Draft,
    InProgress,
    ReadyToExport,
    Exported,
    Archived,
}

impl ProjectStatus {
    pub fn can_transition_to(&self, target: &ProjectStatus) -> bool {
        matches!(
            (self, target),
            (Self::Draft, Self::InProgress)
                | (Self::InProgress, Self::ReadyToExport)
                | (Self::ReadyToExport, Self::Exported)
                | (Self::Exported, Self::Archived)
                | (Self::InProgress, Self::Draft)
        )
    }
}
```

---

## Error Handling

### Domain Errors

```rust
#[derive(Debug, thiserror::Error)]
pub enum DomainError {
    #[error("Entity not found: {entity} with id {id}")]
    NotFound { entity: String, id: String },
    #[error("Invalid state transition from {from} to {to}")]
    InvalidStateTransition { from: String, to: String },
    #[error("Validation failed: {0}")]
    ValidationFailed(String),
}
```

### Application Errors

```rust
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("Persistence error: {0}")]
    Persistence(String),
    #[error("Domain error: {0}")]
    Domain(#[from] DomainError),
}
```

---

## SQLite Patterns

### Connection Wrapper

```rust
pub struct DbConnection {
    conn: Mutex<Connection>,
}

impl DbConnection {
    pub fn open(path: &str) -> Result<Self, InfraError> {
        let conn = Connection::open(path)?;
        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
        Ok(Self { conn: Mutex::new(conn) })
    }

    pub fn with_conn<F, T>(&self, f: F) -> Result<T, InfraError>
    where F: FnOnce(&Connection) -> Result<T, InfraError> {
        let conn = self.conn.lock().map_err(|e| InfraError::Database(e.to_string()))?;
        f(&conn)
    }
}
```

### Embedded Migrations

```rust
pub fn run_migrations(conn: &DbConnection) -> Result<(), InfraError> {
    let migrations = vec![
        include_str!("migrations/001_create_projects.sql"),
        // ... additional migrations
    ];
    conn.with_conn(|c| {
        for (i, sql) in migrations.iter().enumerate() {
            c.execute_batch(sql)?;
        }
        Ok(())
    })
}
```

---

## Testing

### Domain Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn should_transition_draft_to_in_progress() {
        let mut project = Project::new("Test".into(), None);
        assert!(project.transition_status(ProjectStatus::InProgress).is_ok());
        assert_eq!(project.status, ProjectStatus::InProgress);
    }

    #[test]
    fn should_reject_invalid_transition() {
        let project = Project::new("Test".into(), None);
        assert!(project.transition_status(ProjectStatus::Exported).is_err());
    }
}
```

### Infrastructure Tests (In-Memory SQLite)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    fn setup() -> DbConnection {
        let conn = DbConnection::in_memory().unwrap();
        run_migrations(&conn).unwrap();
        conn
    }

    #[test]
    fn should_save_and_find_project() {
        let conn = Arc::new(setup());
        let repo = SqliteProjectRepo::new(conn);
        let project = Project::new("Test".into(), None);
        repo.save(&project).unwrap();
        let found = repo.find_by_id(&project.id).unwrap();
        assert!(found.is_some());
    }
}
```

---

*Guide Version: 1.0 — Rust + Tauri Desktop*
