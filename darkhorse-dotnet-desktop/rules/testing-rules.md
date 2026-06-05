# Testing Rules — WPF Desktop (v1.0)

**Mandatory testing standards for all DarkHorse WPF desktop development.**

---

## Test Stack

| Package | Version | Purpose |
|---------|---------|---------|
| `xunit` | 2.9.* | Test framework |
| `FluentAssertions` | 6.* | Readable assertions |
| `NSubstitute` | 5.* | Mocking framework |
| `Microsoft.EntityFrameworkCore.InMemory` | {version}.* | Integration test isolation |

---

## Unit Tests — `Namespace.UnitTests`

### What to Test

| Test Subject | How |
|-------------|-----|
| Domain entities | Test all factory methods, state-change methods, invariant violations |
| Value objects | Test equality, validation, immutability |
| Domain events | Test that events are raised when expected |
| Command handlers | Mock repository interface, assert domain method was called |
| Query handlers | Mock repository, assert DTO mapping is correct |
| FluentValidation validators | Test valid/invalid inputs |
| `ViewModelBase` properties | Test `IsBusy`, `ErrorMessage` state transitions |

### Rules

- Domain tests use **no mocks** — test real domain objects only.
- Application handler tests use NSubstitute to mock repository interfaces.
- Each test method covers one scenario (Arrange-Act-Assert pattern).
- Test names follow: `MethodName_Scenario_ExpectedResult`.

---

## Integration Tests — `Namespace.IntegrationTests`

### What to Test

| Test Subject | How |
|-------------|-----|
| Repository implementations | EF Core in-memory database |
| Full CQRS flows | Create command → query → assert persisted state |
| DI registration | Verify `AddApplicationServices()` / `AddInfrastructureServices()` resolve correctly |

### Rules

- Use `Microsoft.EntityFrameworkCore.InMemory` for SQLite isolation.
- Each test creates a fresh `DbContext` instance — no shared state between tests.

---

## Test Coverage Requirements

| Area | Minimum Coverage |
|------|-----------------|
| Domain entities | 90% |
| Application handlers | 85% |
| Infrastructure repositories | 80% |

---

## Zero Failures Policy

**All tests must pass before any task is marked Done.**

- Run `dotnet test` from the solution root before completing any implementation.
- Fix pre-existing failures before adding new code.
- A red test suite is never acceptable — it blocks the entire development flow.
