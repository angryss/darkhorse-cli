# Backend Patterns — Rust/Tauri Desktop

> Rust-idiomatic patterns for Dark Horse desktop projects.

## Layer Architecture

```
Infrastructure → Application → Domain
       ↓
Desktop (Tauri) ──────→┘
```

## Domain Layer Patterns

### Entities

Entities are identified by a unique ID and have a lifecycle:

```rust
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: Uuid,
    pub name: ProjectName,
    pub description: String,
    pub status: ProjectStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Project {
    pub fn new(name: ProjectName, description: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            name,
            description,
            status: ProjectStatus::Active,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn complete(&mut self) -> Result<(), DomainError> {
        if self.status == ProjectStatus::Completed {
            return Err(DomainError::AlreadyCompleted(self.id));
        }
        self.status = ProjectStatus::Completed;
        self.updated_at = Utc::now();
        Ok(())
    }
}
```

### Value Objects

Value objects are immutable, compared by value, and validate on construction:

```rust
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ProjectName(String);

impl ProjectName {
    pub fn new(value: impl Into<String>) -> Result<Self, DomainError> {
        let value = value.into();
        if value.trim().is_empty() {
            return Err(DomainError::EmptyProjectName);
        }
        if value.len() > 200 {
            return Err(DomainError::ProjectNameTooLong(value.len()));
        }
        Ok(Self(value))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}
```

### Domain Errors

Use `thiserror` for all domain errors:

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum DomainError {
    #[error("Project name must not be empty")]
    EmptyProjectName,
    #[error("Project name too long: {0} characters (max 200)")]
    ProjectNameTooLong(usize),
    #[error("Project {0} is already completed")]
    AlreadyCompleted(Uuid),
}
```

## Application Layer Patterns

### Commands

Commands are simple structs that represent user intent:

```rust
pub struct CreateProjectCommand {
    pub name: String,
    pub description: String,
}

pub struct CompleteProjectCommand {
    pub project_id: Uuid,
}
```

### Handlers

Handlers orchestrate domain logic using port traits:

```rust
pub async fn handle_create_project(
    cmd: CreateProjectCommand,
    repo: &dyn ProjectRepository,
) -> Result<Uuid, AppError> {
    let name = ProjectName::new(cmd.name)?;
    let project = Project::new(name, cmd.description);
    let id = project.id;
    repo.save(&project).await?;
    Ok(id)
}
```

### Port Traits

Ports define what infrastructure must provide:

```rust
#[async_trait::async_trait]
pub trait ProjectRepository: Send + Sync {
    async fn find_by_id(&self, id: Uuid) -> Result<Option<Project>, AppError>;
    async fn save(&self, project: &Project) -> Result<(), AppError>;
    async fn list_all(&self) -> Result<Vec<Project>, AppError>;
    async fn delete(&self, id: Uuid) -> Result<(), AppError>;
}
```

## Infrastructure Layer Patterns

### SQLite Repository

```rust
pub struct SqliteProjectRepository {
    conn: Arc<Mutex<Connection>>,
}

impl SqliteProjectRepository {
    pub fn new(conn: Connection) -> Self {
        Self { conn: Arc::new(Mutex::new(conn)) }
    }
}

#[async_trait::async_trait]
impl ProjectRepository for SqliteProjectRepository {
    async fn save(&self, project: &Project) -> Result<(), AppError> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT OR REPLACE INTO projects (id, name, description, status, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                project.id.to_string(),
                project.name.as_str(),
                project.description,
                project.status.as_str(),
                project.created_at.to_rfc3339(),
                project.updated_at.to_rfc3339(),
            ],
        )?;
        Ok(())
    }
}
```

### Database Initialization

```rust
pub fn init_database(path: &Path) -> Result<Connection> {
    let conn = Connection::open(path)?;
    conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
    run_migrations(&conn)?;
    Ok(conn)
}

fn run_migrations(conn: &Connection) -> Result<()> {
    conn.execute_batch(include_str!("migrations/001_initial.sql"))?;
    Ok(())
}
```

## Desktop Layer Patterns

### Tauri Commands

```rust
#[tauri::command]
async fn create_project(
    state: State<'_, AppState>,
    name: String,
    description: String,
) -> Result<String, String> {
    let cmd = CreateProjectCommand { name, description };
    handle_create_project(cmd, &*state.project_repo)
        .await
        .map(|id| id.to_string())
        .map_err(|e| e.to_string())
}
```

### Application State

```rust
pub struct AppState {
    pub project_repo: Box<dyn ProjectRepository>,
    // Add more repos/services as needed
}
```

## Frontend Integration

### Tauri IPC Calls

```typescript
import { invoke } from "@tauri-apps/api/core";

export async function createProject(name: string, description: string): Promise<string> {
  return invoke<string>("create_project", { name, description });
}
```
