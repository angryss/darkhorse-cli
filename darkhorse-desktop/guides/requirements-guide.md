# Requirements Guide

> **Process boundary:** Requirements are input to the governed A1 flow, not approval or completion evidence. Once A1 exists, amend `contract.yaml` through the adapter and regenerate read-only projections.

**How to write effective requirements for darkhorse-desktop projects.**

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

### Backend Requirements (Rust Crates)
- [ ] New domain entities: [yes/no, describe]
- [ ] New application commands: [yes/no, describe]
- [ ] Database migrations: [yes/no, describe]
- [ ] New Tauri bridge commands: [yes/no, describe]

### Frontend Requirements
- [ ] New pages/views: [yes/no, describe]
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

### DO

| Practice | Example |
|----------|---------|
| Be specific | "Display project list sorted by updated_at descending" not "Show projects" |
| Include acceptance criteria | Testable, measurable criteria |
| Reference patterns | "Follow CQRS command pattern via Tauri bridge" |
| Define test requirements upfront | Tests are not an afterthought |
| Identify affected crates | "Domain entity in `<prefix>-domain`, bridge in `<prefix>-desktop`" |

### DON'T

| Anti-Pattern | Problem |
|--------------|---------|
| Vague descriptions | "Make it better" — not actionable |
| Missing acceptance criteria | Can't verify completion |
| Skipping test requirements | Tests become afterthought |
| Cross-crate coupling | Domain must not depend on infrastructure |

---

## Priority Levels

| Priority | Response Time | Examples |
|----------|---------------|----------|
| **P0** | Immediate | Data loss, crash, security issue |
| **P1** | Within 1-2 days | Core functionality broken, blocking issues |
| **P2** | Within sprint | Important features, significant improvements |
| **P3** | Backlog | Nice-to-have, minor improvements |

---

## Effort Estimation

| Size | Duration | Complexity |
|------|----------|------------|
| **S** | 1-2 days | Single module, simple logic |
| **M** | 3-5 days | Multiple modules across crates |
| **L** | 1-2 weeks | Full feature across all layers |
| **XL** | 2+ weeks | Major feature, architectural changes |

---

*Guide Version: 1.0 — Tauri Desktop*
