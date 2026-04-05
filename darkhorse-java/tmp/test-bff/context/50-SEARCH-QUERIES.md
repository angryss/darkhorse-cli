# 50 — Search Queries

> Search patterns for AI agents to find code by architectural pattern in **test-bff** (archetype: bff-api).

## Find by Layer


| Pattern | Query |
|---------|-------|
| API client interfaces | Search for `Client` in `backend/bffs/contexts/*/domain/` |
| Message sender interfaces | Search for `Sender` in `backend/bffs/contexts/*/domain/` |
| Command handlers | `backend/bffs/contexts/*/application/commands/**/*.java` |
| Query handlers | `backend/bffs/contexts/*/application/queries/**/*.java` |
| REST client implementations | Search for `Client` in `backend/bffs/contexts/*/infrastructure/` |
| Message sender implementations | Search for `Sender` in `backend/bffs/contexts/*/infrastructure/` |
| REST controllers | `backend/bffs/contexts/*/presentation/**/*.java` |
| Auth middleware | Search for `Auth` or `Permission` in `backend/bffs/contexts/*/presentation/` |


## Find by Bounded Context

```
backend/bffs/contexts/<context-name>/
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
| Custom hooks (web) | `frontend/web-app/src/hooks/use*.ts` |
| API services (web) | `frontend/web-app/src/services/**/*.ts` |
| Screens & layouts | `frontend/mobile-app/app/**/*.tsx` |
| Shared components (mobile) | `frontend/mobile-app/src/components/**/*.tsx` |
| Custom hooks (mobile) | `frontend/mobile-app/src/hooks/use*.ts` |
| API services (mobile) | `frontend/mobile-app/src/services/**/*.ts` |
