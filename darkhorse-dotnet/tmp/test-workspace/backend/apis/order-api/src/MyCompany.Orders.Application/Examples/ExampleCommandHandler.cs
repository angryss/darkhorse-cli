namespace MyCompany.Orders.Application.Examples;

/// <summary>
/// EXAMPLE: Command handler for a standard API archetype.
///
/// Commands modify state, return void or an ID, and publish domain events.
/// This example demonstrates the pattern — delete this file and create real
/// handlers inside your bounded contexts.
///
/// Location in a real context:
///   {Namespace}.Application/Contexts/{Context}/Commands/PlaceOrderCommandHandler.cs
/// </summary>
public class ExampleCommandHandler
{
    // Inject repository interface (defined in Application layer)
    // private readonly IOrderRepository _orderRepository;
    // private readonly IDomainEventPublisher _eventPublisher;

    /// <summary>
    /// Handle a command that modifies state.
    ///
    /// Pattern:
    /// 1. Validate the command
    /// 2. Load or create the aggregate
    /// 3. Execute domain logic on the aggregate
    /// 4. Persist via repository
    /// 5. Publish domain event(s)
    /// </summary>
    public string Handle(/* PlaceOrderCommand command */)
    {
        // 1. Validate
        // ArgumentNullException.ThrowIfNull(command.CustomerId);

        // 2. Create aggregate via factory method (domain language)
        // var order = Order.Place(command.CustomerId, command.Items);

        // 3. Persist
        // await _orderRepository.SaveAsync(order);

        // 4. Publish domain event
        // await _eventPublisher.PublishAsync(new OrderPlacedEvent(order.Id));

        // 5. Return aggregate ID
        // return order.Id.Value;

        throw new NotImplementedException("Replace with real implementation");
    }
}
