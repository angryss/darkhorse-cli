# Dark Horse CLI

> Product-development platform — opinionated scaffolding CLIs and a local-first desktop companion

Dark Horse is a suite of tools that scaffold **complete products** with enforced architecture patterns (DDD, Clean Architecture, CQRS) and guide teams through the full delivery lifecycle — discovery, planning, implementation, and troubleshooting.

The monorepo contains three sub-projects:

| Project | Tech | Description |
|---------|------|-------------|
| [`darkhorse-dotnet`](darkhorse-dotnet/) | TypeScript CLI | .NET scaffolding — ASP.NET Core, React frontend, Docker Compose |
| [`darkhorse-java`](darkhorse-java/) | TypeScript CLI | Java scaffolding — Quarkus, React frontend, Docker Compose |
| [`darkhorse-desktop`](darkhorse-desktop/) | Rust / Tauri 2 | Local-first desktop app for shaping, planning, and tracking initiatives |

---

## How It Works

### CLI Tools (dotnet & java)

Both CLIs follow the same pattern: **agent → command → skill**.

- **`init`** scaffolds a complete product — backend workspace, React frontend, and deployment config — from a single command
- **`add`** adds services to an existing workspace (.NET only, currently)
- **`discover` / `plan` / `implement` / `troubleshoot`** form a continuous development cycle driven by AI-native workflow skills
- **`nx-monorepo`** analyzes workspace fit for Nx and produces a full adoption plan with scoring, tradeoffs, and phased migration steps
- **`mcp-serve`** exposes CLI tools to AI agents via the Model Context Protocol

Products are fully self-contained after scaffolding — no runtime dependency on the CLI.

### Desktop App

Dark Horse Desktop is the local workspace companion. Built with Tauri 2 + Rust and a Vite/TypeScript frontend, it models the entire Dark Horse lifecycle:

- Discovery sessions with phased exploration
- MVP scoping, scope classification, and planning readiness
- Requirements, implementation slices, and delivery progress
- Architecture decisions, roadmaps, and artifact management

All data is local-first — SQLite for structured data, filesystem for generated artifacts, no external services required.

---

## Architecture

### CLI Architecture

Both TypeScript CLIs share the same layered structure:

```
src/
├── agents/       # Thin orchestrators — call skills, present results
├── commands/     # Commander.js CLI + inquirer interactive prompts
├── skills/       # Core reasoning engines — pure logic, no I/O
├── core/         # Shared utilities (logger, types, config)
└── mcp/          # MCP server integration
```

Skills are ecosystem-agnostic — identical across both platforms. Commands differ only in ecosystem-specific defaults.

### Desktop Architecture

Four-crate Rust workspace with clean architecture boundaries:

```
crates/
├── dh-domain/          # Entities, value objects, policies, domain services
├── dh-application/     # Commands, port traits, orchestration services
├── dh-infrastructure/  # SQLite persistence, filesystem, settings
└── dh-desktop/         # Tauri app shell, command bridge, window lifecycle
```

---

## Quick Start

### Prerequisites

- **Node.js ≥ 18** (for CLIs)
- **.NET 8 or 9 SDK** (for darkhorse-dotnet)
- **Java 17 or 21 + Maven** (for darkhorse-java)
- **Rust 1.75+ + Tauri CLI v2** (for darkhorse-desktop)

### CLI Usage

```bash
# .NET — scaffold a full product
npx darkhorse-dotnet init --name my-product --frontend --platform web

# .NET — add a backend service
npx darkhorse-dotnet add api --name orders

# Java — scaffold a full product
npx darkhorse-java init --type api --name my-service --group-id com.mycompany

# Either CLI — analyze Nx monorepo fit
npx darkhorse-dotnet nx-monorepo
npx darkhorse-java nx-monorepo
```

### Desktop

```bash
cd darkhorse-desktop
cd frontend && npm install && cd ..
cargo tauri dev
```

---

## Development

### CLI Development

```bash
# Install dependencies
cd darkhorse-dotnet && npm install

# Type-check
npx tsc --noEmit

# Run tests
npx vitest run
```

Same commands apply to `darkhorse-java`.

### Desktop Development

```bash
cd darkhorse-desktop

# Run in dev mode (hot-reloading frontend + Rust backend)
cargo tauri dev

# Run Rust tests
cargo test --workspace

# Build for production
cargo tauri build
```

---

## Project Status

All three sub-projects are at **v0.1.0**.

| Capability | dotnet | java | desktop |
|------------|--------|------|---------|
| Product scaffolding (`init`) | ✅ | ✅ | — |
| Service addition (`add`) | ✅ | — | — |
| Nx monorepo analysis | ✅ | ✅ | — |
| Discovery workflow | 🔜 v1 | 🔜 v1 | ✅ |
| Planning workflow | 🔜 v1 | 🔜 v1 | ✅ |
| Implementation workflow | 🔜 v1 | 🔜 v1 | ✅ |
| Troubleshooting workflow | 🔜 v1 | 🔜 v1 | — |
| MCP server | 🔜 v1 | 🔜 v1 | — |

---

## License

MIT
