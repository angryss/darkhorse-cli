# Testing Rules (v1.5)

**Mandatory testing requirements for all development.**

---

## Rule 1: Testing is NOT Optional

> ⚠️ **No code without tests**

Every implementation must include:
- Unit tests
- Integration tests (when applicable)
- Regression tests (for bug fixes)

---

## Rule 2: Coverage Requirements

| Metric | Minimum | Target |
|--------|---------|--------|
| Line Coverage | 80% | 90%+ |
| Branch Coverage | 75% | 85%+ |
| Critical Paths | 100% | 100% |

---

## Rule 3: Test Types

### Unit Tests (Always Required)
- Test individual functions/components
- Mock external dependencies
- Fast execution

### Integration Tests (When Applicable)
- Test API endpoints
- Test database operations
- Test component interactions

### Regression Tests (Bug Fixes)
- Prove the bug is fixed
- Prevent recurrence
- Document the bug scenario

---

## Rule 4: Test Location

All tests in project folder:

```
../<project-name>/
├── src/
│   └── components/
│       └── Button/
│           ├── Button.tsx
│           └── Button.test.tsx    ← Co-located
└── tests/
    └── integration/               ← Integration tests
```

---

## Rule 5: Test Naming

```
should_[expected]_when_[condition]

Examples:
- should_return_order_when_valid_id
- should_throw_when_not_found
- should_render_when_data_loaded
```

---

## Rule 6: Toolkit Testing

- ❌ Do NOT test toolkit internals
- ✅ Test YOUR code that uses toolkit

```typescript
// Testing your component that uses toolkit
describe('Dashboard', () => {
  it('should render chart with data', () => {
    render(<Dashboard data={mockData} />);
    expect(screen.getByTestId('chart')).toBeInTheDocument();
  });
});
```

---

## Rule 7: Metadata

```yaml
unit_tests:
  required: true
  files:
    - ../<project-name>/tests/Order.test.ts
    - ../<project-name>/src/components/Button.test.tsx
```

---

## Rule 8: Quality Gate

Before completion:
- [ ] All tests pass
- [ ] Coverage meets minimum
- [ ] No skipped tests
- [ ] Regression test added (bug fixes)

---

## Rule 9: Failure Handling and Masking

> ⛔ **Tests must reveal truth, not enforce success. Hiding a failure is worse than the failure itself.**

### Disallowed Patterns

The following patterns are **prohibited** and must be rejected in code review:

| Pattern | Why It Is Prohibited |
|---------|----------------------|
| Blind retry loops to make tests pass | Hides transient failures that indicate real problems |
| Polling for non-empty results without architectural justification | Masks eventual-consistency lag as if it is a timing issue |
| Arbitrary `Thread.sleep()` or timeout increases | Suppresses the symptom; the root cause remains |
| `WaitForStep` or equivalent "wait until success" helpers | Converts a failing test into a passing one without fixing anything |
| Silent fallbacks or default values when a contract fails | Makes contract violations invisible at runtime |
| Catching and swallowing exceptions in test helpers | Prevents the test from recording the actual failure |

### Required Behavior

- Fail fast on contract violations (422, 400, enum mismatch, missing fields, wrong status code)
- Surface errors with root-cause context — never discard the exception message
- Treat timing issues as **architectural signals**, not bugs to patch with waits

### Retry Policy

Retries are **only allowed** when ALL of the following are true:
1. The failure is **proven transient** (network flake, external system unavailability)
2. The operation is **idempotent**
3. Retry count and backoff interval are **explicitly defined in code**, not hardcoded magic numbers

Every retry must be classified with a comment:

```java
// RESILIENCE — network call to external API; max 3 retries, 500ms exponential backoff
// MASKING — NOT acceptable here; remove or escalate for approval
```

| Label | Meaning |
|-------|---------|
| `RESILIENCE` | Valid retry for a proven transient, idempotent operation |
| `MASKING` | Hides a real issue — rejected unless explicitly approved with written justification |

---

## Rule 10: Testing Philosophy — Reveal Truth

### Core Principle

> A failing test is **valuable signal**. A passing test achieved by weakening assertions is a liability.

### Prohibited

- Modifying test assertions to accommodate incorrect production behavior
- Adding waits, retries, or polling to force a test to pass
- Commenting out assertions that reveal a bug
- Reducing assertion specificity (e.g. changing `assertEquals(422, status)` to `assertNotEquals(200, status)`)

### Required Failure Classification

When a test fails, the cause MUST be classified before any fix is made:

| Class | Description | Correct Fix |
|-------|-------------|-------------|
| `CONTRACT` | DTO field name wrong, enum value wrong, HTTP status wrong | Fix the implementation to match the contract |
| `ARCHITECTURE` | Layer violation, wrong routing, wrong topology | Fix the architecture |
| `TIMING` | Eventual consistency lag, async event not yet projected | Document the behavior; do not add a sleep |
| `DEFECT` | Incorrect business logic or missing behavior | Fix the domain/application layer |
| `TEST_BUG` | The test itself is wrong (wrong mock, wrong expectation) | Fix the test — but confirm the behavior first |

No fix may be merged without a comment identifying the class of failure and the layer where the fix was applied.

---

*Rule Version: 2.0*
