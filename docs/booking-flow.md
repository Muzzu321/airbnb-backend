# Booking Flow

The booking system follows a state-driven workflow:

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

## 1. Initialize Booking

```http
POST /api/v1/bookings/init
```

The backend:

1. Validates the hotel and room.
2. Loads inventory for the requested dates.
3. Locks inventory rows using database row locking.
4. Checks room availability.
5. Calculates the booking price.
6. Increases `reserved_count`.
7. Creates the booking with status `RESERVED`.

Availability is calculated as:

```text
available = total_count - booked_count - reserved_count
```

The operation is transactional to keep booking and inventory changes consistent.

## 2. Add Guests

```http
POST /api/v1/bookings/{bookingId}/addGuests
```

After validation, guest information is attached to the booking.

```text
RESERVED → GUESTS_ADDED
```

## 3. Create Payment

```http
POST /api/v1/bookings/{bookingId}/payments
```

The backend creates a Stripe Checkout Session and stores the Stripe session ID.

```text
GUESTS_ADDED → PAYMENTS_PENDING
```

Creating the Checkout Session does **not** confirm the booking.

## 4. Stripe Webhook

Stripe sends:

```text
checkout.session.completed
```

to:

```http
POST /api/v1/webhook/payment
```

The backend verifies the Stripe webhook signature and then processes the payment event.

```text
PAYMENTS_PENDING
        ↓
checkout.session.completed
        ↓
CONFIRMED
```

## 5. Inventory Confirmation

When payment succeeds:

```text
reserved_count--
booked_count++
```

Example:

```text
Before:
booked_count   = 1
reserved_count = 1

After:
booked_count   = 2
reserved_count = 0
```

## 6. Cancellation and Refund

```http
POST /api/v1/bookings/{bookingId}/cancel
```

For a confirmed booking:

```text
CONFIRMED
    ↓
Stripe refund
    ↓
release inventory
    ↓
CANCELLED
```

Stripe refund processing was verified successfully in the test environment.

## 7. Concurrency Protection

Inventory availability is protected using database row locking.

The Hibernate query uses:

```sql
FOR NO KEY UPDATE
```

This prevents concurrent booking requests from incorrectly reserving the same inventory.

## 8. Important Failure Cases Tested

The implementation was tested against:

- Room becoming unavailable → booking rejected.
- Expired JWT → `401 UNAUTHORIZED`.
- Missing booking → `404 NOT_FOUND`.
- Successful Stripe webhook → `204` response.
- Successful payment → booking becomes `CONFIRMED`.
- Successful refund → Stripe refund status `succeeded`.

## Complete Flow

```text
Initialize Booking
       ↓
RESERVED
       ↓
Add Guests
       ↓
GUESTS_ADDED
       ↓
Stripe Checkout
       ↓
PAYMENTS_PENDING
       ↓
checkout.session.completed
       ↓
CONFIRMED
       ↓
Inventory Booked
       ↓
Cancellation
       ↓
Stripe Refund
       ↓
CANCELLED
```

## Future Improvements

- Webhook idempotency
- Automatic expiry of unpaid reservations
- Better `409 CONFLICT` handling for unavailable rooms
- Concurrent booking integration tests
- Database migrations for production
