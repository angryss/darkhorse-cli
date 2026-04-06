# Testing Rules (v1.0)

**Mandatory testing requirements for all Tauri desktop development.**

---

## Rule 1: Testing is NOT Optional

> **No code without tests.**

Every implementation must include:
- Unit tests (Rust `#[cfg(test)]` modules)
- Integration tests (when applicable)
- Regression tests (for bug fixes)

---

## Rule 2: Coverage Requirements

| Metric | Minimum | Target |
|--------|---------|--------|
| Domain logic coverage | 80% | 90%+ |
| Application command coverage | 80% | 90%+ |
| Critical state transitions | 100% | 100% |

---

## Rule 3: Test Types

### Unit Tests (Always Required)

- Test domain entity behavior and state transitions
- Test value object equality and validation
- Test application command handlers with mock/stub ports
- Fast execution, no external dependencies

### Integration Tests (When Applicable)

- Test SQLite repositories with in-memory database
- Test filesystem operations with temp directories
- Test migration sequences

### Regression Tests (Bug Fixes)

- Prove the bug is fixed
- Prevent recurrence
- Document the bug scenario

---

## Rule 4: Test Location

### Rust Tests

```
crates/<prefix>-domain/src/
├── entities.rs               ← #[cfg(test)] mod tests { ... } at bottom
├── values.rs                 ← #[cfg(test)] mod tests { ... } at bottom
└── tests/                    ← Optional: integration tests

crates/<prefix>-application/src/
├── commands/
│   └── <command>.rs          ← #[cfg(test)] mod tests { ... } at bottom

crates/<prefix>-infrastructure/src/
└── repositories/
    └── <repo>.rs             ← #[cfg(test)] mod tests { ... } (in-memory SQLite)
```

### Frontend Tests (Vitest)

```
frontend/
└── tests/
    └── pages/
        └── dashboard.test.ts
```

---

## Rule 5: Test Naming

```rust
#[test]
fn should_transition_draft_to_in_progress() { }

#[test]
fn should_reject_invalid_status_transition() { }

#[test]
fn should_save_and_retrieve_project() { }
```

Pattern: `should_{expected_behavior}_when_{condition}` or `should_{expected_behavior}`.

---

## Rule 6: Rust Test Stack

| Tool | Purpose |
|------|---------|
| **`#[cfg(test)]`** | Inline test modules |
| **`#[test]`** | Test function attribute |
| **`assert!` / `assert_eq!`** | Standard assertions |
| **In-memory SQLite** | Test database — `Connection::open_in_memory()` |
| **`cargo test`** | Test runner |

---

## Rule 7: Quality Gate

Before completion:
- [ ] All tests pass (`cargo test --workspace`)
- [ ] No compiler warnings (`cargo check --workspace`)
- [ ] Regression test added (bug fixes)

---

*Rule Version: 1.0 — Tauri Desktop Testing*
