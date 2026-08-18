# Airbnb Backend

A backend-first hotel and room booking platform built with Spring Boot. The project focuses on authentication, authorization, inventory reservation, transactional booking workflows, dynamic pricing, Stripe Checkout, signed webhooks, refunds, and hotel reporting.

> **Project focus:** backend architecture, business rules, data consistency, payment integration, and API design.

## Highlights

- JWT-based authentication and authorization
- User, role, hotel, room, guest, booking, and inventory management
- Hotel-owner booking and revenue reporting
- Booking lifecycle management
- Inventory reservation with database row locking
- Dynamic pricing through a pricing strategy layer
- Stripe Checkout integration
- Stripe webhook signature verification
- Payment confirmation through `checkout.session.completed`
- Booking cancellation and Stripe refunds
- Swagger/OpenAPI documentation
- DTO-based API contracts
- Centralized exception/response handling
- PostgreSQL persistence with Spring Data JPA/Hibernate

## Technology Stack

| Area | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 4.1 |
| Web | Spring MVC / REST |
| Persistence | Spring Data JPA / Hibernate |
| Database | PostgreSQL |
| Security | Spring Security + JWT |
| Payments | Stripe Checkout + Webhooks |
| API documentation | Springdoc OpenAPI / Swagger UI |
| Build | Maven |
| Utilities | Lombok, ModelMapper |

## Architecture

```text
                Client / Swagger
                       |
                       v
                REST Controllers
                       |
                       v
                 Service Layer
                       |
          +------------+-------------+
          |            |             |
          v            v             v
     Repositories   Strategies   External APIs
          |            |             |
          v            v             v
      PostgreSQL     Pricing        Stripe
```

### Main packages

```text
src/main/java/com/muzammil/projects/airBnbApp
├── advice        # API/error response handling
├── config        # application/security configuration
├── controller    # REST endpoints
├── dto           # API request/response models
├── entity        # JPA persistence models
├── exception     # application-specific exceptions
├── repository    # Spring Data persistence layer
├── security      # JWT/authentication components
├── service       # business logic
├── strategy      # pricing/business strategies
└── util          # shared utilities
```

## Core Domain Model

- **User** — authenticated application user and hotel ownership context.
- **Hotel** — property being offered for booking.
- **Room** — bookable room type belonging to a hotel.
- **Inventory** — date-level availability for a room.
- **Booking** — reservation and payment lifecycle.
- **Guest** — guest information associated with a booking.

### Inventory model

Inventory tracks:

```text
total_count
booked_count
reserved_count
```

Availability is effectively:

```text
available = total_count - booked_count - reserved_count
```

Booking initialization locks the relevant inventory rows and verifies that every requested date is available before increasing the reserved count.

## Booking Lifecycle

```text
RESERVED
    |
    v
GUESTS_ADDED
    |
    v
PAYMENTS_PENDING
    |
    | Stripe checkout.session.completed
    v
CONFIRMED
    |
    | cancellation + refund
    v
CANCELLED
```

### Initialize booking

`POST /bookings/init`

The service loads the hotel and room, locks available inventory for the requested date range, verifies availability for every date, reserves the requested rooms, calculates the price, and creates the booking in `RESERVED`.

### Add guests

`POST /bookings/{bookingId}/addGuests`

The service verifies ownership, expiry, and booking state before attaching guest records. The booking moves to `GUESTS_ADDED`.

### Start payment

`POST /bookings/{bookingId}/payments`

The checkout service creates a Stripe Checkout Session, stores its session ID on the booking, and the booking moves to `PAYMENTS_PENDING`.

### Stripe webhook

Stripe sends `checkout.session.completed` to:

`POST /webhook/payment`

The controller verifies the Stripe signature. The booking service finds the booking using the Checkout Session ID, changes it to `CONFIRMED`, and converts reserved inventory into booked inventory.

### Cancellation

`POST /bookings/{bookingId}/cancel`

A confirmed booking can be cancelled. The service releases the booking inventory and creates a Stripe refund using the PaymentIntent associated with the Checkout Session.

## Stripe Payment Architecture

```text
Client
  |
  | POST /bookings/{id}/payments
  v
BookingService
  |
  v
CheckoutService
  |
  v
Stripe Checkout
  |
  | successful payment
  v
Stripe
  |
  | checkout.session.completed
  v
Stripe CLI / webhook delivery
  |
  v
POST /webhook/payment
  |
  v
WebhookController
  |
  | verify Stripe-Signature
  v
BookingService.capturePayment()
  |
  +--> Booking = CONFIRMED
  |
  +--> reserved_count decreases
  |
  +--> booked_count increases
```

Local development:

```bash
stripe listen --forward-to 172.25.64.1:8080/api/v1/webhook/payment
```

## Design Principles and Patterns

### Layered Architecture
Controllers handle HTTP concerns, services contain business rules, repositories handle persistence, and entities represent persistence models.

### Dependency Injection
Spring-managed dependencies are injected into controllers and services, including constructor injection via Lombok `@RequiredArgsConstructor`.

### DTO Pattern
The API uses request/response DTOs instead of exposing persistence entities as the primary API contract.

Examples:

```text
BookingRequest
BookingDto
BookingPaymentInitResponseDto
BookingStatusResponseDto
HotelReportDto
GuestDto
```

### Repository Pattern
Persistence is isolated behind Spring Data repositories such as:

```text
BookingRepository
HotelRepository
RoomRepository
InventoryRepository
GuestRepository
```

### Strategy Pattern
Pricing policies are separated from the booking service through the pricing strategy layer.

### Transaction Management
Critical booking operations use `@Transactional` so inventory and booking state changes participate in the same database transaction.

### Pessimistic Row Locking
Inventory availability is protected with database row locking to reduce race conditions when multiple users attempt to reserve the same room/date.

## Security

The project uses Spring Security with JWT authentication.

The security layer includes:

- JWT authentication filter
- User details service
- Authentication manager configuration
- Authenticated user lookup
- Role/authorization checks
- Ownership checks for user-specific and hotel-owner operations

## API Overview

### Booking Flow

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/bookings/init` | Initialize a booking |
| POST | `/bookings/{bookingId}/addGuests` | Add guests |
| POST | `/bookings/{bookingId}/payments` | Create Stripe Checkout |
| GET | `/bookings/{bookingId}/status` | Get booking status |
| POST | `/bookings/{bookingId}/cancel` | Cancel a confirmed booking |

### Payment Webhook

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/webhook/payment` | Receive and verify Stripe webhook events |

### Guest APIs

Guest management is exposed under `/users/guests`, including retrieving the authenticated user's guests and adding a new guest.

### Admin / Hotel Inventory

The application also exposes hotel, room, and inventory administration endpoints. Swagger/OpenAPI is the authoritative source for the complete endpoint list and schemas.

## Swagger UI

When running locally:

```text
http://localhost:8080/api/v1/swagger-ui/index.html
```

## Configuration

Secrets are externalized through environment variables:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

jwt.secretKey=${JWT_SECRET}

stripe.secret.key=${STRIPE_SECRET_KEY}
stripe.webhook.secret=${STRIPE_WEBHOOK_SECRET}
```

Never commit real credentials.

## Running Locally

### Prerequisites

- Java 21
- PostgreSQL
- Maven or the included Maven wrapper
- Stripe test credentials for payment testing
- Stripe CLI for local webhook forwarding

### Run

Linux/macOS:

```bash
./mvnw spring-boot:run
```

Windows:

```cmd
mvnw.cmd spring-boot:run
```

The application runs on port `8080` with context path `/api/v1`.

### Stripe webhook forwarding

```bash
stripe listen --forward-to 172.25.64.1:8080/api/v1/webhook/payment
```

## Demonstrated End-to-End Flow

The payment flow has been exercised end-to-end:

```text
Booking created
    ↓
Guests added
    ↓
Stripe Checkout Session created
    ↓
Test payment completed
    ↓
checkout.session.completed
    ↓
Webhook returned HTTP 204
    ↓
Booking became CONFIRMED
    ↓
Inventory changed from reserved to booked
```

A successful test verified:

```text
Before confirmation:
booked_count   = 1
reserved_count = 1

After confirmation:
booked_count   = 2
reserved_count = 0
```

Cancellation and Stripe refund processing were also verified in the test environment.

## Reporting

Hotel owners can retrieve booking data and generate a report containing:

- confirmed booking count
- total revenue from confirmed bookings
- average revenue per confirmed booking

## Known Limitations / Future Improvements

This project is functional but not being presented as production-complete.

- Return `409 Conflict` instead of generic `500` for inventory conflicts.
- Automatically release inventory held by expired `PAYMENTS_PENDING` bookings.
- Add webhook idempotency protection for duplicate Stripe deliveries.
- Add integration tests for concurrent booking attempts.
- Expand automated test coverage beyond context loading.
- Improve search/availability query semantics.
- Replace placeholder holiday-pricing behavior with a real holiday/calendar source.
- Explicitly configure `spring.jpa.open-in-view` where appropriate.
- Improve API consistency around query parameters versus request bodies.

## Project Walkthrough

**YouTube video: Coming soon**

The walkthrough will demonstrate:

1. Project architecture
2. Database model
3. Swagger API
4. Booking creation
5. Guest addition
6. Stripe Checkout
7. Stripe webhook processing
8. Booking confirmation
9. Inventory transition
10. Cancellation and refund

## Repository

https://github.com/Muzzu321/airbnb-backend

## Author

**Muzammil Meraj**
