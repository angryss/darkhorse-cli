# Archetype Rules (v1.0)

**Defines the desktop project archetype and its architectural constraints.**

> DarkHorse Desktop projects follow a single archetype: `desktop`. The archetype determines which layers exist, what dependencies are allowed, and how commands route.

---

## Archetype: Desktop

### Purpose

A local-first desktop application that owns its domain, persists data locally via SQLite, and exposes functionality through a Tauri IPC bridge to a web-based frontend.

### Layer Behavior

| Layer | Behavior |
|-------|----------|
| **Frontend** | Vite + TypeScript UI, page-based routing, Tauri invoke() for IPC |
| **Desktop Shell** | Tauri host, Tauri bridge commands (thin wrappers), state management, plugin integration |
| **Application** | Command handlers operate on domain entities via repository ports. Query handlers read from repository ports. |
| **Domain** | Full domain model: entities, value objects, domain services, port traits. Zero external crate dependencies. |
| **Infrastructure** | SQLite repositories, filesystem operations, settings store, logging, update mechanism |

### Command Routing

```
Frontend invoke("command_name", args)
  → Tauri Bridge Command (Desktop Shell)
    → Application Command Handler → Domain Logic → Repository Port
                                                      ↓
                                              Infrastructure Implementation → SQLite
```

### Allowed Dependencies by Crate

| Crate | Allowed Dependencies |
|-------|---------------------|
| `<prefix>-domain` | std, serde, chrono, uuid, thiserror |
| `<prefix>-application` | Domain crate, anyhow/thiserror |
| `<prefix>-infrastructure` | Application, Domain, rusqlite, tokio, tracing, serde_json |
| `<prefix>-desktop` | All crates, tauri, tauri-plugins |

### Folder Structure

```
<project>/
├── Cargo.toml                          # Workspace root
├── crates/
│   ├── <prefix>-domain/src/
│   │   ├── <context>/                  # Bounded context module
│   │   │   ├── entities.rs
│   │   │   ├── values.rs
│   │   │   └── errors.rs
│   │   ├── errors.rs                   # Shared domain errors
│   │   └── lib.rs
│   ├── <prefix>-application/src/
│   │   ├── commands/                   # Application commands
│   │   ├── ports.rs                    # Repository/store trait definitions
│   │   ├── errors.rs
│   │   └── lib.rs
│   ├── <prefix>-infrastructure/src/
│   │   ├── database/                   # Connection, migrations
│   │   ├── repositories/               # SQLite implementations of ports
│   │   ├── filesystem.rs
│   │   ├── settings.rs
│   │   ├── logging.rs
│   │   └── lib.rs
│   └── <prefix>-desktop/
│       ├── src/
│       │   ├── bridge.rs               # Tauri #[tauri::command] functions
│       │   ├── state.rs                # AppState with Arc'd dependencies
│       │   └── main.rs                 # Tauri builder + plugin registration
│       ├── tauri.conf.json
│       └── icons/
└── frontend/
    ├── index.html
    ├── src/
    └── package.json
```

---

## Archetype Violations to Detect

| Violation | Description |
|-----------|-------------|
| **Domain with infra deps** | Domain crate must not depend on rusqlite, tokio, or tauri |
| **Business logic in bridge** | Bridge commands must be thin wrappers, not contain logic |
| **Direct DB in desktop shell** | Desktop shell must not use rusqlite directly |
| **Cross-context imports** | Context modules must not import from other contexts |
| **Frontend with direct DB** | Frontend communicates via IPC only, never direct DB access |

---

*Rule Version: 1.0 — Desktop Archetype*
