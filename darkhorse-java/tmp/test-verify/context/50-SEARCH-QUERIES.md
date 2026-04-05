# 50 — Search Queries

> Search patterns for AI agents to find code by architectural pattern in **test-verify** (archetype: bff-api).

## Find by Layer


| Pattern | Query |
|---------|-------|
| API client interfaces | Search for `Client` in `backend/contexts/*/domain/` |
| Message sender interfaces | Search for `Sender` in `backend/contexts/*/domain/` |
| Command handlers | `backend/contexts/*/application/commands/**/*.java` |
| Query handlers | `backend/contexts/*/application/queries/**/*.java` |
| REST client implementations | Search for `Client` in `backend/contexts/*/infrastructure/` |
| Message sender implementations | Search for `Sender` in `backend/contexts/*/infrastructure/` |
| REST controllers | `backend/contexts/*/presentation/**/*.java` |
| Auth middleware | Search for `Auth` or `Permission` in `backend/contexts/*/presentation/` |


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
| Screens & layouts | `frontend/mobile-app/app/**/*.tsx` |
| Shared components | `frontend/mobile-app/src/components/**/*.tsx` |
| Custom hooks | `frontend/mobile-app/src/hooks/use*.ts` |
| API services | `frontend/mobile-app/src/services/**/*.ts` |
| State stores | `frontend/mobile-app/src/store/**/*.ts` |
