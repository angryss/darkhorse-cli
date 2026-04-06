# Archetype Rules — Rust/Tauri Desktop

> Archetype-specific constraints for generated Rust/Tauri projects.

## Desktop Archetype

The `desktop` archetype generates a Tauri 2 application with local-first design.

### Structure

```
<project>/
├── crates/
│   ├── <prefix>-domain/
│   ├── <prefix>-application/
│   ├── <prefix>-infrastructure/
│   └── <prefix>-desktop/
├── frontend/
├── deployment/
└── Cargo.toml
```

### Constraints

- **No web server**: This is a desktop app. There is no HTTP listener, no REST API, no web framework.
- **No Docker**: Desktop apps are distributed as native installers (MSI, DMG, AppImage), not containers.
- **Local persistence only**: SQLite for structured data. Filesystem for documents/artifacts. No remote database.
- **Single-user**: No authentication layer. No multi-tenancy. The app runs for one user on one machine.
- **Offline-capable**: Core features must work without network access. Sync features are optional enhancements.

### Tauri-Specific Rules

- Use Tauri plugins for system capabilities (shell, dialog, filesystem).
- Frontend communicates with Rust via `@tauri-apps/api` IPC — never via HTTP.
- Tauri configuration lives in `crates/<prefix>-desktop/tauri.conf.json` (alongside the desktop crate's `Cargo.toml`).
- Build commands use `cargo tauri dev` (development) and `cargo tauri build` (production).

### What This Archetype Does NOT Include

- HTTP server or REST endpoints
- Docker Compose or container orchestration
- Database migration CLI tooling
- Message queues or event buses
- Multi-service communication
