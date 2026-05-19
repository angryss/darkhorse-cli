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
| `openspec/specs/architecture/architecture-rules.md` | DDD, Onion, CQRS, topology, Rules 1–22 |
| `openspec/specs/architecture/archetype-rules.md` | api / bff-api / microservice archetype constraints |
| `openspec/specs/architecture/testing-rules.md` | Test requirements, masking prohibition, failure classification |
| `openspec/specs/architecture/messaging-lessons.md` | AMQP topology lessons + normative rules R-MSG-1–6 |
| `openspec/specs/architecture/hibernate-lessons.md` | JPA/Hibernate lessons + normative rules R-ORM-1–5 |
| `openspec/specs/architecture/toolkit-integration-lessons.md` | Vendored toolkit lessons (frontend proposals only) |

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
8. **Eventual consistency is by design** — Do not assume read-after-write. Do not propose retries to fix projection lag (Rule 19).
9. **Contracts are fixed** — DTO field names, enum casing, and HTTP status codes must match exactly. A 422 is correct behavior (Rule 20).
10. **Every task must be classified** — Each task in tasks.md must carry REAL_FIX / ARCH_ALIGNMENT / RESILIENCE / MASKING / UNKNOWN (Rule 21).
11. **No masking** — Retries, sleeps, and polling to hide failures are prohibited. If a retry is proposed, it must be classified RESILIENCE with explicit count and backoff (Rule 9).
12. **Fanout exchanges for multi-consumer events** — Any integration event consumed by 2+ services requires a fanout exchange with dedicated per-service queues (Rule 18, R-MSG-1, R-MSG-2).
13. **ORM collection mutations only** — Never replace Hibernate-managed collections. Never call `em.clear()` inside a JTA transaction (R-ORM-1, R-ORM-4).
14. **Integration mode is first-class** — Native is an explicit choice, not a default fallback. Always check `integrationMode` before rendering gated features (Rule 22).

## Lessons-Learned Enforcement

Before finalizing any proposal, check each of the following:

- [ ] New integration event with 2+ consumers? → Fanout exchange + dedicated queues required (R-MSG-1, R-MSG-2)
- [ ] New AMQP channel? → definitions.json + application.properties (main + test) + docker-compose.yml all updated in same task (R-MSG-5, R-MSG-6)
- [ ] JPA entity with collection relationship? → No collection replacement; mutate in place (R-ORM-1)
- [ ] cascade + orphanRemoval on entity? → No JPQL bulk delete alongside it (R-ORM-2)
- [ ] BIGSERIAL-backed column? → Explicit @SequenceGenerator with exact sequenceName (R-ORM-5)
- [ ] New @Blocking listener? → @Transactional on the listener method, not only on the handler (Hibernate Lesson 8 / messaging Lesson 8)
- [ ] Frontend proposal? → No new toolkit components; use existing Chakra UI (toolkit frozen)
- [ ] Read immediately after command? → Flag as eventual-consistency boundary; do not propose a sleep or poll (Rule 19)

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

## Handoff

After completing, confirm the following closing steps are done:
1. `openspec/changes/mvp-{MVP}/REQ-{MVP}-{###}/proposal.md` — created
2. `openspec/changes/mvp-{MVP}/REQ-{MVP}-{###}/tasks.md` — created
3. `context/30-BOUNDED-CONTEXTS.md` — updated (or marked N/A)
4. `openspec/specs/domain/<context-name>.md` — created if new context (or marked N/A)
5. `openspec/specs/project/roadmap.md` — REQ added to MVP Requirements table
6. `openspec/changes/mvp-{MVP}/progress-tracker.md` — row added, total updated

Then suggest proceeding to `/implement` with the generated proposal ID.
