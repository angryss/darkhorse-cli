# test-api

> Test API

## Architecture

- **Archetype:** api
- **Framework:** ASP.NET Core (.NET 8)
- **Architecture:** DDD + Onion Architecture + CQRS
- **Build:** dotnet CLI
- **Frontend:** React + DarkHorse Toolkit
- **Generated:** 2026-04-03 by DarkHorse .NET CLI v0.1.0

## Project Structure

```
test-api/
├── context/          ← AI navigation
├── openspec/         ← Specs, proposals, workflow
├── backend/
│   └── apis/  ← .NET solution (Onion Architecture)
│       ├── src/
│       │   ├── TestApi.Presentation/
│       │   ├── TestApi.Application/
│       │   ├── TestApi.Domain/
│       │   └── TestApi.Infrastructure/
│       └── tests/
├── frontend/         ← React (Web) + React Native (Mobile)
├── deployment/       ← Docker, Kubernetes
└── .darkhorse.yaml   ← Config
```

## Getting Started

```bash
# Build backend
cd backend/apis
dotnet build

# Run backend
dotnet run --project src/TestApi.Presentation

# Run tests
dotnet test

# Start web frontend (separate terminal)
cd frontend/web-app
npm install
npm run dev

# Start mobile app (separate terminal)
cd frontend/mobile-app
npm install
npx expo start
```

## For AI Agents

Start with `context/00-START-HERE.md`, then read `openspec/AGENTS.md`.

## Development Workflow

1. **Plan** — Create proposal in `openspec/changes/`
2. **Implement** — Follow tasks.md, write code to `backend/`
3. **Test** — Run tests, file bugs as BUG proposals
4. **Archive** — Move completed proposals to `openspec/archive/`

See `openspec/specs/workflow/` for detailed workflow guides.
