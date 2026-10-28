---
version: alpha
name: JOUW DRIVER mobile
description: A navy and gold driver workspace aligned with the driver portal, with profile, trips and revenue.
colors:
  primary: "#E0BD5B"
  on-primary: "#302408"
  dark-background: "#0B1423"
  dark-surface: "#142238"
  light-background: "#F5F3ED"
  light-surface: "#FFFFFF"
  hero: "#101E33"
  hero-text: "#F2F7F8"
  light-icon: "#765514"
typography:
  body:
    fontFamily: "system-ui, sans-serif"
  data:
    fontFamily: "Menlo, monospace"
rounded:
  card: "20px"
  control: "16px"
  chip: "10px"
spacing:
  page: "20px"
  section: "24px"
  card: "20px"
components:
  button: {}
  card: {}
  navigation: {}
  route-art: {}
---

# JOUW DRIVER mobile design

## Overview

The native Android app is a driver cockpit for starting and completing trips,
checking messages and managing the assigned vehicle. The product serves Belgian
operations, as established by `driver-app/README_AR.md` and its Brussels trip
history contract. Arabic, French, Dutch and English are supported. No Japan
market or Japanese-language scope is implied.

On 17 October 2026 the user requested parity with the driver portal. Adopt its
navy and gold language through the canonical runtime palette. The native app now
organizes five destinations: home, trips, revenue, messages and profile. Driver
and company information and vehicle selection belong in profile; preferences
and account-security actions belong in a separate settings screen. The signature is a small
animated street route on the home trip card. It is decorative, never a real map,
GPS claim or progress indicator. Real navigation remains in DriverMap.

Runtime tokens remain canonical (Model B):
`driver-app/src/experience/tokens.ts` → preferences → shared UI and navigation.
This document mirrors accepted values; it does not generate a second theme.
The web administration and marketing site are outside this redesign.

## Colors

Primary is reserved for the main action, selected navigation, and route artwork.
On-primary provides action text. Hero stays navy in both themes. The full
semantic palette, including text, muted, borders, error and icon roles, is owned
by `palette.dark` and `palette.light` in tokens.ts. Light-theme icons use the
darker icon role; gold is not used for small informational text on white.
Error states contain an icon and readable text as well as a danger tone.

## Typography

Use native system sans for Arabic and Latin UI so text is available immediately,
without a network font swap. The runtime platform adapter uses System on iOS,
sans-serif on Android, and system-ui for web QA. Use the platform monospace
adapter (Menlo / monospace) only for plates, prices and timer values; mixed-script
labels stay in system sans. Display headings are 27–29px, body 16px, secondary
copy 12–14px. Arabic has a 1.55 line-height multiplier; Latin uses 1.45.
No constrained single-line heading may hide a long driver name or translation.

## Layout

Use the existing 20px page inset, 24px section rhythm and 20px card padding.
The main action appears before the vehicle and inbox. Native safe areas remain
owned by SafeAreaView and the bottom navigation's inset adapter. Each screen
owns one vertical ScrollView. The bottom navigation occupies normal layout
space, rather than floating above controls or the keyboard. At 360px all five
navigation labels remain visible; all controls are at least 44px tall.
Loading indicators reserve space and never replace a loaded data set with a
blank screen. No fabricated metrics or delivery claims are shown.

## Elevation & Depth

Use tonal layers and thin borders. Keep shadows out of operational cards;
active navigation receives an inset gold capsule rather than a large glow.
The hero is the only expressive surface. Avoid translucent blur, neon glows,
large gradients and motion behind a running trip meter.

## Shapes

Cards use 20px corners, controls 16px, and compact choices 10px. Vehicle plates
use a small utility label. Thin route connectors express origin and destination;
they are not a decorative timeline with invented steps.

## Components

The shared owner is experience/ui.tsx: Button, IconButton, Card, Field, Notice,
Loading, Label, Row, SectionHeading and RouteStops. Equivalent controls must
reuse these owners. NavigationBar owns the bottom navigation; Preferences owns
locale, theme and the user's motion setting.

Buttons have a stable 54px minimum height, pressed feedback, visible keyboard
focus, a disabled/busy state, and unchanged action labels. Fields keep their
native keyboard/autofill behavior, a persistent label and a visible focus border.
Notices are inline, announced politely, and keep critical recovery text visible.
The existing native trip-ending confirmation remains mandatory.

Motion is owned by experience/motion.tsx and tokens.ts: content enters over
320ms, staggered in 45ms increments capped at 180ms; pressing uses a small spring;
selected navigation settles with a short spring; the decorative route takes
6800ms with an 800ms pause. Only transform and opacity are animated. Route motion
stops on a hidden tab, background transition, user motion-off, or OS reduced
motion. Reduced motion reveals content immediately without translation.
No animation gates an action, simulates availability, or changes trip data.

Use Ionicons throughout; retain text labels for actions and navigation. Badges
show real unread counts, and unread cards retain a textual state. Money, route
lifecycle, push permissions and FCM receipt semantics remain governed by the
existing APIs, not by animation or visual state.

### Reporting and portal parity

ActivityFilters owns typed Gregorian date ranges, localized preset labels, platform
and trip-status choices, draft/apply/reset behavior and accessible disclosure.
The shared ActivityProvider keeps committed non-sensitive filters in session
memory across trips and revenue. The signature financial surface is one gold-on-
navy gross-revenue panel followed by restrained, labelled metric and breakdown
cards. It never represents net profit, tax advice or payout after commissions.
The authenticated server owns period-wide totals; page rows are never summed into
period revenue. Profile uses quiet information rows and the existing guarded
vehicle-selection controller. Screens use the same native system fonts and safe
areas, not a scaled copy of desktop tables.

## Do's and Don'ts

- Do give one primary trip action priority and keep recovery actions visible.
- Do verify Arabic RTL, French long labels, both themes and motion-off.
- Do keep pending-trip protection and explicit push opt-in intact.
- Do not turn the driver app into a promotional landing page.
- Do not use decorative counters, fake live data, endless status pulsing or
  full-screen motion while a driver is using trip controls.

### Recovery and startup · 0.2.7

The home screen prioritizes the trip action and messages; vehicle selection is
owned by Profile, with a Settings shortcut. It does not fetch the vehicle list
just to draw a home card. JourneyLoading owns all indeterminate loading regions,
including session startup. A short route line and gold travelling beam express
work in progress, never a percentage, GPS location or completion claim. The
welcome surface reuses navy/gold, native fonts and the route motif. It adds no
minimum delay and yields immediately to the actual session result. The beam
stops in background and with OS/user reduced motion; static text remains.
New motion uses the installed Reanimated 4.5.1 UI runtime/CSS support (transform
and opacity only). Welcome enters with a 280ms fade; peer tab navigation has no
custom transition. Existing route artwork/press feedback is retained.
Reference: Expo's MIT animation skill, reviewed at revision
927dd7cc2088ec2f0c73589fe2e94c3c973afc45, `expo/skills`,
`plugins/expo/skills/expo-animation/SKILL.md`. No runtime package was added.

## Company registration and marketing website — 17 October 2026

The web scope now adopts midnight navy (#0D1727), gold (#E0BD5B), warm paper
and system typography. Marketing uses restrained route animation and section
reveals; both respect reduced motion and pause when the document is hidden.
Illustrative journeys remain explicitly labeled demo data. No invented prices,
customer counts, certifications or Chiron acceptance claims are published.

Registration is an operational five-step dialog, not a decorative contact form.
Its canonical web owners are ui/Dialog, AlertDialog, Button, Input and Label;
LanguageContext owns Arabic/French/Dutch. registration.css owns its scoped
layout tokens. The administrator widget reuses those same web primitives.
Global layers are cookie 400, dialog backdrop 500, dialog 600, confirmation
700/710 and toast 900. Portaled selects, menus and popovers use 650 so
controls opened inside a dialog remain visible. Keyboard focus stays in the current modal. Scrollable
content and a visible footer preserve submission on short mobile viewports.

## Company operations extension (2026-10-18)

The approved company workspaces extend the existing web management shell and its semantic CSS/Tailwind tokens. They do not change the native palette or rebrand the marketing site. The visual aim is a calm operational ledger: a clear company identity header, compact status badges, scannable monetary totals, natural-height tab panels, and consistent shared Radix dialogs/selects. Financial state is expressed in text, never only in colour. Tables scroll horizontally when comparison requires it; cards retain every available action at narrow widths.

Behavior and business references are maintained in docs/OPERATIONS_UX.md and docs/COMPANY_PLATFORM_CONTRACT.md. Runtime owners are src/components/operations, src/components/ui and the existing globals.css theme. No new parallel colour token system is introduced.


### Driver portal shift entry

The service shift is the primary work entry. Use one prominent dp card below the
shared header, with the vehicle and a text status, a single odometer start field,
and a pause/resume action. Keep the shift open through breaks. Retain navigation
to profile and history; do not mix GPS sharing with declaration status. Use the
same card, OperationForm and Arabic/French/Dutch copy in both themes. Trip links belong to the separate Dutch service sheet; customer receipts stay unchanged.
Use a structured A4 report with company identity, shift metadata, time and kilometre
summaries, actual payments and a paginated audit ledger. Never guess odometer values.

## Marketing homepage · botanical editorial direction (2026-10-22)

Reference: Kedhareswer’s Botanical 3D Flower Landing Page on 21st.dev, reviewed
from its published cover and template description. The composition, spacious
typography and fine rules inform the layout; the flower is replaced by the
existing JOUW DRIVER phone, company window and illustrative street route.
Midnight navy, warm paper, gold and native system fonts retain the product identity.
A slow decorative orbit connects those three forms without suggesting live GPS.
The first section owns the expressive composition; subsequent sections use
quiet editorial rows rather than repeated boxed cards. Actions are rounded pills.

PlatformLanding and platform.css own this marketing scope. LanguageContext,
company registration, cookie preferences and portal links retain their existing
owners and behavior. No customer, integration, price or acceptance claim changes.
Arabic has independent line-height and no Latin tracking. Narrow screens stack
the product illustration beneath the headline; demo labels stay explicit.
Reduced motion disables orbit, phone float, route travel and section reveals;
all motion pauses on a hidden document. Keyboard focus remains visible and
the existing roving tab keyboard interactions remain available.

## Native service cockpit · 0.3.0 (22 October 2026)

The Android redesign makes the service shift the first action. A navy service
ticket presents the real work state, vehicle, last explicitly recorded odometer
and server-recorded start time. A compact trip entry follows it; the existing
decorative route remains a single restrained signature, never a GPS reading.
The five-destination navigation stays in normal flow, with service history reached
from Home. Shared cards now use 20px radii, controls 16px and choices 10px.
Dark background/surface are #0B1423/#142238; light background is warm #F5F3ED.
Gold remains #E0BD5B. tokens.ts is the sole runtime owner; system fonts and
Arabic line-height remain unchanged. No web/marketing palette is modified.

ShiftCard, Shifts and ShiftProvider reuse native Field, Button, Notice, Screen
and the session action gate. The server remains authoritative. Start needs an
explicit odometer; readings never come from GPS or trip kilometres. Pause/resume
keeps the same shift. Active or unsent local trips block pause/end. Pending
declarations are encrypted in SecureStore before transmission, frozen on an
uncertain outcome and replayed explicitly with the same UUID after restart.
The Dutch service PDF reuses the existing server document and shares from the
private cache. It never adds a shift to a customer invoice.

UI/UX Pro Max guidance was checked for native keyboard handling, readable type
and reduced motion. Its generic landing-page/palette suggestion was rejected
in favour of this operational product contract and the established navy/gold.
21st assets are web-oriented; no web component or WebView is added to Android.

## Approved emerald driver redesign — 23 October 2026

The user approved the dark charcoal and emerald mobile cockpit shown in the
conversation. This supersedes the navy/gold driver-interface guidance above for
the native driver app and `/driver` portal only. Marketing and administration
retain their own identities. Runtime ownership remains
`driver-app/src/experience/tokens.ts` for native and the `--dp-*` token adapter in
`src/app/globals.css` for web. The approved dark background/surface/raised roles
are #0C131B / #151F2A / #202D3A. Native action emerald #34D399 uses #062C20 ink;
web action uses #047857 with white text in both themes, while dark-mode
informational accent uses #34D399. Native small
informational icons use #047857 in light mode. These roles feed the existing
shared controls, screens, lists and navigation rather than new screen-local kits.

The start-odometer field belongs inside the primary shift card, immediately
above its action. Web reuses the canonical OperationForm through its inline
variant so validation, duplicate prevention and uncertain-request replay remain
identical. All five destinations and their existing features remain available.
Native navigation uses restrained emerald tint, with no gold highlight.

Document QR is black on an opaque white surface with four-module quiet zone,
locally generated. Receipts link to the persisted invoice snapshot and render
PDF on request; no server PDF object is saved. Shift QR opens the authenticated
shift detail; open shifts are explicitly provisional. Document references are
stable; the grouped DS reference is a lossless base36 encoding of the shift ID,
not a new business sequence. Historical records and signatures are not rewritten.

## Approved taxi welcome and J-arrow identity — 23 October 2026

The user approved the simplified emerald J/northeast-arrow emblem from the taxi
welcome artwork. `driver-app/assets/app-icon.png` is the opaque 1024px icon used
by Expo and Android adaptive masking; the matching web preview is in
`public/app-brand`. `BrandMark` owns its native display. This replaces neither
the marketing identity nor the established operational palette.

The welcome surface shows the approved Brussels taxi with an illuminated TAXI
roof sign, a fixed brand mark and localized text above the primary continue
action. `design.brand` owns its fixed charcoal #0B1110, white #FFFFFF and muted
#DCE6E1 roles. A slow 1–1.045 camera scale is decorative; it stops in background
and under OS/user reduced motion. No GIF light sweeps, fake driving or progress.
`WelcomeScreen` owns this native surface; the admin preview mirrors it in scoped
`welcome-preview.css`. Static raster replacement and motion enable/disable are
remote settings; the installed icon remains a build-time asset. Videos/GIFs are
not accepted as administrator uploads in this implementation.

## Web service cockpit · 28 October 2026

DriverShiftWorkspace owns shift entry, declarations, pause/resume and closing on
`/driver/home` only. DriverShifts is a read-only service history and Dutch PDF
workspace. The web cockpit uses existing `--dp-*` semantic tokens and system
fonts; tabular odometer and meter values use system monospace. Its instrument
needle and light change only after the existing shift API confirms success;
they are a service-state illustration, never RPM, vehicle speed or GPS data.
Start retains the shared OperationForm retry identity and opens the taximeter
after confirmation. Closing requests explicit final odometer and cumulative
passenger kilometres, preserves the server version contract, and dims the
instruments after success. Local active or unsent trips block closing.

Taximeter presentation keeps actual price, distance, time and invoice endpoints.
After a successful invoice download, a paper feed animation confirms generation
and the driver can continue to trip history. Failure never animates a receipt.
All new motion is finite and respects reduced motion. GPS remains mounted in
the shared shell independently of service controls. Native apps are unchanged.

## Approved web driver reference · 28 October 2026

The owner approved the three navy/gold artboards rendered from
`jouw-driver-complete-ui(1).zip`: cockpit, digital meter and receipt printer.
`src/components/driver/DriverExperience.tsx` owns the shared frame, responsive
SVG gauge ticks, needle motion and paper feed. `driver-experience.css` preserves
the supplied navy surfaces, gold gradients, circular instruments and serrated
paper; it adapts existing OperationForm controls inside that scope only.
Global management, marketing and native app tokens remain unchanged.

Home alone owns shift mutations. Server-confirmed odometer and service state
replace sample instrument readings; unavailable RPM stays a dash. The meter
receives the existing agreed fare/GPS distance and elapsed time. There is no
new fare model or unsupported trip-pause action. Existing trip setup, navigation,
confirmation, Chiron and encrypted journal remain owned by the meter page.
After explicit invoice creation succeeds, the dedicated receipt artboard loads
only the issued invoice snapshot. Its PDF action uses the existing receipt URL.
All new movement is finite and respects system reduced motion.

Receipt email uses the shared Dialog, Input, Textarea and Select owners. It is
an independent optional action, with editable localized copy, explicit recipient,
provider acceptance distinct from delivery, stable retry identity, and no message
or recipient persistence in the new database tables. Administrator ad controls
reuse the management shell and optimistic settings version.

## Marketing cinematic experience · 28 October 2026

The requested automotive direction supersedes the botanical marketing composition
for the homepage only. The signature is a single reversible scroll sequence:
phone ignition → original ASTER sedan → cabin meter → thermal receipt.
`cinematic/cinematic.css` owns scoped `--jd-*` tokens: background #060B12,
navy #0B1929, surface #14283D, champagne #EAC080, ice #A9D8F2,
text #F3F5F7 and muted #A6B8C9. These do not replace native, driver or admin
palettes. Display uses Avenir Next / Segoe UI / system sans; instruments use
system monospace. Arabic has no tracking and an independent line-height.

Text and the WebGL viewport occupy distinct columns, stacked on phones.
`engine.ts` owns the GSAP scrub playhead, camera, light and model transforms.
There is no autonomous driving timer. Rendering is demanded by scroll/resize,
paused offscreen and on hidden documents, with capped device pixel ratio.
Reduced motion and WebGL failure use a locally rendered poster and full HTML
story. Navigation and registration remain usable independently of the scene.
`PlatformLanding` reuses CompanyRegistrationDialog and portal-origin routing.
AR/FR/NL home URLs supplement all existing editorial and authentication routes.
The subscription stays 50€ including 21% VAT, 12 months / 600€, no auto-renewal.
Asset provenance and commercial-use permission are in public/cinematic/ASSETS.md.
