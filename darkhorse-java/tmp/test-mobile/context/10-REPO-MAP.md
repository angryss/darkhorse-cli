# 10 — Repository Map

> Folder layout for **test-mobile** (archetype: api).

## Top-Level Structure

| Folder | Purpose |
|--------|---------|
| `context/` | AI navigation — helps agents understand the repo |
| `openspec/` | Specs, proposals, archive — spec-driven development |
| `backend/` | Java/Quarkus code organized by bounded contexts (DDD) |
| `frontend/` | React web application |
| `deployment/` | Docker, Kubernetes, deployment scripts |

## Backend Structure

```
backend/
├── pom.xml                          ← Maven build (Quarkus + persistence)
├── contexts/                        ← DDD bounded contexts
│   └── <context-name>/
│       ├── domain/                  ← Entities, value objects, events
│       │   └── GLOSSARY.md          ← Ubiquitous language
│       ├── application/             ← Commands, queries, handlers
│       ├── infrastructure/          ← Repos, messaging, persistence
│       ├── presentation/            ← REST controllers
│       └── tests/                   ← Unit + integration tests
├── common/                          ← Shared contracts, utilities
│   ├── persistence/                 ← Shared persistence abstractions
│   └── examples/                    ← CQRS example handlers (delete after use)
```

## OpenSpec Structure

```
openspec/
├── AGENTS.md                        ← AI agent instructions
├── specs/
│   ├── architecture/                ← DDD, Onion Arch, CQRS rules
│   ├── domain/                      ← Bounded context definitions
│   ├── patterns/                    ← Backend & frontend patterns
│   ├── project/                     ← Roadmap, MVPs, progress
│   ├── toolkit/                     ← React component reference
│   └── workflow/                    ← Planning, implementation, troubleshooting
├── changes/                         ← Active proposals (REQ-, BUG-, ENH-)
└── archive/                         ← Completed proposals
```

## Frontend Structure

```
frontend/
└── mobile-app/
    ├── package.json
    ├── app/              ← Expo Router screens & layouts
    └── src/
        ├── components/
        ├── hooks/
        ├── services/
        ├── store/
        └── utils/
```

## Deployment Structure

```
deployment/
├── docker-compose.yml
├── dev/                             ← Development environment
└── prod/                            ← Production environment
```
