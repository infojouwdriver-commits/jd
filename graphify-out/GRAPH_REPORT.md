# Graph Report - JOUW DRIVER  (2026-11-04)

## Corpus Check
- 629 files · ~267,461 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3576 nodes · 12073 edges · 183 communities (126 shown, 57 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 247 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8a457551`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- ref_react
- requestMiddleware
- PlatformLanding.tsx
- Button
- Input
- useTripController.ts
- framer-motion
- lib/auth.ts
- usePreferences
- DriverRegisterForm.tsx
- useAuth
- receipt-email/route.ts
- SelectContent
- dependencies
- preferences.tsx
- stripe-billing.ts
- cn
- api-utils.ts
- api.ts
- BackgroundGeolocation
- package.json
- dependencies
- sidebar.tsx
- summary/page.tsx
- Shifts.tsx
- company-changes.ts
- 20261026_invoice_checkout.sql
- end/route.ts
- session.tsx
- BackgroundGeolocationService.java
- driver-app/package.json
- mobile-location.ts
- DriverShifts.tsx
- use-toast.ts
- vervoerbewijs.ts
- pdf-generator.ts
- mobile/package.json
- utils.ts
- driver/taximeter/page.tsx
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- DriverMap.tsx
- 20261024_stripe_billing.sql
- SiteAIAgent.tsx
- 20261018_company_lifecycle.sql
- 20261019_shift_activity.sql
- convert-database.mjs
- update-customer-portal.sh
- 20261018_contract_billing.sql
- DirectoryToolbar.tsx
- receipt/page.tsx
- configure-mail.mjs
- form.tsx
- TripPointJournal.java
- company-registrations/route.ts
- welcome-config.ts
- compilerOptions
- documents/route.ts
- ref_node_fs
- app/layout.tsx
- messages/route.ts
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- code-map.py
- ref_node_crypto
- scripts
- RouteMap.tsx
- createTripJournal
- rollout.mjs
- 20261019_driver_shifts.sql
- devDependencies
- carousel.tsx
- api-client.ts
- PublicInfo.tsx
- CookieBanner.tsx
- company-pricing.ts
- activity-state.tsx
- "schema".company_registrations
- chart.tsx
- DriverFleetShift.tsx
- PDFGenerator
- "schema".security_fleet_locations
- secret-vault.ts
- LanguageProvider
- "schema".security_save_company_account
- "schema".company_change_requests
- HomepageAdSlotSection.tsx
- sheet.tsx
- FaqPage.tsx
- chat/route.ts
- DriverGuideSection.tsx
- pagination.tsx
- recover-db-log.mjs
- 20261013_mail_delivery.sql
- navigation-menu.tsx
- toggle-group.tsx
- drawer.tsx
- Override
- "schema".security_email_contract
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- ContractDocument.tsx
- [...path]/route.ts
- driverShiftPdf
- android.content.Intent
- driver-app/tsconfig.json
- LiveMap.tsx
- 20261019_email_identity.sql
- "schema".manual_invoices
- definitions.d.ts
- database-readiness.mjs
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- start/route.ts
- 20261009_security.sql
- 20261018_web_billing.sql
- invoice_bank_snapshot
- 20261104_company_tariffs.sql
- ModeEnum
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
- 20261023_app_experience.sql
- scroll-area.tsx
- company-portal/drivers/route.ts
- company-portal/vehicles/route.ts
- invoices/send/route.ts
- view/route.ts
- websocket/route.ts
- ModeEnum
- totp.ts
- backup.sh
- public.security_enroll_initial_owner
- 20261010_admin_mfa.sql
- trips_user_completion_request_idx
- "schema".security_create_trip_invoice
- "schema".security_reserve_mail
- preflight.mjs
- global-error.tsx
- PortalEnum
- backup-foundation.sh
- import-private-archive.sh
- Package.swift
- onboarding-copy.ts

## God Nodes (most connected - your core abstractions)
1. `createErrorResponse()` - 273 edges
2. `createSuccessResponse()` - 271 edges
3. `generateAdminUserToken()` - 265 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 213 edges
6. `validateRequestBody()` - 164 edges
7. `Button` - 160 edges
8. `requestMiddleware()` - 123 edges
9. `createPostgrestClient()` - 123 edges
10. `useLanguage()` - 114 edges

## Surprising Connections (you probably didn't know these)
- `locate()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `search()` --indirect_call--> `value()`  [INFERRED]
  driver-app/src/experience/AddressField.tsx → scripts/convert-database.mjs
- `DriverMapView()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `ActiveTrip()` --references--> `Alert`  [EXTRACTED]
  driver-app/src/experience/ActiveTrip.tsx → src/components/ui/alert.tsx
- `locate()` --references--> `Location`  [EXTRACTED]
  driver-app/src/experience/PickupLocation.tsx → mobile/plugins/background-geolocation/definitions.d.ts

## Import Cycles
- 2-file cycle: `src/lib/api-utils.ts -> src/lib/create-response.ts -> src/lib/api-utils.ts`
- 2-file cycle: `driver-app/src/experience/session.tsx -> driver-app/src/experience/shift-state.tsx -> driver-app/src/experience/session.tsx`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (183 total, 57 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.06
Nodes (125): bcryptjs, GET, GET, executeApprovedRequest(), GET, getTableName(), POST, PUT (+117 more)

### Community 1 - "ref_react"
Cohesion: 0.06
Nodes (56): nextConfig, class-variance-authority, lucide-react, next, sonner, FailedTrip, Company, Contract (+48 more)

### Community 2 - "requestMiddleware"
Cohesion: 0.06
Nodes (60): welcomePayload(), zod, GET, PUT, POST, schema, GET, PUT (+52 more)

### Community 3 - "PlatformLanding.tsx"
Cohesion: 0.05
Nodes (69): gsap, qrcode, three, metadata, generateMetadata(), LocalizedHome(), Props, dynamicParams (+61 more)

### Community 4 - "Button"
Cohesion: 0.07
Nodes (63): ChironSyncPage(), Page(), Page(), CompanyDashboardPage(), ContractPrintPage(), PrintableContract, InvoicePayment(), words (+55 more)

### Community 5 - "Input"
Cohesion: 0.07
Nodes (65): sameWelcomeContent(), WELCOME_LANGUAGES, AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, EditCompanyPage() (+57 more)

### Community 6 - "useTripController.ts"
Cohesion: 0.06
Nodes (58): login(), ActionGate, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), FleetLocation(), journalBytes() (+50 more)

### Community 7 - "framer-motion"
Cohesion: 0.04
Nodes (59): framer-motion, Page(), Page(), Page(), Page(), Page(), Page(), DriverInfo (+51 more)

### Community 8 - "lib/auth.ts"
Cohesion: 0.09
Nodes (58): PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone(), normalizePhoneCandidates() (+50 more)

### Community 9 - "usePreferences"
Cohesion: 0.14
Nodes (48): Account(), ActiveTrip(), invoice(), useActivityFilters(), ActivityFilters(), AddressField(), search(), ClassicDisplay() (+40 more)

### Community 10 - "DriverRegisterForm.tsx"
Cohesion: 0.06
Nodes (60): @hookform/resolvers, react-hook-form, dynamic, LoginPage(), CompanyLoginForm(), CompanyLoginFormData, CompanyLoginFormProps, companyLoginSchema (+52 more)

### Community 11 - "useAuth"
Cohesion: 0.08
Nodes (55): AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), ChironSettingsPage() (+47 more)

### Community 12 - "receipt-email/route.ts"
Cohesion: 0.06
Nodes (52): dynamic, GET(), headers, available(), GET, POST, schema, POST (+44 more)

### Community 13 - "SelectContent"
Cohesion: 0.09
Nodes (57): CompanyContractsPage(), PlatformContractsPage(), DistributorsPage(), Page(), AdminTripsPage(), DistributorDashboardPage(), DriverMessagesPage(), glassCard (+49 more)

### Community 14 - "dependencies"
Cohesion: 0.03
Nodes (65): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+57 more)

### Community 15 - "preferences.tsx"
Cohesion: 0.07
Nodes (44): Layout(), Navigation(), RoadArt(), BrandMark(), icon, FarePreview, same(), Tariff (+36 more)

### Community 16 - "stripe-billing.ts"
Cohesion: 0.08
Nodes (50): stripe, runtime, runtime, register(), BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState (+42 more)

### Community 17 - "cn"
Cohesion: 0.06
Nodes (52): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger, AlertTitle (+44 more)

### Community 18 - "api-utils.ts"
Cohesion: 0.07
Nodes (39): POST, GET, normalizeUrlPreview(), AUTH_ENABLED, authConfig, ApiParams, appendCorsHeaders(), clearCookie() (+31 more)

### Community 19 - "api.ts"
Cohesion: 0.07
Nodes (38): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead() (+30 more)

### Community 20 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 21 - "package.json"
Cohesion: 0.05
Nodes (40): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+32 more)

### Community 22 - "dependencies"
Cohesion: 0.05
Nodes (41): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+33 more)

### Community 23 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 24 - "summary/page.tsx"
Cohesion: 0.08
Nodes (33): DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), DriverProfileRoute(), glassCard, labelStyle (+25 more)

### Community 25 - "Shifts.tsx"
Cohesion: 0.11
Nodes (29): driverApi, BillingReminder(), dismissed, directory(), shareShiftReport(), TripRuntime(), useSession(), useTrip() (+21 more)

### Community 26 - "company-changes.ts"
Cohesion: 0.12
Nodes (26): DELETE, GET, POST, PUT, changeFingerprint(), changesGET, changesPUT, fleetChange() (+18 more)

### Community 27 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (21): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+13 more)

### Community 28 - "end/route.ts"
Cohesion: 0.15
Nodes (18): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError, numeric() (+10 more)

### Community 29 - "session.tsx"
Cohesion: 0.12
Nodes (23): App(), logout(), styles, createActionGate(), apiConnectionKey(), DriverProfile, DriverTripSummary, DriverMap() (+15 more)

### Community 30 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 31 - "driver-app/package.json"
Cohesion: 0.07
Nodes (28): eslint, react, react-dom, @types/react, typescript, main, name, overrides (+20 more)

### Community 32 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 33 - "DriverShifts.tsx"
Cohesion: 0.12
Nodes (23): qrcode, ShiftPage(), GET, DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy (+15 more)

### Community 34 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 35 - "vervoerbewijs.ts"
Cohesion: 0.13
Nodes (23): dynamic, GET(), headers, runtime, chironColor(), chironLabel(), fmtDateTime(), fmtGps() (+15 more)

### Community 36 - "pdf-generator.ts"
Cohesion: 0.14
Nodes (23): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+15 more)

### Community 37 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 38 - "utils.ts"
Cohesion: 0.07
Nodes (19): clsx, @radix-ui/react-checkbox, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+11 more)

### Community 39 - "driver/taximeter/page.tsx"
Cohesion: 0.13
Nodes (24): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard(), LocationPoint (+16 more)

### Community 40 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 41 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 42 - "DriverMap.tsx"
Cohesion: 0.16
Nodes (21): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, locate(), coordinate() (+13 more)

### Community 43 - "20261024_stripe_billing.sql"
Cohesion: 0.12
Nodes (13): "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts, stripe_company_lifecycle_guard (+5 more)

### Community 44 - "SiteAIAgent.tsx"
Cohesion: 0.14
Nodes (24): apiFetch(), ApiResponse, buildApiUrl(), ChatMessage, ConversationStep, detectChangeIntent(), detectSearchIntent(), formatEntityInfo() (+16 more)

### Community 45 - "20261018_company_lifecycle.sql"
Cohesion: 0.12
Nodes (12): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+4 more)

### Community 46 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (13): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+5 more)

### Community 47 - "convert-database.mjs"
Cohesion: 0.18
Nodes (19): main(), convertExport(), EXCLUDED, identifier(), integer(), JsonNumber, literal(), main() (+11 more)

### Community 48 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 49 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 50 - "DirectoryToolbar.tsx"
Cohesion: 0.14
Nodes (17): cmdk, @radix-ui/react-popover, directoryCopy, CompanyOption, CompanyPicker(), DirectoryKind, DirectoryResult, Command (+9 more)

### Community 51 - "receipt/page.tsx"
Cohesion: 0.16
Nodes (19): ReceiptPage(), ReceiptWorkspace(), ExperienceFrame(), ExperienceGauge(), experienceWords, HomeInstruments(), ReceiptPrinter(), ReferenceMeter() (+11 more)

### Community 52 - "configure-mail.mjs"
Cohesion: 0.14
Nodes (14): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv(), checkedStripeSetup(), enabledStripeEvents (+6 more)

### Community 53 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 55 - "company-registrations/route.ts"
Cohesion: 0.25
Nodes (18): GET, POST, PUT, review, DELETE, document(), failed(), GET (+10 more)

### Community 57 - "welcome-config.ts"
Cohesion: 0.17
Nodes (15): APP_ORIGIN, companyRegistrationUrl(), LEGACY_APP_ORIGIN, DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome() (+7 more)

### Community 58 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 59 - "documents/route.ts"
Cohesion: 0.20
Nodes (12): jspdf, Company, GET, handler, POST, configurePdfFonts(), CompanyTariff, drawPdfQr() (+4 more)

### Community 60 - "ref_node_fs"
Cohesion: 0.13
Nodes (8): createEnrollmentHandler(), escapeHtml(), totp(), mobileConfig(), files, names, values, [id,output]

### Community 61 - "app/layout.tsx"
Cohesion: 0.16
Nodes (13): next-themes, dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider(), GlobalClientEffects() (+5 more)

### Community 62 - "messages/route.ts"
Cohesion: 0.24
Nodes (12): POST, PUT, GET, POST, GET, POST, POST, saveCompanyAccount() (+4 more)

### Community 64 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 65 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 66 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 67 - "ref_node_crypto"
Cohesion: 0.18
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 68 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 69 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 70 - "createTripJournal"
Cohesion: 0.25
Nodes (13): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+5 more)

### Community 71 - "rollout.mjs"
Cohesion: 0.15
Nodes (10): dir, aad, openPushCredential(), compose(), directory, env, [image, revision, target], lock (+2 more)

### Community 72 - "20261019_driver_shifts.sql"
Cohesion: 0.23
Nodes (10): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_immutable_shift_event() (+2 more)

### Community 73 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+7 more)

### Community 74 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 75 - "api-client.ts"
Cohesion: 0.27
Nodes (12): apiRequest(), ApiResponse, buildApiUrl(), getLoginPath(), getServerApiBaseUrl(), normalizeBaseUrl(), parseApiResponse(), redirectToLogin() (+4 more)

### Community 76 - "PublicInfo.tsx"
Cohesion: 0.23
Nodes (9): metadata, Page(), metadata, Page(), metadata, PrivacyPolicyPage(), Locale, PublicInfo() (+1 more)

### Community 77 - "CookieBanner.tsx"
Cohesion: 0.26
Nodes (11): CookieBanner(), CookieCategory, DEFAULT_CATEGORIES, T, COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION, COOKIE_PREFERENCES_EVENT, CookieConsent (+3 more)

### Community 78 - "company-pricing.ts"
Cohesion: 0.31
Nodes (11): activeCompanyTariffs(), CompanyPricing, companyPricingPatch(), companyTariffs(), defaults, driverPricing(), normalizeCompanyPricing(), numericField() (+3 more)

### Community 79 - "activity-state.tsx"
Cohesion: 0.26
Nodes (9): Period, periodDates(), validDay(), validRange(), ActivityProvider(), Context, useStateValue(), apply() (+1 more)

### Community 80 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 81 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 82 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 84 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 85 - "secret-vault.ts"
Cohesion: 0.22
Nodes (9): jose, apply, headers, url, close(), send(), decryptSecret(), encryptSecret() (+1 more)

### Community 86 - "LanguageProvider"
Cohesion: 0.24
Nodes (8): DriverLayout(), DriverLayoutShell(), detectBrowserLanguage(), LanguageProvider(), normalizeLanguage(), readCookieLanguage(), setDocumentDirection(), setLanguageCookie()

### Community 88 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 89 - "HomepageAdSlotSection.tsx"
Cohesion: 0.31
Nodes (7): dompurify, FloatingCard(), FloatingCardProps, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 90 - "sheet.tsx"
Cohesion: 0.24
Nodes (9): @radix-ui/react-dialog, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+1 more)

### Community 91 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 92 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 93 - "DriverGuideSection.tsx"
Cohesion: 0.27
Nodes (9): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+1 more)

### Community 94 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 95 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 96 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 97 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 98 - "toggle-group.tsx"
Cohesion: 0.31
Nodes (7): @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 99 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 102 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 103 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 104 - "ContractDocument.tsx"
Cohesion: 0.32
Nodes (5): dompurify, CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 105 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 106 - "driverShiftPdf"
Cohesion: 0.46
Nodes (7): driverShiftPdf(), ensure(), page(), pairs(), paragraph(), section(), table()

### Community 108 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 109 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 110 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 111 - ""schema".manual_invoices"
Cohesion: 0.38
Nodes (3): manual_invoice_immutable, "schema".manual_invoice_payments, "schema".manual_invoices

### Community 112 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 113 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 114 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 115 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 116 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 117 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 118 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 119 - "start/route.ts"
Cohesion: 0.53
Nodes (4): generateTripHash(), generateTripUuid(), getRetentionDate(), POST

### Community 123 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 124 - "ModeEnum"
Cohesion: 0.40
Nodes (5): ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET

### Community 125 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 126 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 127 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 131 - "scroll-area.tsx"
Cohesion: 0.67
Nodes (3): @radix-ui/react-scroll-area, ScrollArea, ScrollBar

### Community 132 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 133 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 134 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 135 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 136 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 137 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

### Community 138 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

### Community 147 - "PortalEnum"
Cohesion: 0.67
Nodes (3): PortalEnum, ADMIN, COMPANY

## Knowledge Gaps
- **774 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+769 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1118 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **57 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UsersManagementClient()` connect `Input` to `useAuth`, `Button`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _774 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.06471981057616416 - nodes in this community are weakly interconnected._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.06404040404040404 - nodes in this community are weakly interconnected._
- **Should `requestMiddleware` be split into smaller, more focused modules?**
  _Cohesion score 0.06142611683848797 - nodes in this community are weakly interconnected._
- **Should `PlatformLanding.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05111683848797251 - nodes in this community are weakly interconnected._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.06864035087719299 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 174 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 265 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
