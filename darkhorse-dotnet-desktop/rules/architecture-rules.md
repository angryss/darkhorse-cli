# Architecture Rules — WPF Desktop (v1.0)

**Mandatory architectural rules for all DarkHorse WPF desktop development.**

> ⚠️ These rules are not suggestions. Violations are bugs, not style preferences.

---

## Rule 1: Onion Architecture — Layer Dependency Direction

Dependencies always point **inward**. The dependency rule is absolute.

```
┌────────────────────────────────────────────┐
│  Presentation (WPF: Views + ViewModels)    │  → may reference Application + Infrastructure (DI only)
├────────────────────────────────────────────┤
│  Infrastructure (Persistence, Adapters)    │  → may reference Application + Domain + Common
├────────────────────────────────────────────┤
│  Application (CQRS: Commands + Queries)    │  → may reference Domain + Common only
├────────────────────────────────────────────┤
│  Domain (Entities, Aggregates, Events)     │  → may reference Common only
├────────────────────────────────────────────┤
│  Common (Primitives, Contracts)            │  → no dependencies
└────────────────────────────────────────────┘
```

### Allowed Dependencies

| Layer | May Reference |
|-------|--------------|
| Presentation | Application, Infrastructure (startup DI only), Common |
| Infrastructure | Application, Domain, Common |
| Application | Domain, Common |
| Domain | Common |
| Common | Nothing |

### Forbidden Dependencies (Non-Negotiable)

| Rule | Example of Violation |
|------|---------------------|
| Domain MUST NOT reference Application | `using Namespace.Application` in Domain |
| Domain MUST NOT reference Infrastructure | `using Namespace.Infrastructure` in Domain |
| Domain MUST NOT reference Presentation | `using Namespace.Presentation` in Domain |
| Application MUST NOT reference Infrastructure | `using Namespace.Infrastructure` in Application handlers |
| Application MUST NOT reference Presentation | `using Namespace.Presentation` in Application |
| Presentation MUST NOT contain business logic | Any `if/switch` on domain rules in ViewModels or code-behind |

---

## Rule 2: DDD — Domain-Driven Design

### Entity Rules

- Entities have identity (`Id`). Two entities with the same `Id` are the same entity.
- All entities extend `Common.Primitives.Entity`.
- State changes happen through methods only — **no public setters**.
- Domain logic (invariants, business rules) lives inside entity methods — not in handlers.

### Aggregate Rules

- Aggregate roots extend `Common.Primitives.AggregateRoot`.
- The aggregate root enforces all invariants for its aggregate boundary.
- External code interacts with the aggregate only through the aggregate root's public interface.
- Domain events are raised via `RaiseDomainEvent()` on the aggregate root.

### Value Object Rules

- Value objects extend `Common.Primitives.ValueObject`.
- Value objects must be **immutable** — no setters, no mutation methods.
- Two value objects are equal if all their equality components are equal.

### Ubiquitous Language

- Entity names, method names, event names, and command names MUST use the domain's ubiquitous language.
- No generic CRUD terminology: use `Place()` not `Create()`, use `Cancel()` not `Delete()`.

---

## Rule 3: CQRS

### Command Rules

- Commands change state. They return the new entity's `Id` or `void`.
- Commands are `sealed record` types implementing `IRequest<T>`.
- Command handlers implement `IRequestHandler<TCommand, TResult>`.
- Command handlers orchestrate — they call domain methods and repository saves. They contain **zero business logic**.

### Query Rules

- Queries read state. They must **never** mutate state.
- Queries return DTOs — never domain entities.
- Query handlers implement `IRequestHandler<TQuery, TResult>`.
- DTOs are `sealed record` types in the Application layer.

### CQRS Routing (WPF)

```
ViewModel
  → _mediator.Send(new CreateEntityCommand(...))
      → CreateEntityCommandHandler.Handle(...)
          → entity = Entity.Create(...)        ← domain logic
          → await _repository.AddAsync(entity) ← infrastructure call via port
          → return entity.Id
  → _mediator.Send(new GetEntitiesQuery())
      → GetEntitiesQueryHandler.Handle(...)
          → return await _repository.GetAllAsync() mapped to DTOs
```

---

## Rule 4: MVVM

### ViewModel Rules

- All ViewModels extend `Common.Primitives.ViewModelBase` (or `ObservableObject` for simple cases).
- Observable properties use `[ObservableProperty]` source generator from CommunityToolkit.Mvvm.
- Commands use `[RelayCommand]` source generator.
- Async commands use `[RelayCommand]` with `CanExecute = nameof(IsBusy)` or equivalent guard.
- ViewModels dispatch to `IMediator` only — they never call repositories or domain objects directly.

### View (XAML) Rules

- Views bind to ViewModel properties via XAML data binding only.
- Code-behind (`*.xaml.cs`) contains only constructor injection: `DataContext = viewModel;`
- Zero business logic in code-behind. If you need logic, move it to the ViewModel.
- Use `d:DataContext="{d:DesignInstance Type=vm:YourViewModel}"` for design-time support.

---

## Rule 5: Common Layer

- Common has ZERO external NuGet package dependencies.
- Common contains only: primitive base classes, shared interfaces/contracts, pure utility functions, extension methods.
- Nothing in Common should need to change when switching UI frameworks or data access strategies.

---

## Rule 6: Testing

- Unit tests cover all domain entities and application handlers.
- Domain tests use no mocks — test real domain objects.
- Application handler tests mock repository interfaces with NSubstitute.
- Integration tests use EF Core in-memory database for isolation.
- All tests must pass before any task is marked `Done`.
- Zero failing tests is mandatory — no exceptions.
