# Hotel Booking Platform

A full-stack hotel / Airbnb-style booking application: a **Spring Boot** REST API with PostgreSQL, JWT authentication and Stripe Checkout payments, and a **React + Vite** single-page frontend.

> **Status.** Every command, path, environment variable and route below was checked against the source code. The integrated project has **not yet been compiled, started or exercised end-to-end** in the environment where this README was written (no network, PostgreSQL or Stripe was available). Items that need your confirmation are marked **⚠️ Confirm**. Read [Known limitations](#known-limitations) before relying on pricing or search behaviour.

---

## Table of contents

1. [Features](#features)
2. [Technology stack](#technology-stack)
3. [Architecture and repository layout](#architecture-and-repository-layout)
4. [Prerequisites](#prerequisites)
5. [Installation and first run](#installation-and-first-run)
6. [Environment variables](#environment-variables)
7. [Database](#database)
8. [Running the apps](#running-the-apps)
9. [Testing](#testing)
10. [Production build](#production-build)
11. [Authentication and authorization](#authentication-and-authorization)
12. [Workflows: availability, pricing, booking, payment](#workflows-availability-pricing-booking-payment)
13. [API reference](#api-reference)
14. [Troubleshooting](#troubleshooting)
15. [Deployment](#deployment)
16. [Security notes](#security-notes)
17. [Known limitations](#known-limitations)

---

## Features

Everything listed is implemented in the source.

**Guests**
- Sign up, log in, log out; stay signed in through a refresh-token cookie.
- Search hotels by city, check-in/check-out dates and number of rooms, with pagination.
- View a hotel and the rooms that are available for the chosen dates.
- Create a booking (reserves rooms), choose guests, pay with Stripe Checkout, watch the status update.
- Booking history, and cancelling a **confirmed** booking (full Stripe refund).
- Edit profile (name, date of birth, gender) and manage saved co-travellers.

**Hotel managers** (role `HOTEL_MANAGER`, only for hotels they own)
- Create, edit, delete and **activate** hotels.
- Create, edit and delete rooms (price, capacity, count, amenities, photo URLs).
- View and update per-day inventory (surge factor, closed flag).
- View the bookings of a hotel and a report (confirmed-booking count, total and average revenue).

**Platform behaviour**
- Dynamic pricing (surge, occupancy, urgency and holiday strategies).
- Pessimistic locking on inventory while reserving, confirming and cancelling.
- Automatic expiry of unpaid reservations.
- Stripe webhook with signature verification as the only thing that confirms a payment.
- Uniform JSON error envelope with validation messages.
- OpenAPI / Swagger UI (springdoc).

**Not implemented:** email notifications, image upload (photos are stored as URLs), price/rating filters or sorting in search, hotel descriptions/ratings, and any way to become a hotel manager from the UI.

## Technology stack

| Layer | Technology (versions from `backend/pom.xml` and `frontend/package.json`) |
|---|---|
| Backend | Java 21, Spring Boot 4.1.0, Spring Web MVC, Spring Security, Spring Data JPA / Hibernate, Bean Validation |
| Database | PostgreSQL (JDBC driver managed by Spring Boot) |
| Auth | JWT with jjwt 0.12.6 (access token in the `Authorization` header + HttpOnly refresh cookie) |
| Payments | Stripe Java SDK 32.0.0 (Checkout Sessions, webhooks, refunds), currency `inr` |
| Mapping / docs | ModelMapper 3.2.4, springdoc-openapi 2.8.3, Lombok |
| Build | Maven (wrapper included: `backend/mvnw`, `backend/mvnw.cmd`) |
| Frontend | React 19, Vite 6, React Router 7, Axios, Tailwind CSS 4, Radix UI, react-hook-form + zod, dayjs, sonner |
| Frontend QA | ESLint 9; unit tests with Node's built-in test runner |

## Architecture and repository layout

```
.
├── README.md                  ← this file
├── backend/                   ← Spring Boot API (context path /api/v1, port 8080)
│   ├── pom.xml, mvnw, mvnw.cmd, .mvn/
│   ├── .env.example           ← backend variables (template, no secrets)
│   └── src/
│       ├── main/java/com/muzammil/projects/airBnbApp/
│       │   ├── controller/    ← REST controllers
│       │   ├── service/       ← business logic (+ BookingExpiryService, PricingUpdateService)
│       │   ├── strategy/      ← dynamic pricing strategies
│       │   ├── security/      ← JWT filter/service, Spring Security config
│       │   ├── config/        ← CORS, OpenAPI, Stripe, ModelMapper
│       │   ├── advice/        ← global exception + response-envelope handlers
│       │   └── entity/, repository/, dto/, exception/, util/
│       └── main/resources/application.properties
└── frontend/                  ← React + Vite SPA (dev server port 5173)
    ├── package.json, vite.config.js, eslint.config.js
    ├── .env.example           ← frontend variables
    └── src/
        ├── app/               ← pages (home, search, hotel-details, checkout, payments, settings, admin)
        ├── features/, components/, hooks/
        ├── config/            ← api.config.js (all endpoint paths), path.config.js (routes)
        └── lib/               ← axios-instance, hooks, providers, __tests__
```

How the pieces talk to each other:

```
Browser (React, :5173) ──HTTP/JSON + Bearer JWT──▶ Spring Boot API (:8080/api/v1) ──JDBC──▶ PostgreSQL
        │                                                │  ▲
        └── redirect to Stripe Checkout ◀── session URL ─┘  └── signed webhook ◀── Stripe
```

> **⚠️ Confirm:** `backend/` + `frontend/` is the layout of the integrated project. If your Git repository keeps the backend at the repository root, adjust the `cd backend` paths accordingly.
> `frontend/README.md` is the original Vite template text and is not project documentation.

## Prerequisites

| Tool | Version | Source |
|---|---|---|
| JDK | **21** | `<java.version>21</java.version>` in `pom.xml` |
| Maven | Not needed; use the included wrapper | `backend/mvnw` |
| PostgreSQL | A currently supported release. **⚠️ Confirm** the minimum; no version is pinned. | — |
| Node.js + npm | **⚠️ Confirm.** No `engines` field. Vite 6 / Tailwind 4 need a current Node; Node 20 LTS or newer is recommended. | `package.json` |
| Stripe account (test mode) + [Stripe CLI](https://stripe.com/docs/stripe-cli) | needed for payments | — |
| Docker | optional, only for the PostgreSQL example below | — |

## Installation and first run

```bash
git clone <your-repository-url>
cd <repository-folder>
```

1. **Start PostgreSQL and create the database** → [Database](#database).
2. **Configure and start the backend** → `cp backend/.env.example backend/.env`, edit it, then [run it](#backend).
3. **Configure and start the frontend** → `cp frontend/.env.example frontend/.env`, then [run it](#frontend).
4. **Create a hotel manager** if you want the admin area → [Creating a hotel manager](#creating-a-hotel-manager).
5. **Forward Stripe webhooks** to complete payments → [Stripe](#stripe-test-mode).

## Environment variables

### Backend (`backend/src/main/resources/application.properties`)

Spring does **not** read `.env` files by itself. Load the file into your shell first (see [Backend](#backend)) or set the variables in your IDE / hosting platform.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DB_PASSWORD` | **Yes** | none | PostgreSQL password |
| `JWT_SECRET` | **Yes** | none | HMAC key for JWTs. Use at least 32 characters (jjwt rejects shorter HS256 keys). |
| `STRIPE_SECRET_KEY` | **Yes** | none | Stripe secret key (`sk_test_…` in development) |
| `STRIPE_WEBHOOK_SECRET` | **Yes** | none | Webhook signing secret (`whsec_…`) |
| `DB_URL` | No | `jdbc:postgresql://localhost:5432/airBnb` | JDBC URL |
| `DB_USERNAME` | No | `airbnb_user` | Database user |
| `FRONTEND_URL` | No | `http://localhost:5173` | Public URL of the SPA; used for Stripe return URLs and as the default CORS origin |
| `CORS_ALLOWED_ORIGINS` | No | value of `FRONTEND_URL` | Comma-separated exact origins. `*` is rejected at startup. |
| `COOKIE_SECURE` | No | `false` | Set `true` behind HTTPS (`Secure` flag of the refresh cookie) |
| `COOKIE_SAME_SITE` | No | `Lax` | Refresh cookie `SameSite`; `None` requires `COOKIE_SECURE=true` |
| `JPA_DDL_AUTO` | No | `update` | Hibernate schema mode (`validate` recommended in production) |
| `JPA_SHOW_SQL` | No | `false` | Log SQL statements |
| `SERVER_PORT` | No | `8080` | HTTP port |

If a required variable is missing, the application fails at startup with an unresolved-placeholder error.

### Frontend (`frontend/.env`)

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_SERVER_BASE_URL` | No | `http://localhost:8080/api/v1` | API base URL **including** `/api/v1` (endpoint paths in `src/config/api.config.js` do not repeat it). Baked in at build time. |

> `frontend/.env` is listed in `frontend/.gitignore`. **⚠️ Confirm** that it is not already tracked in your repository (`git ls-files frontend/.env`); if it is, run `git rm --cached frontend/.env`.

## Database

The project has **no Flyway/Liquibase migrations**. Hibernate creates and updates the tables on startup (`JPA_DDL_AUTO=update`). Create an empty database and user once:

```bash
# Optional: PostgreSQL in Docker
docker run --name airbnb-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16

psql -U postgres -h localhost <<'SQL'
CREATE USER airbnb_user WITH PASSWORD 'choose-a-password';
CREATE DATABASE "airBnb" OWNER airbnb_user;   -- quotes keep the mixed-case name used in DB_URL
SQL
```

Put the same password in `DB_PASSWORD`. Tables are created on the first backend start. There is no seed data; create hotels through the admin area.

### Creating a hotel manager

Sign-up always creates a `GUEST`, and there is intentionally no API to change roles. After registering in the UI, grant the role in SQL (verify table names with `\d app_user_roles` first):

```sql
INSERT INTO app_user_roles (app_user_id, roles)
SELECT id, 'HOTEL_MANAGER' FROM app_user WHERE email = 'you@example.com';
```

Log out and in again; an **Admin** entry appears in the account menu.

## Running the apps

### Backend

```bash
cd backend
cp .env.example .env                 # edit the values (never commit .env)
set -a; source .env; set +a          # bash/zsh: load variables into this shell
./mvnw spring-boot:run               # Windows: mvnw.cmd spring-boot:run
```

API: `http://localhost:8080/api/v1`. Swagger UI (springdoc default path, **⚠️ Confirm**): `http://localhost:8080/api/v1/swagger-ui/index.html`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install                          # no lockfile is committed, so this resolves current compatible versions
npm run dev                          # http://localhost:5173
```

### Stripe (test mode)

```bash
stripe login
stripe listen --forward-to localhost:8080/api/v1/webhook/payment
```

Copy the printed `whsec_…` value into `STRIPE_WEBHOOK_SECRET` and restart the backend. Use Stripe's test card `4242 4242 4242 4242` with any future expiry and any CVC. Without `stripe listen` running, a payment succeeds at Stripe but the booking never leaves `PAYMENTS_PENDING`.

### First-time walkthrough

1. Sign up, [promote the user](#creating-a-hotel-manager) to `HOTEL_MANAGER`, log in again.
2. Admin → **Create hotel** → open it → **Create Room** → **Activate hotel** (generates one year of inventory and makes the hotel searchable).
3. Search for the hotel's **city** with future dates, open it, pick a room, add a guest, pay.
4. After the webhook arrives the status page shows `CONFIRMED`; the booking appears in *My Bookings*, where it can be cancelled.

## Testing

| Where | Command | Notes |
|---|---|---|
| Frontend unit tests | `cd frontend && npm test` | Runs `node --test src/lib/__tests__/*.test.js` (error normalisation, single-flight token refresh). Needs no installed dependencies. |
| Frontend lint | `cd frontend && npm run lint` | ESLint |
| Backend tests | `cd backend && ./mvnw test` (or `./mvnw clean verify`) | The only test is `AirBnbAppApplicationTests`; it **needs PostgreSQL and the four required environment variables**. No tests exist for the booking flow. |

There are no browser / end-to-end tests.

## Production build

```bash
# Backend: executable JAR
cd backend
./mvnw clean package -DskipTests
java -jar target/airBnbApp-0.0.1-SNAPSHOT.jar      # name derived from pom.xml (⚠️ Confirm after building)

# Frontend: static files in frontend/dist
cd frontend
VITE_SERVER_BASE_URL=https://api.example.com/api/v1 npm run build
npm run preview                                    # local preview of the build
```

Serve `frontend/dist` from any static host. The SPA uses client-side routing, so configure a fallback to `index.html` for unknown paths.

## Authentication and authorization

- **Sign-up and login** (`/auth/signup`, `/auth/login`) are public. Login returns `{ accessToken }` in the response body and sets an **HttpOnly `refreshToken` cookie** (path `/api/v1/auth`).
- **Access token:** JWT valid **10 minutes**, sent as `Authorization: Bearer <token>`. The frontend stores it in `localStorage` (key `__auth-token__`).
- **Refresh token:** JWT valid about **180 days**, kept only in the cookie. On a `401` the frontend makes one shared `POST /auth/refresh` call (with credentials) and retries the request once; if the refresh fails the user is signed out.
- **Logout:** `POST /auth/logout` clears the cookie. JWTs are stateless, so an already-issued access token stays valid until it expires (at most 10 minutes).
- **Roles** (`GUEST`, `HOTEL_MANAGER`): `/admin/**` requires `HOTEL_MANAGER`; `/bookings/**` and `/users/**` require authentication; everything else is public. Services additionally check ownership (managers only reach their own hotels; users only their own bookings and guests).
- **Status codes:** missing/invalid token → `401`; wrong role or someone else's resource → `403`.
- **CORS:** only origins in `CORS_ALLOWED_ORIGINS`; methods GET, POST, PUT, PATCH, DELETE, OPTIONS; credentials allowed.
- The frontend route guards only improve UX. The backend enforces access independently.

## Workflows: availability, pricing, booking, payment

### Availability and search
- Activating a hotel creates one **inventory row per room per day for one year** (`totalCount`, `bookedCount`, `reservedCount`, `price`, `surgeFactor`, `closed`). Rooms created later in an already-active hotel are initialised automatically.
- `GET /hotels/search` reads a precomputed `hotel_min_price` table (city match is case-insensitive, active hotels only). It is refreshed **hourly** (cron `0 0 * * * *`) and immediately for a hotel when it is activated.
- `GET /hotels/{id}/info` lists only the rooms available for **every** requested day in the requested quantity, with their average price.

### Dynamic pricing
Price of one inventory day = `room base price` × surge factor × (×1.2 if occupancy is above 80%) × (×1.15 if the date is within the next 7 days) × **×1.25 holiday factor**. The holiday factor is currently hard-coded to always apply (see [Known limitations](#known-limitations)). The booking amount is the sum over the booked days and rooms, calculated on the server at booking time. Prices shown in search and on the hotel page are estimates.

### Booking lifecycle

```
RESERVED ─▶ GUESTS_ADDED ─▶ PAYMENTS_PENDING ─▶ CONFIRMED ─▶ CANCELLED
    └────────────┴────────────────┴──────────────▶ EXPIRED
```

1. `POST /bookings/init` validates the dates (check-in not in the past, check-out after check-in) and that the room belongs to the hotel, locks the inventory rows and **reserves** the rooms → `RESERVED`. Billing counts every calendar date from check-in **through** check-out (nights + 1).
2. `POST /bookings/{id}/addGuests` with the chosen saved-guest IDs (at least one, all owned by the caller) → `GUESTS_ADDED`. Calling it again **replaces** the guest list.
3. `POST /bookings/{id}/payments` (from `GUESTS_ADDED`, or from `PAYMENTS_PENDING` to retry, in which case the previous Stripe session is closed first) creates a Stripe Checkout session (mode `payment`, currency `inr`) that expires after 30 minutes → `PAYMENTS_PENDING`; returns `{ sessionUrl }`.
4. The browser is redirected to Stripe. Stripe returns to `FRONTEND_URL/payments/{bookingId}/status` (a cancelled checkout returns with `?cancelled=true`).
5. Stripe calls `POST /webhook/payment`. The signature is verified with `STRIPE_WEBHOOK_SECRET`; on `checkout.session.completed` with a paid session the booking becomes `CONFIRMED` and the reserved rooms become booked. Repeated deliveries are ignored. **Returning from Stripe does not confirm a booking.**
6. The frontend polls `GET /bookings/{id}/status` every 3 seconds (maximum 20 attempts) until `CONFIRMED`, `CANCELLED` or `EXPIRED`.
7. `POST /bookings/{id}/cancel` works for `CONFIRMED` bookings only: the inventory is released and the payment refunded in full through Stripe. If the refund fails, nothing is cancelled.
8. **Expiry:** a job runs every 60 seconds. `RESERVED` / `GUESTS_ADDED` bookings older than 10 minutes and `PAYMENTS_PENDING` bookings older than 35 minutes become `EXPIRED`, and their reserved rooms are released.

## API reference

Base URL: `http://localhost:8080/api/v1`. Auth column: **Public**, **User** (any valid access token), **Manager** (`HOTEL_MANAGER` and owner of the hotel).

### Response and error format

Every JSON response is wrapped:

```json
{ "timeStamp": "2026-10-10T10:00:00", "data": { }, "error": null }
```

Failures return `data: null` and an error object:

```json
{ "timeStamp": "…", "data": null,
  "error": { "status": "BAD_REQUEST", "message": "Validation failed",
             "subErrors": ["email: must be a well-formed email address"] } }
```

Status codes in use: `400` validation / bad input, `401` unauthenticated or bad credentials, `403` forbidden, `404` not found, `409` business-rule conflict (wrong booking state, no availability, refund failure, data conflict), `500` unexpected. Dates are `YYYY-MM-DD`.

### Auth

| Method | Path | Auth | Body / notes |
|---|---|---|---|
| POST | `/auth/signup` | Public | `{ "name", "email", "password" }` (password 8–72 characters) → `201` user |
| POST | `/auth/login` | Public | `{ "email", "password" }` → `{ "accessToken" }` + `refreshToken` cookie |
| POST | `/auth/refresh` | Cookie | no body → `{ "accessToken" }`; `401` without a valid cookie |
| POST | `/auth/logout` | Public | clears the cookie |

```bash
curl -X POST http://localhost:8080/api/v1/auth/signup -H 'Content-Type: application/json' \
  -d '{"name":"Asha","email":"asha@example.com","password":"S3cure-pass"}'

curl -i -X POST http://localhost:8080/api/v1/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"asha@example.com","password":"S3cure-pass"}'
```

### Public hotel browsing

| Method | Path | Query parameters |
|---|---|---|
| GET | `/hotels/search` | `city`, `startDate`, `endDate` (required); `roomsCount` (1–20, default 1); `page` (default 0); `size` (1–50, default 10) |
| GET | `/hotels/{hotelId}/info` | `startDate`, `endDate` (required); `roomsCount` (1–20, default 1) |

```bash
curl 'http://localhost:8080/api/v1/hotels/search?city=Goa&startDate=2026-11-01&endDate=2026-11-03&roomsCount=1&page=0&size=10'
```

Search returns a Spring `Page` (`content`, `totalElements`, …) of hotels with their price.

### User (`User`)

| Method | Path | Body |
|---|---|---|
| GET | `/users/profile` | none (includes `roles`) |
| PATCH | `/users/profile` | `{ "name", "dateOfBirth", "gender" }` (`gender`: `MALE`, `FEMALE`, `OTHER`) |
| GET | `/users/myBookings` | none |
| GET | `/users/guests` | none |
| POST | `/users/guests` | `{ "name", "gender", "dateOfBirth" }` |
| PUT | `/users/guests/{guestId}` | same as POST |
| DELETE | `/users/guests/{guestId}` | none |

### Bookings (`User`, owner only)

| Method | Path | Body / result |
|---|---|---|
| POST | `/bookings/init` | `{ "hotelId", "roomId", "checkInDate", "checkOutDate", "roomsCount" }` → booking (`RESERVED`) |
| POST | `/bookings/{bookingId}/addGuests` | JSON array of guest IDs, e.g. `[3, 4]` → booking (`GUESTS_ADDED`) |
| POST | `/bookings/{bookingId}/payments` | → `{ "sessionUrl": "https://checkout.stripe.com/…" }` |
| GET | `/bookings/{bookingId}/status` | → `{ "bookingStatus": "CONFIRMED" }` |
| POST | `/bookings/{bookingId}/cancel` | `CONFIRMED` bookings only |

```bash
TOKEN=<accessToken from login>
curl -X POST http://localhost:8080/api/v1/bookings/init \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"hotelId":1,"roomId":1,"checkInDate":"2026-11-01","checkOutDate":"2026-11-03","roomsCount":1}'
```

### Admin (`Manager`)

| Method | Path | Body / notes |
|---|---|---|
| GET | `/admin/hotels` | your hotels |
| POST | `/admin/hotels` | `{ "name", "city", "photos": [], "amenities": [], "contactInfo": { "address", "phoneNumber", "email", "location" } }` → `201`; the hotel starts **inactive** |
| GET / PUT / DELETE | `/admin/hotels/{hotelId}` | PUT takes the same body as POST; DELETE fails with `409` if bookings exist |
| PATCH | `/admin/hotels/{hotelId}/activate` | generates inventory and makes the hotel searchable; `409` if already active |
| GET | `/admin/hotels/{hotelId}/bookings` | bookings of the hotel |
| GET | `/admin/hotels/{hotelId}/reports` | optional `startDate`, `endDate` → `{ bookingCount, totalRevenue, avgRevenue }` |
| GET / POST | `/admin/hotels/{hotelId}/rooms` | POST body: `{ "type", "basePrice", "photos", "amenities", "totalCount", "capacity" }` |
| GET / PUT / DELETE | `/admin/hotels/{hotelId}/rooms/{roomId}` | PUT takes the same body as POST |
| GET | `/admin/inventory/rooms/{roomId}` | per-day inventory |
| PATCH | `/admin/inventory/rooms/{roomId}` | `{ "startDate", "endDate", "surgeFactor" (≥ 1), "closed" }` |

### Webhook

| Method | Path | Auth |
|---|---|---|
| POST | `/webhook/payment` | `Stripe-Signature` header (called by Stripe, never by the frontend) |

### Frontend routes

`/` home · `/search` · `/signin` · `/signup` · `/hotels/:id` · `/hotels/:id/checkout` · `/payments/:bookingId/status` · `/me/profile` · `/me/booking-history` · `/me/travelers` · `/admin` · `/admin/hotels/create` · `/admin/hotels/:hotelId/{overview | bookings | edit | rooms | rooms/create | rooms/:roomId/edit | rooms/:roomId/inventory}`.

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `Could not resolve placeholder 'DB_PASSWORD'` (or `JWT_SECRET`, `STRIPE_*`) | The variable is not set in the shell that launches Maven. Run `set -a; source .env; set +a` in the same terminal. |
| `WeakKeyException` / key too short | `JWT_SECRET` has fewer than 32 characters. |
| `FATAL: database "airBnb" does not exist` | Create it with quotes: `CREATE DATABASE "airBnb"`, or change `DB_URL`. |
| `password authentication failed` | `DB_PASSWORD` / `DB_USERNAME` do not match the PostgreSQL user. |
| `Connection refused` on port 5432 | PostgreSQL is not running or uses another port; adjust `DB_URL`. |
| `Port 8080 was already in use` | Set `SERVER_PORT` and update `VITE_SERVER_BASE_URL` to match. |
| `app.cors.allowed-origins must list explicit origins` | `CORS_ALLOWED_ORIGINS` contains `*`. List exact origins. |
| Browser CORS error / blocked preflight | The page's origin is not in `CORS_ALLOWED_ORIGINS`. Scheme, host and port must match exactly (for example `http://localhost:5173`). |
| Frontend shows a network error | Backend not running, or `VITE_SERVER_BASE_URL` is wrong (it must end with `/api/v1`). Restart `npm run dev` after editing `.env`. |
| Signed out after about 10 minutes | The refresh cookie is not being sent. Check the allowed origins; for HTTPS or cross-site deployments set `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=None`. |
| Hotel not visible in search | It was not **activated**, the city text differs, or the dates are in the past. |
| Hotel opens but shows no rooms | No room is available for every selected day (booked out or closed). |
| Admin menu missing / `403` on `/admin/**` | The user lacks `HOTEL_MANAGER` ([grant it](#creating-a-hotel-manager)) or does not own that hotel. |
| Payment completes but status stays "processing" | The webhook is not reaching the backend. Run `stripe listen …` and make sure `STRIPE_WEBHOOK_SECRET` is the secret it printed. A bad signature returns `400`. |
| Error when creating the Stripe session | Invalid `STRIPE_SECRET_KEY`. |
| `409 Booking has already expired` | Payment must start within 10 minutes of creating the booking. |
| Backend test fails with connection or placeholder errors | `AirBnbAppApplicationTests` needs PostgreSQL and the required variables. |

## Deployment

1. Provision PostgreSQL with a dedicated database and user. After the first run, prefer `JPA_DDL_AUTO=validate` (or add real migrations); automatic `update` is not a migration strategy.
2. Build the JAR and run it behind HTTPS (reverse proxy or platform TLS). Required environment: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL` (public https URL of the SPA), `CORS_ALLOWED_ORIGINS` (same origin), `COOKIE_SECURE=true`, and `COOKIE_SAME_SITE=None` only if the SPA and API are on different sites.
3. Build the frontend with `VITE_SERVER_BASE_URL=https://<api-host>/api/v1` and host `frontend/dist` as static files with an `index.html` fallback.
4. In the Stripe Dashboard add a webhook endpoint `https://<api-host>/api/v1/webhook/payment` for `checkout.session.completed` and use its signing secret as `STRIPE_WEBHOOK_SECRET`. Use live keys only after testing in test mode.
5. Run a single backend instance, or review the scheduled jobs first: the expiry job (60 s) and the price refresh (hourly) have no distributed lock. **⚠️ Confirm** before scaling horizontally.

No Dockerfile, CI configuration or hosting-specific files exist in the project.

## Security notes

- **Never commit secrets.** `backend/.env` is git-ignored and the example files contain placeholders only. Earlier versions of `application.properties` contained hard-coded Stripe, JWT and database credentials. **Rotate any that were ever pushed**, because they remain in Git history.
- Card data never touches this application. Payment happens on Stripe-hosted Checkout, and confirmation relies solely on the verified webhook.
- CORS is restricted to configured origins and rejects `*`. CSRF protection is disabled because the API is stateless and authenticates with a bearer header. The refresh cookie is `HttpOnly`, limited to the path `/api/v1/auth`, with configurable `Secure` and `SameSite`.
- The access token lives in `localStorage`, which any script on the page can read; keep the frontend free of untrusted scripts.
- Refresh tokens are not rotated or revocable, and they share the signing key with access tokens (a leaked refresh token would be accepted as a bearer token). Consider adding a token-type claim and rotation.
- Server errors return a generic message; details are only logged.
- Swagger UI and `/v3/api-docs` are not behind authentication by default; restrict or disable them in production if you do not want them public. **⚠️ Confirm** after deployment.
- There is no rate limiting or account lockout on login.

## Known limitations

- **Unverified build and run:** see the status note at the top.
- **Billing is nights + 1** (inventory days from check-in through check-out, inclusive).
- **Holiday pricing is hard-coded** (`HolidayPricingStrategy` sets `isTodayHoliday = true`), so every price carries a ×1.25 factor.
- **Search does not check availability** and has no price/rating filter or sorting; a hotel can appear in results with no rooms for the chosen dates.
- Changing a room's base price or total count does **not** update inventory that already exists.
- Refreshing the checkout page creates another reservation (the earlier one expires after 10 minutes).
- Photos are URL strings; there is no upload.
- `package-lock.json` is not committed, so frontend dependency versions are not pinned.
