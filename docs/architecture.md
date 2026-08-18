# Architecture

## 1. Overview

The Airbnb backend follows a layered Spring Boot architecture. The main goal is to keep HTTP handling, business rules, persistence, security, and external payment integration separated.

```text
                         ┌──────────────────────┐
                         │   Client / Swagger   │
                         └──────────┬───────────┘
                                    │ HTTP
                                    ▼
                         ┌──────────────────────┐
                         │    Controllers       │
                         │ REST / HTTP layer    │
                         └──────────┬───────────┘
                                    │ DTOs
                                    ▼
                         ┌──────────────────────┐
                         │      Services        │
                         │ Business logic       │
                         └──────┬───────┬───────┘
                                │       │
                     persistence│       │pricing
                                │       │
                                ▼       ▼
                     ┌──────────────┐ ┌──────────────┐
                     │ Repositories │ │  Strategies  │
                     └──────┬───────┘ └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ PostgreSQL   │
                     └──────────────┘

                         External integration
                                │
                                ▼
                         ┌──────────────┐
                         │    Stripe    │
                         └──────┬───────┘
                                │ webhook
                                ▼
                         /webhook/payment
```

## 2. Layer Responsibilities

### Controller Layer

Controllers are responsible for the HTTP boundary.

Typical responsibilities:

- Mapping HTTP requests to application operations.
- Reading path/query/body parameters.
- Accepting request DTOs.
- Returning response DTOs.
- Delegating business logic to services.

Controllers should not contain the core booking or payment rules.

### Service Layer

The service layer contains the application's business logic.

Examples of responsibilities include:

- Creating bookings.
- Validating booking state transitions.
- Checking ownership.
- Reserving inventory.
- Adding guests.
- Starting payment.
- Confirming payment after a Stripe webhook.
- Cancelling bookings.
- Creating refunds.
- Producing hotel reports.

The booking workflow is deliberately kept in the service layer because it spans multiple repositories and business rules.

### Repository Layer

Repositories isolate persistence operations from the business layer.

The project uses Spring Data JPA repositories for domain persistence.

Representative repositories include:

```text
BookingRepository
HotelRepository
RoomRepository
InventoryRepository
GuestRepository
```

The repository layer is also where the inventory availability query can use database locking.

### Entity Layer

JPA entities represent the persistent domain model.

The important domain concepts are:

```text
User
Hotel
Room
Inventory
Booking
Guest
```

Relationships between these entities model ownership, room availability, reservations, and guests.

### DTO Layer

DTOs define the API-facing data contract.

This avoids making the persistence model the only representation exposed to API consumers.

Representative DTOs include:

```text
BookingRequest
BookingDto
BookingPaymentInitResponseDto
BookingStatusResponseDto
HotelReportDto
GuestDto
```

## 3. Booking Service as the Main Business Workflow

The booking service coordinates several domain operations.

```text
                    initialiseBooking()
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
       Hotel            Room           Inventory
                                           │
                                  row-level locking
                                           │
                                           ▼
                                  availability check
                                           │
                                           ▼
                                  reserve inventory
                                           │
                                           ▼
                                    calculate price
                                           │
                                           ▼
                                    create Booking
                                           │
                                           ▼
                                       RESERVED
```

The important point is that booking initialization is not simply a database insert. It is a transactional workflow involving availability and inventory state.

## 4. Inventory Concurrency

Inventory is maintained per room and date.

The important counters are:

```text
total_count
booked_count
reserved_count
```

Availability is calculated as:

```text
available = total_count - booked_count - reserved_count
```

During initialization, the application queries the relevant inventory rows with a database locking clause.

The SQL generated by Hibernate includes:

```sql
FOR NO KEY UPDATE
```

This is important for concurrent requests. Without a locking strategy, two requests could both observe the same available room and reserve it before either request updates the inventory.

The intended flow is:

```text
Request A ──┐
            ├── lock inventory rows
Request B ──┘
                 │
                 ▼
          check availability
                 │
                 ▼
          reserve inventory
```

Only the request that successfully obtains and validates the inventory state should proceed.

## 5. Transaction Boundary

Critical booking operations are transactional.

The transaction is important because the following operations are related:

```text
Check inventory
     ↓
Update reserved_count
     ↓
Create/update booking
```

If a failure occurs before the transaction commits, the database should not be left with only part of the booking operation applied.

This is why booking operations belong in the service layer and use Spring transaction management.

## 6. Booking State Machine

The booking lifecycle is represented by application-level booking states.

```text
             ┌──────────────┐
             │   RESERVED   │
             └──────┬───────┘
                    │
                    ▼
             ┌──────────────┐
             │ GUESTS_ADDED │
             └──────┬───────┘
                    │
                    ▼
          ┌────────────────────┐
          │ PAYMENTS_PENDING   │
          └─────────┬──────────┘
                    │
        Stripe checkout.session.completed
                    │
                    ▼
             ┌──────────────┐
             │  CONFIRMED   │
             └──────┬───────┘
                    │
              cancellation
                    │
                    ▼
             ┌──────────────┐
             │  CANCELLED   │
             └──────────────┘
```

Each transition is controlled by business rules rather than allowing arbitrary status changes from the API.

## 7. Payment Architecture

Stripe is treated as an external payment provider.

The application does not mark a booking as paid merely because a client called the payment-initiation endpoint.

The payment sequence is:

```text
Client
  │
  │ create payment
  ▼
Booking service
  │
  ▼
Stripe Checkout Session
  │
  │ customer completes payment
  ▼
Stripe
  │
  │ checkout.session.completed
  ▼
Webhook endpoint
  │
  │ verify Stripe signature
  ▼
Booking service
  │
  ├── locate booking by Stripe session ID
  ├── mark booking CONFIRMED
  └── convert reservation inventory to booked inventory
```

This separates payment initiation from payment confirmation.

## 8. Webhook Security

The webhook endpoint is protected by Stripe's signing mechanism.

The important rule is:

```text
Do not trust the webhook payload until its signature is verified.
```

The webhook controller receives the raw Stripe payload and signature, verifies the event, and only then delegates the event to the booking/payment logic.

For local development, Stripe CLI forwards events to:

```text
POST /api/v1/webhook/payment
```

## 9. Cancellation and Refund

Cancellation is another multi-step business operation.

```text
CONFIRMED booking
       │
       ▼
validate cancellation
       │
       ▼
release booking inventory
       │
       ▼
create Stripe refund
       │
       ▼
CANCELLED
```

The refund is associated with the Stripe PaymentIntent/charge created for the booking payment.

The project was tested against Stripe's test environment and a successful refund was observed.

## 10. Pricing Strategy

Pricing is separated from the booking orchestration through the strategy layer.

Conceptually:

```text
BookingService
      │
      ▼
PricingService
      │
      ▼
Pricing Strategy
      │
      ▼
final booking amount
```

This follows the Strategy Pattern and keeps pricing rules replaceable.

It also makes future policies easier to add without turning `BookingService` into a large conditional block.

## 11. Security Architecture

The application uses Spring Security and JWT.

The request flow is approximately:

```text
HTTP request
     │
     ▼
JWTAuthFilter
     │
     ▼
validate JWT
     │
     ▼
load user details
     │
     ▼
SecurityContext
     │
     ▼
Controller
     │
     ▼
Service ownership/authorization checks
```

Authentication establishes who the caller is.

Service-level ownership checks establish whether that authenticated user is allowed to perform the requested business operation.

Those are separate concerns and both matter.

## 12. Error Handling

The project contains an advice/exception layer for converting application failures into the API's response structure.

A typical response follows the project's wrapper style:

```json
{
  "data": null,
  "error": {
    "message": "Booking not found with id: 1",
    "status": "404 NOT_FOUND",
    "subErrors": null
  },
  "timeStamp": "..."
}
```

One known improvement is to map inventory conflicts such as:

```text
Room is not available anymore
```

to a more appropriate HTTP conflict response such as `409 CONFLICT` rather than exposing a generic `500`.

## 13. Configuration and Secrets

Application configuration is externalized through environment variables.

```properties
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

The real `.env` file is excluded from Git.

The committed `application.properties` contains references such as:

```properties
spring.datasource.url=${DB_URL}
jwt.secretKey=${JWT_SECRET}
stripe.secret.key=${STRIPE_SECRET_KEY}
stripe.webhook.secret=${STRIPE_WEBHOOK_SECRET}
```

No real credentials should be committed to the repository.

## 14. Why This Architecture

The architecture is intentionally simple enough to understand but structured enough to support non-trivial booking behavior.

The main separation is:

```text
HTTP concerns       → Controllers
Business rules      → Services
Persistence         → Repositories
Persistence model   → Entities
API contracts       → DTOs
Variable algorithms → Strategies
Authentication      → Security layer
Payment provider    → Stripe integration
Error translation   → Advice/Exception layer
```

This reduces coupling and makes individual responsibilities easier to test and change.

## 15. Known Architectural Improvements

This project is a portfolio/learning backend rather than a claim of production completeness.

The next architectural improvements would be:

1. Add explicit idempotency handling for Stripe webhook events.
2. Add automated expiration/release of abandoned payment reservations.
3. Add integration tests for concurrent inventory reservations.
4. Return domain-specific conflict responses for unavailable inventory.
5. Introduce a dedicated payment abstraction if additional payment providers are added.
6. Add stronger observability around booking and payment state transitions.
7. Add database migrations instead of relying on `ddl-auto=update` for production deployment.
