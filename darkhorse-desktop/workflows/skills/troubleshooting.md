# Skill: Troubleshooting

## Metadata

```yaml
id: troubleshooting
version: 1.0.0
category: workflow
status: active
next_skill: planning
```

## Purpose

Identify, categorize, and document bugs with architecture compliance. Determine the root cause, classify the change type, and produce an actionable bug report that chains into the Planning and Implementation skills.

## Required Context

Load these files before executing the skill:

```yaml
architecture:
  - openspec/specs/architecture/clean-architecture.md
  - openspec/specs/architecture/cqrs-patterns.md

patterns:
  - openspec/specs/patterns/backend.md
  - openspec/specs/patterns/frontend.md

context:
  - context/20-WORKSPACE-PROJECTS.md
  - context/30-BOUNDED-CONTEXTS.md
```

## Steps

1. **Load Rules & Patterns** — Read architecture rules, patterns, and context maps.
2. **Identify Affected Module** — Determine which crate and module contains the bug.
3. **Identify Affected Layer** — Domain, Application, Infrastructure, Desktop Shell, or Frontend.
4. **Categorize Bug**:
   - **Application Code Bug** → Log proposal, fix in project.
   - **Architecture Violation** → Refactor to comply with rules.
   - **Cross-Context Issue** → Fix via proper module boundaries.
5. **Check for Architecture Violations** — Clean architecture violations, crate dependency violations, CQRS violations, boundary violations.
6. **Analyze Root Cause** — Trace the issue to its origin.
7. **Determine Change Type** — Config change, code fix, infrastructure change, or architecture refactor.
8. **Produce Bug Report** — Create `openspec/changes/mvp-[MVP]/BUG-[MVP]-[###]/proposal.md` with full analysis.
9. **Define Regression Test** — Specify a Rust test that would have caught this bug.
10. **Update Progress Tracker** — Add the bug row to `openspec/changes/mvp-[MVP]/progress-tracker.md` with status `Not Started`.

## Output Format

```markdown
# Troubleshooting Report: [Issue Description]

## Problem Summary
[One-line description using ubiquitous language]

## Root Cause
[Explicit explanation of why the issue occurs]

## Impacted System
- Crate: [<prefix>-domain / <prefix>-application / <prefix>-infrastructure / <prefix>-desktop]
- Module: [module path]
- Layer: Domain / Application / Infrastructure / Desktop Shell / Frontend
- Files: [list of affected files]

## Bug Category
- [ ] Application code bug
- [ ] Architecture violation → Rule: [description]
- [ ] Cross-context issue → Fix: [approach]

## Architecture Violations Found
| Check                                    | Status |
|------------------------------------------|--------|
| Domain depending on infrastructure       | ok / violation |
| Cross-context direct imports             | ok / violation |
| Business logic in bridge commands        | ok / violation |
| Ubiquitous language consistent           | ok / violation |
| CQRS patterns followed                   | ok / violation |
| Crate dependency direction correct       | ok / violation |

## Recommended Fix
[Step-by-step fix description]

## Evidence
[Code snippets, error messages, or traces supporting the analysis]

## Regression Test
```rust
#[test]
fn should_expected_when_condition() {
    // Arrange — set up the scenario that caused the bug
    // Act — trigger the behavior
    // Assert — verify the fix
}
```

## Recommended Change Type
config / code-fix / infrastructure / architecture-refactor

## Next Actions
- [ ] Create planning proposal: `openspec/changes/mvp-[MVP]/BUG-[MVP]-[###]/`
- [ ] Add to `openspec/changes/mvp-[MVP]/progress-tracker.md` (status: Not Started)
- [ ] Implement fix via Implementation skill
- [ ] Add regression test
- [ ] Verify architecture compliance
```

## Constraints

- **HARD STOP — Reports Only:** This skill produces bug reports and proposal documents ONLY. Writing source code or modifying application files in `crates/` or `frontend/` is a HARD STOP violation. Document the suggested fix in the report but do NOT implement it.
- Bug fixes must respect crate boundaries and layer dependencies.
- Architecture violations require refactoring, not workarounds.

## Next Skill

After troubleshooting is complete:

- **Code/config change needed** — proceed to **Planning** (`workflows/skills/planning.md`) to create a formal proposal, then **Implementation** (`workflows/skills/implementation.md`) to apply the fix.
- **Architecture violation** — proceed to **Planning** to design the refactor, then **Implementation** to execute.

Typical chain: **Troubleshooting → Planning → Implementation**
