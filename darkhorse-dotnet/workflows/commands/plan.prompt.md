---
description: "Create a DDD-compliant requirement proposal with system topology validation and read/write separation"
mode: agent
---

Execute the **Planning** workflow.

## Skill

Read and follow every step in `openspec/specs/workflow/skills/planning.md`.

## Context

Load all required context files listed in the skill before producing output. Pay special attention to `architecture-rules.md` and `archetype-rules.md` — these define the non-negotiable system topology.

## Parameters

- **feature**: What feature or change to plan
- **mvp**: Target MVP milestone (e.g., 1.0)
- **priority**: P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)
- **context**: Target bounded context name
- **type**: feature / enhancement / bug-fix

## Architecture Enforcement

> These rules are non-negotiable. Every proposal MUST comply.

1. **BFF is the entry point** — All frontend traffic routes through the BFF. The BFF is the security layer (JWT, claims, permissions).
2. **CQRS splits at the BFF** — Queries go to downstream APIs (HttpClient). Commands go to the message broker.
3. **Microservices process commands** — Commands from the broker are processed by microservices that own write databases.
4. **APIs serve queries** — APIs own read-optimized databases and serve query results to the BFF.
5. **Read/write separation** — Read databases and write databases are separate. No shared locks.
6. **DDD is mandatory** — Aggregates, value objects, ubiquitous language, domain events. No CRUD terminology.
7. **Onion architecture** — Dependencies point inward. Domain has zero external dependencies.

## Constraints

- NO code generation — proposals only
- NO modifications outside `openspec/changes/`
- Output goes to `openspec/changes/mvp-{MVP}/REQ-{MVP}-{###}/`
- Update `openspec/changes/mvp-{MVP}/progress-tracker.md`
- ALL architecture compliance checks must pass before the proposal is complete
- MVPs are core roadmap items — link every requirement to an active MVP

## Handoff

After completing, suggest proceeding to `/implement` with the proposal ID.
