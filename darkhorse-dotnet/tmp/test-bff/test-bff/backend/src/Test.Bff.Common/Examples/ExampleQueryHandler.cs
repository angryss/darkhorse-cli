namespace Test.Bff.Common.Examples;

/// <summary>
/// EXAMPLE: Query handler for a BFF-API archetype.
///
/// BFF queries do NOT access a database. They call downstream REST APIs
/// (via HttpClient/IHttpClientFactory) and return aggregated/transformed
/// responses to the frontend.
///
/// Location in a real context:
///   {Namespace}.Application/Contexts/{Context}/Queries/GetOrderByIdQueryHandler.cs
/// </summary>
public class ExampleQueryHandler
{
    // Inject REST API client (defined in Domain layer as interface,
    // implemented in Infrastructure layer via HttpClient)
    // private readonly IOrderApiClient _orderApiClient;

    /// <summary>
    /// Handle a query by calling a downstream API.
    ///
    /// Pattern:
    /// 1. Validate the query
    /// 2. Call downstream API via typed HttpClient
    /// 3. Map/transform the response to a frontend-facing DTO
    /// 4. Return the DTO
    ///
    /// NOTE: No repository. No database. Data comes from downstream APIs.
    /// </summary>
    public object Handle(/* GetOrderByIdQuery query */)
    {
        // 1. Validate
        // ArgumentNullException.ThrowIfNull(query.OrderId);

        // 2. Call downstream API
        // var response = await _orderApiClient.GetByIdAsync(query.OrderId);

        // 3. Map to frontend DTO (anti-corruption layer)
        // return OrderDto.FromExternal(response);

        throw new NotImplementedException("Replace with real implementation");
    }
}
