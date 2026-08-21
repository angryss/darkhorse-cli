# DarkHorse .NET

> **Scaffolder** — Generates .NET products with the full DarkHorse development guidance system

**DarkHorse .NET** is a scaffolder CLI. It generates a complete project — ASP.NET Core backend, React frontend, Docker Compose deployment, **and** the development guidance system (OpenSpec, context, rules, guides, workflows, roadmap) — from a single `init` command. Backend services are added with `add`. Each service enforces DDD, Onion Architecture, and CQRS. Generated projects are fully self-contained — no runtime dependency on the CLI.

Generated projects pin public `@angryss/vep@2.0.0` exactly at the root and own their VEP state. `discover`, `plan`, `test`, `review`, and `close` delegate to project-local `visu`; `implement` verifies the approved A1 boundary. Optional OpenSpec is draft input only—after materialization A1 is the sole editable plan authority. See [the repository VEP integration contract](../docs/vep-2-integration.md).

### Role in the DarkHorse Ecosystem

| Concern | DarkHorse .NET |
|---------|---------------|
| **Is** | A scaffolder — a CLI tool that generates project repositories |
| **Generates** | Runtime product structure + development guidance system |
| **Does not** | Run as part of the generated project or manage runtime concerns |

---

## Table of Contents

- [Why DarkHorse?](#why-darkhorse)
- [Quick Start](#quick-start)
- [CLI Commands](#cli-commands)
- [Service Archetypes](#service-archetypes)
- [What Gets Scaffolded](#what-gets-scaffolded)
- [Architecture Enforced](#architecture-enforced)
- [Frontend Stack](#frontend-stack)
- [React Toolkit](#react-toolkit)
- [AI Tools Support](#ai-tools-support)
- [AI-Native Workflow](#ai-native-workflow)
- [Skills & Workflow System](#skills--workflow-system)
- [MCP Server Integration](#mcp-server-integration)
- [Development](#development)
- [Tech Stack](#tech-stack)
- [License](#license)

---

## Why DarkHorse?

Most scaffolding tools give you a folder structure and walk away. DarkHorse generates **both the product and the process**:

- **Product + process in one command** — `init` scaffolds the runtime product (ASP.NET Core workspace, React frontend, Docker Compose) and the development guidance system (OpenSpec, context, rules, guides, workflows, roadmap) — all structured and ready to develop.
- **Workspace-first** — `init` creates the project root with the full guidance system. Backend services are added with `add`.
- **Three clear archetypes** — `api`, `bff-api`, and `microservice` produce structurally different .NET solutions with enforced constraints per type.
- **Architecture is law** — DDD, Onion Architecture, CQRS, and SOLID are baked into every generated project via living documentation that AI agents and developers follow.
- **AI-native from day one** — A `context/` navigation layer and `openspec/` spec system guide AI coding agents through the codebase without hallucinating structure.
- **MVP-driven development** — Roadmap, requirements, and progress tracker adopt `REQ-{MVP}-{###}` IDs where each MVP is a fully deliverable, independently deployable unit.
- **Frontend platform choice** — React + Vite for web, React Native + Expo for mobile, or both.
- **Zero lock-in** — After `init`, the workspace is completely standalone. The `.darkhorse.yaml` is provenance only.

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- .NET 8 or 9 SDK

### Full Product (Recommended)

Scaffold a complete product — backend workspace, React frontend, and deployment — in one command:

```bash
npx darkhorse-dotnet init \
  --name order-management \
  --description "Order management platform" \
  --namespace OrderManagement \
  --frontend \
  --platform web \
  --output ./projects
```

Then add your first backend service:

```bash
cd order-management
npx darkhorse-dotnet add api \
  --name order-api \
  --namespace MyCompany.Orders
```

You now have:
- `backend/apis/order-api/` — ASP.NET Core service (DDD, Onion, CQRS)
- `frontend/web-app/` — React + Chakra UI + Tailwind + Zustand + Zod
- `deployment/docker-compose.yml` — Docker Compose for local development

### Backend Only

Skip the frontend and scaffold the workspace only:

```bash
npx darkhorse-dotnet init \
  --name order-management \
  --namespace OrderManagement \
  --no-frontend
```

### Interactive Mode

Run without flags for guided prompts:

```bash
npx darkhorse-dotnet init
```

You'll be prompted for:

| Prompt | Example | Notes |
|--------|---------|-------|
| Workspace name | `order-management` | Lowercase, hyphenated |
| Description | `Order management platform` | Short description |
| Namespace | `OrderManagement` | PascalCase (default: derived from name) |
| Include frontend? | `yes` / `no` | Adds React or React Native scaffold |
| Frontend platform | `web` / `mobile` / `both` | React + Vite, React Native + Expo, or both |

### After Scaffolding

```bash
cat context/00-START-HERE.md   # AI navigation entry point
cat openspec/AGENTS.md         # Architecture rules and agent guide
```

Then start building with the workflow agents:

```bash
npx darkhorse-dotnet discover      # Explore and shape an idea before planning
npx darkhorse-dotnet plan          # Create a feature proposal
npx darkhorse-dotnet implement     # Execute an approved proposal
npx darkhorse-dotnet troubleshoot  # Investigate a bug
```

---

## CLI Commands

| Command | Status | Description |
|---------|--------|-------------|
| `init` | ✅ Implemented | Initialize a new workspace (no service yet) |
| `add <type>` | ✅ Implemented | Add a service to an existing workspace |
| `ai sync` | ✅ Implemented | Add or refresh AI tool adapters (Kiro steering, Copilot instructions) |
| `discover` | 🔜 v1 | Explore and shape product ideas before formal planning |
| `plan` | 🔜 v1 | Create architecture-compliant proposals for features/bugs |
| `implement` | 🔜 v1 | Execute an approved proposal with inside-out implementation |
| `troubleshoot` | 🔜 v1 | Investigate and fix bugs with architecture compliance checks |
| `validate` | ✅ Implemented | Validate project structure and AI adapter completeness |
| `nx-monorepo` | ✅ Implemented | Analyze and plan Nx monorepo strategy — plan-ahead or migration |
| `mcp-serve` | 🔜 v1 | Start an MCP server exposing CLI tools to AI agents |

### `init` Options

```bash
darkhorse-dotnet init [options]

  -n, --name <name>               Workspace name
  -d, --description <description> Short description
  -ns, --namespace <namespace>    Workspace namespace (default: PascalCase of name)
  --frontend / --no-frontend      Include frontend scaffold
  --platform <platform>           web | mobile | both (default: web)
  --kiro / --no-kiro              Generate Kiro steering files (default: --no-kiro)
  -o, --output <dir>              Parent directory (default: .)
```

### `add` Options

```bash
darkhorse-dotnet add <type> [options]

  <type>                          api | bff-api | microservice
  --name <name>                   Service name (lowercase, hyphenated)
  --namespace <namespace>         C# root namespace (e.g. MyCompany.Orders)
  --dotnet-version <version>      8 | 9 (default: 8)
```

### `ai sync` Options

```bash
darkhorse-dotnet ai sync [options]

  --tools <tools>                 Comma-separated: copilot, kiro (default: kiro)
  --force                         Overwrite existing adapter files
  -p, --path <path>               Project root (default: .)
```

Add Kiro steering files to an existing project without touching code or OpenSpec:

```bash
npx darkhorse-dotnet ai sync --tools kiro
```

Refresh both Copilot and Kiro adapters (overwrites existing files):

```bash
npx darkhorse-dotnet ai sync --tools copilot,kiro --force
```

### `discover` Options

```bash
darkhorse-dotnet discover [options]

  -i, --idea <idea>               Idea, feature, or change to explore
  -m, --mode <mode>               discovery | adjustment (default: discovery)
  --mvp <mvp>                     Target MVP milestone (e.g. 1.0)
  -c, --context <context>         Related bounded context
```

### Global Options

```bash
npx darkhorse-dotnet --verbose <command>   # Enable debug logging
npx darkhorse-dotnet --help                # Show help
npx darkhorse-dotnet --version             # Show version
```

---

## Service Archetypes

Every DarkHorse service is one of three archetypes. The archetype determines template selection, dependency tree, solution structure, and CQRS routing behavior.

### `api` — Standard REST Service

A service that owns its data, exposes HTTP endpoints, and contains full domain logic.

```
HTTP Request → Controller → Command Handler → Repository → Database (EF Core)
                          → Query Handler  → Repository → Database (EF Core)
```

**Scaffolded at:** `backend/apis/<name>/`

| Layer | Project | Behavior |
|-------|---------|----------|
| Presentation | `*.Presentation` | ASP.NET Core controllers, request/response models |
| Application | `*.Application` | Commands persist via repositories (MediatR), queries read from repositories |
| Domain | `*.Domain` | Full model: entities, value objects, aggregates, events, repository interfaces |
| Infrastructure | `*.Infrastructure` | EF Core repositories, DbContext, database migrations, optional messaging |

**Dependencies:** ASP.NET Core, EF Core, MediatR, FluentValidation, PostgreSQL (Npgsql)

### `bff-api` — Backend-for-Frontend

A routing and aggregation layer between a frontend and downstream services. **No persistence, no domain logic execution.**

```
HTTP Request → Controller (auth/claims) → Query Handler   → HttpClient → Downstream API
                                        → Command Handler → MassTransit → Broker
```

**Scaffolded at:** `backend/bffs/<name>/`

| Layer | Project | Behavior |
|-------|---------|----------|
| Presentation | `*.Presentation` | HTTP endpoints, authentication, claims/permissions enforcement |
| Application | `*.Application` | Queries → downstream API clients, commands → broker. **No repositories.** |
| Domain | `*.Domain` | **Interfaces and contracts only.** No entities, no aggregates, no business logic. |
| Infrastructure | `*.Infrastructure` | Typed HttpClient implementations, MassTransit message senders |

**Dependencies:** ASP.NET Core, HttpClient, MassTransit (RabbitMQ), MediatR. **No EF Core.**

### `microservice` — Message-Driven Service

A service that listens for commands/events from a broker, executes domain logic, and owns its data. **Not HTTP-first.**

```
Inbound Message → Consumer (MassTransit) → Command Handler → Domain Logic → Repository → Database
                                                           → Event Publisher → Broker → Other Services
```

**Scaffolded at:** `backend/microservices/<name>/`

| Layer | Project | Behavior |
|-------|---------|----------|
| Presentation | `*.Presentation` | MassTransit consumers (`IConsumer<T>`), optional health endpoints |
| Application | `*.Application` | Command handlers (triggered by messages), event handlers, query handlers |
| Domain | `*.Domain` | Full model: entities, value objects, aggregates, events |
| Infrastructure | `*.Infrastructure` | EF Core repositories, MassTransit config, integration event publishers |

**Dependencies:** MassTransit (RabbitMQ), EF Core, PostgreSQL (Npgsql), MediatR. **No REST by default.**

---

## What Gets Scaffolded

`init` generates two halves: the **runtime product** (backend, frontend, deployment) and the **development guidance system** (context, OpenSpec, rules, guides, workflows, roadmap). Together they form a self-contained project repository.

### `darkhorse-dotnet init` — Workspace Structure

```
<workspace>/
├── context/                          # AI navigation layer
│   ├── 00-START-HERE.md              # Entry point for agents & developers
│   ├── 10-REPO-MAP.md               # Folder layout & purpose
│   ├── 30-BOUNDED-CONTEXTS.md       # Context inventory & relationships
│   └── 50-SEARCH-QUERIES.md         # Search patterns for AI tools
│
├── openspec/                         # Living documentation & specs
│   ├── AGENTS.md                     # AI agent entry point
│   ├── specs/
│   │   ├── architecture/             # DDD, Onion, CQRS, SOLID rules
│   │   ├── domain/                   # Bounded context specs (you fill in)
│   │   ├── patterns/                 # Backend & frontend implementation patterns
│   │   ├── project/                  # roadmap.md, progress-tracker.md, MVPs
│   │   ├── toolkit/                  # UI component reference (if frontend)
│   │   └── workflow/                 # Planning, implementation, troubleshooting
│   ├── changes/                      # Active proposals (REQ-, BUG-, ENH-)
│   └── archive/                      # Completed proposals
│
├── backend/
│   ├── apis/                         # (empty) REST API services
│   ├── bffs/                         # (empty) BFF routing services
│   ├── microservices/                # (empty) Message-driven services
│   └── shared/
│       └── <WorkspaceNs>.Contracts/  # Workspace-shared published language
│           ├── Events/               # Integration events
│           ├── Abstractions/         # Shared interfaces
│           └── Primitives/           # Shared value types
│
├── frontend/                         # Optional — platform-dependent
│   ├── web-app/                      # React + Vite (--platform web or both)
│   └── mobile-app/                   # React Native + Expo (--platform mobile or both)
│
├── deployment/
│   └── docker-compose.yml
│
├── .darkhorse.yaml                   # Workspace config
├── .vscode/mcp.json                  # MCP server config
├── .gitignore
└── README.md
```

### `darkhorse-dotnet add <type>` — Service Structure

```
backend/<category>/<service-name>/
├── <Namespace>.sln
├── src/
│   ├── <Namespace>.Presentation/     # API layer (controllers / consumers) + Program.cs
│   ├── <Namespace>.Application/      # CQRS handlers, use cases, examples
│   ├── <Namespace>.Domain/           # Core domain — ZERO external dependencies
│   └── <Namespace>.Infrastructure/   # EF Core, messaging, external integrations
└── tests/
    ├── <Namespace>.UnitTests/
    └── <Namespace>.IntegrationTests/
```

### .NET Layer Mapping (Onion Architecture)

Dependencies point **inward only**:

| Layer | Project | Depends On |
|-------|---------|------------|
| **Domain** | `*.Domain` | NOTHING (zero dependencies) |
| **Application** | `*.Application` | Domain, Contracts |
| **Infrastructure** | `*.Infrastructure` | Application, Domain, Contracts |
| **Presentation** | `*.Presentation` | Application, Infrastructure (Contracts transitive) |
| **Contracts** | `*.Contracts` | NOTHING (zero dependencies) |

> **Contracts** (`<WorkspaceNs>.Contracts`) is a workspace-level class library at `backend/shared/`, created during `init`. It represents the **published language** of the workspace — the shared contracts that cross service boundaries. Application and Infrastructure layers reference it via relative `ProjectReference`. Presentation gets it transitively. Each service gets its own `Program.cs` entry point in the Presentation layer, tailored to the archetype (Swagger for api/bff-api, health checks only for microservice).
>
> **Contracts MUST contain:** integration events, cross-service message contracts, shared value types/primitives, true cross-service abstractions used by 2+ services.
>
> **Contracts MUST NOT contain:** service-specific DTOs, domain entities, repository interfaces, EF models, controller/request models, or generic utilities. If only one service uses a type, it belongs inside that service.

### Bounded Context Structure (per context)

```
*.Domain/Contexts/<ContextName>/
├── Entities/            # Aggregates, entities, value objects
├── Events/              # Domain events
└── Interfaces/          # Repository interfaces

*.Application/Contexts/<ContextName>/
├── Commands/            # Command handlers (MediatR IRequest)
├── Queries/             # Query handlers (MediatR IRequest)
├── DTOs/                # Data transfer objects
└── Validators/          # FluentValidation validators

*.Infrastructure/Contexts/<ContextName>/
├── Repositories/        # EF Core implementations
└── Configurations/      # Entity type configurations

*.Presentation/Contexts/<ContextName>/
└── Controllers/         # REST controllers or Minimal API endpoints
```

---

## Architecture Enforced

Every scaffolded workspace ships with living architecture documentation in `openspec/specs/architecture/`. These aren't suggestions — they're rules AI agents and developers must follow.

### Domain-Driven Design (DDD)

- **Bounded Contexts** are autonomous domains with their own models, language, persistence, and API
- **Ubiquitous Language** reflected in class names, methods, events, and endpoints
- **Context Mapping** via Shared Kernel, Customer-Supplier, Anti-Corruption Layer, or Published Language
- **No cross-context imports** — communication via APIs, events, or ACL only

### Onion Architecture

Dependencies point **inward only**. Domain has zero external dependencies.

```
Presentation ──▶ Application  ──▶ Domain (CORE — zero deps)
     │                  ▲
     └──▶ Infrastructure ─▸
```

### CQRS (via MediatR)

- **MediatR is required** — `IRequest<T>` and `IRequestHandler<T, R>` are the only approved CQRS dispatch mechanism
- **Commands** modify state, return void/ID, MAY publish integration events after successful persistence
- **Queries** return data with no side effects, MUST NOT modify state or publish events
- Separate read/write paths for scalability

### Additional Patterns

- **SOLID** principles enforced across all layers
- **Repository-per-Aggregate** — one repository per aggregate root (EF Core implementations)
- **Event-Driven** — domain events within context (MediatR notifications), integration events across contexts (MassTransit)
- **Inside-Out Implementation** — always build domain first, then outward

### Workspace Contracts Boundary

`<WorkspaceNs>.Contracts` is the published language of the workspace. Its boundary is enforced by rule and by the generated `.csproj` itself.

| Contracts MUST contain | Contracts MUST NOT contain |
|------------------------|----------------------------|
| Integration events | Service-specific DTOs |
| Cross-service message contracts | Domain entities or aggregates |
| Shared value types / primitives | Repository interfaces |
| Cross-service abstractions (2+ services) | EF models or persistence concerns |
| | Controller / request / response models |
| | Generic helpers or utilities |

> **Rule:** If only one service uses a type, it belongs inside that service — in `Domain`, `Application`, `Infrastructure`, or `Presentation` as appropriate. Putting single-service types in `Contracts` creates invisible coupling and defeats service autonomy.

---

## Frontend Stack

When scaffolded with `--frontend`, choose a target platform:

### Web — React + Vite (`--platform web`)

Scaffolds `frontend/web-app/` with a production-ready React stack:

| Package | Version | Role |
|---------|---------|------|
| react + react-dom | ^18.3.0 | UI framework |
| react-router-dom | ^7.0.0 | Client-side routing |
| @chakra-ui/react | ^2.0.0 | Accessible component library |
| tailwindcss | ^4.0.0 | Utility-first CSS (via `@tailwindcss/vite`) |
| zustand | ^5.0.0 | Lightweight global state |
| react-hook-form | ^7.0.0 | Form state management |
| @hookform/resolvers | ^3.0.0 | Connects forms to Zod schemas |
| zod | ^3.0.0 | TypeScript-first schema validation |
| vite | ^5.0.0 | Build tool |
| vitest | ^2.0.0 | Unit testing |

```bash
cd frontend/web-app && npm install && npm run dev
```

**Form pattern** — define Zod schema first, infer the type, wire to the form:

```typescript
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({ email: z.string().email(), name: z.string().min(1) })
type FormData = z.infer<typeof schema>

const { register, handleSubmit } = useForm<FormData>({ resolver: zodResolver(schema) })
```

### Mobile — React Native + Expo (`--platform mobile`)

Scaffolds `frontend/mobile-app/` with React Native 0.76, Expo SDK 52, Expo Router, Jest.

```bash
cd frontend/mobile-app && npm install && npx expo start
```

### Both — Web + Mobile (`--platform both`)

Scaffolds both `frontend/web-app/` and `frontend/mobile-app/`.

> Docker Compose includes a `frontend` service for web apps. Mobile apps are built and deployed separately.

---

## React Toolkit

When scaffolded with `--frontend`, your project includes a reference to the **React Toolkit** — a 14-package component library for enterprise UI patterns.

### Available Packages

| Category | Package | Description |
|----------|---------|-------------|
| **Planning & Flow** | `@react-toolkit/kanban` | Card-based workflow with swimlanes & drag-and-drop |
| | `@react-toolkit/gantt` | Project timeline with dependencies & resource tracking |
| | `@react-toolkit/timeline` | Event visualization with zoom & grouping |
| **Scheduling** | `@react-toolkit/scheduler` | Multi-view calendar (Day/Week/Month/Year/Agenda/Timeline) |
| **Data Visualization** | `@react-toolkit/tree-grid` | Hierarchical data tables with sort, filter, selection |
| | `@react-toolkit/charts` | Column, spline area, and pie charts |
| | `@react-toolkit/pivot-table` | Multi-dimensional data aggregation |
| | `@react-toolkit/tree-map` | Hierarchical space-filling visualization |
| **Content & Editing** | `@react-toolkit/rich-text-editor` | WYSIWYG with formatting, media, tables, mentions |
| | `@react-toolkit/image-editor` | Canvas-based with crop, filters, annotations |
| **AI & Assistance** | `@react-toolkit/chat-ui` | Conversational UI with typing indicators |
| | `@react-toolkit/ai-assist` | AI panel with prompt input & history |
| **Foundation** | `@react-toolkit/core` | Core utilities & shared types |
| | `@react-toolkit/design-tokens` | Design system (colors, spacing, typography) |

> **Important:** The toolkit is **read-only** within scaffolded projects. Always check available toolkit components before building custom UI. Never write files to `toolkit/` or `openspec/specs/toolkit/`.

---

## AI Tools Support

DarkHorse generated projects support multiple AI tools. All tools share the same project-owned VEP work state. OpenSpec may supply draft input, but materialized A1 is the sole editable plan authority—no duplicated process truth.

| Tool | Adapter Location | How to Enable |
|------|-----------------|---------------|
| **GitHub Copilot** | `.github/copilot-instructions.md`, `.github/agents/`, `.github/prompts/` | Always generated (default) |
| **Kiro** | `.kiro/steering/` (4 steering files) | `--kiro` flag on `init`, or `ai sync` |

### Enabling Kiro at init time

```bash
npx darkhorse-dotnet init --name my-project --kiro
```

### Adding Kiro to an existing project (backfill)

```bash
npx darkhorse-dotnet ai sync --tools kiro
```

This creates `.kiro/steering/` files without touching code, OpenSpec specs, or Copilot files. Re-running the command is safe — it skips files that already exist. Use `--force` to refresh them:

```bash
npx darkhorse-dotnet ai sync --tools kiro --force
```

### How the Kiro adapter works

Kiro reads `.kiro/steering/` on session start. Each steering file is a bridge that redirects Kiro to the canonical OpenSpec sources:

| File | Purpose |
|------|---------|
| `.kiro/steering/00-project.md` | Project identity and OpenSpec navigation |
| `.kiro/steering/01-workflow.md` | Workflow phase map (Discover → Plan → Implement → Troubleshoot) |
| `.kiro/steering/02-architecture.md` | Architecture rules summary + pointer to `openspec/specs/architecture/` |
| `.kiro/steering/03-tooling.md` | Tech stack, approved tools, and generation instructions |

**Rules:**
- Kiro steering files reference OpenSpec — they never duplicate it.
- Workflow skills stay in `openspec/specs/workflow/skills/` — one source for both Copilot and Kiro.
- Copilot slash commands (`.github/prompts/`) and Kiro natural-language instructions both execute the same skills.

### Validating AI adapter completeness

```bash
npx darkhorse-dotnet validate
```

This checks that all expected AI adapter files are present for the tools configured in `.darkhorse.yaml`.

### `.darkhorse.yaml` AI config shape

```yaml
ai:
  sourceOfTruth: openspec
  entrypoint: AGENTS.md
  tools:
    copilot: true
    kiro: true
```

---

## AI-Native Workflow

DarkHorse projects are designed for AI coding agents (GitHub Copilot, Kiro, Claude, Codex). The development guidance system includes:

### Context Layer (`context/`)

- **00-START-HERE.md** — First file any agent reads. Workspace overview and navigation.
- **10-REPO-MAP.md** — What lives where and why. Adapts to services present.
- **30-BOUNDED-CONTEXTS.md** — Context inventory, relationships, integration patterns.
- **50-SEARCH-QUERIES.md** — Pre-built search patterns for finding handlers, events, repositories.

### OpenSpec System (`openspec/`)

- **AGENTS.md** — Agent entry point with architecture rules, code placement, and forbidden patterns.
- **specs/architecture/** — Enforceable rules (not guidelines).
- **specs/domain/** — Bounded context specifications (you fill in).
- **specs/patterns/** — Backend and frontend implementation patterns.
- **specs/workflow/** — How to plan, implement, and troubleshoot.

---

## Skills & Workflow System

DarkHorse defines four interconnected workflow skills that create a continuous development cycle:

```
┌───────────┐     ┌──────────┐     ┌─────────────┐     ┌────────────────┐
│ Discovery │——▸│ Planning │——▸│ Implement   │——▸│ Troubleshoot   │
│           │◂——│          │◂——│             │◂——│                │
└───────────┘     └──────────┘     └─────────────┘     └────────────────┘
```

### Discovery Skill

Guides product discovery and MVP shaping **before formal planning begins**:

1. Understand the idea or scope change
2. Identify user goal and problem being solved
3. Explore scope, surface missing concerns, and compare options
4. Evaluate tradeoffs (now vs later, essential vs optional, leverage vs complexity)
5. Produce structured discovery document at `openspec/changes/discoveries/DISC-{###}.md`

Supports two modes:
- **Discovery** — new idea exploration, expanding and narrowing scope
- **Adjustment** — re-evaluating existing plans when new ideas or constraints appear

### Planning Skill

Creates architecture-compliant proposals **before any code is written**:

1. Load architecture rules and context maps
2. Identify bounded context (new or existing)
3. Define ubiquitous language
4. Validate against DDD, Onion Architecture, CQRS rules
5. Generate proposal at `openspec/changes/mvp-[MVP]/REQ-[MVP]-[###]/`

### Implementation Skill

Executes approved proposals with inside-out layer ordering:

1. Verify proposal file exists in `openspec/changes/` (HARD STOP if missing)
2. Scaffold or extend bounded context
3. Implement: Domain → Application → Infrastructure → Presentation → Frontend → Deployment
4. Write tests (80%+ coverage required)
5. Update context maps and mark tasks complete

### Troubleshooting Skill

Investigates bugs with full architecture awareness:

1. Identify affected bounded context and layer
2. Categorize (code bug, architecture violation, cross-context issue, toolkit bug)
3. Check for DDD/Onion/CQRS violations
4. Produce bug report — does NOT implement fixes
5. Define regression tests

### Requirement Lifecycle

Requirements follow a strict naming model:

```
REQ-{MVP}-{###}    ← Feature requirement
ENH-{MVP}-{###}    ← Enhancement
BUG-{MVP}-{###}    ← Bug fix
```

Example: `REQ-1.0-001`, `REQ-2.0-003`, `BUG-1.0-002`

| Scope | What It Covers |
|-------|----------------|
| `full-slice` | Domain + Application + Infrastructure + Presentation + Frontend + Tests |
| `backend` | Backend layers + Tests only |
| `frontend` | UI + State + API integration + Tests |
| `infrastructure` | Deployment, DevOps, configuration |

> **Default:** All requirements are `full-slice` unless otherwise specified.

Each MVP is a **fully deliverable unit of work** — independently deployable and demonstrably valuable. When all requirements for an MVP are done and tests pass, the MVP folder moves from `openspec/changes/mvp-X.Y/` to `openspec/archive/mvp-X.Y/` and `roadmap.md` is updated.

```bash
npx darkhorse-dotnet discover      # Explore and shape ideas → openspec/changes/discoveries/DISC-001.md
npx darkhorse-dotnet plan          # Create proposal → openspec/changes/mvp-1.0/REQ-1.0-001/
npx darkhorse-dotnet implement     # Execute approved proposal (inside-out)
npx darkhorse-dotnet troubleshoot  # Investigate and document a bug
npx darkhorse-dotnet validate      # Validate specs and architecture compliance
```

### Nx Monorepo Skill

Evaluates whether Nx makes sense for your workspace and produces a full adoption plan:

- **Plan-ahead mode** — designing a new Nx monorepo from scratch (greenfield or multi-project)
- **Migration mode** — migrating existing standalone projects into an Nx workspace

```bash
npx darkhorse-dotnet nx-monorepo  # Interactive prompts for mode, projects, ecosystems
```

The skill scores workspace fit (0–100), identifies shared-library opportunities, maps native build commands to Nx targets, and outputs phased setup/migration steps with risk assessments. Every analysis includes structured tradeoffs (dimension, benefit, cost, verdict) so teams can make informed decisions.

Output includes:
- Recommendation: **recommended** / **optional** / **not-recommended** with numeric fit score
- Target workspace design with Nx plugins and directory structure
- Project mapping (source → target or new → target)
- Task orchestration plan (Nx targets wrapping `dotnet`, `npm`, `mvn`, etc.)
- Setup or migration steps — phased, with `low` / `medium` / `high` risk labels
- CI/CD considerations for Nx Cloud and `affected` commands

---

## MCP Server Integration

DarkHorse includes infrastructure for a **Model Context Protocol (MCP)** server, allowing AI agents in VS Code to invoke CLI tools programmatically. Every scaffolded project also ships a pre-wired `.vscode/mcp.json` that connects your workspace to the key tools in your delivery ecosystem.

```bash
npx darkhorse-dotnet mcp-serve   # Start MCP server on stdio
```

### DarkHorse Tools

| Tool | Purpose |
|------|---------|
| `darkhorse_init` | Initialize a workspace |
| `darkhorse_add` | Add a service to the workspace |
| `darkhorse_discover` | Explore and shape a product idea |
| `darkhorse_plan` | Create a feature/bug proposal |
| `darkhorse_implement` | Execute an approved proposal |
| `darkhorse_troubleshoot` | Investigate and fix a bug |

> **Status:** MCP server infrastructure is in place. Full SDK integration is planned for v1.

### Ecosystem Integrations

The generated `.vscode/mcp.json` pre-wires four additional MCP servers. Remove any you don't need, or keep them all — VS Code only prompts for credentials when you first use a server.

| Server | Purpose | Auth |
|--------|---------|------|
| **GitHub** (`github`) | PRs, issues, code search | VS Code OAuth (no setup) |
| **Azure DevOps** (`azure-devops`) | Work items, pipelines, repos | Browser login on first use; enter your ADO org name when prompted |
| **Atlassian** (`atlassian`) | Jira issues, Confluence pages | Browser OAuth on first use (Atlassian Cloud) |
| **Google Drive** (`google-drive`) | Read/write Drive documentation | Google Cloud OAuth; requires `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` |

**Google Drive setup** (one-time):
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/) and enable the Drive API
2. Create an **OAuth 2.0 Client ID** (Desktop application type)
3. Copy the Client ID and Client Secret — VS Code will prompt for these on first use

**Prefer Jira over Azure DevOps?** Both are included; remove the server you don't use from `.vscode/mcp.json`.

> **Requires:** Python 3.10+ and [uv](https://github.com/astral-sh/uv) (`pip install uv`) for the Google Drive server.

---

## Development

```bash
git clone <repo-url>
cd darkhorse-dotnet
npm install
npm run build          # Compile TypeScript → dist/
npm run dev            # Watch mode
npm start              # Run CLI from dist/
npm test               # Run tests once
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report
```

### MCP Server Setup

After scaffolding a project, configure the MCP servers in `.vscode/mcp.json`. VS Code prompts for credentials the first time each server is used — nothing needs to be set in advance except where noted below.

#### GitHub — PRs, Issues, Code Search

The GitHub server uses VS Code's built-in OAuth by default — **no setup required**. If you prefer a Personal Access Token (PAT) or need to authenticate outside VS Code:

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens/new)
2. Choose **Fine-grained token** (recommended) or **Classic token**
3. For fine-grained: set repository access and grant **Contents**, **Issues**, **Pull requests**, and **Metadata** (read-only is sufficient for most use)
4. For classic: select scopes `repo`, `read:org`, `read:user`
5. Copy the generated token

Then add a `headers` block to the `github` server entry in `.vscode/mcp.json`:

```json
"github": {
  "type": "http",
  "url": "https://api.githubcopilot.com/mcp/",
  "headers": {
    "Authorization": "Bearer <your-pat>"
  }
}
```

#### Azure DevOps — Work Items, Pipelines, Repos

No credentials to configure in advance. When VS Code first activates this server:

1. You will be prompted for your **Azure DevOps organization name** — the segment after `dev.azure.com/` in your org's URL (e.g. for `https://dev.azure.com/contoso` enter `contoso`)
2. A browser window opens for Microsoft account login
3. After authorizing, the server connects automatically for all future sessions

> Remove the `azure-devops` entry from `.vscode/mcp.json` if your team uses Jira/Atlassian instead.

#### Atlassian — Jira Issues, Confluence Pages

No credentials to configure in advance. On first use:

1. A browser window opens for Atlassian OAuth — sign in with your Atlassian Cloud account
2. Grant the requested Jira and Confluence permissions
3. Access is scoped to what your Atlassian account can already see — no elevated permissions are granted

> The first user to authorize on a site must have admin access. Subsequent team members can authorize themselves. See [Atlassian MCP docs](https://support.atlassian.com/rovo/docs/getting-started-with-the-atlassian-remote-mcp-server/) for admin controls.

> Remove the `atlassian` entry from `.vscode/mcp.json` if your team uses Azure DevOps instead.

#### Google Drive — Documentation

**Prerequisites:** Python 3.10+ and [`uv`](https://github.com/astral-sh/uv) installed (`pip install uv`).

Google requires an OAuth app before anything else. This is a one-time setup per team or developer:

1. Open [Google Cloud Console](https://console.cloud.google.com/) → create or select a project
2. Go to **APIs & Services → Library** → search for and enable **Google Drive API**
3. Go to **APIs & Services → Credentials** → **Create Credentials → OAuth 2.0 Client ID**
4. Choose **Desktop application** as the application type, give it a name
5. Copy the **Client ID** and **Client Secret** shown (or download the JSON — the values are inside)

When VS Code first prompts for the Google Drive server inputs:

| Prompt | What to enter |
|--------|---------------|
| `Google OAuth Client ID` | Your Client ID — looks like `123456789-xxxx.apps.googleusercontent.com` |
| `Google OAuth Client Secret` | Your Client Secret |

On the first tool call, a browser window opens for Google consent. Tokens are cached at `~/.google_workspace_mcp/credentials/` and reused automatically.

> Remove the `google-drive` entry from `.vscode/mcp.json` if your team uses a different documentation platform.

### Test Suite

206 tests across 7 files validate generated output quality:

| File | Tests | What It Validates |
|------|-------|-------------------|
| `golden-path-init.test.ts` | 33 | Workspace init with no/web/mobile frontend, Contracts scaffold |
| `golden-path-add.test.ts` | 43 | Add api, bff-api, microservice, domain model starters, Contracts references |
| `archetype-validation.test.ts` | 37 | Deep per-archetype assertions (deps, layers, patterns, domain model correctness) |
| `openspec-output.test.ts` | 40 | AGENTS.md, roadmap, progress tracker, architecture specs |
| `context-output.test.ts` | 26 | All 4 context files, frontend-conditional content |
| `workspace-updates.test.ts` | 14 | Config persistence, context/OpenSpec file integrity, multi-service isolation |
| `dotnet-smoke.test.ts` | 13 | `dotnet restore` + `dotnet build` per archetype |

Smoke tests require `.NET SDK 8+` installed. They are skipped automatically if `dotnet` is not on the PATH.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| CLI Framework | Commander 12.1.0 |
| Prompts | Inquirer 9.3.0 |
| Templating | Handlebars 4.7.8 |
| Config Format | YAML |
| Language | TypeScript 5 (ESM, ES2022/Node16) |
| Runtime | Node.js 18+ |
| Test Runner | Vitest |

---

## License

MIT
