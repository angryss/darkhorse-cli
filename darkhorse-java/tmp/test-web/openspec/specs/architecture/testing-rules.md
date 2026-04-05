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

*Rule Version: 1.5*
