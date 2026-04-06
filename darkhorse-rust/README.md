# DarkHorse Rust

> **Scaffolder** — Generates Rust/Tauri desktop products with the full Dark Horse development guidance system

**DarkHorse Rust** is a scaffolder CLI. It generates a complete Tauri desktop application — Cargo workspace with Clean Architecture crates, Vite + TypeScript frontend, Tauri configuration, **and** the development guidance system (OpenSpec, context, rules, guides, workflows, roadmap) — from a single `init` command. Each generated project enforces DDD, Clean Architecture, and command-oriented flow. Generated projects are fully self-contained — no runtime dependency on the CLI.

### Role in the Dark Horse Ecosystem

| Concern | DarkHorse Rust |
|---------|---------------|
| **Is** | A scaffolder — a CLI tool that generates project repositories |
| **Generates** | Runtime product structure + development guidance system |
| **Does not** | Run as part of the generated project or manage runtime concerns |

---

## Table of Contents

- [Why DarkHorse?](#why-darkhorse)
- [Quick Start](#quick-start)
- [CLI Commands](#cli-commands)
- [What Gets Scaffolded](#what-gets-scaffolded)
- [Architecture Enforced](#architecture-enforced)
- [Frontend Stack](#frontend-stack)
- [AI-Native Workflow](#ai-native-workflow)
- [Development](#development)
- [Tech Stack](#tech-stack)
- [License](#license)

---

## Why DarkHorse?

Most scaffolding tools give you a folder structure and walk away. DarkHorse generates **both the product and the process**:

- **Product + process in one command** — `init` scaffolds the runtime product (Cargo workspace, Tauri desktop shell, Vite frontend) and the development guidance system (OpenSpec, context, rules, guides, workflows, roadmap) — all structured and ready to develop.
- **Desktop-first** — Designed for local-first Tauri desktop applications. No web servers, no Docker, no cloud assumptions.
- **Clean Architecture by default** — Four-crate model (`domain`, `application`, `infrastructure`, `desktop`) with enforced dependency direction.
- **Architecture is law** — DDD, Clean Architecture, command-oriented flow, and port-adapter patterns are baked into every generated project via living documentation that AI agents and developers follow.
- **AI-native from day one** — A `context/` navigation layer and `openspec/` spec system guide AI coding agents through the codebase without hallucinating structure.
- **MVP-driven development** — Roadmap, requirements, and progress tracker adopt `REQ-{MVP}-{###}` IDs where each MVP is a fully deliverable unit.
- **Zero lock-in** — After `init`, the project is completely standalone. The `.darkhorse.yaml` is provenance only.

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- Rust toolchain (rustup)
- Tauri prerequisites ([platform-specific](https://v2.tauri.app/start/prerequisites/))

### Generate a Project

```bash
npx darkhorse-rust init \
  --name visu-photo-studio \
  --description "Photo management desktop application" \
  --output ./projects
```

### Interactive Mode

Run without flags for guided prompts:

```bash
npx darkhorse-rust init
```

You'll be prompted for:

| Prompt | Example | Notes |
|--------|---------|-------|
| Project name | `visu-photo-studio` | Lowercase, hyphenated |
| Description | `Photo management app` | Short description |
| Crate prefix | `vps` | Abbreviation for crate names (default: derived) |
| Rust edition | `2024` | `2021` or `2024` |
| Include frontend? | `yes` / `no` | Vite + TypeScript scaffold |

### After Scaffolding

```bash
cat context/00-START-HERE.md   # AI navigation entry point
cat openspec/AGENTS.md         # Architecture rules and agent guide
```

Then start building with the workflow agents:

```bash
npx darkhorse-rust discover      # Explore and shape an idea before planning
npx darkhorse-rust plan          # Create a feature proposal
npx darkhorse-rust implement     # Execute an approved proposal
npx darkhorse-rust troubleshoot  # Investigate a bug
```

---

## CLI Commands

| Command | Status | Description |
|---------|--------|-------------|
| `init` | ✅ Implemented | Initialize a new Tauri desktop project |
| `discover` | 🔜 v1 | Explore and shape product ideas before formal planning |
| `plan` | 🔜 v1 | Create architecture-compliant proposals for features/bugs |
| `implement` | 🔜 v1 | Execute an approved proposal with inside-out implementation |
| `troubleshoot` | 🔜 v1 | Investigate and fix bugs with architecture compliance checks |
| `validate` | ✅ Implemented | Validate project structure and architecture compliance |
| `mcp-serve` | 🔜 v1 | Start an MCP server exposing CLI tools to AI agents |

### `init` Options

```bash
darkhorse-rust init [options]

  -n, --name <name>               Project name
  -d, --description <description> Short description
  --crate-prefix <prefix>         Crate name prefix (default: derived from name)
  --edition <edition>             Rust edition: 2021 | 2024 (default: 2024)
  --framework <framework>         Desktop framework: tauri (default: tauri)
  --frontend / --no-frontend      Include frontend scaffold (default: true)
  -o, --output <dir>              Parent directory (default: .)
```

---

## What Gets Scaffolded

### Product (Runtime Structure)

```
<project>/
├── Cargo.toml                     # Workspace root
├── rustfmt.toml                   # Formatting config
├── crates/
│   ├── <prefix>-domain/           # Entities, value objects, domain services
│   │   └── src/
│   │       ├── lib.rs             # Module declarations
│   │       ├── entities.rs        # Entity stubs
│   │       ├── errors.rs          # Domain errors
│   │       ├── services.rs        # Domain services
│   │       └── values.rs          # Value objects
│   ├── <prefix>-application/      # Commands, handlers, port traits
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── commands.rs        # Command stubs
│   │       ├── errors.rs          # Application errors
│   │       ├── ports.rs           # Port trait definitions
│   │       └── services.rs        # Application services
│   ├── <prefix>-infrastructure/   # SQLite repos, filesystem, persistence
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── database.rs        # SQLite persistence
│   │       ├── errors.rs          # Infrastructure errors
│   │       ├── filesystem.rs      # File I/O
│   │       ├── logging.rs         # Tracing setup
│   │       └── settings.rs        # App settings
│   └── <prefix>-desktop/          # Tauri commands, app state, entry point
│       ├── src/main.rs            # Tauri entry point
│       ├── build.rs               # Tauri build script
│       ├── tauri.conf.json        # Tauri 2 configuration
│       └── icons/                 # App icon assets (ICO, ICNS, PNG)
├── frontend/
│   ├── src/main.ts                # TypeScript entry point
│   ├── index.html                 # App shell
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── .darkhorse.yaml                # Dark Horse project config
```

### Process (Development Guidance System)

```
<project>/
├── openspec/
│   ├── AGENTS.md                  # AI agent entry point
│   ├── specs/
│   │   ├── architecture/          # Architecture rules (copied from scaffolder)
│   │   ├── patterns/              # Development patterns & guides
│   │   ├── workflow/              # Agent and skill workflow definitions
│   │   ├── domain/                # Bounded context specifications
│   │   └── project/
│   │       ├── roadmap.md         # MVP roadmap & requirement IDs
│   │       └── progress-tracker.md
│   └── changes/                   # Requirement proposals (created during dev)
├── context/
│   ├── 00-START-HERE.md           # Project overview
│   ├── 10-REPO-MAP.md            # Repository map with crate dependencies
│   ├── 30-BOUNDED-CONTEXTS.md    # Bounded context inventory
│   └── 50-SEARCH-QUERIES.md      # Rust-specific search patterns
└── .vscode/mcp.json               # MCP server configuration
```

---

## Architecture Enforced

### Four-Crate Clean Architecture

```
Domain ← Application ← Infrastructure
                   ↑
               Desktop (Tauri)
```

| Crate | Responsibility | Dependencies |
|-------|---------------|-------------|
| `<prefix>-domain` | Entities, value objects, domain errors, domain services | None (pure Rust + serde) |
| `<prefix>-application` | Commands, handlers, port traits (interfaces) | Domain only |
| `<prefix>-infrastructure` | SQLite repositories, filesystem adapters, port implementations | Domain + Application |
| `<prefix>-desktop` | Tauri commands, app state, window management | All crates |

### Key Principles

- **Domain purity** — Domain crate has zero infrastructure dependencies
- **Port-adapter pattern** — Application defines traits; infrastructure implements them
- **Command-oriented flow** — User intent → command struct → handler → domain logic → persistence
- **Local-first persistence** — SQLite via rusqlite, no cloud required
- **Thin Tauri commands** — Desktop layer dispatches to application handlers, never contains business logic
- **Inside-out implementation** — Always build domain → application → infrastructure → desktop → frontend

---

## Frontend Stack

| Technology | Purpose |
|-----------|---------|
| Vite | Build tool and dev server |
| TypeScript | Type-safe frontend code |
| Tauri IPC | Communication with Rust backend |

The frontend is intentionally framework-free by default. Add React, Svelte, or any framework to the generated project as needed.

---

## AI-Native Workflow

Generated projects include a complete AI navigation system:

1. **`context/00-START-HERE.md`** — Entry point for any AI agent
2. **`openspec/AGENTS.md`** — Architecture rules, crate table, and reading order
3. **`openspec/specs/architecture/`** — Enforceable architecture rules
4. **`openspec/specs/workflow/`** — Agent and skill definitions
5. **`context/50-SEARCH-QUERIES.md`** — Pre-built search patterns for Rust codebases

---

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Type check
npx tsc --noEmit
```

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| TypeScript | CLI implementation language |
| Commander.js | Command-line argument parsing |
| Inquirer.js | Interactive prompts |
| Handlebars | Template engine |
| Chalk | Terminal styling |
| YAML | Configuration format |
| Vitest | Test framework |

---

## License

MIT
