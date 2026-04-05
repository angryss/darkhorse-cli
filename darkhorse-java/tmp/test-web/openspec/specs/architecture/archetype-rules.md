# Archetype Rules (v1.0)

**Defines the three project archetypes and their architectural constraints.**

> Every DarkHorse project is one of: `api`, `bff-api`, or `microservice`. The archetype determines which layers exist, what dependencies are allowed, and how CQRS routes.

---

## Archetypes Overview

| Archetype | Purpose | HTTP? | Persistence? | Messaging? |
|-----------|---------|-------|-------------|------------|
| **api** | Standard REST service with persistence | ✅ Primary | ✅ Owns data | Optional |
| **bff-api** | Backend-for-Frontend routing layer | ✅ Primary | ❌ Forbidden | ✅ Commands via broker |
| **microservice** | Message-driven service | ❌ Not primary | ✅ Owns data | ✅ Primary |

---

## Archetype 1: API

### Purpose

A standard REST API that owns its domain, persists its data, and exposes HTTP endpoints.

### Layer Behavior

| Layer | Behavior |
|-------|----------|
| **Presentation** | REST controllers, request/response models, validation |
| **Application** | Command handlers persist via repositories. Query handlers read from repositories. |
| **Domain** | Full domain model: entities, value objects, aggregates, domain events, repository interfaces |
| **Infrastructure** | Repository implementations (JPA/Panache), database config, optional messaging |

### CQRS Routing

```
HTTP Request
  → Controller (Presentation)
    → Command Handler (Application) → Repository → Database
    → Query Handler (Application) → Repository → Database
```

### Allowed Dependencies

- REST framework (Quarkus REST)
- Persistence (Hibernate ORM / Panache, JDBC)
- Validation (Hibernate Validator)
- Messaging (optional, for publishing integration events)

### Folder Structure

```
backend/contexts/<context>/
├── domain/
│   ├── entities/           ← Aggregates, entities
│   ├── value-objects/      ← Immutable value types
│   ├── events/             ← Domain events
│   ├── exceptions/         ← Domain-specific exceptions
│   └── GLOSSARY.md
├── application/
│   ├── commands/           ← Command handlers (write path)
│   ├── queries/            ← Query handlers (read path)
│   ├── services/           ← Domain services
│   ├── dtos/               ← Data transfer objects
│   └── interfaces/         ← Repository + service interfaces
├── infrastructure/
│   ├── repositories/       ← JPA/Panache implementations
│   ├── database/           ← DB config, migrations
│   ├── messaging/          ← Event publishers (optional)
│   └── external/           ← External service adapters
└── presentation/
    ├── controllers/        ← REST endpoints
    ├── middleware/          ← Filters, interceptors
    └── models/             ← Request/response models
```

---

## Archetype 2: BFF-API (Backend-for-Frontend)

### Purpose

A routing and aggregation layer between a frontend and downstream backend services. The BFF does NOT own data, does NOT execute domain logic, and does NOT persist anything.

### Core Principle

> The BFF is a **thin orchestration layer**. It validates inbound requests, routes queries to downstream APIs, and dispatches commands to a message broker. All business logic lives in downstream services.

### Layer Behavior

| Layer | Behavior |
|-------|----------|
| **Presentation** | HTTP endpoints, authentication, claims/permissions enforcement |
| **Application** | Strict CQRS routing: queries → downstream API clients, commands → broker/messaging. **No repository or persistence logic.** |
| **Domain** | Interfaces and contracts ONLY. No business execution logic. Defines API client interfaces and message sender interfaces. |
| **Infrastructure** | REST API client implementations, message/broker sender implementations |

### CQRS Routing

```
HTTP Request (from frontend)
  → Controller (Presentation — auth, claims, permissions)
    → Query Handler (Application) → API Client (Infrastructure) → Downstream API
    → Command Handler (Application) → Message Sender (Infrastructure) → Broker
```

### What BFF Does

- ✅ Validate inbound requests
- ✅ Enforce authentication and authorization (claims, permissions)
- ✅ Route queries to downstream APIs via REST clients
- ✅ Dispatch commands to message broker (AMQP, Kafka)
- ✅ Transform/aggregate responses for the frontend
- ✅ Handle correlation IDs for async command tracking

### What BFF Does NOT Do

- ❌ Persist data (no database, no repository implementations)
- ❌ Execute business/domain logic
- ❌ Own aggregates or entities with state
- ❌ Publish domain events (it dispatches commands, not events)
- ❌ Contain repository interfaces or implementations

### Allowed Dependencies

- REST framework (Quarkus REST — serves HTTP to frontend)
- REST Client (Quarkus REST Client — calls downstream APIs)
- Messaging sender (Reactive Messaging / AMQP — dispatches commands)
- Validation (Hibernate Validator — validates inbound requests)
- **NO** persistence dependencies (no Hibernate ORM, no JDBC, no Panache)

### Folder Structure

```
backend/contexts/<context>/
├── domain/
│   ├── contracts/          ← API client interfaces, message sender interfaces
│   ├── models/             ← Shared DTOs, request/response contracts
│   └── GLOSSARY.md
├── application/
│   ├── commands/           ← Command handlers (dispatch to broker)
│   ├── queries/            ← Query handlers (call downstream APIs)
│   └── dtos/               ← Frontend-facing DTOs
├── infrastructure/
│   ├── clients/            ← REST API client implementations
│   ├── messaging/          ← Message broker sender implementations
│   └── auth/               ← Auth/claims/permissions adapters
└── presentation/
    ├── controllers/        ← REST endpoints (frontend-facing)
    ├── middleware/          ← Auth filters, CORS, rate limiting
    └── models/             ← Request/response models
```

### BFF Violations to Detect

| Violation | Description |
|-----------|-------------|
| **Repository in BFF** | BFF must not define or implement repository interfaces |
| **Database dependency** | No JPA, JDBC, Panache, or database driver dependencies |
| **Domain logic** | Domain layer must contain only interfaces and contracts |
| **Direct data access** | All data must come from downstream APIs, never from a local store |
| **Event publishing** | BFF dispatches commands to a broker; it does not publish domain events |

---

## Archetype 3: Microservice

### Purpose

A message-driven service that listens for commands/events from a broker, executes domain logic, and persists its own state. Not HTTP-first — messaging is the primary interface.

### Layer Behavior

| Layer | Behavior |
|-------|----------|
| **Presentation** | Message listeners (inbound channels), optional thin REST for health/admin |
| **Application** | Command handlers execute domain logic and persist. Event handlers react to integration events. |
| **Domain** | Full domain model: entities, value objects, aggregates, domain events, repository interfaces |
| **Infrastructure** | Repository implementations, database config, message broker config, integration event publishers |

### CQRS Routing

```
Inbound Message (from broker)
  → Message Listener (Presentation)
    → Command Handler (Application) → Domain Logic → Repository → Database
    → Event Handler (Application) → Update read model / trigger side effects

Outbound:
  → Integration Event Publisher (Infrastructure) → Broker → Other services
```

### What Microservice Does

- ✅ Listen for commands and events from a message broker
- ✅ Execute full domain logic (aggregates, entities, domain services)
- ✅ Persist its own data (database per service)
- ✅ Publish integration events for other services
- ✅ Maintain optimised read models (CQRS)

### What Microservice Does NOT Do

- ❌ Serve as the primary HTTP API for frontend clients (use a BFF for that)
- ❌ Call downstream APIs as its primary data source (it owns its data)
- ❌ Share its database with other services

### Allowed Dependencies

- Messaging (Reactive Messaging / AMQP — primary interface)
- Persistence (Hibernate ORM / Panache, JDBC)
- JSON serialization (Jackson — for message payloads)
- Validation (Hibernate Validator)
- REST (optional, for health checks or admin endpoints only)

### Folder Structure

```
backend/contexts/<context>/
├── domain/
│   ├── entities/           ← Aggregates, entities
│   ├── value-objects/      ← Immutable value types
│   ├── events/             ← Domain events + integration events
│   ├── exceptions/         ← Domain-specific exceptions
│   └── GLOSSARY.md
├── application/
│   ├── commands/           ← Command handlers (triggered by messages)
│   ├── queries/            ← Query handlers (local read model)
│   ├── events/             ← Integration event handlers
│   ├── services/           ← Domain services
│   ├── dtos/               ← Data transfer objects
│   └── interfaces/         ← Repository + service interfaces
├── infrastructure/
│   ├── repositories/       ← JPA/Panache implementations
│   ├── database/           ← DB config, migrations
│   ├── messaging/          ← Broker config, event publishers, message listeners
│   └── external/           ← External service adapters
└── presentation/
    ├── listeners/          ← Message channel listeners (@Incoming)
    └── health/             ← Health check endpoints (optional REST)
```

---

## Cross-Archetype Rules

These rules apply regardless of archetype:

1. **DDD is mandatory** — All archetypes use bounded contexts and ubiquitous language
2. **Onion Architecture** — Dependencies always point inward (domain has zero external dependencies)
3. **CQRS separation** — Commands and queries are always separate, even in BFF
4. **No cross-context imports** — Communication via events, APIs, or ACL
5. **Inside-out implementation** — Build domain layer first, then outward
6. **Tests are non-negotiable** — 80% line coverage minimum

---

## Archetype Selection Guide

| If your service... | Choose |
|---------------------|--------|
| Serves HTTP to clients, owns its database, has full domain logic | `api` |
| Sits between a frontend and backend services, owns no data | `bff-api` |
| Reacts to messages, owns its data, is not HTTP-first | `microservice` |
