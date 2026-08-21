# DarkHorse — Ecosystem Architecture

> Scaffold the product. Scaffold the process.

---

## Core Principle

### Governed developer lifecycle

DarkHorse exposes one developer lifecycle and no competing process:

`Discover -> Plan -> Implement -> Test -> Close`

The generated project's exact `@angryss/vep@2.0.0` dependency is the sole process-command authority. `discover`, `plan`, `test`, `review`, and `close` preserve the project-local `visu` output and exit status. Review is an independent check within the Test stage, not a sixth lifecycle stage. `implement` only verifies the approved canonical A1 before ordinary engineering work; it creates no lifecycle transition or separate state.

OpenSpec is optional draft input before A1 and a read-only projection after A1. Once `.visu/work/<change-id>/contract.yaml` exists, that contract is the sole editable plan authority. AI adapters, workflow prose, prompts, `.darkhorse.yaml`, and DarkHorse Desktop cannot approve scope, waive proof, decide closure, or replace VEP state.

Delegation always resolves the generated project's installed `visu`. Missing, corrupt, incompatible, global, PATH, source-tree, embedded, and tarball fallbacks fail closed.

Command classification:

| Command | Class | Boundary |
|---|---|---|
| `discover`, `plan`, `test`, `review`, `close` | A — direct delegation | Project-local `visu` owns JSON, exit status, and governed outcome |
| `implement` | B — bounded ergonomics | Installed VEP validates approved A1; no transition is persisted |
| `init` | B — bounded ergonomics | Generates the exact project-owned VEP boundary |
| `troubleshoot`, `validate`, variant scaffolding, `mcp-serve`, `ai sync` | C — independent tooling | May diagnose, scaffold, or display; never changes VEP authority |
| Legacy DarkHorse/OpenSpec lifecycle instructions | D — retired | Retained only as non-authoritative engineering reference where useful |

**A DarkHorse scaffolder is only complete if it generates both the runtime product and the development guidance system.**

Every scaffolder must produce:

### 1. Runtime Product

- Language/platform-specific application or service foundation
- Appropriate architecture and folder/module layout
- Platform-specific defaults (build, config, deployment)

### 2. Development Guidance System

- `openspec/` — specs, proposals, archive
- `context/` — AI navigation layer
- `AGENTS.md` — AI agent entry point
- Architecture rules (copied from scaffolder's `rules/`)
- Guides/patterns (copied from scaffolder's `guides/`)
- Workflows (copied from scaffolder's `workflows/`)
- Roadmap and progress starter docs
- DarkHorse config (`.darkhorse.yaml`)

A generated project is self-contained. It carries both the runtime product and the guidance system. No runtime dependency on the CLI.

---

## Project Types

The DarkHorse ecosystem has exactly two types of projects: **scaffolders** and **products**. The distinction must remain explicit and must not be blurred.

### Scaffolders (Tools)

A scaffolder is a CLI tool that generates project repositories. It owns:
- **Templates** (`templates/`) — Handlebars templates rendered with project-specific variables
- **Source assets** (`rules/`, `guides/`, `workflows/`) — reference material copied into generated projects
- **Generation logic** (`src/`) — commands, agents, and skills that orchestrate the scaffold pipeline
- **Toolkit** (`toolkit/`) — optional UI component library reference (where applicable)

A scaffolder does NOT contain runtime application code. It is a tool that produces applications.

| Scaffolder | Platform | Status |
|------------|----------|--------|
| `darkhorse-dotnet` | .NET / ASP.NET Core | Active |
| `darkhorse-dotnet-desktop` | .NET / WPF | Active |
| `darkhorse-java` | Java / Quarkus | Active |
| `darkhorse-rust` | Rust / Tauri | Active |

### Products (Applications)

A product is a runtime application. It may follow DarkHorse architectural principles, but it does not own generation logic, templates, or scaffold pipelines.

When documentation folders (`openspec/`, `context/`, `rules/`, `guides/`, `workflows/`) exist in a product repo, they are:
- **Authored project documentation** — guidance for building that specific product
- **Consumer-side project artifacts** — not scaffold source material

A product does NOT contain Handlebars templates, Commander.js commands, or scaffold skills. These concerns belong exclusively in scaffolders.

| Product | Platform | Role |
|---------|----------|------|
| `darkhorse-desktop` | Rust / Tauri 2 | Local-first product-development management UI |

---

## Scaffolder Architecture

All active scaffolders (`darkhorse-dotnet`, `darkhorse-dotnet-desktop`, `darkhorse-java`, `darkhorse-rust`) share an identical architecture.

### Source Layout

```
<scaffolder>/
├── src/
│   ├── commands/         # Commander.js CLI + inquirer prompts
│   ├── agents/           # Thin orchestrators — call skills, present results
│   ├── skills/           # Core logic — scaffold, openspec, context, workflows
│   ├── core/             # Template engine, config, logger, types
│   └── mcp/              # MCP server integration
├── rules/                # Architecture rules — COPIED into generated projects
├── guides/               # Development patterns — COPIED into generated projects
├── workflows/            # Skills, commands, agents — COPIED into generated projects
├── templates/            # Handlebars .hbs files — RENDERED into generated projects
│   ├── openspec/         # openspec/ file templates
│   ├── context/          # context/ file templates
│   ├── backend/          # Backend structure templates
│   ├── frontend/         # Frontend structure templates
│   ├── deployment/       # Docker/deployment templates
│   └── vscode/           # VS Code config templates
├── tests/                # Scaffold integration tests
└── package.json          # npm package with "bin" entry
```

### Init Pipeline

The `init` command is the primary scaffold entry point. It runs three skills in sequence:

```
commands/init.ts  →  agents/init.agent.ts  →  3 skills:

1. scaffoldWorkspace(config)
   → Creates directory structure
   → Renders backend/frontend/deployment templates
   → Writes root files (README, .gitignore, solution/pom)

2. seedOpenSpec(config)
   → Renders openspec/*.hbs templates (AGENTS.md, domain/README.md, roadmap, progress-tracker, toolkit)
   → COPIES rules/*.md → openspec/specs/architecture/
   → COPIES guides/*.md → openspec/specs/patterns/
   → COPIES workflows/skills/*.md → openspec/specs/workflow/
   → COPIES workflows/commands/*.md → openspec/specs/workflow/commands/
   → COPIES workflows/agents/*.md → .github/agents/
   → Creates openspec/changes/ and openspec/archive/

3. generateContext(config)
   → Renders context/*.hbs templates (00-START-HERE, 10-REPO-MAP, 30-BOUNDED-CONTEXTS, 50-SEARCH-QUERIES)

4. writeConfig(config)
   → Writes .darkhorse.yaml (provenance only)
```

### Template vs Copy

| Mechanism | Source | Output | When |
|-----------|--------|--------|------|
| **Render** (Handlebars) | `templates/*.hbs` | Project-specific files with interpolated variables | Files that need project name, archetype, dates |
| **Copy** (raw file) | `rules/`, `guides/`, `workflows/` | Identical copies in openspec/specs/ | Generic reference material that doesn't change per project |

---

## Generated Project Structure

Every scaffolded project follows this canonical structure:

```
<project-name>/
├── context/                        ← AI navigation layer
│   ├── 00-START-HERE.md
│   ├── 10-REPO-MAP.md
│   ├── 30-BOUNDED-CONTEXTS.md
│   └── 50-SEARCH-QUERIES.md
├── openspec/                       ← Spec-driven development system
│   ├── AGENTS.md                   ← AI agent entry point (READ FIRST)
│   ├── specs/
│   │   ├── architecture/           ← Rules (from scaffolder rules/)
│   │   ├── domain/                 ← Bounded context specs
│   │   ├── patterns/               ← Guides (from scaffolder guides/)
│   │   ├── project/                ← Roadmap, progress tracker
│   │   ├── toolkit/                ← UI component reference (optional)
│   │   └── workflow/               ← Skills + commands (from scaffolder workflows/)
│   ├── changes/                    ← Active MVP proposals
│   └── archive/                    ← Completed MVPs
├── backend/  or  crates/           ← Platform-specific app structure
├── frontend/                       ← UI (when enabled)
├── deployment/                     ← Docker, packaging, CI
├── .darkhorse.yaml                 ← Scaffolding provenance only
└── README.md
```

After scaffolding, the project is **fully self-contained**. No runtime dependency on the CLI. The `.darkhorse.yaml` is provenance only.

---

## OpenSpec/Context in Product Repos

When a product repository (like `darkhorse-desktop`) contains `openspec/`, `context/`, `rules/`, `guides/`, or `workflows/` folders, these are fundamentally different from the same folders in a scaffolder:

| Folder | In a Scaffolder | In a Product |
|--------|-----------------|--------------|
| `rules/` | **Source material** — copied into generated projects at scaffold time | **Project documentation** — architecture guidance for building this specific product |
| `guides/` | **Source material** — copied into generated projects | **Project documentation** — pattern reference for this product |
| `workflows/` | **Source material** — copied into generated projects | **Project documentation** — development workflow for this product |
| `openspec/` | N/A (scaffolders don't have their own openspec) | **Project documentation** — spec system for this product (hand-authored, not generated) |
| `context/` | N/A (scaffolders don't have their own context) | **Project documentation** — AI navigation for this product (hand-authored) |
| `templates/` | **Handlebars templates** — rendered into generated projects | **Should NOT exist** — products don't render templates |

This distinction prevents confusion between tool-owned generation assets and product-owned documentation assets.

---

## Desktop Support: Current State and Future Path

### Current State

Desktop/Tauri is represented by two projects:

- **`darkhorse-desktop`** — A **product application** (Tauri 2 desktop app for product-development management). Its `openspec/`, `context/`, `rules/`, `guides/`, and `workflows/` are hand-authored project documentation.
- **`darkhorse-rust`** — A **scaffolder** that generates new Rust/Tauri desktop projects with the full DarkHorse guidance system from a single `darkhorse-rust init` command.

### Why This Gap Exists

The .NET and Java scaffolders were built first because they target the most common enterprise project patterns (API services, BFF layers, microservices). Desktop/Tauri is a different archetype with different structural concerns (Rust crates, Tauri commands, local persistence, native packaging).

### Near-Term Path

- Keep `darkhorse-desktop` as a product repo with hand-authored `openspec/` and `context/`
- Use `darkhorse-rust` to scaffold new Rust/Tauri desktop projects with the full guidance system
- Bridge the experience: new desktop projects get the single-command scaffold; the existing desktop product retains its hand-authored docs

---

## Desktop Support: `darkhorse-dotnet-desktop`

`darkhorse-dotnet-desktop` is the scaffolder for .NET WPF desktop applications. It follows the same architecture as `darkhorse-dotnet` and `darkhorse-java` with WPF-specific extensions.

### Architecture

```
darkhorse-dotnet-desktop/
├── src/
│   ├── commands/         # Commander.js CLI (init, add, deploy, discover, plan, implement, troubleshoot)
│   ├── agents/           # Thin orchestrators
│   ├── skills/           # Scaffold, deployment, openspec, context skills
│   ├── core/             # Template engine, config, types
│   └── mcp/              # MCP server integration
├── rules/                # WPF/Onion Architecture rules
├── guides/               # WPF development patterns, deployment patterns
├── workflows/            # Skills, commands, agents for WPF projects
├── templates/
│   ├── app/              # C# project templates (csproj, XAML, ViewModels, DI)
│   ├── tests/            # Test project templates (xUnit)
│   ├── context/          # Context templates
│   ├── openspec/         # OpenSpec templates
│   ├── deployment/
│   │   ├── wix/          # WiX 4 MSI installer templates
│   │   └── ci/           # GitHub Actions and Azure DevOps pipeline templates
│   ├── github/           # Copilot adapter templates
│   ├── kiro/             # Kiro steering templates
│   └── vscode/           # VS Code config templates
├── tests/
└── package.json          # "bin": { "darkhorse-dotnet-desktop": "./dist/index.js" }
```

### What `init` Generates

One `init` creates a complete, self-contained WPF project with five Onion Architecture layers:

| Layer | Project | Dependencies |
|-------|---------|-------------|
| `*.Common` | Primitives, contracts | None |
| `*.Domain` | Entities, aggregates, domain events, repositories | Common |
| `*.Application` | CQRS commands, queries, handlers, validators | Domain + Common |
| `*.Infrastructure` | Persistence (EF Core SQLite), adapters | Application + Domain + Common |
| `*.Presentation` | WPF UI, ViewModels, DI host bootstrap | All layers |

In addition to the five application layers, `init` generates:
- `deploy/installer/` — WiX 4 SDK MSI installer project (desktop shortcut feature, launch-on-finish checkbox)
- `.github/workflows/build-installer.yml` (when `--cicd github-actions`) or `azure-pipelines.yml` (when `--cicd ado`)
- Full OpenSpec + context + workflow assets (same pattern as all other scaffolders)

### Key Differences from Other Scaffolders

| Aspect | `darkhorse-dotnet` | `darkhorse-dotnet-desktop` |
|--------|-------------------|---------------------------|
| Scope | Multi-service workspace | Single WPF desktop app |
| `add` command | Adds a service to the workspace | Adds a bounded context (feature module) |
| Packaging | Docker Compose | WiX 4 MSI installer |
| CI/CD | Not generated | GitHub Actions or Azure DevOps (optional) |
| MVVM | Not applicable | CommunityToolkit.Mvvm source generators |
| UI framework | React / Chakra UI | MaterialDesignThemes or WPF UI (Fluent) |

---

## Rust Desktop Scaffolder: `darkhorse-rust`

`darkhorse-rust` is the scaffolder for Rust/Tauri desktop projects. It follows the exact same architecture as `darkhorse-dotnet` and `darkhorse-java`.

### Architecture

```
darkhorse-rust/
├── src/
│   ├── commands/         # Commander.js CLI (init, plan, implement, troubleshoot)
│   ├── agents/           # Thin orchestrators
│   ├── skills/           # Scaffold, openspec, context skills
│   ├── core/             # Template engine, config, types
│   └── mcp/              # MCP server integration
├── rules/                # Rust/Tauri architecture rules
├── guides/               # Rust/Tauri development patterns
├── workflows/            # Skills, commands, agents for Rust projects
├── templates/
│   ├── openspec/         # OpenSpec templates (Rust-adapted)
│   ├── context/          # Context templates (Rust-adapted)
│   ├── backend/          # Rust crate templates
│   ├── frontend/         # Vite + TypeScript templates
│   └── deployment/       # Tauri packaging templates
├── tests/
└── package.json          # "bin": { "darkhorse-rust": "./dist/index.js" }
```

### App Scaffolding Requirements

The `init` command must generate:

| Component | Structure |
|-----------|-----------|
| **Rust workspace** | `Cargo.toml` (workspace root) |
| **Domain crate** | `crates/<prefix>-domain/` — entities, value objects, domain services (zero deps) |
| **Application crate** | `crates/<prefix>-application/` — commands, port traits, orchestration |
| **Infrastructure crate** | `crates/<prefix>-infrastructure/` — SQLite, filesystem, settings |
| **Desktop shell crate** | `crates/<prefix>-desktop/` — Tauri host, command bridge, state |
| **Frontend** | `frontend/` — Vite + TypeScript, Tauri IPC wrappers |
| **Deployment** | `deployment/` — Tauri build config, packaging scripts |
| **Local persistence** | SQLite via rusqlite, WAL mode, embedded migrations |

### Development Guidance Scaffolding Requirements

The `init` command must also generate:

| Component | Source | Output |
|-----------|--------|--------|
| `openspec/AGENTS.md` | Template (`.hbs`) | Rendered with project name, Tauri archetype, crate mapping |
| `openspec/specs/architecture/` | `rules/*.md` | Copied — Rust/Tauri architecture rules |
| `openspec/specs/patterns/` | `guides/*.md` | Copied — Rust/Tauri development patterns |
| `openspec/specs/domain/README.md` | Template | Rendered — bounded context template for Rust modules |
| `openspec/specs/project/roadmap.md` | Template | Rendered — MVP lifecycle starter |
| `openspec/specs/project/progress-tracker.md` | Template | Rendered — progress tracking starter |
| `openspec/specs/workflow/` | `workflows/skills/*.md` + `workflows/commands/*.md` | Copied — development workflow docs |
| `context/00-START-HERE.md` | Template | Rendered — project entry point |
| `context/10-REPO-MAP.md` | Template | Rendered — Rust crate layout map |
| `context/30-BOUNDED-CONTEXTS.md` | Template | Rendered — context inventory |
| `context/50-SEARCH-QUERIES.md` | Template | Rendered — Rust-specific search patterns |
| `.darkhorse.yaml` | Generated | Project config (provenance only) |
| `.github/agents/` | `workflows/agents/*.md` | Copied — Copilot agent mode files |

### Key Differences from .NET/Java Scaffolders

| Aspect | dotnet / java | rust |
|--------|--------------|------|
| Backend structure | `backend/` with solution/Maven project | `crates/` with Cargo workspace |
| Archetypes | `api`, `bff-api`, `microservice` | `desktop` (initially, expandable to `cli`, `api`) |
| CQRS dispatch | MediatR (C#) / CDI (Java) | Application command structs + trait-based handlers |
| Persistence | SQL Server/PostgreSQL via EF Core/Hibernate | SQLite via rusqlite (local-first) |
| Presentation layer | ASP.NET Core / Quarkus REST | Tauri command bridge |
| Frontend | React + Chakra UI + Tailwind | Vite + TypeScript (vanilla or framework) |
| Packaging | Docker Compose | Tauri bundler (MSI, DMG, AppImage) |

---

## Summary

| Principle | Enforcement |
|-----------|-------------|
| DarkHorse scaffolds both the product and the process | Every scaffolder `init` generates app structure + full guidance system |
| Scaffolders and products are distinct project types | Scaffolders own templates + generation logic; products are runtime apps |
| Generated projects are self-contained | Zero runtime dependency on the CLI after scaffolding |
| OpenSpec/context in a product repo is authored documentation | Not scaffold source material — explicitly different from scaffolder-owned assets |
| Desktop support requires a dedicated scaffolder | `darkhorse-desktop` is a product; `darkhorse-dotnet-desktop` scaffolds WPF projects; `darkhorse-rust` scaffolds Tauri projects |
| No hybrid tool/product projects | Do not mix template packaging, generation logic, and runtime app concerns |

---

*Architecture Version: 1.0*
