# test-project

> E2E test

## Architecture

- **Framework:** Quarkus (Java 17)
- **Architecture:** DDD + Onion Architecture + CQRS
- **Build:** Maven
- **Frontend:** React + DarkHorse Toolkit
- **Generated:** 2026-04-03 by DarkHorse Java CLI v0.1.0

## Project Structure

```
test-project/
├── context/          ← AI navigation
├── openspec/         ← Specs, proposals, workflow
├── backend/          ← Java/Quarkus services (DDD)
├── frontend/         ← React web application
├── deployment/       ← Docker, Kubernetes
└── .darkhorse.yaml   ← Config
```

## Getting Started

```bash
# Build backend
cd backend
./mvnw quarkus:dev

# Start frontend (separate terminal)
cd frontend/web-app
npm install
npm run dev
```

## For AI Agents

Start with `context/00-START-HERE.md`, then read `openspec/AGENTS.md`.

## Development Workflow

1. **Plan** — Create proposal in `openspec/changes/`
2. **Implement** — Follow tasks.md, write code to `backend/`
3. **Test** — Run tests, file bugs as BUG proposals
4. **Archive** — Move completed proposals to `openspec/archive/`

See `openspec/specs/workflow/` for detailed workflow guides.
