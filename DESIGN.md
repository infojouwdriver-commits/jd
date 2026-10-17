---
version: alpha
name: JOUW DRIVER mobile
description: A navy and gold driver workspace aligned with the driver portal, with profile, trips and revenue.
colors:
  primary: "#E0BD5B"
  on-primary: "#302408"
  dark-background: "#0D1626"
  dark-surface: "#172338"
  light-background: "#F1F3F7"
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
  card: "24px"
  control: "17px"
  chip: "12px"
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
labels stay in system sans. Display headings are 27–29px, body 15px, secondary
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

Cards use 24px corners, controls 17px, and compact choices 12px. Vehicle plates
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
