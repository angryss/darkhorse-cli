# Skill: Implementation

## Metadata

```yaml
id: implementation
version: 1.0.0
category: workflow
status: active
next_skill: troubleshooting
```

## Purpose

Execute an approved proposal in strict inside-out order for a WPF desktop project. All implementation follows Onion Architecture (domain-first, inside-out).

## Required Context

Load before executing:
- `openspec/changes/mvp-{X.Y}/{proposal-id}/proposal.md`
- `openspec/changes/mvp-{X.Y}/{proposal-id}/tasks.md`
- `openspec/specs/architecture/architecture-rules.md`
- `openspec/specs/architecture/archetype-rules.md`
- `openspec/specs/patterns/backend-patterns.md`
- `openspec/specs/patterns/frontend-patterns.md`
- `context/30-BOUNDED-CONTEXTS.md`

## Steps

1. **Verify Proposal Exists** — Check `openspec/changes/mvp-{X.Y}/{proposal-id}/proposal.md` AND the requirement row in `progress-tracker.md`. If either is missing, **STOP** — direct to Planning skill.
2. **Initialize Progress (MANDATORY)** — Before writing any code: set requirement to `In Progress` in `progress-tracker.md`, set `**Status:**` in `tasks.md` to `In Progress`.
3. **Validate Proposal** — Architecture checklist must pass. If any check fails, return to Planning.
4. **Implement Common** — If new primitive base types are needed (rare), add them here first.
5. **Implement Domain Layer** — Entity/aggregate factory methods, value objects, domain events, repository interfaces. Zero external dependencies. All invariants enforced.
6. **Implement Application Layer** — Commands, queries, handlers, DTOs, validators. Depends on Domain + Common only.
7. **Implement Infrastructure Layer** — Repository implementations, EF Core entity configurations, adapter implementations. No domain logic.
8. **Implement Presentation Layer** — ViewModels (CommunityToolkit.Mvvm `[ObservableProperty]`, `[RelayCommand]`), XAML Views (UserControl or Window), register in DI.
9. **Write Tests** — Unit tests (Domain: real objects; Application: NSubstitute mocks), integration tests (EF Core in-memory).
10. **Zero Tech Debt — MANDATORY** — Run `dotnet test` for all projects. **ALL tests must pass.** Fix any pre-existing failures before proceeding.
11. **Update Context Maps** — Update `context/30-BOUNDED-CONTEXTS.md` if new context added.
12. **Synchronize Tracking (STOP-SAFE)** — Keep `tasks.md` checkboxes and `progress-tracker.md` accurate at all times. On session interruption: set accurate status, leave unchecked tasks reflecting remaining work.
13. **Only Mark Done When Complete** — Set to `Done` ONLY when all criteria are met AND all tests pass.
14. **Check MVP Completion** — If ALL requirements in the MVP are `Done` and tests pass: update `roadmap.md`, move `changes/mvp-{X.Y}/` to `archive/mvp-{X.Y}/`.

## Output Format

```markdown
# Implementation Report: [Proposal ID]

## Mode
scaffold-new / extend-existing

## Files Created
- [layer] `path/to/file.cs` — [purpose]

## Tests
- [x] Unit tests pass
- [x] Integration tests pass

## Tracking Updated
- [x] tasks.md updated
- [x] progress-tracker.md updated
```
