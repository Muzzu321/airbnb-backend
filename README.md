# Airbnb Backend

Backend hotel booking platform built with Spring Boot, supporting hotel management, room inventory, booking workflows, dynamic pricing, and Stripe payments.

## Features

- JWT-based authentication and role-based authorization
- Hotel, room, guest, booking, and inventory management
- Hotel search with date and room availability
- Concurrent booking protection using database row locking
- Booking lifecycle: Reserved → Guests Added → Payment Pending → Confirmed → Cancelled
- Dynamic pricing using the Strategy Pattern
- Stripe Checkout integration with signed webhooks
- Booking cancellation and Stripe refunds
- Swagger/OpenAPI documentation

## Architecture

Layered Spring Boot architecture:

- REST Controllers
- Service Layer
- Repository Layer
- PostgreSQL
- Pricing Strategy Layer
- Stripe Integration

## Technologies

- Java 21
- Spring Boot
- Spring Security + JWT
- Spring Data JPA / Hibernate
- PostgreSQL
- Stripe
- Maven
- Swagger / OpenAPI

## Architecture Diagram

<img width="4936" height="3566" alt="diagram_export_23_11_2024_23_28_48_7c4f0f0be2" src="https://github.com/user-attachments/assets/177aa4da-0b6a-4fb1-953f-abd5763ea40f" />


## Booking Flow

1. Search hotels and check room availability
2. Initialize booking and reserve inventory
3. Add guests
4. Create Stripe Checkout session
5. Verify Stripe webhook
6. Confirm booking and update inventory
7. Cancel booking and process refund when applicable
