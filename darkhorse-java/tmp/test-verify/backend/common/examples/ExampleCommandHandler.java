package com.test.common.examples;

/**
 * EXAMPLE: Command handler for a BFF-API archetype.
 *
 * BFF commands do NOT persist state. They dispatch messages to a broker
 * (AMQP, Kafka, etc.) so downstream services execute the actual domain logic.
 *
 * The BFF is a routing layer: it validates, transforms, and dispatches.
 *
 * Location in a real context:
 *   backend/contexts/<context>/application/commands/PlaceOrderCommandHandler.java
 */
public class ExampleCommandHandler {

    // Inject messaging sender (defined in domain layer as interface)
    // private final OrderCommandSender commandSender;

    /**
     * Handle a command by dispatching it to the message broker.
     *
     * Pattern:
     * 1. Validate the inbound request
     * 2. Map to a command message (domain language)
     * 3. Send to broker (AMQP, Kafka, etc.)
     * 4. Return acknowledgement (accepted, not completed)
     *
     * NOTE: No repository. No persistence. No domain logic execution.
     */
    public String handle(/* PlaceOrderCommand command */) {
        // 1. Validate inbound data
        // Objects.requireNonNull(command.getCustomerId(), "Customer ID required");

        // 2. Map to message payload
        // PlaceOrderMessage message = PlaceOrderMessage.from(command);

        // 3. Dispatch to broker
        // commandSender.send(message);

        // 4. Return correlation ID (accepted, processing async)
        // return message.getCorrelationId();

        throw new UnsupportedOperationException("Replace with real implementation");
    }
}
