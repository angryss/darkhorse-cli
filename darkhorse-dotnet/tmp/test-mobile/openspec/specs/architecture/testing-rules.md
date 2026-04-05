# Testing Rules (v1.5)

**Mandatory testing requirements for all development.**

---

## Rule 1: Testing is NOT Optional

> ⚠️ **No code without tests**

Every implementation must include:
- Unit tests (xUnit + FluentAssertions)
- Integration tests (when applicable)
- Regression tests (for bug fixes)

---

## Rule 2: Coverage Requirements

| Metric | Minimum | Target |
|--------|---------|--------|
| Line Coverage | 80% | 90%+ |
| Branch Coverage | 75% | 85%+ |
| Critical Paths | 100% | 100% |

Coverage measured with Coverlet.

---

## Rule 3: Test Types

### Unit Tests (Always Required)

- Test domain logic in isolation
- Test command/query handlers with mocked dependencies (Moq)
- Fast execution, no external dependencies

### Integration Tests (When Applicable)

- Test API endpoints (WebApplicationFactory)
- Test EF Core repository implementations
- Test MassTransit consumer behavior

### Regression Tests (Bug Fixes)

- Prove the bug is fixed
- Prevent recurrence
- Document the bug scenario

---

## Rule 4: Test Location

```
backend/tests/
├── Namespace.UnitTests/
│   ├── Domain/           ← Entity, value object, aggregate tests
│   ├── Application/      ← Handler tests with mocked repos
│   └── Common/           ← Shared utility tests
└── Namespace.IntegrationTests/
    ├── Api/              ← HTTP endpoint tests (WebApplicationFactory)
    └── Infrastructure/   ← Repository, messaging tests
```

---

## Rule 5: Test Naming

```csharp
// Method naming convention
[Fact]
public async Task Should_ReturnOrder_When_ValidId() { }

[Fact]
public async Task Should_ThrowNotFoundException_When_OrderDoesNotExist() { }

[Fact]
public async Task Should_PublishEvent_When_OrderPlaced() { }
```

---

## Rule 6: .NET Test Stack

| Package | Purpose |
|---------|---------|
| **xUnit** | Test framework |
| **FluentAssertions** | Readable assertions |
| **Moq** | Mocking dependencies |
| **Coverlet** | Code coverage |
| **Microsoft.AspNetCore.Mvc.Testing** | Integration test host |

---

## Rule 7: Quality Gate

Before completion:
- [ ] All tests pass (`dotnet test`)
- [ ] Coverage meets minimum (Coverlet report)
- [ ] No skipped tests
- [ ] Regression test added (bug fixes)

---

*Rule Version: 1.5*
