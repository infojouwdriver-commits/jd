# Graph Report - JOUW DRIVER  (2026-10-28)

## Corpus Check
- 612 files · ~256,761 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3480 nodes · 11754 edges · 178 communities (124 shown, 54 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 245 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9219d415`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- api-client.ts
- ref_react
- Input
- requestMiddleware
- Badge
- usePreferences
- DriverRegisterForm.tsx
- stripe-billing.ts
- preferences.tsx
- lib/auth.ts
- Card
- PlatformLanding.tsx
- api.ts
- dependencies
- useTripController.ts
- cn
- api-utils.ts
- zod
- InvoicesFeaturePage.tsx
- BackgroundGeolocation
- session.tsx
- package.json
- sidebar.tsx
- ChironError
- 20261026_invoice_checkout.sql
- BackgroundGeolocationService.java
- mobile-location.ts
- DriverShifts.tsx
- scripts
- use-toast.ts
- driver-app/package.json
- utils.ts
- app/layout.tsx
- dependencies
- mobile/package.json
- driver/taximeter/page.tsx
- validateRequestBody
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- native-journal.ts
- DriverMap.tsx
- 20261024_stripe_billing.sql
- 20261018_company_lifecycle.sql
- 20261019_shift_activity.sql
- update-customer-portal.sh
- 20261018_contract_billing.sql
- DriverGdprSection.tsx
- pdf-generator.ts
- form.tsx
- TripPointJournal.java
- ref_node_fs
- compilerOptions
- welcome-config.ts
- vervoerbewijs.ts
- CookieBanner.tsx
- SiteAIAgent
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- generateAcceptanceReportPdf
- code-map.py
- convert-database.mjs
- receipt/page.tsx
- RouteMap.tsx
- next_api/contracts/route.ts
- receipt-email/route.ts
- createTripJournal
- 20261019_driver_shifts.sql
- command.tsx
- carousel.tsx
- apply-release.mjs
- [token]/route.ts
- ref_node_crypto
- configure-mail.mjs
- end/route.ts
- mail-policy.ts
- push-worker.mjs
- activity-state.tsx
- "schema".company_registrations
- chart.tsx
- send-signature-link/route.ts
- driverShiftPdf
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- HomepageAdSlotSection.tsx
- secret-vault.ts
- contract-email-handler.ts
- mail-service.ts
- "schema".security_save_company_account
- "schema".company_change_requests
- class-variance-authority
- sheet.tsx
- FaqPage.tsx
- chat/route.ts
- DriverGuideSection.tsx
- pagination.tsx
- configure-stripe.mjs
- recover-db-log.mjs
- scripts
- 20261013_mail_delivery.sql
- navigation-menu.tsx
- drawer.tsx
- DirectoryToolbar.tsx
- Override
- "schema".security_email_contract
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- [...path]/route.ts
- android.content.Intent
- driver-app/tsconfig.json
- LiveMap.tsx
- 20261019_email_identity.sql
- "schema".manual_invoices
- definitions.d.ts
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- contract-template.ts
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
- company-portal/drivers/route.ts
- company-portal/vehicles/route.ts
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
1. `createErrorResponse()` - 271 edges
2. `createSuccessResponse()` - 269 edges
3. `generateAdminUserToken()` - 261 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 213 edges
6. `Button` - 160 edges
7. `validateRequestBody()` - 158 edges
8. `requestMiddleware()` - 122 edges
9. `createPostgrestClient()` - 117 edges
10. `useLanguage()` - 114 edges

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
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (178 total, 54 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (114): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+106 more)

### Community 1 - "api-client.ts"
Cohesion: 0.03
Nodes (97): nextConfig, framer-motion, lucide-react, next, sonner, ChironSyncPage(), FailedTrip, Company (+89 more)

### Community 2 - "ref_react"
Cohesion: 0.06
Nodes (71): Page(), Page(), Page(), ContractPrintPage(), PrintableContract, InvoicePayment(), action(), words (+63 more)

### Community 3 - "Input"
Cohesion: 0.09
Nodes (73): Company, CompanyContractsPage(), Contract, Signature, EditCompanyPage(), PlatformContract, PlatformContractsPage(), Company (+65 more)

### Community 4 - "requestMiddleware"
Cohesion: 0.07
Nodes (57): welcomePayload(), GET, PUT, command, POST, filters, GET, GET (+49 more)

### Community 5 - "Badge"
Cohesion: 0.08
Nodes (58): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, CompaniesPage(), CompaniesPageContent(), Company (+50 more)

### Community 6 - "usePreferences"
Cohesion: 0.15
Nodes (45): Account(), ActiveTrip(), invoice(), useActivityFilters(), ActivityFilters(), AddressField(), BillingReminder(), dismissed (+37 more)

### Community 7 - "DriverRegisterForm.tsx"
Cohesion: 0.05
Nodes (66): @hookform/resolvers, react-hook-form, CompanyLoginForm(), DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data (+58 more)

### Community 8 - "stripe-billing.ts"
Cohesion: 0.07
Nodes (58): stripe, runtime, runtime, register(), BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState (+50 more)

### Community 9 - "preferences.tsx"
Cohesion: 0.05
Nodes (51): DriverMessage, DriverNotification, Layout(), Navigation(), RoadArt(), BrandMark(), icon, companyCopy (+43 more)

### Community 10 - "lib/auth.ts"
Cohesion: 0.09
Nodes (55): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+47 more)

### Community 11 - "Card"
Cohesion: 0.09
Nodes (51): AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), ChironSettingsPage() (+43 more)

### Community 12 - "PlatformLanding.tsx"
Cohesion: 0.07
Nodes (44): metadata, dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props (+36 more)

### Community 13 - "api.ts"
Cohesion: 0.06
Nodes (52): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead() (+44 more)

### Community 14 - "dependencies"
Cohesion: 0.03
Nodes (63): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+55 more)

### Community 15 - "useTripController.ts"
Cohesion: 0.09
Nodes (43): ActionGate, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), nativeJournal(), engines (+35 more)

### Community 16 - "cn"
Cohesion: 0.06
Nodes (51): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+43 more)

### Community 17 - "api-utils.ts"
Cohesion: 0.07
Nodes (43): POST, VALID_TYPES, AUTH_ENABLED, ApiParams, appendCorsHeaders(), clearCookie(), extractBearerToken(), getAllowedOrigin() (+35 more)

### Community 18 - "zod"
Cohesion: 0.10
Nodes (34): bcryptjs, zod, available(), GET, POST, schema, POST, schema (+26 more)

### Community 19 - "InvoicesFeaturePage.tsx"
Cohesion: 0.07
Nodes (36): Page(), Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps (+28 more)

### Community 20 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 21 - "session.tsx"
Cohesion: 0.09
Nodes (32): App(), logout(), styles, createActionGate(), apiConnectionKey(), driverApi, DriverProfile, DriverTripSummary (+24 more)

### Community 22 - "package.json"
Cohesion: 0.05
Nodes (39): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+31 more)

### Community 23 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 24 - "ChironError"
Cohesion: 0.13
Nodes (19): POST, canonicalChironEnvironment(), chironDestination(), ChironError, numeric(), rideMessage(), timestamp(), retryChironTrip() (+11 more)

### Community 25 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (21): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+13 more)

### Community 26 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 27 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 28 - "DriverShifts.tsx"
Cohesion: 0.13
Nodes (23): qrcode, qrcode, ShiftPage(), failure(), GET, DocumentQr(), DriverShifts(), downloadPdf() (+15 more)

### Community 29 - "scripts"
Cohesion: 0.06
Nodes (30): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+22 more)

### Community 30 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 31 - "driver-app/package.json"
Cohesion: 0.07
Nodes (27): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+19 more)

### Community 32 - "utils.ts"
Cohesion: 0.07
Nodes (20): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+12 more)

### Community 33 - "app/layout.tsx"
Cohesion: 0.10
Nodes (21): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider() (+13 more)

### Community 34 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+19 more)

### Community 35 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 36 - "driver/taximeter/page.tsx"
Cohesion: 0.13
Nodes (24): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard(), LocationPoint (+16 more)

### Community 37 - "validateRequestBody"
Cohesion: 0.17
Nodes (18): POST, POST, POST, PUT, POST, POST, GET, POST (+10 more)

### Community 38 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 39 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 40 - "native-journal.ts"
Cohesion: 0.12
Nodes (13): login(), journalBytes(), assertNativeCryptoReady(), keys, createSqlTripStore(), open(), seal(), Database (+5 more)

### Community 41 - "DriverMap.tsx"
Cohesion: 0.15
Nodes (21): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, search(), coordinate() (+13 more)

### Community 42 - "20261024_stripe_billing.sql"
Cohesion: 0.12
Nodes (13): "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts, stripe_company_lifecycle_guard (+5 more)

### Community 43 - "20261018_company_lifecycle.sql"
Cohesion: 0.12
Nodes (12): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+4 more)

### Community 44 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (13): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+5 more)

### Community 45 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 46 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 47 - "DriverGdprSection.tsx"
Cohesion: 0.15
Nodes (18): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+10 more)

### Community 48 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 49 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 51 - "ref_node_fs"
Cohesion: 0.13
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 53 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 54 - "welcome-config.ts"
Cohesion: 0.20
Nodes (15): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster() (+7 more)

### Community 55 - "vervoerbewijs.ts"
Cohesion: 0.19
Nodes (14): jspdf, configurePdfFonts(), chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs() (+6 more)

### Community 56 - "CookieBanner.tsx"
Cohesion: 0.19
Nodes (13): ReceiptEmailSettings(), CookieBanner(), CookieCategory, DEFAULT_CATEGORIES, T, Switch, COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION (+5 more)

### Community 57 - "SiteAIAgent"
Cohesion: 0.19
Nodes (18): apiFetch(), buildApiUrl(), detectChangeIntent(), detectSearchIntent(), formatEntityInfo(), generateId(), SiteAIAgent(), addAssistantMessage() (+10 more)

### Community 59 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 60 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 61 - "generateAcceptanceReportPdf"
Cohesion: 0.26
Nodes (14): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+6 more)

### Community 62 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 63 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 64 - "receipt/page.tsx"
Cohesion: 0.25
Nodes (13): ReceiptPage(), ReceiptWorkspace(), ExperienceFrame(), ExperienceGauge(), experienceWords, HomeInstruments(), ReceiptPrinter(), ReferenceMeter() (+5 more)

### Community 65 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 66 - "next_api/contracts/route.ts"
Cohesion: 0.36
Nodes (14): PUT, DELETE, document(), failed(), GET, positiveId(), POST, PUT (+6 more)

### Community 67 - "receipt-email/route.ts"
Cohesion: 0.23
Nodes (14): esc(), POST, Draft, mailConfiguration(), mailEventKey(), sendTransactionalMail(), IssuedReceipt, localized (+6 more)

### Community 68 - "createTripJournal"
Cohesion: 0.25
Nodes (13): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+5 more)

### Community 69 - "20261019_driver_shifts.sql"
Cohesion: 0.23
Nodes (10): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_immutable_shift_event() (+2 more)

### Community 70 - "command.tsx"
Cohesion: 0.18
Nodes (13): cmdk, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup, CommandInput (+5 more)

### Community 71 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 72 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 73 - "[token]/route.ts"
Cohesion: 0.25
Nodes (12): dynamic, GET(), headers, runtime, getVervoerbewijsArrayBuffer(), VervoerbewijsData, documentOrigin, receiptCapability() (+4 more)

### Community 74 - "ref_node_crypto"
Cohesion: 0.16
Nodes (8): base, checks, headers, now, required, decodeTotpSecret(), matchingTotpStep(), totpAt()

### Community 75 - "configure-mail.mjs"
Cohesion: 0.20
Nodes (9): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv(), dir, aad (+1 more)

### Community 76 - "end/route.ts"
Cohesion: 0.23
Nodes (9): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST (+1 more)

### Community 77 - "mail-policy.ts"
Cohesion: 0.18
Nodes (10): resend, dynamic, LoginPage(), POST(), runtime, LoginPageClient(), events, MAIL_FREE_LIMITS (+2 more)

### Community 78 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 79 - "activity-state.tsx"
Cohesion: 0.26
Nodes (9): Period, periodDates(), validDay(), validRange(), ActivityProvider(), Context, useStateValue(), apply() (+1 more)

### Community 80 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 81 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 82 - "send-signature-link/route.ts"
Cohesion: 0.29
Nodes (9): command, POST, claims, contractDigest(), ContractEmailLink, issueContractEmailLink(), mac(), readContractEmailLink() (+1 more)

### Community 83 - "driverShiftPdf"
Cohesion: 0.27
Nodes (10): GET, runtime, driverShiftPdf(), ensure(), page(), pairs(), paragraph(), section() (+2 more)

### Community 84 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 85 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 86 - "HomepageAdSlotSection.tsx"
Cohesion: 0.27
Nodes (8): dompurify, dompurify, FloatingCard(), FloatingCardProps, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 87 - "secret-vault.ts"
Cohesion: 0.22
Nodes (9): jose, apply, headers, url, close(), send(), decryptSecret(), encryptSecret() (+1 more)

### Community 88 - "contract-email-handler.ts"
Cohesion: 0.27
Nodes (7): POST, POST, emailContractHandler(), review, signature, contractSigningCopy, contractSigningLanguage()

### Community 89 - "mail-service.ts"
Cohesion: 0.31
Nodes (8): POST(), runtime, brevoIdempotencyKey(), brevoMailEvent(), brevoProviderId(), brevoWebhookAuthorized(), MailMessage, MailResult

### Community 91 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 92 - "class-variance-authority"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 93 - "sheet.tsx"
Cohesion: 0.24
Nodes (9): @radix-ui/react-dialog, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+1 more)

### Community 94 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 95 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 96 - "DriverGuideSection.tsx"
Cohesion: 0.27
Nodes (9): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+1 more)

### Community 97 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 98 - "configure-stripe.mjs"
Cohesion: 0.31
Nodes (7): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys

### Community 99 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 100 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 101 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 102 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 103 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 104 - "DirectoryToolbar.tsx"
Cohesion: 0.31
Nodes (4): directoryCopy, CompanyOption, DirectoryKind, DirectoryResult

### Community 107 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 108 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 109 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 111 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 112 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 113 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 114 - ""schema".manual_invoices"
Cohesion: 0.38
Nodes (3): manual_invoice_immutable, "schema".manual_invoice_payments, "schema".manual_invoices

### Community 115 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 116 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 117 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 118 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 119 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 120 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 121 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

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

## Knowledge Gaps
- **752 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+747 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1090 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **54 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `DriverShifts.tsx`, `HomepageAdSlotSection.tsx`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _752 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.06907630522088354 - nodes in this community are weakly interconnected._
- **Why does `AdminDriversPageContent()` connect `Badge` to `Input`, `api-client.ts`, `ref_react`, `Card`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `api-client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03175745118191162 - nodes in this community are weakly interconnected._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.05728924080111784 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.09042096219931271 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 174 unresolved internal-endpoint edges and 21 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 254 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
