# Skill: Planning

## Metadata

```yaml
id: planning
version: 1.0.0
category: workflow
status: active
next_skill: implementation
```

## Purpose

Create a structured, architecture-compliant proposal for a WPF desktop feature. The proposal must pass the architecture checklist before implementation begins.

## Required Context

Load before executing:
- `openspec/specs/architecture/architecture-rules.md`
- `openspec/specs/architecture/archetype-rules.md`
- `openspec/specs/patterns/backend-patterns.md`
- `openspec/specs/patterns/frontend-patterns.md`
- `context/30-BOUNDED-CONTEXTS.md`
- `openspec/specs/project/roadmap.md`

## Steps

1. **Assign requirement ID** — `REQ-{MVP}-{###}` from the roadmap.
2. **Define acceptance criteria** — Specific, testable, unambiguous.
3. **Design the domain model** — Aggregate, entities, value objects, domain events. Check for DDD compliance.
4. **Design CQRS surface** — List all commands (with return types) and queries (with DTO fields).
5. **Design repository interface** — What methods does the domain need?
6. **Design Infrastructure** — EF Core entity config, repository implementation structure.
7. **Design ViewModel** — Observable properties, relay commands, MediatR dispatches.
8. **Design View (XAML)** — UserControl or Window? Key bindings needed.
9. **Architecture checklist** — Run all checks. If any fail, redesign before proceeding.
10. **Write tasks** — Ordered task checklist in `tasks.md` by layer.
11. **Add to progress tracker** — Add requirement row to `openspec/changes/mvp-{X.Y}/progress-tracker.md`.

## Architecture Checklist

- [ ] Domain layer has no external NuGet packages
- [ ] Common layer has no external NuGet packages
- [ ] Application handlers reference Domain + Common only
- [ ] ViewModels reference Application (via IMediator) only — no Infrastructure or Domain
- [ ] Domain logic lives in aggregate methods — not in handlers
- [ ] All new entities extend `Common.Primitives.Entity` or `AggregateRoot`
- [ ] Implementation will proceed inside-out

## Proposal File Structure

```
openspec/changes/mvp-{X.Y}/{proposal-id}/
├── proposal.md    ← requirement, acceptance criteria, design decisions
└── tasks.md       ← ordered task checklist by layer
```

## Proposal Template

```markdown
# Proposal: [Feature Name]

**ID:** [proposal-id]
**REQ:** REQ-{MVP}-{###}
**MVP:** {X.Y}
**Status:** Draft | Approved | In Progress | Done

## Requirement
[What needs to be built in domain language]

## Acceptance Criteria
- [ ] [criterion 1]
- [ ] [criterion 2]
- [ ] All tests pass

## Domain Design
**Aggregate:** [ContextName]
**New Properties:** [list]
**New Methods:** [method signatures]
**Domain Events:** [event names and triggers]

## CQRS Design
**Commands:**
- `Create[Context]Command(...)` → `Guid`

**Queries:**
- `Get[Context]Query` → `IReadOnlyList<[Context]Dto>`

## Repository Interface
[interface definition]

## ViewModel Design
**Observable Properties:** [list]
**Commands:** [RelayCommand list]

## Architecture Checklist
[run checks]
```
