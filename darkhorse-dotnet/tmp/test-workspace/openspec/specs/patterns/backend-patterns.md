# Backend Patterns Guide

**Architecture and implementation patterns for .NET backend development.**

---

## Clean Architecture (Onion Architecture)

### Layer Structure

```
Infrastructure ──→ Application ──→ Domain
     ↓                  ↑
Presentation ──────────┘
```

**Dependency Rule**: Outer layers depend on inner layers ONLY. Domain has ZERO dependencies.

### .NET Project Mapping

| Layer | Project | Dependencies |
|-------|---------|--------------|
| **Domain** | `Namespace.Domain` | NONE |
| **Application** | `Namespace.Application` | Domain, Common |
| **Common** | `Namespace.Common` | Domain |
| **Infrastructure** | `Namespace.Infrastructure` | Application, Domain, Common |
| **Presentation** | `Namespace.Presentation` | Application, Infrastructure, Common |

---

## CQRS Pattern (MediatR)

### Command Handler

```csharp
public record PlaceOrderCommand(Guid CustomerId, List<OrderItemDto> Items) : IRequest<Guid>;

public class PlaceOrderCommandHandler : IRequestHandler<PlaceOrderCommand, Guid>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IPublisher _publisher;

    public PlaceOrderCommandHandler(IOrderRepository orderRepository, IPublisher publisher)
    {
        _orderRepository = orderRepository;
        _publisher = publisher;
    }

    public async Task<Guid> Handle(PlaceOrderCommand request, CancellationToken ct)
    {
        var order = Order.Place(new CustomerId(request.CustomerId), request.Items);
        await _orderRepository.SaveAsync(order, ct);
        await _publisher.Publish(new OrderPlacedEvent(order.Id), ct);
        return order.Id.Value;
    }
}
```

### Query Handler

```csharp
public record GetOrderByIdQuery(Guid OrderId) : IRequest<OrderDto?>;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto?>
{
    private readonly IOrderReadRepository _readRepository;

    public GetOrderByIdQueryHandler(IOrderReadRepository readRepository)
    {
        _readRepository = readRepository;
    }

    public async Task<OrderDto?> Handle(GetOrderByIdQuery request, CancellationToken ct)
    {
        return await _readRepository.FindByIdAsync(new OrderId(request.OrderId), ct);
    }
}
```

---

## Event-Driven Architecture

### Domain Event (MediatR Notification)

```csharp
public record OrderPlacedEvent(OrderId OrderId) : INotification;

public class OrderPlacedEventHandler : INotificationHandler<OrderPlacedEvent>
{
    public async Task Handle(OrderPlacedEvent notification, CancellationToken ct)
    {
        // Update read model, send notifications, trigger downstream
    }
}
```

### Integration Event (MassTransit)

```csharp
// Shared contract (Common project)
public record OrderPlacedIntegrationEvent
{
    public Guid OrderId { get; init; }
    public Guid CustomerId { get; init; }
    public DateTime OccurredAt { get; init; }
}

// Publisher (Infrastructure)
public class OrderEventPublisher
{
    private readonly IPublishEndpoint _publishEndpoint;

    public async Task PublishOrderPlaced(OrderPlacedIntegrationEvent @event, CancellationToken ct)
    {
        await _publishEndpoint.Publish(@event, ct);
    }
}
```

### Fault Tolerance
- Retry with exponential backoff (Polly)
- Dead letter queues (MassTransit error queues)
- Idempotency keys to prevent duplicate processing

---

## Repository Pattern

### Interface (Domain Layer)

```csharp
public interface IOrderRepository
{
    Task SaveAsync(Order order, CancellationToken ct = default);
    Task<Order?> FindByIdAsync(OrderId id, CancellationToken ct = default);
    Task<IReadOnlyList<Order>> FindByCustomerIdAsync(CustomerId customerId, CancellationToken ct = default);
}
```

### Implementation (Infrastructure Layer)

```csharp
public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _db;

    public OrderRepository(AppDbContext db) => _db = db;

    public async Task SaveAsync(Order order, CancellationToken ct)
    {
        _db.Orders.Add(order);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<Order?> FindByIdAsync(OrderId id, CancellationToken ct)
    {
        return await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, ct);
    }
}
```

---

## API Design

### ASP.NET Core Controller

```csharp
[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator) => _mediator = mediator;

    [HttpPost("place")]
    public async Task<ActionResult<Guid>> PlaceOrder(PlaceOrderRequest request, CancellationToken ct)
    {
        var command = new PlaceOrderCommand(request.CustomerId, request.Items);
        var orderId = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id = orderId }, orderId);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDto>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOrderByIdQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }
}
```

---

## Archetype-Specific Patterns

### API Archetype

Standard CQRS flow with persistence:

```
HTTP Request → Controller → IMediator.Send → Handler → Repository → Database
```

### BFF-API Archetype

**BFF Command Pattern:**

```csharp
// BFF command handler — dispatches to broker, does NOT persist
public class PlaceOrderCommandHandler : IRequestHandler<PlaceOrderCommand, string>
{
    private readonly IOrderCommandSender _sender; // interface in Domain/Contracts

    public async Task<string> Handle(PlaceOrderCommand request, CancellationToken ct)
    {
        var message = new PlaceOrderMessage
        {
            CorrelationId = Guid.NewGuid().ToString(),
            CustomerId = request.CustomerId,
            Items = request.Items
        };
        await _sender.SendAsync(message, ct);
        return message.CorrelationId; // accepted, not completed
    }
}
```

**BFF Query Pattern:**

```csharp
// BFF query handler — calls downstream API, does NOT access database
public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto?>
{
    private readonly IOrderApiClient _apiClient; // interface in Domain/Contracts

    public async Task<OrderDto?> Handle(GetOrderByIdQuery request, CancellationToken ct)
    {
        var response = await _apiClient.GetByIdAsync(request.OrderId, ct);
        return response is null ? null : OrderDto.FromExternal(response);
    }
}
```

### Microservice Archetype

**MassTransit Consumer (entry point):**

```csharp
public class PlaceOrderConsumer : IConsumer<PlaceOrderMessage>
{
    private readonly IMediator _mediator;

    public PlaceOrderConsumer(IMediator mediator) => _mediator = mediator;

    public async Task Consume(ConsumeContext<PlaceOrderMessage> context)
    {
        var command = new PlaceOrderCommand(
            context.Message.CustomerId,
            context.Message.Items);
        await _mediator.Send(command, context.CancellationToken);
    }
}
```

**Integration Event Publisher:**

```csharp
public class OrderIntegrationEventPublisher
{
    private readonly IPublishEndpoint _publishEndpoint;

    public async Task PublishOrderPlaced(Order order, CancellationToken ct)
    {
        await _publishEndpoint.Publish(new OrderPlacedIntegrationEvent
        {
            OrderId = order.Id.Value,
            CustomerId = order.CustomerId.Value,
            OccurredAt = DateTime.UtcNow
        }, ct);
    }
}
```

---

## Testing

### Unit Tests (xUnit + Moq + FluentAssertions)

```csharp
public class PlaceOrderCommandHandlerTests
{
    [Fact]
    public async Task Should_SaveOrder_When_CommandIsValid()
    {
        var repo = new Mock<IOrderRepository>();
        var publisher = new Mock<IPublisher>();
        var handler = new PlaceOrderCommandHandler(repo.Object, publisher.Object);

        var result = await handler.Handle(new PlaceOrderCommand(Guid.NewGuid(), items), CancellationToken.None);

        result.Should().NotBeEmpty();
        repo.Verify(r => r.SaveAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}
```

### Integration Tests (WebApplicationFactory)

```csharp
public class OrdersApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public OrdersApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task PlaceOrder_ReturnsCreated()
    {
        var response = await _client.PostAsJsonAsync("/api/orders/place", new { /* ... */ });
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}
```

---

*Guide Version: 1.5*
