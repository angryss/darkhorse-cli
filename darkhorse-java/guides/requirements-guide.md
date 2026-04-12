# Requirements Guide

**How to write effective requirements for darkhorse-java projects.**

---

## Overview

Requirements are the input to the Planning workflow. Well-written requirements lead to better implementations.

---

## Requirement Types

| Type | Description | Template |
|------|-------------|----------|
| Feature | New functionality | `REQ-[MVP]-[###]-feature.md` |
| Enhancement | Improve existing functionality | `REQ-[MVP]-[###]-enhancement.md` |
| Bug Fix | Fix broken functionality | `BUG-[MVP]-[###]-description.md` |
| Technical | Infrastructure, refactoring | `REQ-[MVP]-[###]-technical.md` |

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
- [ ] AC-003: [Criteria 3]

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
- [ ] State management changes: [yes/no, describe]

## Dependencies
- Depends on: [REQ-XXX, REQ-YYY]
- Blocks: [REQ-ZZZ]

## Test Requirements
### Unit Tests
- [ ] [Test scenario 1]
- [ ] [Test scenario 2]

### Integration Tests
- [ ] [Test scenario 1]

### E2E Tests (if applicable)
- [ ] [Test scenario 1]

## Out of Scope
- [Explicitly state what is NOT included]

## Open Questions
- [ ] [Question 1]
- [ ] [Question 2]
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
| Reference patterns | "Follow CQRS query pattern" |
| List toolkit components | "Use @react-toolkit/charts for visualization" |
| Define test requirements upfront | Tests are not an afterthought |
| State dependencies | What needs to be done first |
| Scope clearly | What's included AND what's excluded |

### DON'T ❌

| Anti-Pattern | Problem |
|--------------|---------|
| Vague descriptions | "Make it better" - not actionable |
| Generic CRUD terms | "Create order" instead of "Place order" — violates DDD |
| Missing topology | Not specifying BFF→API vs BFF→broker routing |
| Mixed read/write | Putting reads and writes in the same service |
| Missing acceptance criteria | Can't verify completion |
| Skipping test requirements | Tests become afterthought |
| Ignoring patterns | Leads to inconsistent architecture |
| Not checking toolkit | Reinventing existing components |
| Unbounded scope | Never-ending requirements |

---

## Priority Levels

| Priority | Response Time | Examples |
|----------|---------------|----------|
| **P0 - Critical** | Immediate | Security issues, data loss, system down |
| **P1 - High** | Within 1-2 days | Core functionality broken, blocking issues |
| **P2 - Medium** | Within sprint | Important features, significant improvements |
| **P3 - Low** | Backlog | Nice-to-have, minor improvements |

---

## Effort Estimation

| Size | Duration | Complexity |
|------|----------|------------|
| **S - Small** | 1-2 days | Single component, simple logic |
| **M - Medium** | 3-5 days | Multiple components, moderate logic |
| **L - Large** | 1-2 weeks | Full feature, complex logic, integrations |
| **XL - Extra Large** | 2+ weeks | Major feature, architectural changes |

---

## Acceptance Criteria Format

Use the Given-When-Then format for testable criteria:

```markdown
AC-001: Order creation validation
- Given: A customer with valid payment method
- When: They submit an order with valid items
- Then: Order is created with status "pending"
- And: Order confirmation email is sent
- And: Inventory is reserved
```

---

## Example: Well-Written Requirement

```markdown
# Requirement: Customer Analytics Dashboard

## Metadata
- **ID**: REQ-5.3-007
- **Type**: Feature
- **Priority**: P2 (Medium)
- **Estimated Effort**: M (3-5 days)
- **Target MVP**: 5.3

## Summary
Create an analytics dashboard for account managers to view customer
purchase patterns, revenue trends, and engagement metrics. This will
help identify high-value customers and those at risk of churning.

## User Story
As an account manager,
I want to see customer analytics on a dashboard,
So that I can identify opportunities and risks in my portfolio.

## Acceptance Criteria
- [ ] AC-001: Dashboard displays top 10 customers by revenue (last 30 days)
- [ ] AC-002: Revenue trend chart shows last 12 months with month-over-month comparison
- [ ] AC-003: Engagement score is calculated and displayed (0-100 scale)
- [ ] AC-004: Dashboard loads within 3 seconds for up to 1000 customers
- [ ] AC-005: Data refreshes automatically every 5 minutes

## Technical Context

### Backend Requirements
- [ ] New API endpoint(s): GET /api/analytics/customers
- [ ] Database changes: No (uses existing data)
- [ ] Message broker events: No
- [ ] Pattern to follow: CQRS Query Handler

### Frontend Requirements
- [ ] New pages/views: /dashboard/analytics
- [ ] Toolkit components to use:
  - @react-toolkit/charts (ChartsDashboard, SplineAreaChart)
  - @react-toolkit/tree-grid (customer list)
- [ ] New components needed: EngagementScoreCard (simple, build custom)
- [ ] State management changes: Add analytics store slice

## Dependencies
- Depends on: REQ-5.2-001 (Customer data API)
- Blocks: None
```

---

*Guide Version: 2.0*
