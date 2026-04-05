# test-workspace

> Test workspace

## Workspace

- **Architecture:** DDD + Onion Architecture + CQRS (per service)
- **Backend:** ASP.NET Core (.NET, per service archetype)
- **Initialized:** 2026-04-03 by DarkHorse .NET CLI v0.1.0

## Workspace Structure

```
test-workspace/
├── context/                   ← AI navigation
├── openspec/                  ← Specs, proposals, workflow
│   ├── AGENTS.md              ← AI agent rules
│   ├── specs/
│   │   ├── project/           ← Roadmap, progress tracker, MVPs
│   │   ├── architecture/      ← Architecture decisions
│   │   ├── domain/            ← Bounded contexts, DDD models
│   │   └── workflow/          ← Development workflow
│   ├── changes/               ← Active proposals
│   └── archive/               ← Completed proposals
├── backend/
│   ├── apis/                  ← REST API services (darkhorse-dotnet add api)
│   ├── bffs/                  ← Backend-for-Frontend services (darkhorse-dotnet add bff-api)
│   └── microservices/         ← Message-driven services (darkhorse-dotnet add microservice)

├── deployment/                ← Docker, Kubernetes
└── .darkhorse.yaml            ← Workspace config
```

## Adding Services

```bash
# Add a REST API service
darkhorse-dotnet add api --name order-api --namespace test-workspace.Orders

# Add a Backend-for-Frontend
darkhorse-dotnet add bff-api --name shell-bff --namespace test-workspace.ShellBff

# Add a message-driven microservice
darkhorse-dotnet add microservice --name notification-ms --namespace test-workspace.Notifications
```

Each service is an isolated .NET solution:
```
backend/<category>/<service-name>/
├── <Namespace>.sln
├── src/
│   ├── <Namespace>.Presentation/     ← Controllers / Consumers
│   ├── <Namespace>.Application/      ← CQRS handlers, use cases
│   ├── <Namespace>.Domain/           ← Entities, value objects, events
│   └── <Namespace>.Infrastructure/   ← Repos, DB, messaging clients
└── tests/
    ├── <Namespace>.UnitTests/
    └── <Namespace>.IntegrationTests/
```

## For AI Agents

Start with `context/00-START-HERE.md`, then read `openspec/AGENTS.md`.

## Development Workflow

```bash
# Plan a feature or bug fix
npx darkhorse-dotnet plan

# Implement an approved proposal
npx darkhorse-dotnet implement

# Troubleshoot a bug
npx darkhorse-dotnet troubleshoot
```

1. **Plan** — Generates a proposal in `openspec/changes/`
2. **Implement** — Executes the approved proposal inside-out (Domain → Application → Infrastructure → Presentation)
3. **Test** — Run tests, file bugs as BUG proposals
4. **Archive** — Move completed proposals to `openspec/archive/`

See `openspec/specs/workflow/` for detailed workflow guides.

