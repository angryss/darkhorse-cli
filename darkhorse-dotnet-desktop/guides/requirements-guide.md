# Requirements Guide — WPF Desktop

## Requirement Format

All requirements follow this structure:

```markdown
## REQ-{MVP}-{###}: {Short Title}

**MVP:** {X.Y}
**Status:** Not Started | In Progress | In Review | Done | Blocked
**Context:** {BoundedContextName}
**Layer(s):** Domain | Application | Infrastructure | Presentation | All

### Description
[What needs to be built. Use domain language.]

### Acceptance Criteria
- [ ] {Specific, testable criterion 1}
- [ ] {Specific, testable criterion 2}
- [ ] All existing tests pass

### Notes
[Dependencies, technical decisions, open questions]
```

---

## Bounded Context Spec Format

Create `openspec/specs/domain/<ContextName>.md` for each bounded context:

```markdown
# <ContextName> Context

## Purpose
[What business capability does this context own?]

## Ubiquitous Language
| Term | Definition |
|------|-----------|
| [Term] | [Domain-specific meaning] |

## Aggregate Root: <ContextName>
**Invariants:**
- [Rule the aggregate enforces]

**Properties:**
- `Id: Guid` — identity
- [other properties]

**Methods:**
- `Create(...)` — factory method
- [state-change methods]

**Domain Events:**
- `<ContextName>CreatedEvent` — raised when...

## Commands
- `Create<ContextName>Command` — [what it does]

## Queries
- `Get<ContextName>Query` — returns `<ContextName>Dto`

## Repository Interface
```csharp
public interface I<ContextName>Repository
{
    Task<<ContextName>?> GetByIdAsync(Guid id, CancellationToken ct);
    Task AddAsync(<ContextName> entity, CancellationToken ct);
}
```
```

---

## MVP Planning Checklist

Before starting an MVP, ensure:

- [ ] Requirements are written in `openspec/specs/project/roadmap.md`
- [ ] All requirements have IDs (`REQ-{MVP}-{###}`)
- [ ] Bounded context specs are written in `openspec/specs/domain/`
- [ ] `context/30-BOUNDED-CONTEXTS.md` is updated
- [ ] `openspec/changes/mvp-{X.Y}/progress-tracker.md` is created
- [ ] Domain ubiquitous language is defined
