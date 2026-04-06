# Dark Horse

> Scaffold the product. Scaffold the process. Ship with a development operating system built in.

Dark Horse is a product-development platform. Its scaffolders generate **both** a runtime codebase and a development guidance system — architecture rules, AI navigation, workflow docs, and planning artifacts — so every new project ships ready for guided development from day one.

---

## System Summary

Dark Horse consists of:

- **Scaffolders** — CLI tools that generate complete project repositories. Each scaffolder produces the runtime product structure (backend, frontend, deployment) **and** the development guidance system (OpenSpec, context, rules, guides, workflows, roadmap). Currently: .NET, Java, and Rust/Tauri.
- **Products** — Runtime applications built with Dark Horse principles. Currently: Dark Horse Desktop, a local-first Tauri app for shaping, planning, and tracking product initiatives.
- **Capabilities** — Discovery, planning, implementation, troubleshooting, and Nx monorepo analysis — available as CLI commands and workflow skills that AI agents execute.

A generated project is fully self-contained. No runtime dependency on the CLI.

---

## What Makes a Complete Scaffold

A Dark Horse scaffolder is only complete if it generates both halves:

1. **The runtime product** — language/platform-specific application foundation, architecture layout, platform defaults
2. **The development guidance system** — `openspec/`, `context/`, `AGENTS.md`, architecture rules, patterns/guides, workflows, roadmap/progress starters, `.darkhorse.yaml`

Initial code generation alone is not full Dark Horse. Guided development is the differentiator.

---

## Ecosystem

This monorepo contains **scaffolders** (tools) and **products** (applications).

### Scaffolders (Tools)

| Project | Tech | What It Does |
|---------|------|--------------|
| [`darkhorse-dotnet`](darkhorse-dotnet/) | TypeScript CLI | Scaffolds .NET products — ASP.NET Core, React frontend, Docker Compose |
| [`darkhorse-java`](darkhorse-java/) | TypeScript CLI | Scaffolds Java products — Quarkus, React frontend, Docker Compose |
| [`darkhorse-rust`](darkhorse-rust/) | TypeScript CLI | Scaffolds Rust/Tauri desktop products — Cargo workspace, Vite frontend |

Scaffolders own templates, generation logic, and development asset source material (`rules/`, `guides/`, `workflows/`, `templates/`). They produce complete, self-contained project repositories with both the product and the guidance system.

### Products (Applications)

| Project | Tech | What It Does |
|---------|------|--------------|
| [`darkhorse-desktop`](darkhorse-desktop/) | Rust / Tauri 2 | Local-first desktop app for shaping, planning, and tracking initiatives |

Products are runtime applications. They follow Dark Horse architectural principles but do not own generation logic or template packaging.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the complete ecosystem design, including the desktop scaffolder specification.

---

## How It Works

### CLI Scaffolders

All three scaffolders follow the same pattern: **command → agent → skill**.

- **`init`** scaffolds a complete project — the runtime product (backend, frontend, deployment) **and** the development guidance system (`openspec/`, `context/`, rules, guides, workflows, roadmap)
- **`add`** adds services to an existing workspace (dotnet only)
- **`discover` / `plan` / `implement` / `troubleshoot`** form a continuous development cycle driven by AI-native workflow skills
- **`nx-monorepo`** analyzes workspace fit for Nx and produces a full adoption plan with scoring, tradeoffs, and phased migration steps (dotnet and java)
- **`mcp-serve`** exposes CLI tools to AI agents via the Model Context Protocol

The `init` pipeline runs three skills in sequence:

```
scaffoldWorkspace(config)   → dirs + root files + backend/frontend/deployment
seedOpenSpec(config)        → openspec/ (templates + copied rules/guides/workflows)
generateContext(config)     → context/ (4 navigation files)
```

### Desktop App

Dark Horse Desktop is the local workspace companion. Built with Tauri 2 + Rust and a Vite/TypeScript frontend, it models the entire Dark Horse lifecycle:

- Discovery sessions with phased exploration
- MVP scoping, scope classification, and planning readiness
- Requirements, implementation slices, and delivery progress
- Architecture decisions, roadmaps, and artifact management

All data is local-first — SQLite for structured data, filesystem for generated artifacts, no external services required.

> **Note**: Dark Horse Desktop is a product, not a scaffolder. It does not generate projects. Rust/Tauri project scaffolding is handled by the [`darkhorse-rust`](darkhorse-rust/) CLI.

---

## Architecture

### CLI Architecture

All three scaffolder CLIs share the same layered structure:

```
src/
├── agents/       # Thin orchestrators — call skills, present results
├── commands/     # Commander.js CLI + inquirer interactive prompts
├── skills/       # Core reasoning engines — pure logic, no I/O
├── core/         # Shared utilities (logger, types, config)
└── mcp/          # MCP server integration
```

Scaffolder-owned source assets (packaged with the CLI):

```
rules/            # Architecture rules — copied into openspec/specs/architecture/
guides/           # Development patterns — copied into openspec/specs/patterns/
workflows/        # Skills, commands, agents — copied into openspec/specs/workflow/
templates/        # Handlebars templates — rendered with project vars into output
```

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

- **Node.js ≥ 18** (for all CLIs)
- **.NET 8 or 9 SDK** (for darkhorse-dotnet)
- **Java 17 or 21 + Maven** (for darkhorse-java)
- **Rust toolchain + Tauri prerequisites** (for darkhorse-rust and darkhorse-desktop)

### CLI Usage

```bash
# .NET — scaffold a full product
npx darkhorse-dotnet init --name my-product --frontend --platform web

# .NET — add a backend service
npx darkhorse-dotnet add api --name orders

# Java — scaffold a full product
npx darkhorse-java init --type api --name my-service --group-id com.mycompany

# Rust — scaffold a Tauri desktop app
npx darkhorse-rust init --name my-desktop-app --description "My desktop application"

# Analyze Nx monorepo fit (dotnet / java)
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

Same commands apply to `darkhorse-java` and `darkhorse-rust`.

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

All four sub-projects are at **v0.1.0**.

| Capability | dotnet | java | rust | desktop |
|------------|--------|------|------|---------|
| Product scaffolding (`init`) | ✅ | ✅ | ✅ | — (product, not scaffolder) |
| Service addition (`add`) | ✅ | — | — | — |
| Nx monorepo analysis | ✅ | ✅ | — | — |
| Discovery workflow | 🔜 v1 | 🔜 v1 | 🔜 v1 | ✅ |
| Planning workflow | 🔜 v1 | 🔜 v1 | 🔜 v1 | ✅ |
| Implementation workflow | 🔜 v1 | 🔜 v1 | 🔜 v1 | ✅ |
| Troubleshooting workflow | 🔜 v1 | 🔜 v1 | 🔜 v1 | — |
| MCP server | 🔜 v1 | 🔜 v1 | 🔜 v1 | — |

---

## License

MIT
