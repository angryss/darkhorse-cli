# Requirements Guide

**How to write effective requirements for darkhorse-dotnet projects.**

---

## Requirement Types

| Type | Description | Template |
|------|-------------|----------|
| Feature | New functionality | `REQ-[MVP]-[###]` |
| Enhancement | Improve existing functionality | `ENH-[MVP]-[###]` |
| Bug Fix | Fix broken functionality | `BUG-[MVP]-[###]` |
| Technical | Infrastructure, refactoring | `REQ-[MVP]-[###]` |

---

## Requirement Template

```markdown
# Requirement: [Short Title]

## Metadata
- **ID**: REQ-[MVP]-[###]
- **Type**: Feature | Enhancement | Technical
- **Priority**: P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
- **Estimated Effort**: S (1-2 days) | M (3-5 days) | L (1-2 weeks) | XL (2+ weeks)
- **Target MVP**: [X.X]

## Summary
[One paragraph describing what is needed and why]

## User Story
As a [role],
I want [capability],
So that [benefit].

## Acceptance Criteria
- [ ] AC-001: [Criteria 1]
- [ ] AC-002: [Criteria 2]

## Technical Context

### Architecture Context (MANDATORY)
- [ ] Bounded Context: [name — new or existing?]
- [ ] Service Archetype: [api / bff-api / microservice]
- [ ] System Topology:
  - [ ] Query path: BFF → API → read DB (describe)
  - [ ] Command path: BFF → broker → microservice → write DB (describe)
- [ ] Read/Write Separation: [which service owns reads? which owns writes?]

### Domain Model (MANDATORY)
- [ ] Aggregate Root(s): [name — consistency boundary]
- [ ] Value Object(s): [name — immutable value types]
- [ ] Domain Event(s): [name — past-tense domain actions, NOT CRUD]
- [ ] Ubiquitous Language: [list domain terms with definitions]

### Backend Requirements
- [ ] New API endpoint(s): [yes/no, describe]
- [ ] Database changes: [read DB / write DB / both — describe]
- [ ] Message broker events: [yes/no, describe]
- [ ] Pattern to follow: [pattern name]

### Frontend Requirements
- [ ] New pages/views: [yes/no, describe]
- [ ] Toolkit components to use: [list]
- [ ] New components needed: [list]

## Dependencies
- Depends on: [REQ-XXX]
- Blocks: [REQ-ZZZ]

## Test Requirements
### Unit Tests
- [ ] [Test scenario 1]

### Integration Tests
- [ ] [Test scenario 1]

## Out of Scope
- [Explicitly state what is NOT included]
```

---

## Writing Good Requirements

### DO ✅

| Practice | Example |
|----------|---------|
| Be specific | "Display top 10 customers by revenue" not "Show customers" |
| Use ubiquitous language | Domain terms, not CRUD (Place order, not Create order) |
| Map to system topology | Specify query path (BFF→API) vs command path (BFF→broker→MS) |
| Define domain model | Aggregates, value objects, events before implementation |
| Include acceptance criteria | Testable, measurable criteria |
| Reference patterns | "Follow CQRS query pattern (MediatR)" |
| List toolkit components | "Use @react-toolkit/charts for visualization" |
| Define test requirements upfront | Tests are not an afterthought |

### DON'T ❌

| Anti-Pattern | Problem |
|--------------|---------|
| Vague descriptions | "Make it better" — not actionable |
| Generic CRUD terms | "Create order" instead of "Place order" — violates DDD |
| Missing topology | Not specifying BFF→API vs BFF→broker routing |
| Mixed read/write | Putting reads and writes in the same service |
| Missing acceptance criteria | Can't verify completion |
| Skipping test requirements | Tests become afterthought |
| Not checking toolkit | Reinventing existing components |

---

## Priority Levels

| Priority | Response Time | Examples |
|----------|---------------|----------|
| **P0** | Immediate | Security issues, data loss, system down |
| **P1** | Within 1-2 days | Core functionality broken, blocking issues |
| **P2** | Within sprint | Important features, significant improvements |
| **P3** | Backlog | Nice-to-have, minor improvements |

---

## Effort Estimation

| Size | Duration | Complexity |
|------|----------|------------|
| **S** | 1-2 days | Single component, simple logic |
| **M** | 3-5 days | Multiple components, moderate logic |
| **L** | 1-2 weeks | Full feature, complex logic |
| **XL** | 2+ weeks | Major feature, architectural changes |

---

*Guide Version: 2.0*
