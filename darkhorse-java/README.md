# DarkHorse Java

> **Scaffolder** — Generates Java products with the full DarkHorse development guidance system

**DarkHorse Java** is a scaffolder CLI. It generates a complete project — Quarkus backend, React frontend, Docker Compose deployment, **and** the development guidance system (OpenSpec, context, rules, guides, workflows, roadmap) — from a single `init` command. Each project enforces DDD, Onion Architecture, and CQRS at every layer. Generated projects are fully self-contained — no runtime dependency on the CLI.

### Role in the DarkHorse Ecosystem

| Concern | DarkHorse Java |
|---------|---------------|
| **Is** | A scaffolder — a CLI tool that generates project repositories |
| **Generates** | Runtime product structure + development guidance system |
| **Does not** | Run as part of the generated project or manage runtime concerns |

---

## Table of Contents

- [Why DarkHorse?](#why-darkhorse)
- [Quick Start](#quick-start)
- [CLI Commands](#cli-commands)
- [Archetypes](#archetypes)
- [What Gets Scaffolded](#what-gets-scaffolded)
- [Architecture Enforced](#architecture-enforced)
- [Frontend Stack](#frontend-stack)
- [React Toolkit](#react-toolkit)
- [AI-Native Workflow](#ai-native-workflow)
- [Skills & Workflow System](#skills--workflow-system)
- [MCP Server Integration](#mcp-server-integration)
- [Development](#development)
- [Tech Stack](#tech-stack)
- [License](#license)

---

## Why DarkHorse?

Most scaffolding tools give you a folder structure and walk away. DarkHorse generates **both the product and the process**:

- **Product + process in one command** — `init` scaffolds the runtime product (Quarkus backend, React frontend, Docker Compose) and the development guidance system (OpenSpec, context, rules, guides, workflows, roadmap) — all structured and ready to develop.
- **Architecture is law** — DDD, Onion Architecture, CQRS, and SOLID principles are baked into every generated project via living documentation that AI agents and developers follow.
- **Three clear archetypes** — `api`, `bff-api`, and `microservice` generate structurally different projects with enforced constraints per type.
- **AI-native from day one** — A `context/` navigation layer and `openspec/` spec system guide AI coding agents through the codebase without hallucinating structure.
- **Proposal-driven development** — All changes flow through a plan → implement → troubleshoot cycle with standardised proposals, ensuring architectural compliance before code is written.
- **Frontend platform choice** — React + Vite for web, React Native + Expo for mobile, or both — with an optional 14-package component toolkit.
- **Zero lock-in** — After `darkhorse-java init`, the project is completely standalone. The `.darkhorse.yaml` is provenance only.

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- Java 17 or 21
- Maven

### Full Product (Recommended)

Scaffold a complete product — backend, React frontend, and deployment — in one command:

```bash
npx darkhorse-java init \
  --type api \
  --name order-management \
  --description "Order management platform" \
  --group-id com.mycompany \
  --java-version 21 \
  --frontend \
  --platform web \
  --output ./projects
```

You now have:
- `backend/apis/` — Quarkus service (DDD, Onion, CQRS)
- `frontend/web-app/` — React + Chakra UI + Tailwind + Zustand + Zod
- `deployment/docker-compose.yml` — Docker Compose for local development

### Backend Only

Skip the frontend and scaffold the backend only:

```bash
npx darkhorse-java init \
  --type api \
  --name order-management \
  --group-id com.mycompany \
  --no-frontend
```

### Interactive Mode

Run without flags for guided prompts:

```bash
npx darkhorse-java init
```

You'll be prompted for:

| Prompt | Example | Notes |
|--------|---------|-------|
| Project archetype | `api` | `api`, `bff-api`, or `microservice` |
| Project name | `order-management` | Lowercase, hyphenated |
| Maven group ID | `com.mycompany` | Java package format |
| Include frontend? | `yes` / `no` | Adds React or React Native scaffold |
| Frontend platform | `web` / `mobile` / `both` | React + Vite, React Native + Expo, or both |
| Java version | `21` | 17 or 21 |

### After Scaffolding

```bash
cat context/00-START-HERE.md   # AI navigation entry point
cat openspec/AGENTS.md         # Architecture rules and agent guide
```

Then start building with the workflow agents:

```bash
npx darkhorse-java discover      # Explore and shape an idea before planning
npx darkhorse-java plan          # Create a feature proposal
npx darkhorse-java implement     # Execute an approved proposal
npx darkhorse-java troubleshoot  # Investigate a bug
```

---

## CLI Commands

| Command | Status | Description |
|---------|--------|-------------|
| `init` | ✅ Implemented | Scaffold a new project with interactive prompts |
| `discover` | 🔜 v1 | Explore and shape product ideas before formal planning |
| `plan` | 🔜 v1 | Create architecture-compliant proposals for features/bugs |
| `implement` | 🔜 v1 | Execute an approved proposal with inside-out implementation |
| `troubleshoot` | 🔜 v1 | Investigate and fix bugs with architecture compliance checks |
| `validate` | 🔜 v1 | Validate project specs and architecture compliance |
| `nx-monorepo` | ✅ Implemented | Analyze and plan Nx monorepo strategy — plan-ahead or migration |
| `mcp-serve` | 🔜 v1 | Start an MCP server exposing CLI tools to AI agents |

### Global Options

```bash
npx darkhorse-java --verbose <command>   # Enable debug logging
npx darkhorse-java --help                # Show help
npx darkhorse-java --version             # Show version
```

---

## Archetypes

Every DarkHorse project is one of three archetypes. The archetype determines template selection, dependency tree, folder structure, and CQRS routing behavior.

### `api` — Standard REST Service

A service that owns its data, exposes HTTP endpoints, and contains full domain logic.

```
HTTP Request → Controller → Command Handler → Repository → Database
                          → Query Handler → Repository → Database
```

| Layer | Behavior |
|-------|----------|
| Presentation | REST controllers, request/response models |
| Application | Commands persist via repositories, queries read from repositories |
| Domain | Full model: entities, value objects, aggregates, events, repository interfaces |
| Infrastructure | Repository implementations (JPA/Panache), database, optional messaging |

**Dependencies:** Quarkus REST, Hibernate ORM/Panache, PostgreSQL JDBC, Hibernate Validator

### `bff-api` — Backend-for-Frontend

A routing and aggregation layer between a frontend and downstream services. **No persistence, no domain logic execution.**

```
HTTP Request → Controller (auth/claims) → Query Handler → API Client → Downstream API
                                        → Command Handler → Message Sender → Broker
```

| Layer | Behavior |
|-------|----------|
| Presentation | HTTP endpoints, authentication, claims/permissions enforcement |
| Application | Queries → downstream API clients, commands → broker. **No repositories.** |
| Domain | **Interfaces and contracts only.** No entities, no aggregates, no business logic. |
| Infrastructure | REST API client implementations, message broker sender implementations |

**Dependencies:** Quarkus REST, REST Client, Reactive Messaging (AMQP), Hibernate Validator. **No persistence.**

### `microservice` — Message-Driven Service

A service that listens for commands/events from a broker, executes domain logic, and owns its data. **Not HTTP-first.**

```
Inbound Message → Listener → Command Handler → Domain Logic → Repository → Database
                                              → Event Publisher → Broker → Other Services
```

| Layer | Behavior |
|-------|----------|
| Presentation | Message listeners (`@Incoming`), optional health endpoints |
| Application | Command handlers (triggered by messages), event handlers, query handlers |
| Domain | Full model: entities, value objects, aggregates, events |
| Infrastructure | Repositories, broker config, integration event publishers |

**Dependencies:** Reactive Messaging (AMQP), Hibernate ORM/Panache, PostgreSQL JDBC, Jackson. **No REST by default.**

---

## What Gets Scaffolded

`init` generates two halves: the **runtime product** (backend, frontend, deployment) and the **development guidance system** (context, OpenSpec, rules, guides, workflows, roadmap). Together they form a self-contained project repository.

```
<project>/
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
│   │   ├── project/                  # Roadmap, MVPs, progress tracking
│   │   ├── toolkit/                  # UI component reference (if frontend)
│   │   └── workflow/                 # Planning, implementation, troubleshooting
│   ├── changes/                      # Active proposals
│   └── archive/                      # Completed proposals
│
├── backend/                          # Java/Quarkus (Onion Architecture)
│   └── <category>/                   # apis/, bffs/, or microservices/
│       ├── pom.xml                   # Maven + Quarkus BOM
│       ├── contexts/                 # Bounded contexts live here
│       └── examples/                 # Example command/query handlers
│
├── frontend/                         # Optional — platform-dependent
│   ├── web-app/                      # React + Vite (--platform web or both)
│   └── mobile-app/                   # React Native + Expo (--platform mobile or both)
│
├── deployment/                       # Infrastructure
│   └── docker-compose.yml
│
├── .darkhorse.yaml                   # Scaffolding provenance
├── .vscode/mcp.json                  # MCP server config
├── .gitignore
└── README.md
```

### Bounded Context Structure (per context)

When you create a bounded context, it follows DDD Onion Architecture:

```
backend/<category>/contexts/<context-name>/
├── domain/                # Core — ZERO external dependencies
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   ├── exceptions/
│   └── GLOSSARY.md        # Ubiquitous language
├── application/           # Use cases — depends on domain only
│   ├── commands/
│   ├── queries/
│   ├── services/
│   ├── dtos/
│   └── interfaces/
├── infrastructure/        # Adapters — depends on application + domain
│   ├── repositories/
│   ├── database/
│   ├── messaging/
│   └── external/
└── presentation/          # API layer — depends on application + domain
    ├── controllers/
    ├── middleware/
    └── models/
```

---

## Architecture Enforced

Every scaffolded project ships with living architecture documentation in `openspec/specs/architecture/`. These aren't suggestions — they're the rules AI agents and developers must follow.

### Domain-Driven Design (DDD)

- **Bounded Contexts** are autonomous domains with their own models, language, persistence, and API
- **Ubiquitous Language** reflected in class names, methods, events, and endpoints
- **Context Mapping** via Shared Kernel, Customer-Supplier, Anti-Corruption Layer, or Published Language
- **No cross-context imports** — communication via APIs, events, or ACL only

### Onion Architecture

```
Presentation → Infrastructure → Application → Domain (CORE)
```

Dependencies point **inward only**. Domain has zero external dependencies.

### CQRS

- **Commands** modify state, return void/ID, publish events
- **Queries** return data with no side effects, can use optimized read models
- Separate read/write paths for scalability

### Additional Patterns

- **SOLID** principles enforced across all layers
- **Repository-per-Aggregate** — one repository per aggregate root
- **Event-Driven** — domain events within context, integration events across contexts
- **Inside-Out Implementation** — always build domain first, then outward

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

Scaffolds `frontend/mobile-app/` with:

- React Native 0.76, Expo SDK 52, Expo Router
- Jest + jest-expo for testing
- File-based routing via `app/` directory
- Optional toolkit dependencies

```bash
cd frontend/mobile-app && npm install && npx expo start
```

### Both — Web + Mobile (`--platform both`)

Scaffolds both `frontend/web-app/` and `frontend/mobile-app/` with their respective stacks above.

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

## AI-Native Workflow

DarkHorse projects are designed for AI coding agents (GitHub Copilot, Claude, Codex). The development guidance system includes:

### Context Layer (`context/`)

An AI-optimized navigation system:

- **00-START-HERE.md** — First file any agent should read. Project overview, architecture summary, and navigation pointers.
- **10-REPO-MAP.md** — What lives where and why.
- **30-BOUNDED-CONTEXTS.md** — Context inventory, relationships, and integration patterns.
- **50-SEARCH-QUERIES.md** — Pre-built search patterns for finding domain events, command handlers, repositories, etc.

### OpenSpec System (`openspec/`)

Living documentation that agents reference before writing code:

- **AGENTS.md** — Agent entry point with reading order, architecture rules, code placement rules, and forbidden patterns.
- **specs/architecture/** — Enforceable rules (not guidelines).
- **specs/domain/** — Bounded context specifications (you create these).
- **specs/patterns/** — Implementation patterns for backend and frontend.
- **specs/workflow/** — How to plan, implement, and troubleshoot.

### Prompt Starters

Ready-to-use prompts in `guides/prompt-starters.md` for common tasks:

- Onboarding to a new project
- Creating a bounded context
- Planning an MVP feature
- Implementing from a proposal
- Debugging with architecture compliance
- Running architecture reviews

---

## Skills & Workflow System

DarkHorse defines four interconnected workflow skills that create a continuous development cycle:

```
┌───────────┐     ┌──────────┐     ┌─────────────┐     ┌────────────────┐
│ Discovery │────▸│ Planning │────▸│ Implement   │────▸│ Troubleshoot   │
│           │◂────│          │◂────│             │◂────│                │
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
npx darkhorse-java discover      # Explore and shape ideas → openspec/changes/discoveries/DISC-001.md
npx darkhorse-java plan          # Create proposal → openspec/changes/mvp-1.0/REQ-1.0-001/
npx darkhorse-java implement     # Execute approved proposal (inside-out)
npx darkhorse-java troubleshoot  # Investigate and document a bug
npx darkhorse-java validate      # Validate specs and architecture compliance
```

### Nx Monorepo Skill

Evaluates whether Nx makes sense for your workspace and produces a full adoption plan:

- **Plan-ahead mode** — designing a new Nx monorepo from scratch (greenfield or multi-project)
- **Migration mode** — migrating existing standalone projects into an Nx workspace

```bash
npx darkhorse-java nx-monorepo  # Interactive prompts for mode, projects, ecosystems
```

The skill scores workspace fit (0–100), identifies shared-library opportunities, maps native build commands to Nx targets, and outputs phased setup/migration steps with risk assessments. Every analysis includes structured tradeoffs (dimension, benefit, cost, verdict) so teams can make informed decisions.

Output includes:
- Recommendation: **recommended** / **optional** / **not-recommended** with numeric fit score
- Target workspace design with Nx plugins and directory structure
- Project mapping (source → target or new → target)
- Task orchestration plan (Nx targets wrapping `mvn`, `npm`, `dotnet`, etc.)
- Setup or migration steps — phased, with `low` / `medium` / `high` risk labels
- CI/CD considerations for Nx Cloud and `affected` commands

---

## MCP Server Integration

DarkHorse includes infrastructure for a **Model Context Protocol (MCP)** server, allowing AI agents in VS Code to invoke CLI tools programmatically. Every scaffolded project also ships a pre-wired `.vscode/mcp.json` that connects your workspace to the key tools in your delivery ecosystem.

```bash
npx darkhorse-java mcp-serve   # Start MCP server on stdio
```

### DarkHorse Tools

| Tool | Purpose |
|------|---------|
| `darkhorse_init` | Scaffold a new project || `darkhorse_discover` | Explore and shape a product idea || `darkhorse_plan` | Create a feature/bug proposal |
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

### Setup

```bash
git clone <repo-url>
cd darkhorse-java
npm install
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

### Build & Run

```bash
npm run build          # Compile TypeScript → dist/
npm run dev            # Watch mode
npm start              # Run CLI from dist/
```

### Test

```bash
npm test               # Run tests once
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report
```

Coverage thresholds: **80% line**, **75% branch**, **80% function**, **80% statement**.

### Lint & Type Check

```bash
npm run lint           # ESLint
npm run type-check     # TypeScript strict check
```

### Project Architecture

```
src/
├── index.ts               # CLI entry point (Commander)
├── commands/              # Command handlers (thin — delegate to agents)
├── agents/                # Orchestrators (thin — delegate to skills)
├── skills/                # Business logic (scaffolding, openspec, context)
├── core/                  # Utilities (config, fs, logger, templates, types)
└── mcp/                   # MCP server, tools, and resources
```

**Design principle:** Commands → Agents → Skills. Each layer is thinner than the one below it. All business logic lives in skills.

---

## Tech Stack

| Dependency | Purpose |
|-----------|---------|
| [Commander](https://github.com/tj/commander.js) | CLI framework |
| [Handlebars](https://handlebarsjs.com/) | Template rendering |
| [Inquirer](https://github.com/SBoudrias/Inquirer.js) | Interactive prompts |
| [Chalk](https://github.com/chalk/chalk) | Terminal colours |
| [YAML](https://github.com/eemeli/yaml) | Config serialization |
| [TypeScript](https://www.typescriptlang.org/) | Type safety (ES2022, strict) |
| [Vitest](https://vitest.dev/) | Unit testing + coverage |

---

## License

MIT
