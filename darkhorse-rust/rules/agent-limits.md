# Agent Limits — Rust/Tauri Desktop

> Scope restrictions for AI coding agents working on Dark Horse Rust/Tauri projects.

## Hard Rules

1. **Read context first**: Always start with `context/00-START-HERE.md` and `openspec/AGENTS.md` before making changes.
2. **Respect layer boundaries**: Never add dependencies from inner crates to outer crates.
3. **No infrastructure in domain**: The domain crate must never import rusqlite, tokio, tauri, or any I/O library.
4. **Implement inside-out**: Domain → Application → Infrastructure → Desktop → Frontend.
5. **Proposals before code**: Non-trivial changes require an approved proposal in `openspec/changes/`.
6. **Update progress**: After implementing a requirement, update the progress tracker.

## What Agents May Do

- Read all project files and context documents
- Create and modify Rust source files following architecture rules
- Create and modify TypeScript frontend files
- Add dependencies in the correct crate's `Cargo.toml`
- Create proposals in `openspec/changes/`
- Update `openspec/specs/domain/` with new context definitions

## What Agents Must NOT Do

- Add runtime dependencies to the domain crate (beyond serde, chrono, uuid, thiserror)
- Create Tauri commands that contain business logic
- Bypass the port-adapter pattern (no direct infrastructure calls from application)
- Modify `crates/<prefix>-desktop/tauri.conf.json` without explicit request
- Delete or restructure the crate layout
- Remove or ignore architecture rules in `openspec/specs/architecture/`
