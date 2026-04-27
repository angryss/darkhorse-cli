# Skill: Planning

## Metadata

```yaml
id: planning
version: 2.0.0
category: workflow
status: active
next_skill: implementation
```

## Purpose

Create architecture-compliant proposals for features, enhancements, or bug fixes. Every proposal must identify the bounded context, define ubiquitous language, map to the correct service archetype, validate system topology (BFF → broker → microservice), and confirm read/write database separation before implementation can begin.

> **DDD is the foundation. The architecture is non-negotiable.** Every requirement must respect bounded contexts, aggregates, value objects, ubiquitous language, onion architecture, and CQRS routing through the system topology.

## Required Context

Load these files before executing the skill:

```yaml
architecture:
  - openspec/specs/architecture/architecture-rules.md
  - openspec/specs/architecture/archetype-rules.md

patterns:
  - openspec/specs/patterns/backend-patterns.md
  - openspec/specs/patterns/frontend-patterns.md

context:
  - context/00-START-HERE.md
  - context/10-REPO-MAP.md
  - context/30-BOUNDED-CONTEXTS.md
  - openspec/specs/domain/README.md

mvp:
  - openspec/specs/project/roadmap.md
  - openspec/changes/mvp-[MVP]/progress-tracker.md

toolkit:
  - openspec/specs/toolkit/README.md
```

## Steps

1. **Load Architecture Rules** — Read `architecture-rules.md` and `archetype-rules.md`. These define DDD, onion architecture, CQRS, system topology, read/write separation, and archetype constraints. Every decision must comply.
2. **Read Context Maps** — Identify existing bounded contexts, their relationships, and integration patterns.
3. **Read MVP State** — Load `openspec/specs/project/roadmap.md` and `openspec/changes/mvp-[MVP]/progress-tracker.md` to understand current scope and progress. MVPs are the core roadmap items for development.
4. **Identify Bounded Context** — Determine if the request targets a new or existing context. If cross-context, identify the integration pattern (ACL, Events, Shared Kernel).
5. **Define Domain Model** — Identify aggregates, entities, value objects, domain events, and repository interfaces. Use ubiquitous language for all naming.
6. **Map to Service Archetype** — Determine which service(s) this requirement touches and validate against archetype constraints:
   - **BFF**: Entry point for frontend. Routes queries to APIs, dispatches commands to broker. NO persistence, NO domain logic.
   - **API**: Owns read-optimized data. Serves queries from BFF. MAY subscribe to events to update read models.
   - **Microservice**: Owns write data. Processes commands from broker. Publishes integration events.
7. **Validate System Topology** — Confirm the data flow follows: Frontend → BFF → (queries to API / commands to broker → microservice). Verify read/write database separation.
8. **Check Toolkit** — If UI is needed, check available toolkit components before proposing custom ones.
9. **Validate Against All Rules** — Run the full compliance checklist (see Architecture Compliance section below). ALL checks must pass.
10. **Create Proposal** — Generate `openspec/changes/mvp-[MVP]/REQ-[MVP]-[###]/proposal.md` and `openspec/changes/mvp-[MVP]/REQ-[MVP]-[###]/tasks.md`.
11. **Update Progress Tracker** — Add the new requirement row to `openspec/changes/mvp-[MVP]/progress-tracker.md` with status `Not Started`.

## Output Format

```markdown
# REQ-[MVP]-[###]: [Title]

## Summary
[One-line description using ubiquitous language]

## Bounded Context
- Context Name: [name]
- New Context: yes/no
- Cross-Context: yes/no
- Integration Pattern: [ACL/Events/Shared Kernel/None]

## Ubiquitous Language
| Term | Definition | Context |
|------|------------|---------|
| ...  | ...        | ...     |

## Domain Model
| Element | Name | Description |
|---------|------|-------------|
| Aggregate Root | [Name] | [Consistency boundary and invariants] |
| Entity | [Name] | [Identity and lifecycle] |
| Value Object | [Name] | [Immutable, equality by value] |
| Domain Event | [Name]Event | [Past-tense domain action] |
| Domain Service | [Name]Service | [Cross-aggregate logic] |
| Repository | I[Name]Repository | [Aggregate persistence contract] |

## Architecture Compliance

### DDD Compliance
- Bounded Context: [pass/fail — is the context identified and isolated?]
- Ubiquitous Language: [pass/fail — do all names use domain terms?]
- Aggregates: [pass/fail — are consistency boundaries defined?]
- Value Objects: [pass/fail — are immutable value types identified?]
- Domain Events: [pass/fail — are events named as past-tense domain actions?]

### Onion Architecture
- Domain Layer: [pass/fail — zero external dependencies?]
- Dependency Direction: [pass/fail — all dependencies point inward?]
- Infrastructure Isolation: [pass/fail — domain never references infrastructure?]

### System Topology
- BFF Entry Point: [pass/fail — frontend traffic routes through BFF only?]
- Query Routing: [pass/fail — BFF queries route to API services?]
- Command Routing: [pass/fail — BFF commands dispatch to broker?]
- Microservice Processing: [pass/fail — commands processed by microservices?]
- Read/Write Separation: [pass/fail — read DB separate from write DB?]

### CQRS
- Command/Query Separation: [pass/fail — writes and reads are separate?]
- No Side Effects on Reads: [pass/fail — queries don't modify state?]
- Event Publishing: [pass/fail — events published after write persistence?]

### Archetype Constraints
- Service Archetype: [api / bff-api / microservice]
- Archetype Rules: [pass/fail — matches archetype constraints from archetype-rules?]

## Classification
- Type: feature / enhancement / bug-fix
- Priority: P0 / P1 / P2 / P3
- Full Slice: backend / frontend / full-slice / infrastructure

## Code Locations
| Layer          | Path                                                  |
|----------------|-------------------------------------------------------|
| Domain         | backend/src/Namespace.Domain/Contexts/<Context>/      |
| Application    | backend/src/Namespace.Application/Contexts/<Context>/ |
| Infrastructure | backend/src/Namespace.Infrastructure/Contexts/<Context>/ |
| Presentation   | backend/src/Namespace.Presentation/Contexts/<Context>/ |
| Frontend       | frontend/web-app/src/                                 |
| Deployment     | deployment/                                           |

## Requirements
- FR-001: [functional requirement]
- NFR-001: [non-functional requirement]

## Test Plan
- [ ] Unit tests for domain logic (xUnit + FluentAssertions)
- [ ] Unit tests for command/query handlers (Moq)
- [ ] Integration tests for repositories (WebApplicationFactory)

## Next Actions
- [ ] Add to `openspec/changes/mvp-[MVP]/progress-tracker.md` (status: Not Started)
- [ ] Proceed to **Implementation** skill with this proposal ID
```

## Constraints

- **HARD STOP — Proposals Only:** This skill produces proposal documents ONLY. Writing source code, creating application files, or modifying any file outside `openspec/changes/` is a HARD STOP violation. If you feel the urge to write code during planning, stop immediately and complete the proposal instead.
- **HARD STOP — System Topology:** Every requirement MUST map to the correct service topology. The BFF is the frontend entry point and security layer. Queries go to APIs. Commands go to the broker for microservice processing. If a requirement violates this topology, reject it and redesign.
- **HARD STOP — DDD Compliance:** Every requirement MUST define aggregates, value objects, and ubiquitous language. Requirements that use generic CRUD terms (Create/Update/Delete) instead of domain language are non-compliant and must be rewritten.
- **HARD STOP — Read/Write Separation:** Requirements involving data persistence MUST specify whether data targets the read path (API + read DB) or write path (microservice + write DB). Mixed read/write in a single service violates the architecture.
- Never propose new toolkit components (toolkit is frozen).
- Project code targets `backend/`, `frontend/`, `deployment/` only.
- Every proposal MUST identify a bounded context and define ubiquitous language.
- Proposals MUST pass ALL architecture compliance checks before implementation begins.
- MVPs are core roadmap items — every requirement MUST link to an active MVP.

## Next Skill

After planning is complete, proceed to: **Implementation** (`workflows/skills/implementation.md`)
