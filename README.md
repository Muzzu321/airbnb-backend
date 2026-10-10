# Hotel Booking – integrated full-stack app

* `backend/`  – Spring Boot 4 / Java 21 / PostgreSQL / JWT / Stripe (context path `/api/v1`, port 8080)
* `frontend/` – React 19 / Vite / Tailwind (dev server on http://localhost:5173)

See **INTEGRATION_REPORT.md** for the API map, every change, what was verified and what was not.

## 1. PostgreSQL

```bash
# Linux/macOS (adapt for your install). Docker alternative:
docker run --name airbnb-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16

psql -U postgres -h localhost <<'SQL'
CREATE USER airbnb_user WITH PASSWORD 'change-me';
CREATE DATABASE "airBnb" OWNER airbnb_user;
SQL
```

There are **no Flyway/Liquibase migrations** in the project. Hibernate creates/updates the tables on startup
(`JPA_DDL_AUTO=update`, the project's existing behaviour). No schema change was made by this integration.

## 2. Backend

```bash
cd backend
cp .env.example .env          # then edit: DB_PASSWORD, JWT_SECRET (>=32 chars), STRIPE_* 
set -a; source .env; set +a   # load variables into this shell (Spring does not read .env itself)
./mvnw spring-boot:run        # -> http://localhost:8080/api/v1  (Swagger: /api/v1/swagger-ui/index.html)
```

Required variables: `DB_PASSWORD`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
The app refuses to start if one is missing (no secret has a default).

### Stripe (test mode)
```bash
stripe login
stripe listen --forward-to localhost:8080/api/v1/webhook/payment
# copy the printed whsec_... into STRIPE_WEBHOOK_SECRET and restart the backend
```
Pay with test card `4242 4242 4242 4242`, any future expiry, any CVC. A booking only becomes
`CONFIRMED` when the signed webhook arrives – without `stripe listen` running, payments will
stay "waiting for confirmation".

### Creating a hotel manager (admin) account
Signup always creates a `GUEST`. There is intentionally no self-service upgrade. After signing up in the UI:
```sql
-- verify names first with:  \d app_user_roles
INSERT INTO app_user_roles (app_user_id, roles)
SELECT id, 'HOTEL_MANAGER' FROM app_user WHERE email = 'you@example.com';
```
Log out and in again. The "Admin" entry appears in the account menu. Then: create hotel → add rooms →
**Activate hotel** (this generates a year of inventory and makes it searchable).

## 3. Frontend

```bash
cd frontend
cp .env.example .env          # VITE_SERVER_BASE_URL=http://localhost:8080/api/v1
npm install                   # no lockfile was supplied, so this resolves current versions
npm run dev                   # http://localhost:5173
npm run build && npm run lint && npm test
```

## Production notes
* `CORS_ALLOWED_ORIGINS` must list your real https origin(s); wildcards are rejected at startup.
* Serve over HTTPS and set `COOKIE_SECURE=true`. If frontend and API are on different *sites*, also `COOKIE_SAME_SITE=None`.
* `FRONTEND_URL` must be the public frontend URL (Stripe redirects back to it).
* Rotate any Stripe/DB/JWT secrets that were previously committed (see report).
