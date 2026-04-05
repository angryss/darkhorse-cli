# test-bff

> Test BFF

## Architecture

- **Archetype:** bff-api
- **Framework:** ASP.NET Core (.NET 9)
- **Architecture:** DDD + Onion Architecture + CQRS
- **Build:** dotnet CLI
- **Generated:** 2026-04-03 by DarkHorse .NET CLI v0.1.0

## Project Structure

```
test-bff/
├── context/          ← AI navigation
├── openspec/         ← Specs, proposals, workflow
├── backend/          ← .NET solution (Onion Architecture)
│   ├── src/
│   │   ├── Test.Bff.Presentation/
│   │   ├── Test.Bff.Application/
│   │   ├── Test.Bff.Domain/
│   │   ├── Test.Bff.Common/
│   │   └── Test.Bff.Infrastructure/
│   └── tests/
├── deployment/       ← Docker, Kubernetes
└── .darkhorse.yaml   ← Config
```

## Getting Started

```bash
# Build backend
cd backend
dotnet build

# Run backend
dotnet run --project src/Test.Bff.Presentation

# Run tests
dotnet test

```

## For AI Agents

Start with `context/00-START-HERE.md`, then read `openspec/AGENTS.md`.

## Development Workflow

1. **Plan** — Create proposal in `openspec/changes/`
2. **Implement** — Follow tasks.md, write code to `backend/`
3. **Test** — Run tests, file bugs as BUG proposals
4. **Archive** — Move completed proposals to `openspec/archive/`

See `openspec/specs/workflow/` for detailed workflow guides.
