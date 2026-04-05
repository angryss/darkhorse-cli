# Backend Patterns Guide

**Architecture and implementation patterns for backend development.**

---

## Clean Architecture (Onion Architecture)

### Layer Structure

```
Infrastructure ──→ Application ──→ Domain
     ↓                  ↑
Presentation ──────────┘
```

**Dependency Rule**: Outer layers depend on inner layers ONLY. Domain has ZERO dependencies.

### Layer Definitions

| Layer | Purpose | Dependencies |
|-------|---------|--------------|
| **Domain** | Business entities, rules, domain events | NONE |
| **Application** | Use cases, DTOs, repository interfaces | Domain only |
| **Presentation** | Controllers, resolvers, API models | Application + Domain |
| **Infrastructure** | Repos, DB, message brokers, external APIs | Application + Domain |

### Folder Structure

```
src/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── exceptions/
├── application/
│   ├── commands/
│   ├── queries/
│   ├── services/
│   ├── dtos/
│   └── interfaces/
├── infrastructure/
│   ├── repositories/
│   ├── database/
│   ├── messaging/
│   └── external/
└── presentation/
    ├── controllers/
    ├── middleware/
    └── models/
```

---

## CQRS Pattern

### Command Query Responsibility Segregation

**Query Path**:
- API → Query Handler → Read Database
- Optimized for reads
- Can use caching

**Command Path**:
- API → Command Handler → Write Database → Publish Event
- Optimized for writes
- Eventual consistency

### Command Handler

```java
public interface CommandHandler<T> {
    void handle(T command);
}

public class CreateOrderHandler implements CommandHandler<CreateOrderCommand> {
    private final OrderRepository orderRepository;
    private final EventPublisher eventPublisher;

    public CreateOrderHandler(OrderRepository orderRepository, EventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public void handle(CreateOrderCommand command) {
        Order order = Order.create(command.getCustomerId(), command.getItems());
        orderRepository.save(order);
        eventPublisher.publish(new OrderCreatedEvent(order.getId()));
    }
}
```

### Query Handler

```java
public interface QueryHandler<TQuery, TResult> {
    TResult handle(TQuery query);
}

public class GetOrderByIdHandler implements QueryHandler<GetOrderByIdQuery, OrderDto> {
    private final OrderReadRepository orderReadRepository;

    public GetOrderByIdHandler(OrderReadRepository orderReadRepository) {
        this.orderReadRepository = orderReadRepository;
    }

    @Override
    public OrderDto handle(GetOrderByIdQuery query) {
        return orderReadRepository.findById(query.getOrderId());
    }
}
```

---

## Event-Driven Architecture

### Event Publishing

```java
public interface DomainEvent {
    String getEventId();
    Instant getOccurredAt();
    String getAggregateId();
}

public class OrderCreatedEvent implements DomainEvent {
    private final String eventId = UUID.randomUUID().toString();
    private final Instant occurredAt = Instant.now();
    private final String aggregateId;
    private final String customerId;

    public OrderCreatedEvent(String aggregateId, String customerId) {
        this.aggregateId = aggregateId;
        this.customerId = customerId;
    }
}
```

### Event Handler

```java
public class OrderCreatedHandler {
    public void handle(OrderCreatedEvent event) {
        // Update read model
        // Send notifications
        // Trigger downstream processes
    }
}
```

### Fault Tolerance

- Retry with exponential backoff
- Dead letter queues for failed messages
- Idempotency keys to prevent duplicate processing

---

## Repository Pattern

### Interface (Application Layer)

```java
public interface OrderRepository {
    void save(Order order);
    Order findById(String id);
    List<Order> findByCustomerId(String customerId);
}
```

### Implementation (Infrastructure Layer)

```java
@ApplicationScoped
public class PanacheOrderRepository implements OrderRepository {
    @Inject
    EntityManager em;

    @Override
    public void save(Order order) {
        em.persist(order.toPersistence());
    }

    @Override
    public Order findById(String id) {
        OrderEntity data = em.find(OrderEntity.class, id);
        return data != null ? Order.fromPersistence(data) : null;
    }
}
```

---

## API Design

### RESTful Endpoints

```
GET    /api/orders          → List orders
GET    /api/orders/:id      → Get order
POST   /api/orders          → Create order
PUT    /api/orders/:id      → Update order
DELETE /api/orders/:id      → Delete order
```

### Response Format

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-12-02T10:00:00Z",
    "requestId": "abc-123"
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order with ID xyz not found",
    "details": []
  },
  "meta": {
    "timestamp": "2025-12-02T10:00:00Z",
    "requestId": "abc-123"
  }
}
```

---

## Database Patterns

### Write Database
- Each service owns its data
- Normalized schema
- Optimized for consistency

### Read Database
- Denormalized for query performance
- Updated via events
- Eventually consistent

---

## Archetype-Specific Patterns

### API Archetype

Standard CQRS flow with persistence:

```
HTTP Request → Controller → Command/Query Handler → Repository → Database
```

- Commands create/modify aggregates and persist via repository
- Queries read from repository (or optimised read model)
- Domain events published after successful commands
- Full domain model with entities, value objects, aggregates

### BFF-API Archetype

The BFF is a **routing layer**, not a service:

```
HTTP Request → Controller (auth/claims) → Command Handler → Message Sender → Broker
HTTP Request → Controller (auth/claims) → Query Handler → API Client → Downstream API
```

**BFF Command Pattern:**

```java
// BFF command handler — dispatches to broker, does NOT persist
public class PlaceOrderCommandHandler {
    private final OrderCommandSender sender;  // interface in domain/contracts

    public String handle(PlaceOrderCommand command) {
        // Validate inbound data
        // Map to message payload
        PlaceOrderMessage message = PlaceOrderMessage.from(command);
        // Dispatch to broker
        sender.send(message);
        // Return correlation ID (accepted, not completed)
        return message.getCorrelationId();
    }
}
```

**BFF Query Pattern:**

```java
// BFF query handler — calls downstream API, does NOT access database
public class GetOrderByIdQueryHandler {
    private final OrderApiClient apiClient;  // interface in domain/contracts

    public OrderDto handle(GetOrderByIdQuery query) {
        // Call downstream API
        ExternalOrderResponse response = apiClient.getById(query.getOrderId());
        // Transform to frontend-facing DTO
        return OrderDto.fromExternal(response);
    }
}
```

**Key constraints:**
- No repository interfaces or implementations
- No database dependencies
- Domain layer contains only interfaces/contracts
- All data comes from downstream APIs (queries) or goes to broker (commands)

### Microservice Archetype

Message-driven, not HTTP-first:

```
Inbound Message → Listener → Command Handler → Domain Logic → Repository → Database
                                             → Integration Event Publisher → Broker
```

**Microservice Message Listener:**

```java
// Message listener — the entry point (replaces HTTP controllers)
@ApplicationScoped
public class OrderCommandListener {
    private final PlaceOrderCommandHandler handler;

    @Incoming("orders-commands")
    public void onPlaceOrder(PlaceOrderMessage message) {
        handler.handle(message);
    }
}
```

**Microservice Integration Event:**

```java
// Publishes events for other services to consume
@ApplicationScoped
public class OrderEventPublisher {
    @Channel("order-events")
    Emitter<OrderPlacedIntegrationEvent> emitter;

    public void publish(OrderPlacedIntegrationEvent event) {
        emitter.send(event);
    }
}
```

**Key constraints:**
- Messaging is the primary interface, not HTTP
- Owns its database (no shared data stores)
- Publishes integration events for cross-service communication
- REST endpoints only for health checks or admin


---

## Testing

### Unit Tests
- Test domain logic in isolation
- Mock repositories and external services
- Focus on behavior, not implementation

### Integration Tests
- Test repository implementations
- Test API endpoints
- Use test database

---

*Guide Version: 1.5*
