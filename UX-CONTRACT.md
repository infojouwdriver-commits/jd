# Native driver UX contract

## Product context

Android driver app; Arabic RTL, French, Dutch and English; system native input
and safe areas; Brussels trip timestamps. Accessibility target: WCAG 2.2 AA
principles applied to native controls. Native device acceptance remains required.
Visual-only redesign: no authorization, money calculation, trip lifecycle,
message delivery or storage-policy changes.

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

Table selection and date picking are not part of this native app change.
Formatting a trip timestamp is not a new calendar control.

## Navigation and state

Four persistent destinations: home, trips, messages and account. Active trip and
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
