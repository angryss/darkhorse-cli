# Scaffolding Rules (v4.0)

**Mandatory rules for scaffolding new and existing projects.**

> ⚠️ **darkhorse-java is scaffolding-only.** Once a project is scaffolded, darkhorse-java is NOT referenced. The project repo is fully self-contained.
>
> ✅ **Every project is a single repository — fully self-contained.**
>
> ✅ **Specs, workflow docs, and context files are seeded INTO the project and work standalone.**

---

## Rule 0: Single Repository Per Project

Every project lives in its **own repository**. The repository contains all code, specs, context, and deployment artifacts. After scaffolding, the project has **zero dependencies on darkhorse-java**.

```
<project-name>/                    ← One repo = one project
├── context/                       ← AI navigation & project context
├── openspec/                      ← Specs, proposals, archive
├── backend/                       ← Backend code
├── frontend/                      ← Frontend code
├── deployment/                    ← Pipelines, IaC, packaging
└── .darkhorse.yaml                ← Scaffolding provenance only
```

### What `.darkhorse.yaml` Contains

This file records **when and how** the project was scaffolded. It is NOT a runtime reference.

```yaml
provenance:
  scaffolded_by: "darkhorse-java"
  version: "1.0.0"
  seeded_at: "2025-01-15T10:30:00Z"
  openspec_version: "1.0.0"

project:
  structure: single-repo
  canonical_folders:
    - context
    - openspec
    - backend
    - frontend
    - deployment
```

---

## Rule 1: Canonical Project Structure

> ⚠️ **This is the ONLY allowed top-level structure.** All agents (Codex, Claude, Copilot) MUST follow this exactly.

```
<project-name>/                     ← Repository root
│
├── context/                        ← Project context for AI tools
│   ├── 00-START-HERE.md            ← Entry point for all agents
│   ├── 10-REPO-MAP.md             ← Folder layout and navigation
│   ├── 20-WORKSPACE-PROJECTS.md   ← Workspace inventory & relationships
│   ├── 30-BOUNDED-CONTEXTS.md     ← Context inventory and relationships
│   ├── 50-SEARCH-QUERIES.md       ← Search recipes for AI tools
│   └── 90-LINKS.md                ← Quick links to key files
│
├── openspec/                       ← OpenSpec root (specs + proposals)
│   ├── AGENTS.md                   ← AI agent instructions (READ FIRST)
│   ├── config.yaml                 ← OpenSpec configuration
│   ├── specs/                      ← Living documentation
│   │   ├── architecture/           ← DDD, Onion Arch, CQRS rules
│   │   ├── domain/                 ← Bounded context specs (project-specific)
│   │   ├── patterns/               ← Backend & frontend implementation patterns
│   │   ├── project/                ← Roadmap, MVPs, progress tracking
│   │   │   ├── roadmap.md
│   │   │   ├── progress-tracker.md
│   │   │   └── mvps/
│   │   ├── toolkit/                ← UI component reference (READ-ONLY)
│   │   └── workflow/               ← Development workflow (self-contained)
│   │       ├── planning.md
│   │       ├── implementation.md
│   │       ├── troubleshooting.md
│   │       └── mvp-milestones.md
│   ├── changes/                    ← Active proposals (REQ/BUG/ENH)
│   └── archive/                    ← Completed changes
│
├── backend/                        ← Backend code
│   ├── contexts/                   ← Bounded contexts (DDD)
│   │   └── <context-name>/
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   ├── value-objects/
│   │       │   ├── events/
│   │       │   ├── services/
│   │       │   └── GLOSSARY.md
│   │       ├── application/
│   │       │   ├── commands/
│   │       │   ├── queries/
│   │       │   ├── handlers/
│   │       │   ├── dtos/
│   │       │   └── interfaces/
│   │       ├── infrastructure/
│   │       │   ├── repositories/
│   │       │   ├── messaging/
│   │       │   └── persistence/
│   │       ├── presentation/
│   │       │   ├── controllers/
│   │       │   └── routes/
│   │       ├── tests/
│   │       └── README.md
│   └── common/                     ← Shared contracts & utilities
│       ├── contracts/
│       │   ├── events/
│       │   ├── commands/
│       │   └── dtos/
│       ├── utils/
│       └── types/
│
├── frontend/                       ← Frontend code
│   ├── web-app/                    ← Web application (React)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── utils/
│   │   ├── tests/
│   │   └── package.json
│   ├── desktop-app/                ← Desktop (Electron/Tauri) — if needed
│   ├── mobile-app/                 ← Mobile (React Native) — if needed
│   └── shared/                     ← Shared frontend components
│
├── deployment/                     ← Deployment & infrastructure
│   ├── scripts/
│   │   ├── deploy.ps1
│   │   ├── start-dev.ps1
│   │   └── stop-dev.ps1
│   ├── dev/
│   │   ├── docker-compose.yml
│   │   └── .env.dev
│   └── prod/
│       ├── docker-compose.yml
│       ├── kubernetes/
│       └── .env.prod
│
├── .darkhorse.yaml                  ← Scaffolding provenance only
└── README.md
```

---

## Rule 2: The `context/` Folder

The `context/` folder is the **AI navigation layer**. It helps Codex, Claude, and Copilot understand the project structure, find relevant code, discover sibling projects, and work efficiently.

### Purpose

| File | Purpose | Updated By |
|------|---------|-----------|
| `00-START-HERE.md` | Entry point — tells agents where to look first | Manual |
| `10-REPO-MAP.md` | Describes the folder layout and what lives where | Manual |
| `20-WORKSPACE-PROJECTS.md` | All workspace projects, purpose, relationships | Manual |
| `30-BOUNDED-CONTEXTS.md` | Lists all bounded contexts, their owners, and relationships | Manual |
| `50-SEARCH-QUERIES.md` | Search patterns for finding code by architectural pattern | Manual |
| `90-LINKS.md` | Quick links to specs, roadmap, progress tracker | Manual |

### Rules

- `context/` is **always present** — created during scaffolding
- AI agents MUST read `context/00-START-HERE.md` then `context/20-WORKSPACE-PROJECTS.md`
- Update `context/30-BOUNDED-CONTEXTS.md` whenever a new bounded context is added
- Update `context/10-REPO-MAP.md` when folder structure changes
- The **Cross-Project Relationships** section in `20-WORKSPACE-PROJECTS.md` is maintained manually

### Augment-Enhanced Context (Optional)

When Augment is enabled during scaffolding (`--augment`):
- `AGENTS.md` includes Augment-specific instructions for cross-repo discovery
- `00-START-HERE.md` includes Augment usage guidance
- `.darkhorse.yaml` records `augment_enabled: true`
- AI agents are instructed to use Augment indexes alongside `context/` files
- `context/` files still serve as the structured overview; Augment provides live code intelligence

---

## Rule 3: The `openspec/specs/` Folder

OpenSpec specs are **seeded during scaffolding** and then maintained independently as the project evolves. After scaffolding, the specs are self-contained.

### Required Spec Folders

| Folder | Seeded From | Editable After Scaffolding | Purpose |
|--------|-------------|---------------------------|---------|
| `architecture/` | darkhorse-java rules | Project can extend | DDD, Onion Architecture, CQRS |
| `domain/` | Template (project fills in) | ✅ Yes | Bounded context specs, glossaries |
| `patterns/` | darkhorse-java guides | Project can extend | Backend & frontend patterns |
| `project/` | Template (project fills in) | ✅ Yes | Roadmap, MVPs, progress tracker |
| `toolkit/` | darkhorse-java toolkit | ❌ READ-ONLY | Available UI components |
| `workflow/` | darkhorse-java workflows | Project can extend | Development workflow |

### Spec Seeding (Happens Once)

```
darkhorse-java (scaffolding-time)       →   Project openspec/specs/ (self-contained)
─────────────────────────────────       ──────────────────────────
rules/architecture-rules.md            →   architecture/
guides/backend-patterns.md             →   patterns/backend.md
guides/frontend-patterns.md            →   patterns/frontend.md
toolkit/ reference                     →   toolkit/README.md
workflows/ (planning, impl, etc.)      →   workflow/ (planning, implementation, troubleshooting, mvp-milestones)
openspec-templates/specs/project/      →   project/ (roadmap, progress-tracker, mvps/)
openspec-templates/specs/domain/       →   domain/README.md
```

> After seeding, the project's `openspec/specs/` stands alone. darkhorse-java is not needed.

---

## Rule 4: The `deployment/` Folder

Every project MUST have a `deployment/` folder for infrastructure and deployment artifacts.

```
deployment/
├── scripts/                 ← Deployment automation
│   ├── deploy.ps1           ← Main deployment script
│   ├── start-dev.ps1        ← Start local dev environment
│   └── stop-dev.ps1         ← Stop local dev environment
├── dev/                     ← Development environment
│   ├── docker-compose.yml
│   └── .env.dev
└── prod/                    ← Production environment
    ├── docker-compose.yml
    ├── kubernetes/
    └── .env.prod
```

---

## Rule 5: Backend Structure (DDD-Aligned)

Backend follows **bounded context** organization:

```
backend/
├── contexts/                    ← One folder per bounded context
│   ├── <context-name>/
│   │   ├── domain/              ← Domain layer (ZERO dependencies)
│   │   ├── application/         ← Application layer (depends on domain only)
│   │   ├── infrastructure/      ← Infrastructure (implements interfaces)
│   │   ├── presentation/        ← HTTP adapters (controllers, routes)
│   │   ├── tests/               ← Tests per layer
│   │   └── README.md
│   └── <another-context>/
└── common/                      ← Shared contracts (Published Language)
    ├── contracts/
    ├── utils/
    └── types/
```

---

## Rule 6: Frontend Structure

```
frontend/
├── web-app/                     ← Primary web application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   └── tests/
├── desktop-app/                 ← Desktop (if needed)
├── mobile-app/                  ← Mobile (if needed)
└── shared/                      ← Shared frontend components
```

---

## Rule 7: Code Goes in the Project Only

After scaffolding, ALL code is written to the project repo:

```
✅ CORRECT: <project-name>/backend/     (project repo)
✅ CORRECT: <project-name>/frontend/    (project repo)
✅ CORRECT: <project-name>/context/     (project repo)
✅ CORRECT: <project-name>/deployment/  (project repo)
```

There is no `darkhorse-java/` folder in the project repo — the CLI is used at scaffolding time only.

---

## Rule 8: What Gets Written Where (Post-Scaffolding)

| Folder | What to Write |
|--------|---------------|
| `context/` | Project context maps, search recipes |
| `openspec/changes/` | Proposals (REQ/BUG/ENH) |
| `openspec/specs/domain/` | Bounded context specs, glossaries |
| `openspec/specs/project/` | Roadmap, progress, MVPs |
| `backend/` | All backend source code |
| `frontend/` | All frontend source code |
| `deployment/` | Deployment configs, scripts, IaC |

---

## Rule 9: Toolkit Packages

Toolkit components are **installed as npm packages** (not linked to darkhorse-java):

```typescript
// Installed packages — no runtime dependency on darkhorse-java
import { KanbanBoard } from '@react-toolkit/kanban';
import { Scheduler } from '@react-toolkit/scheduler';
import { tokens } from '@react-toolkit/design-tokens';
```

Reference docs for available components are in `openspec/specs/toolkit/README.md`.

---

## Rule 10: Scaffolding Guardrail

> ⛔ **Scaffolding may ONLY create these top-level folders:**

| Folder | Required |
|--------|----------|
| `context/` | ✅ Always |
| `openspec/` | ✅ Always |
| `backend/` | ✅ Always |
| `frontend/` | ✅ Always |
| `deployment/` | ✅ Always |
| `.vscode/` | Optional (minimal settings) |

**No other top-level folders are permitted** without an approved OpenSpec change request.

See also: `rules/agent-limits.md` for approved AI tools and forbidden dependencies.

---

## Self-Containment Guarantee

After scaffolding, the project MUST meet these criteria:

| Criterion | Required |
|-----------|----------|
| No references to `darkhorse-java/` paths | ✅ |
| All specs readable without external tools | ✅ |
| All workflow docs self-contained | ✅ |
| Toolkit imported as npm packages | ✅ |
| `.darkhorse.yaml` is provenance-only | ✅ |
| `openspec/AGENTS.md` references only project paths | ✅ |

---

*Rule Version: 4.0 | Scaffolding-Only | Self-Contained Output | DDD-Aligned*
