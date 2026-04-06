# Troubleshooting Skill

> Diagnose and resolve compilation errors, runtime failures, and architecture violations.

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `issue` | Yes | Description of the issue or error message |
| `layer` | No | Layer suspected to be the source (domain, application, infrastructure, desktop, frontend) |

## Steps

1. **Reproduce** — Confirm the issue (run `cargo check`, `cargo test`, or frontend build)
2. **Locate** — Identify which layer and file is the source
3. **Trace** — Follow the call chain through layers to find root cause
4. **Diagnose** — Determine the category of issue:
   - Compilation error (type mismatch, missing trait impl, lifetime issue)
   - Architecture violation (wrong dependency direction, logic in wrong layer)
   - Runtime failure (panic, database error, IPC failure)
   - Configuration issue (Cargo.toml, tauri.conf.json, package.json)
5. **Fix** — Apply the smallest correct fix following architecture rules
6. **Verify** — Confirm the fix: `cargo check && cargo test`

## Common Issue Patterns

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Dependency cycle between crates | Wrong layer dependency | Move shared types to domain, use port traits |
| Domain crate imports infrastructure | Architecture violation | Extract interface to port trait in application |
| Tauri command has business logic | Desktop layer too thick | Move logic to application handler |
| SQLite type conversion error | Missing `From` impl | Add `TryFrom` impl for repository mapping |
| Frontend invoke returns error | Mismatched command name | Ensure `invoke("name")` matches `#[tauri::command]` fn name |
| Lifetime error in async handler | Borrow across await | Clone the value or restructure ownership |
