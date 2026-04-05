# 50 — Search Queries

> Search patterns for AI agents to find code by architectural pattern in **test-project**.

## Find by Layer

| Pattern | Query |
|---------|-------|
| Domain entities | `backend/contexts/*/domain/**/*.java` |
| Value objects | Search for `record` in `backend/contexts/*/domain/` |
| Domain events | Search for `Event` in `backend/contexts/*/domain/` |
| Commands | `backend/contexts/*/application/commands/**/*.java` |
| Queries | `backend/contexts/*/application/queries/**/*.java` |
| Handlers | Search for `Handler` in `backend/contexts/*/application/` |
| Repositories (interface) | Search for `Repository` in `backend/contexts/*/application/` |
| Repositories (impl) | Search for `Repository` in `backend/contexts/*/infrastructure/` |
| REST controllers | `backend/contexts/*/presentation/**/*.java` |
| Integration events | Search for `IntegrationEvent` across `backend/` |

## Find by Bounded Context

```
backend/contexts/<context-name>/
├── domain/          ← grep here for business rules
├── application/     ← grep here for use cases
├── infrastructure/  ← grep here for persistence/messaging
└── presentation/    ← grep here for API endpoints
```

## Find by Convention

| Convention | Pattern |
|------------|---------|
| Aggregate roots | Classes with `@AggregateRoot` or implementing `AggregateRoot` |
| CQRS commands | Classes ending in `Command` |
| CQRS queries | Classes ending in `Query` |
| Event handlers | Classes with `@EventHandler` or methods with `@ConsumeEvent` |
| REST endpoints | Classes with `@Path` annotation |
| Tests | `*Test.java` or `*IT.java` files |

