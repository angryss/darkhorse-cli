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
