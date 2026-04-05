# 10 — Repository Map

> Folder layout for **test-project**.

## Top-Level Structure

| Folder | Purpose |
|--------|---------|
| `context/` | AI navigation — helps agents understand the repo |
| `openspec/` | Specs, proposals, archive — spec-driven development |
| `backend/` | Java/Quarkus code organized by bounded contexts (DDD) |
| `deployment/` | Docker, Kubernetes, deployment scripts |

## Backend Structure

```
backend/
├── pom.xml                          ← Maven build (Quarkus)
├── contexts/                        ← DDD bounded contexts
│   └── <context-name>/
│       ├── domain/                  ← Entities, value objects, events
│       │   └── GLOSSARY.md          ← Ubiquitous language
│       ├── application/             ← Commands, queries, handlers
│       ├── infrastructure/          ← Repos, messaging, persistence
│       ├── presentation/            ← REST controllers
│       └── tests/                   ← Unit + integration tests
└── common/                          ← Shared contracts, utilities
```

## OpenSpec Structure

```
openspec/
├── AGENTS.md                        ← AI agent instructions
├── specs/
│   ├── architecture/                ← DDD, Onion Arch, CQRS rules
│   ├── domain/                      ← Bounded context definitions
│   ├── patterns/                    ← Backend patterns
│   ├── project/                     ← Roadmap, MVPs, progress
│   └── workflow/                    ← Planning, implementation, troubleshooting
├── changes/                         ← Active proposals (REQ-, BUG-, ENH-)
└── archive/                         ← Completed proposals
```


## Deployment Structure

```
deployment/
├── docker-compose.yml
├── dev/                             ← Development environment
└── prod/                            ← Production environment
```
