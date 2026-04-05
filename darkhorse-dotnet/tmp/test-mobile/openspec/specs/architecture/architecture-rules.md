# Architecture Rules (v1.6)

**Mandatory architectural rules for all development.**

> ⚠️ **DDD-First**: All architecture decisions must respect Domain-Driven Design principles.

---

## Rule 1: Domain-Driven Design (DDD) Foundation

### Bounded Contexts as Domains

Each **Bounded Context** is an autonomous domain with its own:
- Domain model (entities, value objects, aggregates)
- Ubiquitous Language (domain-specific terminology)
- Persistence strategy
- API contracts

### Bounded Context Rules

| Rule | Requirement |
|------|-------------|
| **Isolation** | Each context has its own codebase folder (Contexts/\<Name\>/ in each layer project) |
| **No Direct Imports** | NEVER import domain models from another bounded context |
| **Communication** | Cross-context via APIs, events, or Anti-Corruption Layer (ACL) |
| **Ownership** | One team owns one bounded context |

### Context Mapping Patterns

| Pattern | When to Use |
|---------|-------------|
| **Shared Kernel** | Two contexts share a small, explicitly defined subset |
| **Customer-Supplier** | Upstream context provides, downstream consumes |
| **Anti-Corruption Layer** | Translate between contexts to prevent model pollution |
| **Published Language** | Well-documented API/event schemas for integration |

---

## Rule 2: Ubiquitous Language

### Enforcement

| Location | Language Usage |
|----------|----------------|
| **Domain Layer** | Entity names, method names, events MUST use domain terms |
| **Application Layer** | Use cases, commands, queries use domain vocabulary |
| **API Contracts** | Endpoints and DTOs reflect domain language |
| **Documentation** | Requirements, READMEs use same terminology |
| **Database** | Table/column names align with domain terms |

### Examples

```
✅ CORRECT (Ubiquitous Language):
   - order.Place()
   - OrderPlacedEvent
   - PlaceOrderCommand
   - POST /orders/place

❌ WRONG (Technical/Generic Terms):
   - order.Create()
   - OrderCreatedEvent
   - CreateOrderCommand
   - POST /orders/create
```

### Language Glossary Requirement

Each bounded context MUST maintain a **glossary**:

```
backend/src/Namespace.Domain/Contexts/<Context>/GLOSSARY.md
```

---

## Rule 3: Onion Architecture Layers

**Dependency Rule**: Dependencies always point inward. Domain is the core and has ZERO outward dependencies.

```
┌──────────────────────────────────────────┐
│           Presentation Layer              │
│  ┌────────────────────────────────────┐  │
│  │       Infrastructure Layer         │  │
│  │  ┌──────────────────────────────┐  │  │
│  │  │     Application Layer        │  │  │
│  │  │  ┌────────────────────────┐  │  │  │
│  │  │  │   Domain Layer (CORE)  │  │  │  │
│  │  │  └────────────────────────┘  │  │  │
│  │  └──────────────────────────────┘  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### .NET Project Mapping

| Layer | Project | Dependencies |
|-------|---------|--------------|
| **Domain** | `Namespace.Domain` | **NONE** (zero NuGet packages) |
| **Application** | `Namespace.Application` | Domain, Common |
| **Common** | `Namespace.Common` | Domain |
| **Infrastructure** | `Namespace.Infrastructure` | Application, Domain, Common |
| **Presentation** | `Namespace.Presentation` | Application, Infrastructure, Common |

### Violations to Prevent

- ❌ Domain depending on any other layer or NuGet package
- ❌ Application depending on Infrastructure
- ❌ Direct DbContext access from Presentation (go through MediatR)
- ❌ Business logic in Controllers
- ❌ Framework dependencies in Domain (no EF Core attributes, no ASP.NET types)
- ❌ Importing models from another bounded context

---

## Rule 4: SOLID Principles

| Principle | Requirement |
|-----------|-------------|
| **S**ingle Responsibility | One reason to change per class |
| **O**pen/Closed | Open for extension, closed for modification |
| **L**iskov Substitution | Subtypes must be substitutable |
| **I**nterface Segregation | Specific interfaces over general |
| **D**ependency Inversion | Depend on abstractions (interfaces in Domain, implementations in Infrastructure) |

---

## Rule 5: DDD Building Blocks

### Aggregates

```csharp
// Order is the Aggregate Root
public class Order
{
    public OrderId Id { get; private set; }
    private readonly List<OrderItem> _items = new();
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();
    public OrderStatus Status { get; private set; }

    // All modifications through root
    public void AddItem(ProductId product, Quantity quantity) { }
    public void Place() { }
}
```

### Entities vs Value Objects

| Type | Characteristics | Example |
|------|-----------------|---------|
| **Entity** | Has identity, mutable over time | `Customer`, `Order` |
| **Value Object** | No identity, immutable, equality by value | `Money`, `Address`, `Email` |

### Domain Services

```csharp
// Domain Service - belongs to domain layer
public class PricingService
{
    public Money CalculateDiscount(Customer customer, Order order) { }
}
```

---

## Rule 6: CQRS Pattern (MediatR)

### Commands (Writes)
- Implement `IRequest<T>` (MediatR)
- Modify state
- Return void or ID
- Publish events after success
- Use domain language: `PlaceOrderCommand`, not `CreateOrderCommand`

### Queries (Reads)
- Implement `IRequest<T>` (MediatR)
- Return data (DTOs)
- No side effects
- Can use optimized read models
- Query names reflect domain intent: `GetActiveOrdersQuery`, not `GetOrdersWhereStatusEquals`

---

## Rule 7: Repository Pattern

- Define interfaces in Domain layer (`IOrderRepository`)
- Implement in Infrastructure layer (`OrderRepository : IOrderRepository`)
- Work with domain entities, not EF Core models
- Repository per Aggregate Root (not per entity)

```csharp
// Domain layer - interface
public interface IOrderRepository
{
    Task SaveAsync(Order order, CancellationToken ct = default);
    Task<Order?> FindByIdAsync(OrderId id, CancellationToken ct = default);
    Task<IReadOnlyList<Order>> FindActiveOrdersForCustomerAsync(CustomerId customerId, CancellationToken ct = default);
}

// Infrastructure layer - implementation
public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _db;
    // EF Core implementation hidden from domain
}
```

---

## Rule 8: Event-Driven Design

| Pattern | Usage |
|---------|-------|
| **Domain Events** | State changes within aggregate (same bounded context, MediatR notifications) |
| **Integration Events** | Cross-context communication (MassTransit, different bounded contexts) |

### Event Naming

```
✅ CORRECT:
   - OrderPlacedEvent (domain action completed)
   - PaymentReceivedEvent
   - InventoryReservedEvent

❌ WRONG:
   - OrderCreatedEvent (generic CRUD term)
   - OrderUpdatedEvent (what was updated?)
   - OrderEvent (too vague)
```

### Fault Tolerance
- Retry with exponential backoff (Polly)
- Dead letter queues (MassTransit)
- Idempotency keys

---

## Rule 9: API Design

### RESTful Resources

```
POST   /api/orders/place           → Place an order
POST   /api/orders/{id}/cancel     → Cancel order
GET    /api/customers/{id}/orders  → Get customer's orders
GET    /api/{resource}             → List
GET    /api/{resource}/{id}        → Get one
```

### Response Format
```json
{
  "data": { },
  "meta": { "timestamp": "", "requestId": "" }
}
```

---

## Rule 10: Data Ownership

- Each **bounded context** owns its database (or schema)
- No direct database sharing across contexts
- Cross-context communication via APIs or integration events (MassTransit)
- Data duplication is acceptable for autonomy

---

## Rule 11: Error Handling

```csharp
// ✅ Domain-specific exceptions
public class OrderCannotBePlacedException : DomainException { }
public class InsufficientInventoryException : DomainException { }
public class CustomerNotEligibleException : DomainException { }

// ❌ Generic exceptions
public class ValidationException { }  // Too vague
public class BadRequestException { }  // HTTP concept in domain
```

Map domain exceptions to HTTP status codes in Presentation layer middleware.

---

## Rule 12: Context Boundary Violations

> ⛔ **These violations MUST be prevented**

| Violation | Description | Fix |
|-----------|-------------|-----|
| **Direct Import** | Importing entity from another context's namespace | Use ACL or shared kernel |
| **Shared Database** | Two contexts writing to same table | Split into separate DbContexts |
| **Leaked Domain Model** | Exposing internal entities in API | Use DTOs at boundaries |
| **Mixed Language** | Using terms from another context | Translate via ACL |
| **Cross-Context Transactions** | Transaction spanning contexts | Use eventual consistency (MassTransit) |

---

## Quick Reference: DDD Checklist

| Check | Question |
|-------|----------|
| ☐ | Is this a separate bounded context or part of an existing one? |
| ☐ | Have I defined the ubiquitous language (glossary)? |
| ☐ | Are entities named using domain terms? |
| ☐ | Am I importing from another bounded context? (If yes, use ACL) |
| ☐ | Do my events use past-tense domain actions? |
| ☐ | Does the API reflect the domain language? |
| ☐ | Is each aggregate's consistency boundary clear? |

---

*Rule Version: 1.6*
