# Scaffolding Rules (v4.0)

**Mandatory rules for scaffolding new and existing projects.**

> ⚠️ **darkhorse-dotnet is scaffolding-only.** Once a project is scaffolded, darkhorse-dotnet is NOT referenced. The project repo is fully self-contained.
>
> ✅ **Every project is a single repository — fully self-contained.**
>
> ✅ **Specs, workflow docs, and context files are seeded INTO the project and work standalone.**

---

## Rule 0: Single Repository Per Project

Every project lives in its **own repository**. After scaffolding, the project has **zero dependencies on darkhorse-dotnet**.

```
<project-name>/                    ← One repo = one project
├── context/                       ← AI navigation & project context
├── openspec/                      ← Specs, proposals, archive
├── backend/                       ← .NET solution (Onion Architecture)
├── frontend/                      ← Frontend code
├── deployment/                    ← Pipelines, IaC, packaging
└── .darkhorse.yaml                ← Scaffolding provenance only
```

---

## Rule 1: Canonical Project Structure

> ⚠️ **This is the ONLY allowed top-level structure.**

```
<project-name>/
│
├── context/                        ← Project context for AI tools
│   ├── 00-START-HERE.md
│   ├── 10-REPO-MAP.md
│   ├── 30-BOUNDED-CONTEXTS.md
│   └── 50-SEARCH-QUERIES.md
│
├── openspec/                       ← OpenSpec root
│   ├── AGENTS.md                   ← AI agent instructions (READ FIRST)
│   ├── specs/
│   │   ├── architecture/
│   │   ├── domain/
│   │   ├── patterns/
│   │   ├── project/
│   │   ├── toolkit/
│   │   └── workflow/
│   ├── changes/
│   └── archive/
│
├── backend/                        ← .NET solution
│   ├── <Namespace>.sln
│   ├── src/
│   │   ├── <Namespace>.Presentation/
│   │   ├── <Namespace>.Application/
│   │   ├── <Namespace>.Domain/
│   │   ├── <Namespace>.Common/
│   │   └── <Namespace>.Infrastructure/
│   └── tests/
│       ├── <Namespace>.UnitTests/
│       └── <Namespace>.IntegrationTests/
│
├── frontend/                       ← Frontend code
│   └── web-app/
│
├── deployment/                     ← Docker, Kubernetes, IaC
│   ├── dev/
│   │   └── docker-compose.yml
│   └── scripts/
│
├── .darkhorse.yaml
└── README.md
```

---

## Rule 2: The `context/` Folder

The `context/` folder is the **AI navigation layer**.

| File | Purpose |
|------|---------|
| `00-START-HERE.md` | Entry point for all agents |
| `10-REPO-MAP.md` | Folder layout and navigation |
| `30-BOUNDED-CONTEXTS.md` | Context inventory and relationships |
| `50-SEARCH-QUERIES.md` | Search recipes for AI tools |

---

## Rule 3: The `openspec/specs/` Folder

Specs are **seeded during scaffolding** then maintained independently.

| Folder | Seeded From | Purpose |
|--------|-------------|---------|
| `architecture/` | darkhorse-dotnet rules | DDD, Onion Architecture, CQRS |
| `domain/` | Template | Bounded context specs, glossaries |
| `patterns/` | darkhorse-dotnet guides | Backend & frontend patterns |
| `project/` | Template | Roadmap, MVPs, progress tracker |
| `toolkit/` | darkhorse-dotnet toolkit | Available UI components (READ-ONLY) |
| `workflow/` | darkhorse-dotnet workflows | Development workflow |

---

## Rule 4: Backend Structure (.NET Onion Architecture)

```
backend/
├── <Namespace>.sln
├── src/
│   ├── <Namespace>.Presentation/       ← ASP.NET Core host, controllers
│   ├── <Namespace>.Application/        ← MediatR handlers, DTOs, validators
│   ├── <Namespace>.Domain/             ← Entities, value objects, interfaces (ZERO deps)
│   ├── <Namespace>.Common/             ← Shared contracts, utilities
│   └── <Namespace>.Infrastructure/     ← EF Core, MassTransit, HttpClient impls
└── tests/
    ├── <Namespace>.UnitTests/          ← Domain + Application tests
    └── <Namespace>.IntegrationTests/   ← API + Infrastructure tests
```

Each layer project contains a `Contexts/<ContextName>/` folder for bounded context isolation.

---

## Rule 5: Frontend Structure

```
frontend/
└── web-app/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   ├── services/
    │   ├── store/
    │   └── utils/
    └── package.json
```

---

## Rule 6: Code Goes in the Project Only

After scaffolding, ALL code is written to the project repo. There is no `darkhorse-dotnet/` folder in the project.

---

## Rule 7: Toolkit Packages

Installed as npm packages, not linked to darkhorse-dotnet:

```typescript
import { KanbanBoard } from '@react-toolkit/kanban';
import { Scheduler } from '@react-toolkit/scheduler';
```

---

## Rule 8: Scaffolding Guardrail

> ⛔ **Scaffolding may ONLY create these top-level folders:**

| Folder | Required |
|--------|----------|
| `context/` | ✅ Always |
| `openspec/` | ✅ Always |
| `backend/` | ✅ Always |
| `frontend/` | ✅ When frontend enabled |
| `deployment/` | ✅ Always |
| `.vscode/` | Optional |

**No other top-level folders are permitted.**

---

## Self-Containment Guarantee

| Criterion | Required |
|-----------|----------|
| No references to `darkhorse-dotnet/` paths | ✅ |
| All specs readable without external tools | ✅ |
| All workflow docs self-contained | ✅ |
| Toolkit imported as npm packages | ✅ |
| `.darkhorse.yaml` is provenance-only | ✅ |
| `openspec/AGENTS.md` references only project paths | ✅ |

---

*Rule Version: 4.0 | Scaffolding-Only | Self-Contained Output | DDD-Aligned*
