# 50 — Search Queries

> Search patterns for AI agents to find code by architectural pattern in **test-web** (archetype: api).

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

## Frontend Search

| Pattern | Query |
|---------|-------|
| React components | `frontend/web-app/src/components/**/*.tsx` |
| Pages | `frontend/web-app/src/pages/**/*.tsx` |
| Custom hooks | `frontend/web-app/src/hooks/use*.ts` |
| API services | `frontend/web-app/src/services/**/*.ts` |
| State stores | `frontend/web-app/src/store/**/*.ts` |
