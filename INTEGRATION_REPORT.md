# Integration report

**Read this first – verification status.** The sandbox used to do this work had **no network, no Maven
dependency cache, no PostgreSQL and no Docker**. Therefore the backend was **never compiled or started**, the
frontend was **never installed, built or linted with its real toolchain**, and **no end-to-end flow (signup →
booking → Stripe) was executed**. Everything below marked ✅ was actually run; everything marked ⚠️ was reasoned
from the source and still needs you to run it. Section 5 lists the exact commands to do so.

---

## 1. Backend ↔ frontend mismatches found (source was the authority)

| # | Mismatch | Effect before | Fix |
|---|---|---|---|
| 1 | `GET /hotels/search` and `GET /hotels/{id}/info` read their parameters from a **request body** | Browsers cannot send a body with GET → search and hotel details impossible | Backend now binds **query parameters** (`@ModelAttribute`) |
| 2 | CORS allowed only `localhost:3000`, no `PATCH`, and was **not wired into Spring Security** | Pre-flight to `/users/**`, `/bookings/**`, `/admin/**` rejected; PATCH (profile, inventory, activate) blocked | `CorsConfigurationSource` bean + `http.cors()`, configurable origins, all needed methods, credentials, `*` rejected |
| 3 | `frontend.url` was `http://localhost:8080` (the backend itself) | Stripe returned users to the API, not the app | `FRONTEND_URL` env var, default `http://localhost:5173` |
| 4 | Secrets (Stripe secret + webhook secret, DB password, JWT key) were **hard-coded in `application.properties`** | Credentials in source control | All moved to env vars, no defaults; `.env.example` added; `.env` git-ignored. **Rotate the committed keys.** |
| 5 | `HotelMinPriceRepository` declared `@Param roomsCount/dateCount` that the query never uses | Spring Data rejects unused named params at startup → app may not boot | Unused params removed (search semantics unchanged) |
| 6 | `BookingDto` had no hotel/room/user | Checkout crashed on `booking.hotel.photos`; history & admin tables had no names | `BookingDto` now includes `hotel`, `room`, `user` (explicit, proxy-safe mapping) |
| 7 | `UserDto` had no `roles` | Frontend `isAdmin()` threw; admin UI unreachable | `roles` added to `UserDto` |
| 8 | Frontend called `/bookings/{id}/removeGuests`, `/auth/logout` – **neither existed** | 404s | Guests: `addGuests` now *replaces* the list (add **and** remove); `POST /auth/logout` added (clears the HttpOnly cookie) |
| 9 | Frontend `useQuery` fired `POST /bookings/init` from an effect | Every re-mount reserved inventory again | Booking is created once via a guarded mutation |
| 10 | Error interceptor read `error.message` without checking `error` exists; unhandled exceptions produced `{data:{status:500…}, error:null}` | Secondary `TypeError`, no usable message | Interceptor rewritten; backend `GlobalExceptionHandler` now returns a proper `error{status,message,subErrors}` for 400/401/403/404/409/500; `UnAuthorisedException` (was 500) → 403 |
| 11 | Missing auth on protected route returned an empty 403 | Frontend could not tell "log in" from "forbidden" | `AuthenticationEntryPoint` → 401 JSON |
| 12 | Hard-coded 2 s delay in `useQuery` | Slow UI | Removed |
| 13 | Fake content: OYO description, ratings, "1k+ booked", savings, strike-through prices, hospital distance, check-in times, cancellation dates, fake user "Anuj Kumar Sharma", default placeholder photos | Presented as facts | Removed or replaced by real backend data |
| 14 | Search page star/price filters and sort did nothing (backend has no such feature) | Dead UI | Removed; documented as gap |
| 15 | Hotels were created inactive and no UI could activate them | No hotel could ever appear in search | "Activate hotel" action added (+ backend now refreshes the hotel's search prices immediately instead of waiting for the hourly job) |
| 16 | Edit Room page was an empty stub; photo "upload" input did nothing | — | Real edit form (PUT); photos are URL strings (the backend has no upload endpoint) |
| 17 | Various runtime bugs: undefined `ERROR_FALLBACK` (×3), undefined `err` in profile form, `useAddTraveler(boolean)` instead of object, `error.message` on a string, `data.length &&` rendering `0`, crashes on empty rooms/photos | Error paths threw | Fixed (✅ found by static check, see §4) |

**Response convention** (checked, no change needed): backend wraps every body as `{timeStamp, data, error}`;
the Axios interceptor returns that envelope; hooks read `response.data` **once**. The "double unwrap" suspicion
does not apply to this backend – it is documented in `axios-instance.js`.

## 2. Backend bugs fixed because they break the booking lifecycle

* **Reservations never expired** (`EXPIRED` was never set; `reservedCount` leaked forever). New
  `BookingExpiryService` (every 60 s): `RESERVED`/`GUESTS_ADDED` > 10 min and `PAYMENTS_PENDING` > 35 min are set to
  `EXPIRED` and their reserved rooms released under the existing pessimistic lock. Stripe sessions now expire after
  30 min so a customer paying legitimately is never expired underneath.
* `initiatePayments` accepted **any** booking state (a `CONFIRMED` booking could be reset to `PAYMENTS_PENDING`). Now only
  `GUESTS_ADDED` (or `PAYMENTS_PENDING` for a retry – the previous Stripe session is closed first).
* Stripe webhook was **not idempotent** – a redelivered event would confirm twice and corrupt inventory counts. Now ignored
  if already `CONFIRMED`; only `payment_status=paid` confirms; events from a different Stripe API version are deserialised
  with the safe fallback; bad signature → 400.
* `cancelBooking` inventory release had the wrong condition (`total-booked >= n`) and silently did nothing for fully booked
  days; it also locked the wrong rows. Fixed (`bookedCount >= n`, lock whole range). Refund failure now rolls back with a clear 409.
* `addGuests` allowed attaching **another user's guest ids** (data leak). Ownership is now verified; ≥1 guest required.
* `initialiseBooking` did not validate dates (past / checkout ≤ checkin) or that the room belongs to the hotel. Now validated.
* `loadUserByUsername` returned `null` (→ odd 500/401); now `UsernameNotFoundException` (→ generic "Bad credentials").
* `/auth/refresh` NPE'd without cookies (500) → 401. Refresh cookie now `HttpOnly`, `Path=/api/v1/auth`, `SameSite`, `Secure` (configurable), 180 days.
* Deleting a hotel failed after activation (FK from `hotel_min_price`) → those rows are removed first.
* Search city match is now case-insensitive. Bean validation added to all request DTOs (`@Valid`).

## 3. Endpoint compatibility map (final, verified against controllers)

All paths relative to `http://localhost:8080/api/v1`. Auth = `Bearer <accessToken>`.

| # | Operation (frontend) | Method + endpoint | Request | Response `data` | Auth |
|---|---|---|---|---|---|
| 1 | Sign up | `POST /auth/signup` | `{name,email,password(8-72)}` | `UserDto` | none |
| 2 | Log in | `POST /auth/login` | `{email,password}` | `{accessToken}` + `refreshToken` HttpOnly cookie | none |
| 2 | Log out | `POST /auth/logout` *(new)* | – | 204, clears cookie | none |
| 3 | Refresh | `POST /auth/refresh` | cookie | `{accessToken}` | cookie |
| 4 | Profile get / update | `GET` / `PATCH /users/profile` | `{name,dateOfBirth,gender}` | `UserDto` (+`roles`) | user |
| 5 | Hotel search | `GET /hotels/search?city&startDate&endDate&roomsCount&page&size` | query | `Page<HotelPriceResponseDto>` (`content,totalElements…`) | none |
| 6–7 | Hotel details + rooms/availability | `GET /hotels/{id}/info?startDate&endDate&roomsCount` | query | `{hotel, rooms[{…,price}]}` | none |
| 8 | Init booking | `POST /bookings/init` | `{hotelId,roomId,checkInDate,checkOutDate,roomsCount}` | `BookingDto` (`RESERVED`) | user |
| 9 | Set guests (add/remove) | `POST /bookings/{id}/addGuests` | `[guestId,…]` (replaces list) | `BookingDto` (`GUESTS_ADDED`) | owner |
| 10 | Booking history | `GET /users/myBookings` | – | `BookingDto[]` | user |
| 11 | Payment session | `POST /bookings/{id}/payments` | – | `{sessionUrl}` | owner |
| 12 | Status (polled) | `GET /bookings/{id}/status` | – | `{bookingStatus}` | owner |
| 12 | Confirmation | `POST /webhook/payment` (Stripe → backend, signed) | Stripe event | 204 | signature |
| 13 | Cancel + refund | `POST /bookings/{id}/cancel` | – | 204 | owner, `CONFIRMED` only |
| 14 | Saved travellers | `GET/POST /users/guests`, `PUT/DELETE /users/guests/{id}` | `{name,dateOfBirth,gender}` | `GuestDto` | user |
| 15 | Hotels | `GET/POST /admin/hotels`, `GET/PUT/DELETE /admin/hotels/{id}`, `PATCH /admin/hotels/{id}/activate` | `HotelDto` | `HotelDto` | `HOTEL_MANAGER` + owner |
| 16 | Rooms | `GET/POST /admin/hotels/{h}/rooms`, `GET/PUT/DELETE …/{roomId}` | `RoomDto` | `RoomDto` | manager + owner |
| 17 | Inventory | `GET/PATCH /admin/inventory/rooms/{roomId}` | `{startDate,endDate,surgeFactor,closed}` | `InventoryDto[]` / 204 | manager + owner |
| 18 | Admin bookings | `GET /admin/hotels/{id}/bookings` | – | `BookingDto[]` | manager + owner |
| 19 | Report | `GET /admin/hotels/{id}/reports?startDate&endDate` | query | `{bookingCount,totalRevenue,avgRevenue}` (CONFIRMED only) | manager + owner |

Booking states used (from the enum): `RESERVED → GUESTS_ADDED → PAYMENTS_PENDING → CONFIRMED`, plus `CANCELLED`, `EXPIRED`.
Payment is only ever shown as successful when `GET …/status` returns `CONFIRMED`; returning from Stripe proves nothing.
Polling: every 3 s, max 20 attempts, stops on `CONFIRMED/CANCELLED/EXPIRED`, on 401/403/404, and on unmount;
a timeout shows "still waiting – check My Bookings", **not** "payment failed".

## 4. Files changed

**Backend** – `application.properties`, `.env.example`, `.gitignore`; `config/CorsConfig`; `security/{WebSecurityConfig,JWTAuthFilter,AuthService}`;
`advice/GlobalExceptionHandler`; `controller/{Auth,HotelBrowse,HotelBooking,Hotel,RoomAdmin,Inventory,User,Webhook}Controller`;
`dto/*` (validation; `BookingDto`, `UserDto`); `repository/{HotelMinPrice,Inventory,Booking}Repository`;
`service/{Booking,Checkout,Hotel,Inventory,User}ServiceImpl`, `PricingUpdateService`, **new** `BookingExpiryService`.
No entity/schema change → no migration.

**Frontend** – new: `lib/api-error.js`, `lib/single-flight.js`, `lib/__tests__/api-client.test.js`, `hooks/use-stay-params.js`,
`components/photo-url-input.jsx`, `app/admin/room-form/*`, `app/settings/booking-history/cancel-booking.jsx`, `.env.example`.
Rewritten: `lib/axios-instance.js`, `lib/hooks/{useQuery,useMutation}.js`, `lib/providers/{auth,admin}-context-provider.jsx`,
`config/{api,payment,app}.config.js`. Updated: auth forms/hooks, search (page, form, hotel card, pagination), hotel-details (all),
checkout (all), payments page + polling, settings (history, profile, travellers, sidebar), admin (hotels, create/edit hotel, overview,
rooms, create/edit room, inventory, bookings). Removed: dummy-data file, hard-coded policy component, non-functional filter/sort
components, duplicate `use-sign-up-form copy.jsx`.

## 5. Verification

### Actually executed ✅
| Command | Result |
|---|---|
| `node --test src/lib/__tests__/*.test.js` (`npm test`) | ✅ 6/6 pass – error normalisation (incl. missing `error` object, timeouts, network), single-flight refresh |
| Custom static checker over all 152 frontend files (TypeScript parser: JSX syntax + undefined identifiers; import/export resolution) | ✅ 0 problems. Same checker on the **original** frontend: 5 real defects (undefined `ERROR_FALLBACK` ×3, undefined `err` ×2) |
| `javac -proc:none` over `src/main/java` | ✅ **no syntax errors**. (Type errors cannot be detected because Spring/Lombok jars are unavailable – this is a parse check only) |

### NOT executed ⚠️ (blocked: no network / DB / Stripe)
`./mvnw clean verify`, application start-up (Spring Data query validation, ModelMapper), PostgreSQL connectivity, `npm install`,
`npm run build`, `npm run lint`, any browser test, any call to a running API, Stripe Checkout, webhook delivery, refunds, role checks.
The pre-existing `AirBnbAppApplicationTests.contextLoads` needs PostgreSQL + the env vars; I did not alter or add backend tests
because I could not run them.

### Run this to close the gap
```bash
cd backend  && set -a && source .env && set +a && ./mvnw clean verify      # compile + tests (needs Postgres)
cd frontend && npm install && npm run lint && npm run build && npm test
# then manually: sign up → promote to HOTEL_MANAGER (README) → create hotel → add room → Activate →
# search (as guest) → book → add guest → pay (4242…) with `stripe listen` running → status CONFIRMED → cancel → refund
```
If `mvnw` reports a compile error, it will be in a file listed in §4 – please send me the message and I will fix it.

## 6. Remaining gaps / known issues (not hidden)

1. **Unverified build/runtime** – see §5. Treat this as a careful, reviewed patch, not a tested release.
2. **Rotate secrets**: the supplied `application.properties` contained a Stripe test secret key, a webhook secret, a DB password and a JWT key. They are removed from the code but remain in git history/any public repo. Rotate them.
3. **No way to become `HOTEL_MANAGER` through the app** (by design of the backend); use the SQL in the README.
4. **Billing counts nights + 1.** The backend charges every calendar date from check-in **through check-out inclusive** (`DAYS.between + 1`). The UI estimates use the same rule and label it "estimated", but this looks like a business-rule bug in the original backend (1 night = 2 charged days). I did not change it because it also drives inventory consumption – please decide.
5. **`HolidayPricingStrategy` is hard-coded to `isTodayHoliday = true`**, so every price is ×1.25 (original code, unchanged). Search/detail prices are estimates; the booking `amount` is authoritative.
6. **Search does not check availability** (it reads the precomputed `hotel_min_price` table) and has **no price/rating filter or sort**; the details page shows only rooms actually available. A hotel can therefore show in search with no rooms for the dates. A proper fix is an `EXISTS` availability sub-query in the search JPQL – I did not add an untested query that is validated at startup.
7. Editing a room's base price / total count does **not** propagate to inventory that already exists (original TODO in `RoomServiceImpl`); the edit form says so.
8. Hotels have no description or rating in the backend; the UI shows only real fields (name, city, address, amenities, contact, photos).
9. Refresh tokens are not rotated or revocable (stateless JWT); `logout` clears the cookie but an already-issued access token lives ≤10 min. A refresh token is also accepted as a bearer token because both share a key and have no `type` claim – worth hardening.
10. A page refresh on the checkout page creates a second booking (the first expires after 10 min and is released by the new expiry job).
11. Gender options in the UI are MALE/FEMALE; backend also supports OTHER.
12. Stripe customers are created per payment attempt (original behaviour).
13. `package-lock.json` was not supplied; `npm install` resolves current compatible versions.
