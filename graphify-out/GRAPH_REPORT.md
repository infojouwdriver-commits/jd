# Graph Report - JOUW DRIVER  (2026-10-26)

## Corpus Check
- 582 files · ~247,046 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3313 nodes · 11155 edges · 171 communities (121 shown, 50 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 243 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `096d495e`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- useLanguage
- Input
- createPostgrestClient
- usePreferences
- useTripController.ts
- DriverRegisterForm.tsx
- lib/auth.ts
- useAuth
- api-utils.ts
- ref_react
- session.tsx
- dependencies
- cn
- create-response.ts
- ui.tsx
- BackgroundGeolocation
- api-client.ts
- dependencies
- package.json
- driver-app/package.json
- sidebar.tsx
- Shifts.tsx
- GdprAdminClient.tsx
- driver/taximeter/page.tsx
- subscription-billing.ts
- ChironError
- BackgroundGeolocationService.java
- mobile-location.ts
- convert-database.mjs
- ref_node_fs
- pdf-generator.ts
- use-toast.ts
- stripe-billing.ts
- DriverShifts.tsx
- utils.ts
- mobile/package.json
- Button
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- 20261024_stripe_billing.sql
- crud-operations.ts
- PlatformLanding.tsx
- SiteAIAgent.tsx
- 20261018_company_lifecycle.sql
- 20261019_shift_activity.sql
- update-customer-portal.sh
- DriverMap.tsx
- 20261018_contract_billing.sql
- DirectoryToolbar.tsx
- form.tsx
- TripPointJournal.java
- ref_node_crypto
- compilerOptions
- welcome-config.ts
- navigation-menu.tsx
- app/layout.tsx
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- CookieBanner.tsx
- code-map.py
- scripts
- RouteMap.tsx
- messages/route.ts
- next_api/contracts/route.ts
- vervoerbewijs.ts
- createTripJournal
- rollout.mjs
- 20261019_driver_shifts.sql
- carousel.tsx
- devDependencies
- PDFGenerator
- "schema".company_registrations
- framer-motion
- chart.tsx
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- HomepageAdSlotSection.tsx
- transformSecrets
- activity-state.tsx
- "schema".security_save_company_account
- "schema".company_change_requests
- sheet.tsx
- FaqPage.tsx
- FeatureDetailCard
- FeaturePageLayout
- chat/route.ts
- DriverGuideSection.tsx
- pagination.tsx
- recover-db-log.mjs
- scripts
- ApiError
- 20261013_mail_delivery.sql
- drawer.tsx
- LanguageProvider
- next_api/drivers/route.ts
- Override
- "schema".security_email_contract
- verify-private-owner.cjs
- InvoicesFeaturePage.tsx
- ReportsPage.tsx
- TripManagementPage.tsx
- company-portal/drivers/route.ts
- [...path]/route.ts
- driverShiftPdf
- android.content.Intent
- driver-app/tsconfig.json
- 20261019_email_identity.sql
- "schema".manual_invoices
- definitions.d.ts
- database-readiness.mjs
- TeamManagementPage.tsx
- brevo/route.ts
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- contract-template.ts
- document-links.ts
- admin-enrollment.mjs
- 20261009_security.sql
- 20261018_web_billing.sql
- invoice_bank_snapshot
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
- 20261023_app_experience.sql
- invoices/send/route.ts
- view/route.ts
- websocket/route.ts
- backup.sh
- public.security_enroll_initial_owner
- 20261010_admin_mfa.sql
- trips_user_completion_request_idx
- "schema".security_create_trip_invoice
- "schema".security_reserve_mail
- preflight.mjs
- global-error.tsx
- privacy-policy/page.tsx
- backup-foundation.sh
- import-private-archive.sh
- Package.swift

## God Nodes (most connected - your core abstractions)
1. `createErrorResponse()` - 264 edges
2. `createSuccessResponse()` - 260 edges
3. `generateAdminUserToken()` - 251 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 213 edges
6. `validateRequestBody()` - 154 edges
7. `Button` - 152 edges
8. `requestMiddleware()` - 118 edges
9. `createPostgrestClient()` - 104 edges
10. `useLanguage()` - 97 edges

## Surprising Connections (you probably didn't know these)
- `locate()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `search()` --indirect_call--> `value()`  [INFERRED]
  driver-app/src/experience/AddressField.tsx → scripts/convert-database.mjs
- `DriverMapView()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `FleetLocation()` --references--> `Location`  [EXTRACTED]
  driver-app/src/FleetLocation.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `ActiveTrip()` --references--> `Alert`  [EXTRACTED]
  driver-app/src/experience/ActiveTrip.tsx → src/components/ui/alert.tsx

## Import Cycles
- 2-file cycle: `src/lib/api-utils.ts -> src/lib/create-response.ts -> src/lib/api-utils.ts`
- 2-file cycle: `driver-app/src/experience/session.tsx -> driver-app/src/experience/shift-state.tsx -> driver-app/src/experience/session.tsx`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (171 total, 50 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.08
Nodes (112): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+104 more)

### Community 1 - "useLanguage"
Cohesion: 0.05
Nodes (83): Page(), Page(), Page(), CompanyDashboardPage(), glassCard, Message, Reply, glassCard (+75 more)

### Community 2 - "Input"
Cohesion: 0.08
Nodes (80): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, Company, CompanyContractsPage(), Contract (+72 more)

### Community 3 - "createPostgrestClient"
Cohesion: 0.04
Nodes (80): resend, zod, dynamic, GET(), headers, runtime, available(), GET (+72 more)

### Community 4 - "usePreferences"
Cohesion: 0.12
Nodes (54): validRange(), Account(), ActiveTrip(), useActivityFilters(), ActivityFilters(), apply(), AddressField(), search() (+46 more)

### Community 5 - "useTripController.ts"
Cohesion: 0.06
Nodes (51): login(), DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), journalBytes(), assertNativeCryptoReady() (+43 more)

### Community 6 - "DriverRegisterForm.tsx"
Cohesion: 0.05
Nodes (69): @hookform/resolvers, react-hook-form, dynamic, LoginPage(), CompanyLoginForm(), DriverRegisterForm(), DriverRegisterFormProps, FormField() (+61 more)

### Community 7 - "lib/auth.ts"
Cohesion: 0.08
Nodes (59): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+51 more)

### Community 8 - "useAuth"
Cohesion: 0.09
Nodes (55): sonner, AdminAccountPage(), ChironSyncPage(), FailedTrip, ChironSettingsPage(), Company, Company, EditCompanyPage() (+47 more)

### Community 9 - "api-utils.ts"
Cohesion: 0.05
Nodes (50): bcryptjs, registrationSchema, GET, POST, VALID_TYPES, GET, POST, POST (+42 more)

### Community 10 - "ref_react"
Cohesion: 0.05
Nodes (43): nextConfig, lucide-react, next, AdminLayout(), ContractPrintPage(), PrintableContract, glassCard, labelStyle (+35 more)

### Community 11 - "session.tsx"
Cohesion: 0.06
Nodes (46): App(), logout(), styles, ActionGate, createActionGate(), AccountInfo, ActivityPage, ActivityQuery (+38 more)

### Community 12 - "dependencies"
Cohesion: 0.03
Nodes (64): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+56 more)

### Community 13 - "cn"
Cohesion: 0.06
Nodes (51): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+43 more)

### Community 14 - "create-response.ts"
Cohesion: 0.11
Nodes (29): welcomePayload(), GET, PUT, GET, GET, GET, GET, GET (+21 more)

### Community 15 - "ui.tsx"
Cohesion: 0.10
Nodes (33): Layout(), Navigation(), RoadArt(), BrandMark(), icon, InboxProvider(), JourneyLoading(), Entrance() (+25 more)

### Community 16 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 17 - "api-client.ts"
Cohesion: 0.08
Nodes (36): DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), DriverProfileRoute(), DriverGoogleLoginButton() (+28 more)

### Community 18 - "dependencies"
Cohesion: 0.05
Nodes (38): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+30 more)

### Community 19 - "package.json"
Cohesion: 0.05
Nodes (39): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+31 more)

### Community 20 - "driver-app/package.json"
Cohesion: 0.05
Nodes (37): eslint, react, react-dom, @types/react, typescript, main, name, overrides (+29 more)

### Community 21 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 22 - "Shifts.tsx"
Cohesion: 0.10
Nodes (27): nativeShiftCopy, start(), shiftDate(), Shifts(), clearForm(), commit(), retry(), save() (+19 more)

### Community 23 - "GdprAdminClient.tsx"
Cohesion: 0.11
Nodes (28): GdprAdminPage(), metadata, DashboardPage(), ApprovalRequest, Company, DistributorDashboardPage(), Driver, Invoice (+20 more)

### Community 24 - "driver/taximeter/page.tsx"
Cohesion: 0.10
Nodes (29): leaflet, BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard() (+21 more)

### Community 25 - "subscription-billing.ts"
Cohesion: 0.12
Nodes (24): qrcode, register(), BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState, validIban(), invoicePaymentState() (+16 more)

### Community 26 - "ChironError"
Cohesion: 0.14
Nodes (17): canonicalChironEnvironment(), chironDestination(), ChironError, numeric(), rideMessage(), timestamp(), ChironService, CompanyPricing (+9 more)

### Community 27 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 28 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 29 - "convert-database.mjs"
Cohesion: 0.13
Nodes (23): files, names, values, main(), convertExport(), EXCLUDED, identifier(), integer() (+15 more)

### Community 30 - "ref_node_fs"
Cohesion: 0.11
Nodes (16): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv(), checkedStripeSetup(), enabledStripeEvents (+8 more)

### Community 31 - "pdf-generator.ts"
Cohesion: 0.14
Nodes (24): jspdf, configurePdfFonts(), generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line() (+16 more)

### Community 32 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 33 - "stripe-billing.ts"
Cohesion: 0.18
Nodes (25): stripe, runtime, runtime, bind(), Client, completeSetup(), assertStripeInvoice(), finiteSchedule() (+17 more)

### Community 34 - "DriverShifts.tsx"
Cohesion: 0.14
Nodes (21): ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy, DriverShift, km (+13 more)

### Community 35 - "utils.ts"
Cohesion: 0.07
Nodes (20): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+12 more)

### Community 36 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 37 - "Button"
Cohesion: 0.14
Nodes (20): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), Company, Distributor (+12 more)

### Community 38 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 39 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 40 - "20261024_stripe_billing.sql"
Cohesion: 0.12
Nodes (13): "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts, stripe_company_lifecycle_guard (+5 more)

### Community 41 - "crud-operations.ts"
Cohesion: 0.15
Nodes (13): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, POST, generateTripHash(), generateTripUuid(), getRetentionDate() (+5 more)

### Community 42 - "PlatformLanding.tsx"
Cohesion: 0.13
Nodes (12): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), openRegistration(), Route(), translations (+4 more)

### Community 43 - "SiteAIAgent.tsx"
Cohesion: 0.14
Nodes (24): apiFetch(), ApiResponse, buildApiUrl(), ChatMessage, ConversationStep, detectChangeIntent(), detectSearchIntent(), formatEntityInfo() (+16 more)

### Community 44 - "20261018_company_lifecycle.sql"
Cohesion: 0.12
Nodes (12): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+4 more)

### Community 45 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (13): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+5 more)

### Community 46 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 47 - "DriverMap.tsx"
Cohesion: 0.18
Nodes (19): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, coordinate(), createAddressSearch() (+11 more)

### Community 48 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 49 - "DirectoryToolbar.tsx"
Cohesion: 0.14
Nodes (17): cmdk, @radix-ui/react-popover, directoryCopy, CompanyOption, CompanyPicker(), DirectoryKind, DirectoryResult, Command (+9 more)

### Community 50 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 53 - "ref_node_crypto"
Cohesion: 0.15
Nodes (13): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+5 more)

### Community 54 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 55 - "welcome-config.ts"
Cohesion: 0.20
Nodes (15): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster() (+7 more)

### Community 56 - "navigation-menu.tsx"
Cohesion: 0.14
Nodes (16): class-variance-authority, @radix-ui/react-navigation-menu, @radix-ui/react-toggle, @radix-ui/react-toggle-group, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList (+8 more)

### Community 57 - "app/layout.tsx"
Cohesion: 0.16
Nodes (13): next-themes, dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider(), GlobalClientEffects() (+5 more)

### Community 59 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 60 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 61 - "CookieBanner.tsx"
Cohesion: 0.20
Nodes (13): PrivacyCenter(), CookieBanner(), CookieCategory, DEFAULT_CATEGORIES, T, CookiePreferencesButton(), COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION (+5 more)

### Community 62 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 63 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 64 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 65 - "messages/route.ts"
Cohesion: 0.26
Nodes (10): POST, PUT, GET, GET, POST, POST, accessibleMessage(), fields (+2 more)

### Community 66 - "next_api/contracts/route.ts"
Cohesion: 0.36
Nodes (14): PUT, DELETE, document(), failed(), GET, positiveId(), POST, PUT (+6 more)

### Community 67 - "vervoerbewijs.ts"
Cohesion: 0.18
Nodes (13): chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs(), VervoerbewijsChiron, VervoerbewijsCompany (+5 more)

### Community 68 - "createTripJournal"
Cohesion: 0.25
Nodes (13): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+5 more)

### Community 69 - "rollout.mjs"
Cohesion: 0.15
Nodes (10): dir, aad, openPushCredential(), compose(), directory, env, [image, revision, target], lock (+2 more)

### Community 70 - "20261019_driver_shifts.sql"
Cohesion: 0.23
Nodes (10): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_immutable_shift_event() (+2 more)

### Community 71 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 72 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+6 more)

### Community 74 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 75 - "framer-motion"
Cohesion: 0.17
Nodes (4): framer-motion, FeatureCardProps, ParallaxSectionProps, StatCounterProps

### Community 76 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 77 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 78 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 79 - "HomepageAdSlotSection.tsx"
Cohesion: 0.27
Nodes (8): dompurify, dompurify, FloatingCard(), FloatingCardProps, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 80 - "transformSecrets"
Cohesion: 0.27
Nodes (9): jose, apply, headers, url, close(), decryptSecret(), encryptSecret(), key() (+1 more)

### Community 81 - "activity-state.tsx"
Cohesion: 0.31
Nodes (7): Period, periodDates(), validDay(), ActivityProvider(), Context, useStateValue(), preset()

### Community 83 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 84 - "sheet.tsx"
Cohesion: 0.24
Nodes (9): @radix-ui/react-dialog, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+1 more)

### Community 85 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 86 - "FeatureDetailCard"
Cohesion: 0.29
Nodes (7): Page(), FeatureDetailCard(), FeatureDetailCardProps, contentFr, contentNl, icons, NotificationsPage()

### Community 87 - "FeaturePageLayout"
Cohesion: 0.29
Nodes (7): Page(), FeaturePageLayout(), FeaturePageLayoutProps, contentFr, contentNl, icons, SecurityPage()

### Community 88 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 89 - "DriverGuideSection.tsx"
Cohesion: 0.27
Nodes (9): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+1 more)

### Community 90 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 91 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 92 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 93 - "ApiError"
Cohesion: 0.44
Nodes (8): ApiError, createDriverApi(), loadProfile(), ownerRead(), profile(), request(), requestOnce(), vehicles()

### Community 94 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 95 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 96 - "LanguageProvider"
Cohesion: 0.31
Nodes (8): DriverLayout(), DriverLayoutShell(), detectBrowserLanguage(), LanguageProvider(), normalizeLanguage(), readCookieLanguage(), setDocumentDirection(), setLanguageCookie()

### Community 97 - "next_api/drivers/route.ts"
Cohesion: 0.47
Nodes (7): POST, PUT, driverFieldsSchema, driverValidationError(), mutateDriverAccount(), optionalText, parseDriverFields()

### Community 100 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 101 - "InvoicesFeaturePage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, InvoicesFeaturePage(), PublicStats

### Community 102 - "ReportsPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, ReportsPage()

### Community 103 - "TripManagementPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, TripManagementPage()

### Community 104 - "company-portal/drivers/route.ts"
Cohesion: 0.21
Nodes (6): DELETE, POST, PUT, DELETE, POST, PUT

### Community 105 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 106 - "driverShiftPdf"
Cohesion: 0.46
Nodes (7): driverShiftPdf(), ensure(), page(), pairs(), paragraph(), section(), table()

### Community 108 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 109 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 110 - ""schema".manual_invoices"
Cohesion: 0.38
Nodes (3): manual_invoice_immutable, "schema".manual_invoice_payments, "schema".manual_invoices

### Community 111 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 112 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 113 - "TeamManagementPage.tsx"
Cohesion: 0.38
Nodes (5): Page(), contentFr, contentNl, icons, TeamManagementPage()

### Community 114 - "brevo/route.ts"
Cohesion: 0.52
Nodes (5): POST(), runtime, brevoMailEvent(), brevoProviderId(), brevoWebhookAuthorized()

### Community 115 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 116 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 117 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 118 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 119 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 120 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 121 - "document-links.ts"
Cohesion: 0.53
Nodes (5): documentOrigin, receiptCapability(), receiptDocumentUrl(), signature(), verifyReceiptCapability()

### Community 122 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 126 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 127 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 128 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 132 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 133 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 134 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

## Knowledge Gaps
- **735 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+730 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1050 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **50 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DriverLayoutShell()` connect `LanguageProvider` to `ref_react`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _735 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07758478081058726 - nodes in this community are weakly interconnected._
- **Why does `DriverLayoutContent()` connect `ref_react` to `useAuth`, `useLanguage`, `DriverFleetShift.tsx`, `api-client.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `useLanguage` be split into smaller, more focused modules?**
  _Cohesion score 0.05283836878471752 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.07576463282099052 - nodes in this community are weakly interconnected._
- **Should `createPostgrestClient` be split into smaller, more focused modules?**
  _Cohesion score 0.043457648546144124 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 169 unresolved internal-endpoint edges and 21 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 238 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
