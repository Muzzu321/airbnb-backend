# Design Patterns and Principles

The project uses a small set of practical patterns to separate responsibilities and keep the booking workflow maintainable.

## 1. Layered Architecture

The application separates responsibilities into layers:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

Controllers handle HTTP concerns, services contain business logic, and repositories handle persistence.

## 2. DTO Pattern

The API uses Data Transfer Objects instead of making JPA entities the primary API contract.

Examples include:

```text
BookingRequest
BookingDto
BookingPaymentInitResponseDto
BookingStatusResponseDto
HotelReportDto
GuestDto
```

This keeps API contracts separate from the persistence model.

## 3. Repository Pattern

Spring Data repositories isolate database access from business logic.

Examples:

```text
BookingRepository
HotelRepository
RoomRepository
InventoryRepository
GuestRepository
```

Services use repositories instead of directly managing persistence operations.

## 4. Strategy Pattern

Pricing logic is separated through the pricing strategy layer.

Conceptually:

```text
BookingService
      ↓
PricingService
      ↓
Pricing Strategy
      ↓
Booking Amount
```

This makes pricing rules easier to change or extend without putting every pricing rule inside `BookingService`.

## 5. Dependency Injection

Spring manages application components and their dependencies.

Constructor injection is used through Spring and Lombok, including:

```java
@RequiredArgsConstructor
```

This reduces manual object creation and keeps components loosely coupled.

## 6. Transaction Management

Critical booking operations use Spring's transaction management.

The inventory reservation and booking creation need to succeed together:

```text
Check inventory
      ↓
Reserve inventory
      ↓
Create booking
      ↓
Commit transaction
```

If the operation fails, the transaction can roll back instead of leaving partially updated booking state.

## 7. Pessimistic Row Locking

Inventory is concurrency-sensitive.

The availability query uses database row locking:

```sql
FOR NO KEY UPDATE
```

This prevents concurrent booking requests from independently consuming the same inventory without synchronization.

The approach is especially important during:

```text
Check availability
       ↓
Reserve inventory
```

## 8. State-Driven Workflow

Booking status represents the lifecycle of a reservation:

```text
RESERVED
   ↓
GUESTS_ADDED
   ↓
PAYMENTS_PENDING
   ↓
CONFIRMED
   ↓
CANCELLED
```

Business operations validate the current state before performing the next transition.

For example, payment confirmation is processed after the Stripe webhook rather than allowing a client request to directly mark a booking as confirmed.

## 9. Separation of External Payment Integration

Stripe is treated as an external service.

The application separates:

```text
Payment initiation
       ↓
Stripe Checkout
       ↓
Stripe webhook
       ↓
Payment confirmation
```

This keeps the booking domain from depending on a client-controlled payment-success flag.

## 10. Design Principles Applied

### Single Responsibility

Controllers, services, repositories, strategies, and security components have separate responsibilities.

### Separation of Concerns

HTTP handling, business logic, persistence, authentication, pricing, and payment integration are kept separate.

### Dependency Inversion

Business services depend on injected abstractions/components rather than manually constructing infrastructure objects.

### Encapsulation

Booking state transitions and inventory changes are controlled by service-layer business rules rather than allowing arbitrary API updates.

## Why These Patterns Matter

The purpose of these patterns is not to add complexity for its own sake.

They address concrete problems in this project:

| Problem | Approach |
|---|---|
| Complex HTTP handling | Controllers |
| Business workflow | Services |
| Database access | Repositories |
| API/persistence separation | DTOs |
| Changeable pricing rules | Strategy Pattern |
| Concurrent inventory | Row locking |
| Consistent multi-step updates | Transactions |
| Payment trust | Stripe webhooks |
| Booking lifecycle | State-driven workflow |

## Future Improvements

The architecture can be strengthened further with:

- Explicit interfaces around external payment providers.
- More automated tests around strategy selection.
- Integration tests for concurrent bookings.
- Webhook idempotency.
- Database migrations using Flyway or Liquibase.
