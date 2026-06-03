# DarkHorse

> Scaffold the product. Scaffold the process. Ship with a development operating system built in.

DarkHorse is an AI-native engineering framework. Its scaffolders generate both a runtime codebase and a development guidance system: architecture rules, AI navigation, workflow docs, prompts, skills, agents, and planning artifacts.

Generated projects are intended to be self-contained. They should not depend on the DarkHorse CLI at runtime.

---

## Why DarkHorse Exists

DarkHorse is built for engineers who want AI-assisted delivery to be structured, inspectable, and portable. It scaffolds both the software foundation and the engineering workflow around it: open specifications, reusable context, architecture guidance, prompts, skills, agents, and validation habits.

The goal is to help teams use AI without locking their process to one vendor or one chat session. DarkHorse favors explicit project context, repeatable discover -> plan -> implement workflows, and generated assets that contributors can read, edit, and own.

---

## Repository Status

DarkHorse is currently **public-alpha/pre-alpha quality**. The repository is being prepared for a credible public open-source release, but some capabilities are still experimental and cleanup work remains.

- **Initial stable focus:** the scaffolders (`darkhorse-dotnet`, `darkhorse-java`, and `darkhorse-rust`) and the generated OpenSpec/context/workflow assets they produce.
- **Experimental surfaces:** MCP support and advanced AI tool adapters should be treated as experimental unless a package explicitly documents a complete implementation.
- **Desktop app:** `darkhorse-desktop` is a companion/showcase product for the DarkHorse lifecycle. It is not the core framework surface and does not own scaffolder behavior.
- **Generated projects:** scaffolded projects are intended to be self-contained and should not require the DarkHorse CLI after generation.

---

## Repository Map

- **Scaffolders:** `darkhorse-dotnet/`, `darkhorse-java/`, and `darkhorse-rust/` are TypeScript CLI packages. They own templates, generation logic, rules, guides, workflow prompts, and generated-project source assets.
- **Desktop app:** `darkhorse-desktop/` is a Rust/Tauri companion product that demonstrates DarkHorse workflow concepts in a local-first application.
- **Docs:** root documentation describes the ecosystem, architecture, open-source readiness, cleanup plan, and public positioning. Package READMEs describe package-specific usage.
- **Examples:** no dedicated root `examples/` directory is present yet. Generated test projects and temporary outputs should not be treated as public examples.
- **Generated workflow assets:** each scaffolder contains `rules/`, `guides/`, `workflows/`, and `templates/`. These are copied or rendered into scaffolded projects to provide OpenSpec, context, prompts, skills, agents, and architecture guidance.

---

## Current Stability Matrix

| Surface | Current Status | Notes |
| --- | --- | --- |
| Scaffolders | Stable focus | Primary OSS entry point. The .NET, Java, and Rust/Tauri CLIs are the first surfaces contributors should validate and improve. |
| OpenSpec support | Beta | Generated OpenSpec/context assets are central to the framework, but schemas and versioned contracts are not finalized yet. |
| Workflow packs | Beta | Discover, plan, implement, and troubleshoot workflow assets exist and are useful, but public versioning and compatibility rules are still forming. |
| Desktop | Beta/showcase | Companion product that demonstrates the DarkHorse lifecycle. It is not the core framework API. |
| MCP | Experimental | Present in docs and package surfaces, but should be treated as experimental unless a package documents complete protocol support. |
| AI adapters | Experimental | Copilot and Kiro outputs exist in places, but a vendor-neutral adapter contract is still planned. |

---

## System Summary

DarkHorse consists of:

- **Scaffolders** - CLI tools that generate complete project repositories. Each scaffolder produces the runtime product structure and the development guidance system.
- **Products** - Runtime applications built with DarkHorse principles. Currently: DarkHorse Desktop, a local-first Tauri app for shaping, planning, and tracking product initiatives.
- **Capabilities** - Discovery, planning, implementation, troubleshooting, and Nx monorepo analysis, available as CLI commands and workflow skills that AI agents execute.

## What Makes a Complete Scaffold

A DarkHorse scaffolder is only complete if it generates both halves:

1. **The runtime product** - language/platform-specific application foundation, architecture layout, platform defaults.
2. **The development guidance system** - `openspec/`, `context/`, `AGENTS.md`, architecture rules, patterns/guides, workflows, roadmap/progress starters, and `.darkhorse.yaml`.

Initial code generation alone is not full DarkHorse. Guided development is the differentiator.

---

## Ecosystem

This monorepo contains scaffolders and a companion product.

### Scaffolders

| Project | Tech | What It Does |
| --- | --- | --- |
| [`darkhorse-dotnet`](darkhorse-dotnet/) | TypeScript CLI | Scaffolds .NET products with ASP.NET Core, React frontend options, Docker Compose, OpenSpec, context, and workflow assets. |
| [`darkhorse-java`](darkhorse-java/) | TypeScript CLI | Scaffolds Java/Quarkus products with React frontend options, Docker Compose, OpenSpec, context, and workflow assets. |
| [`darkhorse-rust`](darkhorse-rust/) | TypeScript CLI | Scaffolds Rust/Tauri desktop products with Cargo workspace, Vite frontend, OpenSpec, context, and workflow assets. |

Scaffolders own templates, generation logic, and development asset source material (`rules/`, `guides/`, `workflows/`, `templates/`). They produce complete, self-contained project repositories.

### Companion Product

| Project | Tech | What It Does |
| --- | --- | --- |
| [`darkhorse-desktop`](darkhorse-desktop/) | Rust / Tauri 2 | Local-first companion app for shaping, planning, and tracking initiatives. |

DarkHorse Desktop follows DarkHorse architectural principles but does not own generation logic or template packaging.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the ecosystem design.

---

## How It Works

All three scaffolders follow the same pattern:

```text
command -> agent -> skill
```

- `init` scaffolds a complete project: runtime structure plus development guidance system.
- `add` adds services to an existing workspace (`darkhorse-dotnet` only today).
- `discover`, `plan`, `implement`, and `troubleshoot` form a continuous AI-native workflow loop.
- `nx-monorepo` analyzes workspace fit for Nx and produces a phased adoption plan (`darkhorse-dotnet` and `darkhorse-java`).
- `mcp-serve` is intended to expose CLI tools to AI agents via the Model Context Protocol, but MCP support should be treated as experimental unless a package documents full implementation.

The `init` pipeline runs three core skills:

```text
scaffoldWorkspace(config) -> dirs + root files + backend/frontend/deployment
seedOpenSpec(config)      -> openspec/ templates + copied rules/guides/workflows
generateContext(config)   -> context/ navigation files
```

## Desktop App

DarkHorse Desktop is the local workspace companion. Built with Tauri 2, Rust, and a Vite/TypeScript frontend, it models the DarkHorse lifecycle:

- Discovery sessions with phased exploration.
- MVP scoping, scope classification, and planning readiness.
- Requirements, implementation slices, and delivery progress.
- Architecture decisions, roadmaps, and artifact management.

All data is local-first: SQLite for structured data, filesystem for generated artifacts, and no external services required.

DarkHorse Desktop is a product, not a scaffolder. Rust/Tauri project scaffolding is handled by [`darkhorse-rust`](darkhorse-rust/).

---

## Architecture

### CLI Architecture

All three scaffolder CLIs share the same layered structure:

```text
src/
  agents/       Thin orchestrators that call skills and present results
  commands/     Commander.js CLI and inquirer interactive prompts
  skills/       Core scaffold, OpenSpec, context, workflow, and validation logic
  core/         Shared utilities such as logger, types, config, filesystem, templates
  mcp/          MCP integration where present
```

Scaffolder-owned source assets:

```text
rules/          Architecture rules copied into generated projects
guides/         Development patterns copied into generated projects
workflows/      Skills, commands, and agents copied into generated projects
templates/      Handlebars templates rendered with project variables
```

### Desktop Architecture

DarkHorse Desktop uses a four-crate Rust workspace:

```text
crates/
  dh-domain          Entities, value objects, policies, domain services
  dh-application     Commands, port traits, orchestration services
  dh-infrastructure  SQLite persistence, filesystem, settings
  dh-desktop         Tauri app shell, command bridge, window lifecycle
```

---

## Quick Start

### Prerequisites

- Node.js >= 18 for all CLIs.
- npm, included with Node.js.
- .NET 8 or 9 SDK for `darkhorse-dotnet`.
- Java 17 or 21 and Maven for `darkhorse-java`.
- Rust toolchain and Tauri prerequisites for `darkhorse-rust` and `darkhorse-desktop`.

### CLI Usage

```bash
# .NET - scaffold a full product
npx darkhorse-dotnet init --name my-product --frontend --platform web

# .NET - add a backend service
npx darkhorse-dotnet add api --name orders

# Java - scaffold a full product
npx darkhorse-java init --type api --name my-service --group-id com.example

# Rust - scaffold a Tauri desktop app
npx darkhorse-rust init --name my-desktop-app --description "My desktop application"

# Analyze Nx monorepo fit
npx darkhorse-dotnet nx-monorepo
npx darkhorse-java nx-monorepo
```

### Scaffold a Local Sample

For local contributor testing, install and build a package first, then run the built CLI against an ignored output folder:

```bash
cd darkhorse-dotnet
npm ci
npm run build
node dist/index.js init --name sample-dotnet --no-frontend --output ../tmp
```

Use the same pattern for `darkhorse-java` and `darkhorse-rust`. Generated sample projects should stay under ignored paths such as `tmp/` or `test-run-*`.

### Desktop

```bash
cd darkhorse-desktop
cd frontend && npm install && cd ..
cargo tauri dev
```

---

## Development

### Getting Started for Contributors

1. Start with the scaffolders. They are the most mature OSS surface and the best place to validate framework behavior.
2. Pick one package: `darkhorse-dotnet`, `darkhorse-java`, or `darkhorse-rust`.
3. Install that package's dependencies with `npm ci`.
4. Run `npm run type-check`, `npm test`, and `npm run build` before changing templates, rules, guides, workflows, or CLI logic.
5. Run CLI help from the package with `node dist/index.js --help` after building.
6. Use `tmp/` or `test-run-*` for local scaffold output so generated projects stay ignored.
7. Treat `darkhorse-desktop` as a companion/showcase app. Changes there should not alter scaffolder behavior unless explicitly scoped.
8. Do not commit generated artifacts such as `node_modules/`, `dist/`, `target/`, `tmp/`, `test-run-*`, source maps, or TypeScript build-info files.

Root scripts are available for common validation after package dependencies are installed:

```bash
npm run type-check
npm test
npm run build
```

The root `clean` script runs `git clean -fdX`, which removes ignored files such as local build output and dependencies. Review your working tree before using it.

### CLI Development

```bash
cd darkhorse-dotnet
npm install
npm run type-check
npm test
```

Use the same commands for `darkhorse-java` and `darkhorse-rust`.

### Desktop Development

```bash
cd darkhorse-desktop

cargo tauri dev
cargo test --workspace
cargo tauri build
```

---

## Project Status

All four sub-projects are at `v0.1.0`.

| Capability | dotnet | java | rust | desktop |
| --- | --- | --- | --- | --- |
| Product scaffolding (`init`) | Stable focus | Stable focus | Stable focus | Product only |
| Service addition (`add`) | Available | Not available | Not available | Product only |
| Nx monorepo analysis | Available | Available | Not available | Not available |
| Discovery workflow | v1 workflow assets | v1 workflow assets | v1 workflow assets | Available |
| Planning workflow | v1 workflow assets | v1 workflow assets | v1 workflow assets | Available |
| Implementation workflow | v1 workflow assets | v1 workflow assets | v1 workflow assets | Available |
| Troubleshooting workflow | v1 workflow assets | v1 workflow assets | v1 workflow assets | Not available |
| MCP server | Experimental | Experimental | Experimental | Not available |

---

## License

MIT. See [LICENSE](LICENSE).
