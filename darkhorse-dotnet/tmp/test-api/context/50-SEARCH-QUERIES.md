# 50 — Search Queries

> Search patterns for AI agents to find code by architectural pattern in **test-api** (archetype: api).

## Find by Layer

| Pattern | Query |
|---------|-------|
| Domain entities | `backend/src/*/Domain/Contexts/*/Entities/**/*.cs` |
| Value objects | Search for `record` in `*Domain/Contexts/*/ValueObjects/` |
| Domain events | Search for `Event` in `*Domain/Contexts/*/Events/` |
| Commands | `*Application/Contexts/*/Commands/**/*.cs` |
| Queries | `*Application/Contexts/*/Queries/**/*.cs` |
| Handlers | Search for `Handler` in `*Application/Contexts/` |
| Repository interfaces | Search for `IRepository` in `*Domain/Contexts/` |
| Repository implementations | Search for `Repository` in `*Infrastructure/Contexts/` |
| REST controllers | `*Presentation/Contexts/*/Controllers/**/*.cs` |
| EF Core DbContext | Search for `DbContext` in `*Infrastructure/Persistence/` |



## Find by Bounded Context

```
backend/apis/src/{Namespace}.Domain/Contexts/<ContextName>/         ← grep here for business rules
backend/apis/src/{Namespace}.Application/Contexts/<ContextName>/    ← grep here for use cases
backend/apis/src/{Namespace}.Infrastructure/Contexts/<ContextName>/ ← grep here for persistence/messaging
backend/apis/src/{Namespace}.Presentation/Contexts/<ContextName>/   ← grep here for API endpoints
```

## Find by Convention

| Convention | Pattern |
|------------|---------|
| Aggregate roots | Classes inheriting `AggregateRoot` or `Entity<T>` |
| CQRS commands | Classes ending in `Command` implementing `IRequest<T>` |
| CQRS queries | Classes ending in `Query` implementing `IRequest<T>` |
| MediatR handlers | Classes implementing `IRequestHandler<TRequest, TResponse>` |
| MassTransit consumers | Classes implementing `IConsumer<T>` |
| REST endpoints | Classes with `[ApiController]` attribute |
| Tests | `*Tests.cs` or `*Test.cs` files |

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
