package com.test.common.examples;

/**
 * EXAMPLE: Command handler for a standard API archetype.
 *
 * Commands modify state, return void or an ID, and publish domain events.
 * This example demonstrates the pattern — delete this file and create real
 * handlers inside your bounded contexts.
 *
 * Location in a real context:
 *   backend/contexts/<context>/application/commands/PlaceOrderCommandHandler.java
 */
public class ExampleCommandHandler {

    // Inject repository interface (defined in application layer)
    // private final OrderRepository orderRepository;
    // private final DomainEventPublisher eventPublisher;

    /**
     * Handle a command that modifies state.
     *
     * Pattern:
     * 1. Validate the command
     * 2. Load or create the aggregate
     * 3. Execute domain logic on the aggregate
     * 4. Persist via repository
     * 5. Publish domain event(s)
     */
    public String handle(/* PlaceOrderCommand command */) {
        // 1. Validate
        // Objects.requireNonNull(command.getCustomerId(), "Customer ID required");

        // 2. Create aggregate via factory method (domain language)
        // Order order = Order.place(command.getCustomerId(), command.getItems());

        // 3. Persist
        // orderRepository.save(order);

        // 4. Publish domain event
        // eventPublisher.publish(new OrderPlacedEvent(order.getId()));

        // 5. Return aggregate ID
        // return order.getId().value();

        throw new UnsupportedOperationException("Replace with real implementation");
    }
}
