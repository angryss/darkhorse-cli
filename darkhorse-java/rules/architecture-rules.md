# Architecture Rules (v2.4)

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

## Rule 7: System Topology

> **The BFF is the ONLY entry point for frontend clients.** All traffic flows through the BFF, which enforces authentication, authorization, and request validation before routing to backend services.

### Traffic Flow

```
Frontend (Web / Mobile)
  │
  ▼
BFF-API  ── security boundary, JWT auth, claims, permissions ──
  │                                │
  │ Queries (reads)                │ Commands (writes)
  ▼                                ▼
API Services                   Message Broker (RabbitMQ)
  │                                │
  ▼                                ▼
Read Database(s)               Microservices
                                   │
                                   ▼
                               Write Database(s)
```

### Routing Rules

| Flow | Route | Why |
|------|-------|-----|
| **Queries** | BFF → downstream API (HttpClient) → read database | APIs own read-optimized data; BFF aggregates for frontend |
| **Commands** | BFF → broker (Reactive Messaging / AMQP) → microservice → write database | Async processing, eventual consistency, decoupled writes |
| **Events** | Microservice → broker → other services | Integration events propagate state changes across contexts |

### Mandatory Rules

1. **Frontend MUST NOT call APIs or microservices directly** — all traffic goes through the BFF
2. **BFF MUST NOT access any database** — it routes queries to APIs and commands to the broker
3. **APIs own read-optimized databases** — they serve query results to the BFF
4. **Microservices own write databases** — they process commands from the broker and persist state
5. **Cross-service communication is event-driven** — microservices publish integration events; other services subscribe

### Violations

```
❌ Frontend calling an API directly (bypassing BFF security boundary)
❌ BFF connecting to a database
❌ API processing commands from the broker (APIs serve queries)
❌ Microservice serving as primary HTTP API for the frontend
❌ Any service sharing a database with another service
```

---

## Rule 8: Read/Write Database Separation

> **Separate read and write databases to avoid locking, contention, and scaling bottlenecks.**

### Pattern

| Concern | Database | Owner | Purpose |
|---------|----------|-------|---------|
| **Writes** | Write DB (primary) | Microservice | Command processing, domain state, ACID transactions |
| **Reads** | Read DB (replica or projection) | API | Query-optimized views, denormalized for fast reads |

### Rules

1. **Write path**: Commands arrive via broker → microservice validates → persists to write DB → publishes integration event
2. **Read path**: Integration event → API updates its read model/projection → BFF queries the API
3. **Eventual consistency**: Read models may lag behind writes — this is by design
4. **No shared locks**: Reads never block writes; writes never block reads
5. **Database-per-service**: Each service owns exactly one database — no cross-service database access

### Implementation

- Write DB: Standard normalized schema, optimized for transactional integrity
- Read DB: Denormalized projections, materialized views, or separate read replicas
- Sync mechanism: Integration events (Reactive Messaging) keep read models updated

---

## Rule 9: Repository Pattern

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

## Rule 10: Event-Driven Design

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

## Rule 11: API Design

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

## Rule 12: Data Ownership

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

## Rule 13: Error Handling

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

## Rule 14: Context Boundary Violations

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

## Rule 15: AMQP Message Listeners — `@Blocking`, Payload Types, and Thread Safety

> ⛔ **Every `@Incoming` method that touches the database MUST use `@Blocking`.** This applies to all listener classes: `CommandMessageListener`, event listeners in read APIs, and reply listeners in the BFF.

### Problem A — `BlockingOperationNotAllowedException`

SmallRye Reactive Messaging delivers AMQP messages on the **Vert.x IO (event-loop) thread**. JTA transactions (`@Transactional`) cannot start on this thread. Using `Message.ack().thenRun(lambda)` schedules the lambda still on the IO thread — silently bypassing `@Blocking`:

```
BlockingOperationNotAllowedException: Cannot start a JTA transaction from the IO thread.
```

**Affected classes in this project:** `CommandMessageListener` (microservices) and `*EventListener` (read APIs).

### Problem B — `ClassCastException: JsonObject cannot be cast to Map`

SmallRye delivers AMQP payloads as `io.vertx.core.json.JsonObject` when the **sender** did not use a `Map`-typed `Emitter`. The BFF reply listeners must accept `JsonObject` directly.

**Exception:** When a sender uses `Emitter<Map<String, Object>>`, SmallRye serializes via Jackson and the receiver can accept `Map<String, Object>`. This is the pattern used for commands (BFF → microservice) and integration events (microservice → read API).

```
ClassCastException: class io.vertx.core.json.JsonObject cannot be cast to class java.util.Map
```

**Affected classes in this project:** `CommandReplyListener` (BFF) — must use `JsonObject`.

### Mandatory Patterns

#### Pattern 1 — Command/Event listeners receiving `Map<String, Object>` (sent via `Emitter<Map<String, Object>>`)

```java
// ✅ CORRECT — microservice CommandMessageListener or read API *EventListener
@Incoming("my-channel")
@Blocking
@Transactional               // safe: @Blocking moves execution to worker thread
public void onEvent(Map<String, Object> payload) {
    String type = (String) payload.get("type");
    // ...
}

// ❌ FORBIDDEN — lambda runs on IO thread, @Transactional will throw
@Incoming("my-channel")
@Transactional
public CompletionStage<Void> onEvent(Message<Map<String, Object>> message) {
    return message.ack().thenRun(() -> { /* runs on IO thread */ });
}
```

#### Pattern 2 — Reply listeners in the BFF receiving `JsonObject`

```java
// ✅ CORRECT — BFF *CommandReplyListener
@Incoming("my-replies")
@Blocking
public void onReply(JsonObject payload) {
    String correlationId = payload.getString("correlationId");
    boolean success      = payload.getBoolean("success");
    // ...
}

// ❌ WRONG — cast will throw ClassCastException at runtime
@Incoming("my-replies")
public void onReply(Map<String, Object> payload) { /* FAILS */ }
```

### Rules

| Rule | Requirement |
|------|-------------|
| **Always `@Blocking`** | Every `@Incoming` method that calls `@Transactional` code MUST have `@Blocking` |
| **Direct payload** | Accept the payload type directly — never `Message<T>` |
| **No `thenRun`** | Never use `message.ack().thenRun(lambda)` for handlers that touch the database |
| **No `CompletionStage` return** | `@Incoming` handlers MUST return `void` |
| **Payload type — commands/events** | Use `Map<String, Object>` when the sender uses `Emitter<Map<String, Object>>` |
| **Payload type — replies (BFF)** | Use `io.vertx.core.json.JsonObject` for BFF reply listeners |
| **Import** | `io.smallrye.reactive.messaging.annotations.Blocking` |

### Checklist

| Check | Question |
|-------|----------|
| ☐ | Does every `@Incoming` method that is `@Transactional` also have `@io.smallrye.reactive.messaging.annotations.Blocking`? |
| ☐ | Does every `@Incoming` method accept the payload directly (not `Message<T>`)? |
| ☐ | Is the payload type correct? `Map<String, Object>` for commands/events; `JsonObject` for BFF replies? |
| ☐ | Is there any `thenRun` wrapping a transactional call? (If yes, remove it) |
| ☐ | Are BFF JAX-RS resource classes covered by Rule 16 (`@io.smallrye.common.annotation.Blocking`)? |

---

## Rule 16: BFF Resource Classes Must Use `@Blocking`

> ⛔ **Every JAX-RS resource class in the BFF that waits on an AMQP reply (`CompletableFuture.get(...)`) or makes synchronous REST client calls MUST be annotated with `@io.smallrye.common.annotation.Blocking`.**

### Problem — Deadlock on Login/Register

The BFF uses a request/reply pattern over AMQP:

1. HTTP handler sends a command via `Emitter` and then calls `CompletableFuture.get(5, SECONDS)` to wait for the reply
2. `CommandReplyListener.onReply()` receives the AMQP reply and completes that future

**Without `@Blocking`**, both steps run on the **same Vert.x IO (event-loop) thread**:
- Step 1 blocks the IO thread waiting for the future
- Step 2 needs the IO thread to receive the AMQP message and complete the future
- **Result**: deadlock — 5-second timeout → generic 401 on every login/register

```
Vert.x IO thread:
  [HTTP handler] → send command → .get(5s) ← BLOCKS IO THREAD
                                              ↑
  [AMQP reply arrives] → needs IO thread to deliver → WAITING
                                              ↑
                                          DEADLOCK
```

This is **silent** — no exception, just a timeout. It manifests as every command call returning 401/500 even when microservices are healthy.

### Fix

Annotate every BFF resource class with `@Blocking`. This moves HTTP handler execution to a worker thread, freeing the IO thread to deliver AMQP replies.

```java
// ✅ CORRECT — HTTP handler runs on worker thread, IO thread stays free
import io.smallrye.common.annotation.Blocking;

@Path("/auth")
@Blocking                          // ← every BFF resource class
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource { ... }

// ❌ DEADLOCK — HTTP handler blocks the IO thread that must deliver the reply
@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource { ... }
```

### Rules

| Rule | Requirement |
|------|-------------|
| **`@Blocking` on all BFF resources** | Every JAX-RS resource class in the BFF MUST have `@io.smallrye.common.annotation.Blocking` |
| **Scope** | Class-level annotation covers all methods — no need to annotate each method individually |
| **Import** | `io.smallrye.common.annotation.Blocking` (NOT `io.smallrye.reactive.messaging.annotations.Blocking`) |
| **When to apply** | Any resource that calls `.get()` on a future, or any synchronous REST client call via `@RegisterRestClient` |

> **Note on imports**: Two `@Blocking` annotations exist in the Quarkus ecosystem:
> - `io.smallrye.common.annotation.Blocking` — for JAX-RS resource methods/classes (RESTEasy Reactive)
> - `io.smallrye.reactive.messaging.annotations.Blocking` — for `@Incoming` messaging methods
>
> Use the correct one for each context. Using the wrong one compiles but has no effect.

### Checklist

| Check | Question |
|-------|----------|
| ☐ | Does every BFF JAX-RS resource class have `@io.smallrye.common.annotation.Blocking`? |
| ☐ | Is the correct `@Blocking` import used (`common.annotation` for REST, `reactive.messaging` for AMQP)? |
| ☐ | Does any resource method call `.get()` or `.join()` on a future without `@Blocking`? |

---

## Rule 17: JAX-RS `@Path` — No Class-Level Prefix That Shadows Other Resources

> ⛔ **In Quarkus RESTEasy Reactive, when multiple resource classes share a URL namespace (e.g. `/workspaces/...`, `/boards/...`), a class-level `@Path` prefix will claim ALL URLs that start with that segment — silently routing every sub-path to that class and making other resources unreachable (404).**

### Problem — Route Shadowing

JAX-RS resolves routes by matching the **most specific class-level path first**. If `WorkspaceResource` is annotated `@Path("/workspaces")`, every request to `/workspaces/**` (including `/workspaces/{id}/boards`) is dispatched to that class. `BoardResource` with `@Path("/")` and method `@Path("/workspaces/{id}/boards")` is never reached.

The failure is silent and hard to diagnose: the route returns 404 served on the **Vert.x IO event-loop thread** (unregistered route), not on an `executor-thread` as a real handler would.

**Example:**
```
WorkspaceResource  @Path("/workspaces")                          ← claims ALL /workspaces/**
BoardResource      @Path("/")  +  @Path("/workspaces/{id}/boards") ← NEVER REACHED → 404
LabelResource      @Path("/")  +  @Path("/workspaces/{id}/labels") ← NEVER REACHED → 404
```

**Diagnosis signal**: requests hitting an unregistered route are served on `vert.x-eventloop-thread`; working routes are served on `executor-thread`. Check logs if a route returns 404 unexpectedly.

### Mandatory Pattern

Every JAX-RS resource class in the BFF and in read API controllers MUST use `@Path("/")` at the class level. All route specificity belongs in the **method-level** `@Path` annotation.

```java
// ✅ CORRECT — class-level path is always "/"
@Path("/")
@Blocking
@Produces(MediaType.APPLICATION_JSON)
public class WorkspaceResource {

    @POST
    @Path("/workspaces")
    public Response createWorkspace(...) { ... }

    @GET
    @Path("/workspaces/{id}/boards")
    public Response listBoards(...) { ... }
}

// ❌ FORBIDDEN — class-level prefix shadows sibling resources
@Path("/workspaces")   // ← claims everything under /workspaces/**
@Blocking
@Produces(MediaType.APPLICATION_JSON)
public class WorkspaceResource {

    @POST
    @Path("/")
    public Response createWorkspace(...) { ... }

    // BoardResource.listBoards() is now unreachable even though it has
    // an explicit @Path("/workspaces/{id}/boards") on its method
}
```

### Rules

| Rule | Requirement |
|------|-------------|
| **Class `@Path` is always `"/"`** | Every JAX-RS resource in the BFF and API controllers MUST use `@Path("/")` at class level |
| **Full paths at method level** | Every method annotation contains the complete path from root (e.g. `@Path("/workspaces/{id}/boards")`) |
| **No implicit path inheritance** | Never rely on JAX-RS class-level path to "prefix" method paths |
| **Applies to BFF and read API controllers** | Both layers had this bug; enforce it in all JAX-RS layers |

### Checklist

| Check | Question |
|-------|----------|
| ☐ | Does every JAX-RS resource class use `@Path("/")` at class level? |
| ☐ | Are all method-level `@Path` values complete paths from root? |
| ☐ | If a route returns 404, is the request served on `vert.x-eventloop-thread` (unregistered) vs `executor-thread` (real handler)? |
| ☐ | Does any class-level `@Path` prefix overlap with another resource's method paths? |

---

## Rule 18: AMQP Event Topology — Fanout Exchanges for Multi-Consumer Events

> ⛔ **Any integration event consumed by two or more services MUST be routed through a RabbitMQ fanout exchange with one dedicated queue per consumer. Sharing a single AMQP queue across multiple consumers causes round-robin message theft — only one consumer receives each event.**

### Why Shared Queues Fail

When multiple services bind to the same queue (e.g. `project.events`), RabbitMQ distributes messages round-robin:

```
❌ WRONG — shared queue, 4 consumers:
project-service → [project.events queue] → project-api        (gets 1 in 4)
                                          → planning-service  (gets 1 in 4)
                                          → planning-api      (gets 1 in 4)
                                          → integrations      (gets 1 in 4)

→ read-model projector in project-api misses ~75% of BoardCreatedEvent messages
→ boards appear in write DB but never in read DB
→ "board created but never shows in UI"
```

```
✅ CORRECT — fanout exchange, dedicated queues:
project-service → /exchange/project.events (fanout)
                    ↓                 ↓                  ↓                  ↓
          project.events     project.events      project.events     project.events
          .project-api       .planning-service   .planning-api      .integrations-service
               ↓                    ↓                  ↓                    ↓
           project-api         planning-service   planning-api      integrations-service
           (gets ALL)           (gets ALL)         (gets ALL)          (gets ALL)
```

### Queue Naming Convention

```
{context}.events.{consumer-service}

Examples:
  project.events.project-api
  project.events.planning-service
  project.events.planning-api
  project.events.integrations-service
  integrations.events.integrations-api
  integrations.events.project-api
```

### Publisher Address — MUST Use `/exchange/` Prefix

With RabbitMQ AMQP 1.0, a bare address resolves through the **default exchange** using the address as a routing key — delivering only to a queue with that exact name, not to a named exchange:

```
bareaddress `project.events`    → default exchange → queue named `project.events` only
/exchange/project.events        → named fanout exchange → ALL bound queues
```

**Publisher configuration (application.properties):**
```properties
# ✅ CORRECT — routes through the fanout exchange
mp.messaging.outgoing.project-events.address=/exchange/project.events

# ❌ WRONG — routes through default exchange to a single queue
mp.messaging.outgoing.project-events.address=project.events
```

**Consumer configuration (application.properties):**
```properties
# ✅ CORRECT — subscribes to the dedicated per-service queue
mp.messaging.incoming.project-events.address=project.events.project-api

# ❌ WRONG — subscribes to the shared queue; only 1 of N services gets each message
mp.messaging.incoming.project-events.address=project.events
```

### Queue Durability — MUST Match SmallRye's Default

SmallRye AMQP auto-declares consumer queues as **`durable=false`**. Pre-creating queues as `durable=true` causes a `precondition_failed` AMQP error and the consumer drops the connection silently.

```json
// ✅ CORRECT — durable:false matches SmallRye auto-declare
{"name": "project.events.project-api", "durable": false, "auto_delete": false}

// ❌ WRONG — durable:true causes precondition_failed; consumer disconnects
{"name": "project.events.project-api", "durable": true}
```

### `definitions.json` — MUST Include Users Section

The RabbitMQ management plugin's `load_definitions` **replaces the entire management database** including users. Omitting the `users` section deletes all existing users on restart — all services lose AMQP connectivity.

```json
// deployment/rabbitmq/definitions.json
{
  "users": [
    {
      "name": "guest",
      "password_hash": "<hash>",
      "hashing_algorithm": "rabbit_password_hashing_sha256",
      "tags": ["administrator"]
    }
  ],
  "permissions": [
    {"user": "guest", "vhost": "/", "configure": ".*", "write": ".*", "read": ".*"}
  ],
  "exchanges": [ ... ],
  "queues": [ ... ],
  "bindings": [ ... ]
}
```

To get the password hash after creating a user: `GET http://localhost:15672/api/users`.

### Rules

| Rule | Requirement |
|------|-------------|
| **Fanout exchange required** | Any event consumed by 2+ services MUST use a fanout exchange with dedicated per-service queues |
| **Publisher prefix** | Outgoing address MUST be `/exchange/<name>` — never a bare exchange/queue name |
| **Consumer dedicated queue** | Incoming address MUST be the dedicated queue (`<context>.events.<consumer>`) — never the shared exchange name |
| **Queue durability** | Consumer queues pre-created in definitions.json MUST be `durable:false` |
| **definitions.json completeness** | Every `definitions.json` loaded via `load_definitions` MUST include `users` and `permissions` sections |

### Checklist When Adding a New Integration Event Channel

| Check | Action |
|-------|--------|
| ☐ | Publisher `application.properties`: `address=/exchange/<context>.events` |
| ☐ | Each consumer `application.properties`: `address=<context>.events.<consumer-name>` |
| ☐ | `definitions.json`: fanout exchange entry |
| ☐ | `definitions.json`: one `durable:false` queue entry per consumer |
| ☐ | `definitions.json`: one binding entry per consumer (empty routing key) |
| ☐ | `definitions.json`: `users` + `permissions` sections present |
| ☐ | `docker-compose.yml`: outgoing publisher env var `MP_MESSAGING_OUTGOING_<CHANNEL>_ADDRESS=/exchange/<name>` |
| ☐ | `docker-compose.yml`: each consumer env var `MP_MESSAGING_INCOMING_<CHANNEL>_ADDRESS=<dedicated-queue>` |

See also: `openspec/specs/architecture/messaging-lessons.md` — Lessons 10–13 for the full failure analysis and recovery steps.

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
| ☐ | Do all `@Incoming` AMQP handlers use `@io.smallrye.reactive.messaging.annotations.Blocking` with direct payload? |
| ☐ | Do all BFF JAX-RS resource classes have `@io.smallrye.common.annotation.Blocking`? |
| ☐ | Does any handler/resource block a thread with `.get()` or `.join()` without `@Blocking`? |
| ☐ | Does every JAX-RS resource class use `@Path("/")` at class level (no prefix shadowing)? |
| ☐ | Are all method-level `@Path` values complete paths from root? |
| ☐ | Does any integration event have 2+ consumers? If yes — fanout exchange + dedicated queues (Rule 18) |
| ☐ | Does every outgoing event publisher use `/exchange/<name>` as the AMQP address (not bare name)? |
| ☐ | Do all pre-created consumer queues in `definitions.json` use `durable:false`? |
| ☐ | Does `deployment/rabbitmq/definitions.json` include a `users` + `permissions` section? |
| ☐ | Is every read-after-write assumption explicitly justified? (Rule 19) |
| ☐ | Do all DTO field names, enum values, and HTTP status codes match the contract exactly? (Rule 20) |
| ☐ | Is every change labeled with a classification? (Rule 21) |
| ☐ | Is the integration type (Native/Agile/Custom) treated as a first-class concept in domain and UI? (Rule 22) |

---

## Rule 19: Eventual Consistency — Read/Write Lag

> ⚠️ **Write operations dispatch commands via messaging. Read operations query projections. These two paths are asynchronous by design. Do not assume read-after-write consistency unless it is explicitly guaranteed.**

### Why This Matters

The system topology separates write databases (owned by microservices) from read databases (owned by APIs, updated via integration events). After a command is processed:

1. The microservice persists to its write DB
2. It publishes an integration event
3. The read API's event listener updates its projection
4. The BFF query then returns the updated value

Steps 2–4 are **asynchronous**. Under normal load the lag is sub-second. Under test, Docker compose startup, or network congestion it can be longer.

### Rules

| Rule | Requirement |
|------|-------------|
| **No read-after-write assumption** | Never assume a write is immediately visible via a read endpoint unless both share the same transaction boundary |
| **No lag patches** | Do NOT fix read/write lag by adding retries, polls, or sleeps |
| **Document, don't suppress** | If a feature requires low-latency reads after writes, document the constraint and choose the correct architectural remedy |
| **UI reflects async state** | Design UI/UX to indicate async state (e.g., optimistic update, spinner, eventual refresh) rather than blocking until the read model catches up |
| **Critical reads route to write model** | If a feature genuinely requires synchronous read-after-write, route that read through the microservice's write database (not the read API) and document the reason |

### Test Rules for Eventual Consistency

- Tests that exercise the full async path MUST be classified as integration tests, not unit tests
- Integration tests MUST use a test-profile in-memory broker (not a live RabbitMQ instance) so that event delivery is synchronous by construction
- Unit tests of handlers and listeners MUST use direct method calls, not broker delivery
- A test that fails due to eventual consistency lag is classified `TIMING` — it must NOT be fixed with a sleep; instead, redesign the test to invoke the event handler directly

---

## Rule 20: API Contract Enforcement

> ⛔ **DTO field names, enum values, HTTP status codes, and required-field presence are contracts. Deviating from them is a defect, not a configuration preference.**

### Field Name Rules

| Rule | Requirement |
|------|-------------|
| **Exact match** | DTO field names used in JSON payloads MUST match the declared contract exactly — no aliasing, no camelCase/snake_case guessing |
| **No implicit defaults** | Do not substitute a default value when a required field is missing — return 400/422 and surface the violation |
| **No silent omission** | If a required field is absent in the request, reject the request |

### Enum Rules

| Rule | Requirement |
|------|-------------|
| **Exact casing** | Enum values MUST match the declared casing exactly (e.g., `NATIVE` ≠ `native` ≠ `Native`) |
| **No fuzzy matching** | Do not normalize or case-fold incoming enum strings |
| **Rejected unknown values** | Unknown enum values must return 422, not be silently mapped to a default |

### HTTP Status Code Rules

| Code | Correct Usage |
|------|---------------|
| `200 OK` | Query returns a body |
| `201 Created` | Resource created; body contains the new resource |
| `202 Accepted` | Command accepted for async processing; no body |
| `204 No Content` | Command executed synchronously; no body |
| `400 Bad Request` | Malformed input (syntax, wrong type) |
| `422 Unprocessable Entity` | Structurally valid input that violates business rules |
| `404 Not Found` | Resource does not exist |
| `409 Conflict` | Resource already exists or state conflict |

**422 responses are CORRECT BEHAVIOR.** A 422 means the domain rejected the input for a business reason. Do NOT "fix" a 422 by weakening validation — diagnose the root cause of the invalid input.

### Validation Rules

- Validation errors (422) must not be "fixed" by loosening validation
- Missing required fields are a contract violation — fix the caller, not the callee
- Treat every 422 in a test as a signal to check the request payload against the contract, not to change the server response code

---

## Rule 21: Change Classification Requirement

> **Every change to production code, tests, or configuration must carry a classification label.**
> **Unlabeled changes are not reviewable and must not be merged.**

### Classification Labels

| Label | Meaning | When to Use |
|-------|---------|-------------|
| `REAL_FIX` | Corrects a genuine defect in business logic, domain rules, or infrastructure behavior | Bug fix that addresses root cause |
| `ARCH_ALIGNMENT` | Aligns the code with the intended architecture (topology, layer boundaries, CQRS) | Fixing a layer violation, moving logic to the correct service |
| `RESILIENCE` | Adds a valid retry, timeout, or circuit breaker for a proven transient, idempotent operation | External API retry with explicit count + backoff |
| `MASKING` | Hides a real issue without addressing root cause | **Must be rejected unless explicitly approved with written justification** |
| `UNKNOWN` | Root cause not yet determined | Requires investigation before any code change is made |

### How to Apply

```java
// REAL_FIX: BoardRepository.findByWorkspaceId returned null for new workspaces;
//           query now uses LEFT JOIN instead of INNER JOIN
public Optional<Board> findByWorkspaceId(UUID workspaceId) { ... }
```

```java
// ARCH_ALIGNMENT: moved WorkItemTypeConfig initialization from BFF to workspace-service
//                 on WorkspaceCreatedEvent — BFF must not contain domain initialization logic
public void onWorkspaceCreated(WorkspaceCreatedEvent event) { ... }
```

```java
// MASKING — REJECTED: Thread.sleep(2000) added to make projection test pass;
//            root cause is test does not wait for event handler synchronously
// Use: invoke the event handler method directly in the test instead
```

### Review Gate

A PR that contains a `MASKING`-labeled change (or any change without a label) must be blocked until:
1. The root cause is identified
2. The change is reclassified or replaced with a `REAL_FIX`

---

## Rule 22: Integration and Mapping Design Principles

> **Integration type (Native, Agile, Custom) is a first-class concept — not a flag, not a fallback, not an afterthought.**

### Integration Mode is a Domain Concept

| Mode | Meaning | Behavior |
|------|---------|----------|
| `NATIVE` | Workspace managed entirely within Visu-Board | Internal source, no sync, uses internal type hierarchy |
| `AGILE` | Agile-preset Native workspace with sprint/backlog lifecycle | Internal source, Agile type defaults pre-populated |
| `CUSTOM` | Workspace synced with an external issue tracker | Requires ExternalSource, field mappings, sync configuration |

**Rules:**

- `integrationMode` is set **once** at workspace creation and is **immutable** thereafter
- No code path may assume a workspace is `NATIVE` without checking `integrationMode`
- No code path may treat `NATIVE` as a "fallback when nothing is configured" — it is an explicit choice
- The UI must make the integration mode visible at all times (badge, header, settings label)
- Gated features (e.g., native config panel, external source config) must check `integrationMode` before rendering

### Field Mapping Rules

- Field mappings are **explicitly configurable per workspace** — never inferred or hardcoded
- Field mapping key names are part of the contract: `externalFieldName`, `internalFieldName` (not abbreviated aliases)
- Field mapping direction (`INBOUND`, `OUTBOUND`) must be declared; never assume bidirectional
- Unknown or unmapped fields must be logged and skipped — never silently mapped to a default

### Template and Type Config Rules

- Work item type structure is **defined per workspace via WorkItemTypeConfig**, not a system-wide enum
- Native workspaces receive Agile defaults on creation (Epic, Story, Task) — this is a domain initialization event, not a UI default
- Templates define the expected shape of work items for a given integration mode and must be validated against the declared type hierarchy
- A workspace with no type config is an **incomplete initialization state** — surface this in the UI and initialize eagerly on workspace creation (see BUG-1.7-001)

### UI Enforcement

- The workspace creation form must present integration mode as the **first** and most prominent choice
- No mode must be pre-selected — the user must make an explicit choice
- Help text explaining each mode must be visible before the user commits

---

*Rule Version: 2.4 — updated 2026-04-21: added Rules 19–22 (eventual consistency, API contract enforcement, change classification, integration design principles)*
