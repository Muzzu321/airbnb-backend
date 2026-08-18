# Database Design

The application uses PostgreSQL with Spring Data JPA/Hibernate.

## Core Entities

```text
User
 ├── owns → Hotel
 ├── has → Guest
 └── has → Booking

Hotel
 └── has many → Room

Room
 └── has many → Inventory

Booking
 ├── belongs to → User
 ├── belongs to → Hotel
 ├── belongs to → Room
 └── has many → Guest
```

## Entity Responsibilities

### User

Represents an authenticated application user.

The user is also used for:

- Authentication and authorization
- Hotel ownership
- User-specific bookings
- Guest management

### Hotel

Represents a property available for booking.

A hotel contains information such as:

- Name
- Address
- City
- Contact information
- Amenities
- Photos
- Owner

A hotel can contain multiple rooms.

### Room

Represents a bookable room type within a hotel.

Important room information includes:

- Room type
- Base price
- Capacity
- Total room count
- Amenities
- Photos

A room has date-specific inventory records.

### Inventory

Inventory represents availability for a specific room on a specific date.

Important fields are:

```text
date
total_count
booked_count
reserved_count
price
closed
```

Availability is calculated as:

```text
available = total_count - booked_count - reserved_count
```

Using date-level inventory allows the application to support different availability and pricing for different dates.

### Booking

Represents a customer's reservation.

Important information includes:

```text
amount
booking_status
check_in_date
check_out_date
rooms_count
hotel
room
user
payment_session_id
```

The booking status represents the booking/payment lifecycle:

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

### Guest

Represents a person staying under a booking.

Guest information includes:

```text
name
date_of_birth
gender
```

A booking can contain multiple guests.

## Inventory and Booking Relationship

Inventory is separated from the booking itself because availability changes by date.

For example, a room can have:

```text
2026-08-20 → available
2026-08-21 → available
2026-08-22 → unavailable
```

A booking covering all three dates therefore cannot be created unless the requested room count is available on every required date.

During booking initialization, the application locks the relevant inventory rows and reserves inventory using `reserved_count`.

After successful payment:

```text
reserved_count--
booked_count++
```

After cancellation/refund, the booking's inventory is released according to the cancellation workflow.

## Relationships

### User → Hotel

A user can own hotels.

```text
User 1 ──────── * Hotel
```

### Hotel → Room

A hotel can contain multiple room types.

```text
Hotel 1 ──────── * Room
```

### Room → Inventory

A room has inventory records for individual dates.

```text
Room 1 ──────── * Inventory
```

### User → Booking

A user can create multiple bookings.

```text
User 1 ──────── * Booking
```

### Booking → Guest

A booking can contain multiple guests.

```text
Booking 1 ──────── * Guest
```

### Booking → Room / Hotel

A booking references the hotel and room being reserved.

```text
Booking * ──────── 1 Room
Booking * ──────── 1 Hotel
```

## Simplified Domain Model

```text
                         ┌─────────────┐
                         │    User     │
                         └──────┬──────┘
                    owns        │        creates
                     │          │
                     ▼          ▼
                ┌────────┐  ┌─────────┐
                │ Hotel  │  │ Booking │
                └───┬────┘  └────┬────┘
                    │             │
                    ▼             ▼
                 ┌──────┐      ┌──────┐
                 │ Room │      │Guest │
                 └──┬───┘      └──────┘
                    │
                    ▼
               ┌───────────┐
               │ Inventory │
               └───────────┘
```

## Design Decisions

### Why separate Inventory from Room?

Room data describes the room itself. Inventory describes whether that room is available on a particular date.

Separating them allows:

- Date-specific availability
- Date-specific pricing
- Reservation counts
- Booked counts
- Closed dates

### Why track reserved and booked separately?

A reservation may exist before payment is confirmed.

```text
reserved_count
    ↓
payment succeeds
    ↓
booked_count
```

This prevents unpaid reservations from being treated as permanently booked inventory.

### Why use database locking?

Booking availability is concurrency-sensitive. The application uses row-level database locking during inventory selection so concurrent requests cannot both safely consume the same inventory without synchronization.

## Future Improvements

- Add database migrations such as Flyway or Liquibase.
- Add explicit unique constraints for inventory `(room_id, date)`.
- Add indexes based on production query patterns.
- Add integration tests for concurrent inventory updates.
- Consider auditing inventory changes for operational visibility.
