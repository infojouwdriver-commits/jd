# Native driver UX contract

## Product context

Android driver app; Arabic RTL, French, Dutch and English; system native input
and safe areas; Brussels trip timestamps. Accessibility target: WCAG 2.2 AA
principles applied to native controls. Native device acceptance remains required.
Portal parity expansion authorized 2026-10-17: profile/company data, selected
vehicle, bounded filtered history and gross completed-trip reporting. Trip
lifecycle, invoice persistence and push contracts remain authoritative.

## Business-context sources

| Domain / scope | Authoritative source | Source type | Reviewed date |
|---|---|---|---|
| Driver ownership and sessions | driver-app/src/api.ts; src/lib/security-policy.ts | API and server permission policy | 2026-10-16 |
| Trip completion and recovery | driver-app/src/useTripController.ts; driver-app/README_AR.md | Domain implementation and maintained contract | 2026-10-16 |
| Push opt-in and delivery acknowledgement | driver-app/src/experience/push.tsx; driver-app/src/push-lifecycle.ts | Runtime contract | 2026-10-16 |
| Message mutation and paging | driver-app/src/api.ts; driver-app/src/experience/inbox.tsx | API contract | 2026-10-16 |
| Privacy and location | driver-app/README_AR.md; src/app/privacy-policy | Maintained policy implementation | 2026-10-16 |

## Visual contract

DESIGN.md documents the accepted native design. Runtime tokens.ts remains
canonical; preferences.tsx adapts themes; ui.tsx, motion.tsx and NavigationBar.tsx
are the shared consumers. No changes apply to web admin or marketing.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Form | experience/ui.tsx Field and Button | Existing API and controller validation | Native TextInput, masked password, multiline | typecheck and synthetic form workflows |
| Select/Listbox | experience/ui.tsx Choice | preferences and trip controller | Labeled native Pressable radio choices | keyboard/touch QA and saved preference reload |
| Scrollbar | experience/ui.tsx Screen | Native ScrollView | Platform-owned scrollbar | narrow-screen scroll and no clipped controls |
| Toast | experience/ui.tsx Notice and Loading | Error/status owned by the caller | Persistent inline status, error and busy | loading/error/empty synthetic fixtures |
| CRUD | experience/session.tsx, Trips.tsx, Messages.tsx, ActiveTrip.tsx | Driver API and trip controller | Existing create/reply/refresh/load-more flows | existing unit tests and visual-review workflows |
| Date | experience/ActivityFilters.tsx and activity-filters.ts | Brussels civil dates; server driver-activity.ts | Typed YYYY-MM-DD with localized format guidance; no calendar popup | DST boundaries, invalid ranges and draft/apply tests |

No table selection or calendar popup is introduced. Typed dates are Gregorian,
inclusive from/through dates; the server converts them to a half-open Brussels
instant range with DST. Range maximum is 366 elapsed days. Today, rolling seven
days, calendar month-to-date and year-to-date are explicit presets. Trips and
revenue reuse committed date/platform state; status filters apply only to trips.
Filter editing does not request data until Apply. Applying/resetting clears paging.
Stale requests cannot replace a newer query. Native session memory overrides URL
persistence: no financial records or profile PII are stored in route parameters or
disk caches. Revenue excludes unfinished trips and reports gross prices only.
All pages are self-scoped on the server, including administrator sessions. Reports
scan bounded 1000-row batches and reject oversized requests instead of silently
returning a partial total. Vehicle choice uses current_vehicle_id first and the
existing active/pending-trip guard. Preference, logout and password flows remain
on Settings.

## Navigation and state

Five persistent destinations: home, trips, revenue, messages and profile.
Settings is a child of profile and preserves its existing account/security forms. Active trip and
notifications stay outside the primary tab list. Use tabPress/tabLongPress events;
never route around a prevented navigation event. Notifications are reachable
from the labeled home bell. The bottom bar reserves its own space and safe inset.
Current local form/back behavior and trip action guards remain unchanged.
No route parameters contain credentials, message bodies or trip payloads.

## Component and async behavior

Buttons are semantic, disabled while their existing operation is busy, and show
progress without widening. Native fields retain labels, autofill and password
masking. Loading does not invent totals or remove recovery controls. Data lists
retain the API's explicit load-more behavior. Inline errors retain input and
expose retry/refresh. In-flight replies still use the existing generation guard.
Queued trip completion and logout protection remain owned by the trip controller.

## Flow ledger

| Operation | Trigger | Pending | Success destination | Success feedback | Failure recovery | Focus outcome | Source ref |
|---|---|---|---|---|---|---|---|
| Start trip | Main trip action and existing trip form | Existing busy lock | Active trip | Real trip metrics | Existing error and retained fields | Existing native flow | useTripController.ts |
| End trip | Explicit end + native confirmation | Existing busy lock | Receipt in active screen | Server receipt / separate Chiron state | Retained pending trip and retry | Native confirmation restoration | ActiveTrip.tsx |
| Send/reply | Explicit send | Disabled send and loading | Existing thread/list | Updated real thread | Inline error, retained text | Composer stays reachable | Messages.tsx |
| Load more | Explicit button | Existing busy lock | Same list | Appended deduplicated rows | Refresh/error | Button remains in list | Trips.tsx |
| Enable push | Explicit user action | Push provider busy | Same screen | Registration status | Inline error | Same screen | push.tsx |
| Test push | Explicit delayed test | Queued state | Same screen / notification tap | Received only after acknowledgement | Existing queue/error state | Fixed internal destination | push-lifecycle.ts |

## Verification

Run driver lint, TypeScript, unit tests, visual-review and the native Android
workflow. Synthetic visual QA covers narrow RTL/LTR screens, both themes,
preference persistence, loading/empty/error, navigation controls, message forms,
notification opt-in UI and reduced-motion behavior. Native Mapbox, GPS, physical
push delivery and TalkBack are not proven by browser fixtures.

## Portal parity evidence and drift · 2026-10-17

| Prior rule | Evidence / new user requirement | Resolution |
|---|---|---|
| Lime/petrol native palette | User asks for closer portal design; portal uses navy/gold | Canonical tokens updated to navy/gold; light icons use dark gold for contrast |
| Four destinations and settings-only account | Portal has profile/company/vehicle and Revenus | Five destinations; Profile and Settings separated |
| First loaded-page revenue | User expects organized period reporting | Authenticated activity endpoint supplies full-period gross totals; pagination stays independent |

Sources: src/components/driver/DriverProfilePage.tsx, src/app/driver/trips/page.tsx,
src/app/driver/summary/page.tsx, src/lib/driver-activity.ts and existing vehicle
controller/API. Verification: driver-activity unit and native API tests, real HTTP
integration over simulated PostgREST (1031 trips), and portal-parity browser QA.

## Reliability revision · 0.2.7

Phone push is temporarily paused at the user's request after repeated activation
failures. The provider never requests notification permissions, obtains tokens,
restores opt-in, subscribes token listeners or queues tests. It stores local opt-out
and attempts to revoke only an existing installation; failure is isolated from
session/trips/reports/logout. Messages and the in-app notification inbox continue.
The phone-push panel explains this state and exposes no unusable activation action.
A previously registered phone's OS delivery may continue if server revocation is
unreachable; no successful revocation is claimed without server confirmation.

Live verification on 17 October found `/drivers/activity` returned 404 because
the tested reporting backend was not deployed. Deployment must complete before
0.2.7 is accepted. The two report screens distinguish a missing backend, session
expiry, forbidden access, transport timeout/offline, and report-server failure.
No fallback may silently sum one loaded page into a period total. A non-JSON proxy
response is a server error, not an assertion that the phone has no Internet.
Startup shows the app-owned JourneyLoading only while preferences/session are
pending. There is no fake progress, welcome timer or blocking animation. Error
and login recovery remain reachable after the real request settles.

## Web company onboarding scope — 17 October 2026

| Capability | Canonical owner | Observable contract |
|---|---|---|
| Locale and direction | LanguageContext + registration/copy.ts | Arabic RTL, French/Dutch LTR; labels stay visible |
| Fields and actions | ui/Input, Label, Button | Mask secrets; inline validation; single-flight submission |
| Dialog and discard | ui/Dialog + ui/AlertDialog | Trapped focus, Escape guards dirty data, confirmation above form |
| Registration | CompanyRegistrationDialog + company-registrations POST | Five steps; review excludes secrets; no storage or URL credentials |
| Pending lifecycle | security_submit_company_registration | One atomic record group, inactive accounts/vehicle/subscription until review |
| Retry | request UUID + server HMAC fingerprint | Uncertain response freezes payload; same request safely retries |
| Administration | CompanyRegistrationApprovals + authenticated GET/PUT | Admin MFA authority; filters/pagination; explicit approve/reject with notes |
| Activation | security_review_company_registration | Atomic decision; changed ownership conflicts; no production Chiron switch or payment |

Required identity collisions reject the whole request, never attach a new user
to an existing tenant. Passwords are hashed and Chiron secrets encrypted before
persistence. Browser roles cannot read the registration ledger or execute its
functions. Server responses and administrator summaries exclude credentials.
On success clear secrets, show request reference and actual decision status.
Known errors preserve editable fields; uncertain responses preserve a frozen
retry. Cancel confirms loss of unsent data. Reject requires an administrator
reason. Approval leaves Chiron TEST pending separate production acceptance.

## Company lifecycle and billing extension (2026-10-18)

The approved company business scope is maintained in docs/COMPANY_PLATFORM_CONTRACT.md. Web operations behavior, canonical owners and verification are maintained in docs/OPERATIONS_UX.md. A billing reminder never blocks native or web trip work. Driver notices are generic and dismissible, suppressed during active trips; failures are isolated from authentication and trip synchronization. Home distinguishes durable local trip storage, pending server confirmation, and server receipt; Chiron delivery remains a separate state. Native API errors distinguish timeout, uncertain transport and server response rather than asserting an Internet outage.

## Contract-backed website subscriptions — 2026-10-18

The confirmed offer and lifecycle are in docs/COMPANY_PLATFORM_CONTRACT.md;
observable flow is in docs/OPERATIONS_UX.md. Canonical owners remain
LanguageContext, UI Checkbox/Label, OperationForm, ContractDocument and BillingPanel.
OperationForm's business variant adds mandatory true consent, a document review
slot and explicit signing label. No second form/retry/modal system is introduced.
Server-side company membership and SQL locks authorize signing; frontend controls
only present that authority. Signing never sends mail, charges a payment method,
or claims real invoice delivery. Signed records and financial evidence are immutable.

## Explicit web driver shifts — 19 October 2026

The web portal now has `/driver/shifts`, linked from the shared driver header.
The authenticated driver, selected active company vehicle, and server clock own
the declaration. No GPS points, inferred kilometres, retrospective shifts,
financial writes, or native application changes are introduced. The existing
latest-position fleet sharing remains separate from the service ledger.

The canonical form is `OperationForm`, using shared Input, Label, Button, Select
and Dialog. Its optional numeric step supports two decimal kilometre inputs;
existing integer forms keep their validation. LanguageContext owns Arabic RTL,
French and Dutch; existing `dp-*` tokens own both themes. The report signature
is the actual chronological declaration ledger. The PDF button generates a real downloadable PDF from the selected declaration
snapshot. Its document labels and Belgian dates are always Dutch, independently
of portal language. Unicode fonts, all event pages, provisional status and
last-recorded state durations are preserved. Download is disabled while preparing;
failures show a localized retry message. No browser print dialog is required. This is an explicit driver declaration, not a
claim of municipal certification or a reconstruction of earlier vehicle motion.

| Operation | Pending and success | Recovery |
| --- | --- | --- |
| Start | Explicit odometer; passenger total starts at zero; selected vehicle and identity snapshots stored | Same request UUID replays; another open driver/vehicle shift conflicts |
| Record | Odometer, cumulative passenger km and next state saved together with server time/version | No decreases; passenger increment cannot exceed odometer increment; conflict requires refresh |
| End | Explicit final readings; blocks while a trip is in progress; closes immutable event history | Same uncertain request can replay; no automatic end on logout or GPS loss |
| View | Driver's own history, 25 shifts per page, full selected ledger | Stale requests cannot replace newer state; retain inputs and expose refresh errors |
| Download Dutch PDF | Declared start/end counters, distances, state intervals and open/closed label | Open reports are provisional; state durations stop at last recorded event |

The optional business error formatter on OperationForm explains invalid readings
and stale-shift conflicts. Uncertain outcomes keep the exact UUID, values, shift
identity and expected version in session memory, scoped by authenticated user;
closing and reopening the form retries the same declaration. The database
serializes driver requests and vehicle allocation and is authoritative over UI
state. Closed events cannot be updated/deleted by the browser or service role.

Verification: `tests/driver-shifts.test.mjs` (PostgreSQL WASM),
`tests/run-driver-shifts-ui.mjs` (three locales, two themes, narrow layout,
uncertain-response retry, reload, actual PDF downloads and printing), and the actual authenticated
handlers in `tests/run-auth-integration.mjs`. Native PostgreSQL migration is also
part of the existing release stack gate.


## Shift-first portal and activity — 19 October 2026

`DriverShiftWorkspace` uses the existing dp tokens and OperationForm. The portal
home starts with one odometer field; taximeter content waits for an active shift.
Profile, history and messages remain accessible. A persistent work-status card
provides one-click pause/resume, a busy lock, localized failures, an idempotent
retry, focus refresh and a 20-second status refresh. A pause keeps the same shift
and never submits or changes a reading. An active trip blocks pause and closure.

The database owns `trips.shift_id`. New trips submitted to this system (meter or
external source) are attached only to an open matching driver/company/vehicle
shift whose start precedes the trip. Existing rows, historical periods and closed
shifts are not backfilled. Real-time starts/completions change work status;
offline completed submissions add trip activity without overwriting the driver's
current break. Replayed saves do not duplicate activity. Platforms which submit
no trip to this system cannot be detected by browser/GPS speculation.

Immutable activity records contain timestamps, state, trip ID and submitted
source, separately from the explicit counter ledger. PDF and screen include both;
state minutes use recorded status changes through the last recorded event.
Trip kilometres never alter declared odometer/passenger totals.

The shift PDF remains separate from customer receipts. Customer invoice generation,
PDF layout and receipt snapshots are unchanged. New shifts snapshot company contact
and tax identifiers, driver card and vehicle identifier for the service document.
Existing shifts keep their original snapshots; missing fields display a dash.
The report includes actual linked completed-trip counts and payment totals grouped
by original currency; unknown payment methods and missing prices are explicit.

Acceptance: `tests/shift-activity.test.mjs` covers owner isolation, idempotency,
real trip source linking, unchanged counters, pause conflicts, historical and
vehicle mismatch exclusions, separate unchanged customer receipts and immutable activity.
The six-locale/theme UI regression starts from home, pauses/resumes across reload,
and downloads the Dutch service sheet. Auth integration exercises the real
status endpoint and rejects counter injection.

The portal's durable local trip journal publishes passenger status with the
completion UUID, retries after reload/online and does not block or discard a
locally saved trip when publication fails. The matching completed-trip insert
clears that state atomically. A replayed start cannot reopen passenger status
after completion. Pausing/closing while that state is active is rejected. A
legacy local trip beginning before the selected shift is not relabelled.


## Standalone Dutch service PDF — reference fields, original design

The service PDF uses an A4 navy/gold header, compact identity fields, kilometre
cards, recorded driving/available/break/total times, completed-trip/activity counts,
and payment totals separated by currency and known payment method. The next pages
contain repeat-header tables of explicit readings and recorded trip/status activity.
The reference photo informs fields only; its company values and thermal layout
are not copied. Missing historic identity snapshots are not filled from current
profiles. Customer invoice source, snapshot RPC and PDF remain unchanged.

Closing a shift freezes its count and currency-separated payment summary. Later
changes to trip metadata cannot rewrite a previously closed service report.

## Native shift parity · 0.3.0

Native ShiftProvider owns refresh, pending declaration replay and operation state;
ShiftCard and Shifts use the established native ui primitives and session action
gate. The existing /drivers/shifts API and SQL functions own tenant/driver isolation,
versions, status transitions, explicit readings, immutable activity and trip links.
The new read-only /drivers/shifts/pdf endpoint reuses driverShiftPdf and the same
user-scoped snapshot. It never calls invoice generation or writes financial data.

| Operation | Pending/success | Recovery | Source |
| --- | --- | --- | --- |
| Start native shift | Explicit odometer; same request/shift UUID; server receipt | SecureStore intent, exact replay on uncertain transport | security_record_driver_shift |
| Pause/resume | No counters sent; same shift retained; trip/action gate | Version conflict refresh; same UUID retry after restart | security_shift_status |
| Record/end | Explicit counters; no GPS inference; end requires native confirmation | Preserve fields, reject decreases, freeze uncertain payload | shift-model.ts + server declaration schema |
| Native trip | Open matching vehicle shift required for new trip; durable journal first | Restore existing trip; publish passenger status by completion UUID; completed insert clears matching state | native journal + security_record_trip_shift |
| History/PDF | 25-row pages; full selected activity ledger; Dutch PDF separate from customer receipt | Stale-response guard, retain selected ledger, retry share | security_driver_shifts + driverShiftPdf |

Logout never closes a shift. Phone push remains paused. Existing encrypted trip
storage, owner separation, GPS handling and completion receipts are preserved.
