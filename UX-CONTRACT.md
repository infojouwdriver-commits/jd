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
