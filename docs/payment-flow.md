# Payment Flow

The project uses Stripe Checkout for payment processing and Stripe webhooks for trusted payment confirmation.

## 1. Payment Lifecycle

```text
Booking
   ↓
Create Checkout Session
   ↓
PAYMENTS_PENDING
   ↓
Customer completes payment
   ↓
Stripe
   ↓
checkout.session.completed
   ↓
Webhook signature verification
   ↓
CONFIRMED
   ↓
reserved inventory → booked inventory
```

## 2. Create Checkout Session

Endpoint:

```http
POST /api/v1/bookings/{bookingId}/payments
```

The backend creates a Stripe Checkout Session and stores its session ID with the booking.

The booking remains:

```text
PAYMENTS_PENDING
```

Creating a Checkout Session alone does not confirm payment.

## 3. Stripe Webhook

Stripe sends the payment event to:

```http
POST /api/v1/webhook/payment
```

The important event for the booking workflow is:

```text
checkout.session.completed
```

The webhook endpoint verifies the Stripe signature before processing the event.

This prevents the application from trusting an arbitrary request claiming that a payment succeeded.

## 4. Local Webhook Testing

Stripe CLI was used to forward events to the local application:

```bash
stripe listen --forward-to 172.25.64.1:8080/api/v1/webhook/payment
```

A successful webhook delivery returned:

```text
204
```

Events observed during testing included:

```text
charge.succeeded
payment_intent.succeeded
payment_intent.created
mandate.updated
checkout.session.completed
```

The application uses `checkout.session.completed` for the booking confirmation workflow.

## 5. Confirm Booking

After successful webhook processing:

```text
PAYMENTS_PENDING
        ↓
checkout.session.completed
        ↓
CONFIRMED
```

The backend also updates inventory:

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

## 6. Why Webhooks Are Used

The client should not be trusted to confirm its own payment.

Incorrect approach:

```text
Client
  ↓
"Payment succeeded"
  ↓
Backend marks booking CONFIRMED
```

Implemented approach:

```text
Client
  ↓
Stripe Checkout
  ↓
Stripe processes payment
  ↓
Stripe sends signed webhook
  ↓
Backend verifies webhook
  ↓
Backend confirms booking
```

Stripe therefore becomes the source of truth for the payment event.

## 7. Cancellation and Refund

Endpoint:

```http
POST /api/v1/bookings/{bookingId}/cancel
```

For a confirmed booking, the backend performs the cancellation/refund workflow.

```text
CONFIRMED
    ↓
Stripe refund
    ↓
release inventory
    ↓
CANCELLED
```

The refund is associated with the payment created for the booking.

During testing, Stripe returned:

```text
status: succeeded
```

for the refund.

The tested refund amount was:

```text
36656 paise = ₹366.56
```

## 8. Configuration

Stripe credentials are supplied through environment variables:

```properties
stripe.secret.key=${STRIPE_SECRET_KEY}
stripe.webhook.secret=${STRIPE_WEBHOOK_SECRET}
```

Real credentials are excluded from Git.

## 9. Future Improvements

- Add Stripe event-id idempotency to safely handle duplicate webhook deliveries.
- Add automatic cleanup of expired `PAYMENTS_PENDING` bookings.
- Add retry/observability around webhook processing.
- Add integration tests for payment failure and duplicate webhook scenarios.
