# 10 — Repository Map

> Folder layout for **test-verify** (archetype: bff-api).

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
├── pom.xml                          ← Maven build (Quarkus + REST Client + Messaging, NO persistence)
├── contexts/                        ← DDD bounded contexts
│   └── <context-name>/
│       ├── domain/                  ← Contracts/interfaces ONLY (no entities, no aggregates)
│       │   └── GLOSSARY.md          ← Ubiquitous language
│       ├── application/             ← Command handlers (→ broker), query handlers (→ API clients)
│       ├── infrastructure/          ← REST API clients, message senders, auth adapters
│       ├── presentation/            ← REST controllers (frontend-facing), auth middleware
│       └── tests/                   ← Unit + integration tests
├── common/                          ← Shared contracts
│   ├── clients/                     ← Shared API client abstractions
│   ├── messaging/                   ← Shared messaging abstractions
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
