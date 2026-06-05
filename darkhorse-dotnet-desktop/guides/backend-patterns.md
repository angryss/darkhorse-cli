# Backend Patterns — WPF Desktop (.NET)

## Domain Layer Patterns

### Entity Factory Method Pattern

Entities are created through static factory methods only. Never call constructors from outside the domain.

```csharp
// ✅ CORRECT — factory method validates and raises domain event
public sealed class Order : AggregateRoot
{
    public static Order Place(CustomerId customerId, IEnumerable<OrderLine> lines)
    {
        if (!lines.Any()) throw new DomainException("Order must have at least one line.");
        var order = new Order(Guid.NewGuid(), customerId);
        order.RaiseDomainEvent(new OrderPlacedEvent(order.Id));
        return order;
    }
}

// ❌ WRONG — public constructor bypasses invariant checks
public Order(Guid id, string name) { ... }
```

### Value Object Pattern

```csharp
public sealed class EmailAddress : ValueObject
{
    public string Value { get; }

    private EmailAddress(string value) => Value = value;

    public static EmailAddress Create(string value)
    {
        if (!value.Contains('@')) throw new DomainException("Invalid email.");
        return new EmailAddress(value.ToLowerInvariant());
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }
}
```

### Repository Interface Pattern

Repository interfaces live in the **Domain** layer. Implementations live in **Infrastructure**.

```csharp
// Domain/Repositories/IOrderRepository.cs
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Order>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(Order order, CancellationToken ct = default);
    Task UpdateAsync(Order order, CancellationToken ct = default);
}
```

---

## Application Layer Patterns

### Command Pattern

```csharp
// Commands/Orders/PlaceOrderCommand.cs
public sealed record PlaceOrderCommand(
    Guid CustomerId,
    IReadOnlyList<OrderLineRequest> Lines
) : IRequest<Guid>;

// Commands/Orders/PlaceOrderCommandHandler.cs
public sealed class PlaceOrderCommandHandler : IRequestHandler<PlaceOrderCommand, Guid>
{
    private readonly IOrderRepository _repository;

    public PlaceOrderCommandHandler(IOrderRepository repository) => _repository = repository;

    public async Task<Guid> Handle(PlaceOrderCommand request, CancellationToken ct)
    {
        var lines = request.Lines.Select(l => OrderLine.Create(l.ProductId, l.Quantity));
        var order = Order.Place(CustomerId.Create(request.CustomerId), lines);
        await _repository.AddAsync(order, ct);
        return order.Id;
    }
}
```

### Query and DTO Pattern

```csharp
// Queries/Orders/GetOrdersQuery.cs
public sealed record OrderSummaryDto(Guid Id, string Status, decimal Total);
public sealed record GetOrdersQuery : IRequest<IReadOnlyList<OrderSummaryDto>>;

public sealed class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, IReadOnlyList<OrderSummaryDto>>
{
    private readonly IOrderRepository _repository;

    public async Task<IReadOnlyList<OrderSummaryDto>> Handle(GetOrdersQuery request, CancellationToken ct)
    {
        var orders = await _repository.GetAllAsync(ct);
        return orders.Select(o => new OrderSummaryDto(o.Id, o.Status.ToString(), o.Total)).ToList();
    }
}
```

### Validation Pipeline Behavior

```csharp
// Behaviours/ValidationPipelineBehavior.cs
public sealed class ValidationPipelineBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var failures = _validators
            .Select(v => v.Validate(request))
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();

        if (failures.Count != 0)
            throw new ValidationException(failures);

        return await next();
    }
}
```

---

## Infrastructure Patterns

### EF Core Repository Pattern

```csharp
// Infrastructure/Repositories/OrderRepository.cs
public sealed class OrderRepository : IOrderRepository
{
    private readonly ApplicationDbContext _context;

    public OrderRepository(ApplicationDbContext context) => _context = context;

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken ct) =>
        await _context.Orders.FindAsync([id], ct);

    public async Task AddAsync(Order order, CancellationToken ct)
    {
        await _context.Orders.AddAsync(order, ct);
        await _context.SaveChangesAsync(ct);
        order.ClearDomainEvents();
    }
}
```

### Domain Event Dispatch After Save

```csharp
// Infrastructure/Persistence/ApplicationDbContext.cs
public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
{
    var result = await base.SaveChangesAsync(ct);

    // Dispatch domain events after state is committed
    var aggregates = ChangeTracker.Entries<AggregateRoot>()
        .Where(e => e.Entity.DomainEvents.Any())
        .Select(e => e.Entity);

    foreach (var aggregate in aggregates)
    {
        foreach (var domainEvent in aggregate.DomainEvents)
            await _mediator.Publish(domainEvent, ct);
        aggregate.ClearDomainEvents();
    }

    return result;
}
```
