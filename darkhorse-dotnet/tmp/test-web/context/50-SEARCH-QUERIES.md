# 50 — Search Queries

> Search patterns for AI agents to find code by architectural pattern in **test-web** (archetype: bff-api).

## Find by Layer


| Pattern | Query |
|---------|-------|
| API client interfaces | Search for `IClient` or `IApiClient` in `*Domain/Contexts/` |
| Message sender interfaces | Search for `ISender` in `*Domain/Contexts/` |
| Command handlers | `*Application/Contexts/*/Commands/**/*.cs` |
| Query handlers | `*Application/Contexts/*/Queries/**/*.cs` |
| HttpClient implementations | Search for `Client` in `*Infrastructure/Clients/` |
| MassTransit senders | Search for `Sender` in `*Infrastructure/Messaging/` |
| REST controllers | `*Presentation/Contexts/*/Controllers/**/*.cs` |
| Auth middleware | Search for `Auth` or `Permission` in `*Presentation/` |


## Find by Bounded Context

```
backend/src/{Namespace}.Domain/Contexts/<ContextName>/         ← grep here for business rules
backend/src/{Namespace}.Application/Contexts/<ContextName>/    ← grep here for use cases
backend/src/{Namespace}.Infrastructure/Contexts/<ContextName>/ ← grep here for persistence/messaging
backend/src/{Namespace}.Presentation/Contexts/<ContextName>/   ← grep here for API endpoints
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
| Custom hooks | `frontend/web-app/src/hooks/use*.ts` |
| API services | `frontend/web-app/src/services/**/*.ts` |
| State stores | `frontend/web-app/src/store/**/*.ts` |
