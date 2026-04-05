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

```
┌─────────────────────────────────────────────────────────────┐
│                      System Boundary                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Orders     │  │  Customers   │  │  Inventory   │       │
│  │   Context    │  │   Context    │  │   Context    │       │
│  │              │  │              │  │              │       │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │       │
│  │ │  Domain  │ │  │ │  Domain  │ │  │ │  Domain  │ │       │
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │   Events/APIs   │                 │               │
│         └────────────────►├◄────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Bounded Context Rules

| Rule | Requirement |
|------|-------------|
| **Isolation** | Each context has its own codebase folder, models, and database |
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

### Definition

A **shared vocabulary** between developers and domain experts that is:
- Consistent across code, documentation, and communication
- Specific to each bounded context
- Reflected in class names, method names, and API endpoints

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
   - Order.place()
   - OrderPlacedEvent
   - PlaceOrderCommand
   - POST /orders/place

❌ WRONG (Technical/Generic Terms):
   - Order.create()
   - OrderCreatedEvent
   - CreateOrderCommand
   - POST /orders/create
```

### Language Glossary Requirement

Each bounded context MUST maintain a **glossary** defining:
- Domain terms and their meanings
- Relationships between concepts
- Terms that differ from other contexts

```
docs/<context>/GLOSSARY.md
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

Dependencies: Presentation → Infrastructure → Application → Domain
```

### Layer Definitions

| Layer | Purpose | Dependencies |
|-------|---------|--------------|
| **Domain** | Business entities, rules, events | **NONE** |
| **Application** | Use cases, DTOs, interfaces | Domain only |
| **Presentation** | Controllers, API models | Application + Domain |
| **Infrastructure** | Repos, DB, messaging | Application + Domain |

### Violations to Prevent

- ❌ Domain depending on any other layer
- ❌ Application depending on Infrastructure
- ❌ Direct database access from Presentation
- ❌ Business logic in Controllers
- ❌ Framework dependencies in Domain
- ❌ Importing models from another bounded context

---

## Rule 4: SOLID Principles

| Principle | Requirement |
|-----------|-------------|
| **S**ingle Responsibility | One reason to change per class |
| **O**pen/Closed | Open for extension, closed for modification |
| **L**iskov Substitution | Subtypes must be substitutable |
| **I**nterface Segregation | Specific interfaces over general |
| **D**ependency Inversion | Depend on abstractions |

---

## Rule 5: DDD Building Blocks

### Aggregates

- **Aggregate Root**: Single entry point for all modifications
- **Consistency Boundary**: Transactions operate on one aggregate
- **Identity**: Each aggregate has a unique identifier

```java
// Order is the Aggregate Root
public class Order {
    private final OrderId id;
    private List<OrderItem> items;  // Entities within aggregate
    private OrderStatus status;     // Value Object

    // All modifications through root
    public void addItem(ProductId product, Quantity quantity) { }
    public void place() { }
}
```

### Entities vs Value Objects

| Type | Characteristics | Example |
|------|-----------------|---------|
| **Entity** | Has identity, mutable over time | `Customer`, `Order` |
| **Value Object** | No identity, immutable, equality by value | `Money`, `Address`, `Email` |

### Domain Services

Use when logic:
- Doesn't belong to a single entity
- Operates across multiple aggregates
- Represents a domain concept

```java
// Domain Service - belongs to domain layer
public class PricingService {
    public Money calculateDiscount(Customer customer, Order order) { }
}
```

---

## Rule 6: CQRS Pattern

### Commands (Writes)
- Modify state
- Return void or ID
- Publish events after success
- Use domain language: `PlaceOrderCommand`, not `CreateOrderCommand`

### Queries (Reads)
- Return data
- No side effects
- Can use optimized read models
- Query names reflect domain intent: `GetActiveOrders`, not `GetOrdersWhereStatusEquals`

---

## Rule 7: Repository Pattern

- Define interfaces in Application layer
- Implement in Infrastructure layer
- Domain entities, not database models
- Repository per Aggregate Root (not per entity)

```java
// Application layer - interface (uses domain language)
public interface OrderRepository {
    void save(Order order);
    Order findById(OrderId id);
    List<Order> findActiveOrdersForCustomer(CustomerId customerId);
}

// Infrastructure layer - implementation
public class PanacheOrderRepository implements OrderRepository {
    // Implementation details hidden from domain
}
```

### Repository Rules

| Rule | Requirement |
|------|-------------|
| **One per Aggregate** | Repository operates on aggregate roots only |
| **Domain Language** | Method names use ubiquitous language |
| **No Leaky Abstractions** | Don't expose DB concepts (SQL, collections) |
| **Return Domain Objects** | Never return ORM entities or raw data |

---

## Rule 8: Event-Driven Design

| Pattern | Usage |
|---------|-------|
| **Domain Events** | State changes within aggregate (same bounded context) |
| **Integration Events** | Cross-context communication (different bounded contexts) |
| **Event Sourcing** | Optional, for audit/replay needs |

### Event Naming (Ubiquitous Language)

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

### Cross-Context Events

When publishing events across bounded contexts:
1. Use **Integration Events** (not Domain Events)
2. Include only data the consumer needs
3. Never expose internal domain model
4. Version your event schemas

### Fault Tolerance
- Retry with exponential backoff
- Dead letter queues
- Idempotency keys

---

## Rule 9: API Design

### RESTful Resources (Using Ubiquitous Language)

```
# Use domain actions, not just CRUD
POST   /api/orders/place           → Place an order (not POST /orders)
POST   /api/orders/:id/cancel      → Cancel order
POST   /api/payments/process       → Process payment
GET    /api/customers/:id/orders   → Get customer's orders

# Standard CRUD when appropriate
GET    /api/{resource}             → List
GET    /api/{resource}/:id         → Get one
PUT    /api/{resource}/:id         → Update
DELETE /api/{resource}/:id         → Delete
```

### Response Format
```json
{
  "data": { },
  "meta": { "timestamp": "", "requestId": "" }
}
```

### API Contract Rules

| Rule | Requirement |
|------|-------------|
| **Context Prefix** | APIs scoped to bounded context: `/api/orders/...`, `/api/inventory/...` |
| **Domain Terms** | Endpoints use ubiquitous language of that context |
| **No Cross-Context Coupling** | Don't expose internal IDs from other contexts |

---

## Rule 10: Data Ownership

- Each **bounded context** owns its database
- No direct database sharing across contexts
- Cross-context communication via APIs or integration events
- Data duplication is acceptable for autonomy

### Anti-Corruption Layer (ACL)

When consuming data from another context:

```java
// ACL translates external concepts to internal domain language
public class CustomerContextAdapter {
    // Translates external "Client" to internal "Customer"
    public Customer translateToCustomer(ExternalClientDTO externalClient) {
        return new Customer(
            new CustomerId(externalClient.getClientId()),
            new CustomerName(externalClient.getFullName())
        );
    }
}
```

---

## Rule 11: Error Handling

- Use **domain-specific exceptions** with ubiquitous language
- Map to HTTP status codes in Presentation layer
- Include error codes for clients

### Domain Exception Examples

```java
// ✅ Domain-specific exceptions
public class OrderCannotBePlacedException extends DomainException { }
public class InsufficientInventoryException extends DomainException { }
public class CustomerNotEligibleException extends DomainException { }

// ❌ Generic exceptions
public class ValidationException { }  // Too vague
public class BadRequestException { }  // HTTP concept in domain
```

---

## Rule 12: Context Boundary Violations

> ⛔ **These violations MUST be prevented**

### Violations to Detect

| Violation | Description | Fix |
|-----------|-------------|-----|
| **Direct Import** | Importing entity from another context | Use ACL or shared kernel |
| **Shared Database** | Two contexts writing to same table | Split into separate databases |
| **Leaked Domain Model** | Exposing internal entities in API | Use DTOs at boundaries |
| **Mixed Language** | Using terms from another context | Translate via ACL |
| **Cross-Context Transactions** | Transaction spanning contexts | Use eventual consistency |

### Folder Structure Enforcement

```
backend/
├── order-context/           ← Bounded Context
│   ├── domain/
│   │   ├── Order.java       ← Order means something HERE
│   │   └── GLOSSARY.md      ← Define "Order" in this context
│   ├── application/
│   └── infrastructure/
│
├── fulfillment-context/     ← Different Bounded Context
│   ├── domain/
│   │   ├── Shipment.java
│   │   ├── Order.java       ← "Order" may mean something DIFFERENT here
│   │   └── GLOSSARY.md      ← Define terms for THIS context
│   ├── application/
│   └── infrastructure/
```

---

## Reference

For implementation details, see:
- `guides/backend-patterns.md`

For DDD patterns, see:
- `openspec/specs/architecture/cqrs-patterns.md`
- `openspec/specs/architecture/ddd-principles.md`

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
