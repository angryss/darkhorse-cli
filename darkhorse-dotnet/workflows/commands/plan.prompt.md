---
description: "Create a DDD-compliant requirement proposal with system topology validation and read/write separation"
mode: agent
---

Execute the **Planning** workflow.

## Skill

Read and follow every step in `openspec/specs/workflow/skills/planning.md`.

## Context

Load all required context files listed in the skill before producing output.

### Mandatory Rules Files (load in this order)

| File | What It Governs |
|------|-----------------|
| `openspec/specs/architecture/architecture-rules.md` | DDD, Onion, CQRS, topology |
| `openspec/specs/architecture/archetype-rules.md` | api / bff-api / microservice archetype constraints |
| `openspec/specs/architecture/scaffolding-rules.md` | scaffolding + file placement rules |
| `openspec/specs/architecture/testing-rules.md` | tests required; no red tests allowed |
| `openspec/specs/architecture/agent-limits.md` | approved tools + constraints |

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
8. **No masking** — Never propose sleeps/polls/retries to hide failing tests or eventual consistency. If resilience is required, it must be explicit with bounded attempts/backoff and a clear failure outcome.
9. **Every task must be classified** — Each task in `tasks.md` must carry: `REAL_FIX` / `ARCH_ALIGNMENT` / `RESILIENCE` / `MASKING` / `UNKNOWN`.

## Constraints

- NO code generation — proposals only
- NO modifications outside `openspec/changes/`, `context/`, `openspec/specs/project/roadmap.md`
- Output goes to `openspec/changes/mvp-{MVP}/REQ-{MVP}-{###}/`
- Update `openspec/changes/mvp-{MVP}/progress-tracker.md` (add row + update Total Requirements count)
- Update `context/30-BOUNDED-CONTEXTS.md` — add or expand bounded context entry for every proposal that introduces or materially changes a bounded context; mark N/A if purely cross-cutting/infrastructure
- Create `openspec/specs/domain/<context-name>.md` stub if a new bounded context is introduced and no spec file exists yet
- Update `openspec/specs/project/roadmap.md` — add the REQ to the active MVP's Requirements table; add the source DISC to Discovery Sources if not already present; update MVP Goals if materially changed
- ALL architecture compliance checks must pass before the proposal is complete
- MVPs are core roadmap items — link every requirement to an active MVP
- **Tests are non-negotiable:** implementation MUST fix any failing tests encountered before proceeding. A red suite is never acceptable.

## Implementation Readiness Gate

Before handing off to `/implement`, verify:

- [ ] Acceptance criteria are explicit and testable
- [ ] Test plan is concrete (what, where, and how it will be tested)
- [ ] `tasks.md` is stop-safe and granular (checkboxes can be updated in real time)
- [ ] Every task is classified (`REAL_FIX` / `ARCH_ALIGNMENT` / `RESILIENCE` / `MASKING` / `UNKNOWN`)

## Handoff

After completing, confirm the following closing steps are done:
1. `openspec/changes/mvp-{MVP}/REQ-{MVP}-{###}/proposal.md` — created
2. `openspec/changes/mvp-{MVP}/REQ-{MVP}-{###}/tasks.md` — created
3. `context/30-BOUNDED-CONTEXTS.md` — updated (or marked N/A)
4. `openspec/specs/domain/<context-name>.md` — created if new context (or marked N/A)
5. `openspec/specs/project/roadmap.md` — REQ added to MVP Requirements table
6. `openspec/changes/mvp-{MVP}/progress-tracker.md` — row added, total updated

Then suggest proceeding to `/implement` with the generated proposal ID.
