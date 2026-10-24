# Graph Report - JOUW DRIVER  (2026-10-24)

## Corpus Check
- 573 files · ~244,218 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3267 nodes · 11024 edges · 160 communities (114 shown, 46 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 243 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `47811381`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- Input
- requestMiddleware
- ref_react
- Button
- usePreferences
- lucide-react
- lib/auth.ts
- api-utils.ts
- dependencies
- SiteAIAgent.tsx
- useTripController.ts
- api.ts
- cn
- contract-email-handler.ts
- api
- next
- BackgroundGeolocation
- useAuth
- session.tsx
- end/route.ts
- driver-app/package.json
- dependencies
- package.json
- sidebar.tsx
- preferences.tsx
- DriverDashboard.tsx
- _layout.tsx
- mobile-location.ts
- utils.ts
- BackgroundGeolocationService.java
- DriverShifts.tsx
- scripts
- use-toast.ts
- stripe-billing.ts
- mobile/package.json
- 20261018_subscription_billing.sql
- driver/taximeter/page.tsx
- jouww-cutover.mjs
- DriverMap.tsx
- 20261024_stripe_billing.sql
- PlatformLanding.tsx
- hashString
- company-registrations/route.ts
- native-journal.ts
- 20261018_company_lifecycle.sql
- 20261019_shift_activity.sql
- validateRequestBody
- update-customer-portal.sh
- 20261018_contract_billing.sql
- DirectoryToolbar.tsx
- DriverGdprSection.tsx
- pdf-generator.ts
- form.tsx
- TripPointJournal.java
- ref_node_crypto
- ref_node_fs
- compilerOptions
- navigation-menu.tsx
- welcome-config.ts
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- vervoerbewijs.ts
- generateAcceptanceReportPdf
- createTripJournal
- code-map.py
- configure-stripe.mjs
- convert-database.mjs
- RouteMap.tsx
- 20261019_driver_shifts.sql
- carousel.tsx
- apply-release.mjs
- api-client.ts
- subscription-scheduler.ts
- driverShiftPdf
- DriverFleetShift.tsx
- "schema".company_registrations
- chart.tsx
- [token]/route.ts
- "schema".security_fleet_locations
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
- drawer.tsx
- Override
- rollout.mjs
- verify-private-owner.cjs
- ContractDocument.tsx
- [...path]/route.ts
- android.content.Intent
- driver-app/tsconfig.json
- LiveMap.tsx
- 20261019_email_identity.sql
- definitions.d.ts
- database-readiness.mjs
- brevo/route.ts
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- start/route.ts
- admin-enrollment.mjs
- 20261009_security.sql
- 20261018_web_billing.sql
- ModeEnum
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
- 20261023_app_experience.sql
- scroll-area.tsx
- login/page.tsx
- view/route.ts
- ModeEnum
- backup.sh
- public.security_enroll_initial_owner
- 20261010_admin_mfa.sql
- trips_user_completion_request_idx
- "schema".security_create_trip_invoice
- "schema".security_reserve_mail
- preflight.mjs
- global-error.tsx
- privacy-policy/page.tsx
- PortalEnum
- backup-foundation.sh
- import-private-archive.sh
- Package.swift

## God Nodes (most connected - your core abstractions)
1. `createErrorResponse()` - 261 edges
2. `createSuccessResponse()` - 257 edges
3. `generateAdminUserToken()` - 248 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 213 edges
6. `validateRequestBody()` - 152 edges
7. `Button` - 150 edges
8. `requestMiddleware()` - 117 edges
9. `createPostgrestClient()` - 100 edges
10. `lucide-react` - 95 edges

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
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (160 total, 46 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (113): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+105 more)

### Community 1 - "Input"
Cohesion: 0.07
Nodes (107): AdSlot, AdSlotsPage(), EMPTY_FORM, CompanyContractsPage(), EditCompanyPage(), CompanyPricingPage(), CompaniesPage(), CompaniesPageContent() (+99 more)

### Community 2 - "requestMiddleware"
Cohesion: 0.05
Nodes (66): welcomePayload(), zod, GET, PUT, POST, schema, command, POST (+58 more)

### Community 3 - "ref_react"
Cohesion: 0.06
Nodes (64): @hookform/resolvers, react-hook-form, FailedTrip, Company, Company, TripData, AuthContext, AuthContextType (+56 more)

### Community 4 - "Button"
Cohesion: 0.08
Nodes (54): Page(), Page(), CompanyDashboardPage(), ContractReview, SignContractPage(), CompanyDashboard(), PortalData, DriversTab() (+46 more)

### Community 5 - "usePreferences"
Cohesion: 0.15
Nodes (45): Account(), ActiveTrip(), useActivityFilters(), ActivityFilters(), AddressField(), BillingReminder(), dismissed, Home() (+37 more)

### Community 6 - "lucide-react"
Cohesion: 0.05
Nodes (45): framer-motion, lucide-react, Page(), Page(), Page(), Page(), Page(), Page() (+37 more)

### Community 7 - "lib/auth.ts"
Cohesion: 0.10
Nodes (52): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+44 more)

### Community 8 - "api-utils.ts"
Cohesion: 0.05
Nodes (51): bcryptjs, registrationSchema, POST, VALID_TYPES, GET, POST, unavailable, GET (+43 more)

### Community 9 - "dependencies"
Cohesion: 0.03
Nodes (63): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+55 more)

### Community 10 - "SiteAIAgent.tsx"
Cohesion: 0.05
Nodes (54): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, apiFetch(), ApiResponse (+46 more)

### Community 11 - "useTripController.ts"
Cohesion: 0.09
Nodes (42): ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), nativeJournal() (+34 more)

### Community 12 - "api.ts"
Cohesion: 0.06
Nodes (46): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead() (+38 more)

### Community 13 - "cn"
Cohesion: 0.06
Nodes (52): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, AccordionContent, AccordionItem, AccordionTrigger, AlertTitle (+44 more)

### Community 14 - "contract-email-handler.ts"
Cohesion: 0.08
Nodes (39): resend, available(), GET, POST, schema, POST, schema, registerSchema (+31 more)

### Community 15 - "api"
Cohesion: 0.09
Nodes (37): sonner, AdminAccountPage(), AppExperiencePage(), metadata, PlatformContract, PlatformContractsPage(), Company, CompanySettingsPage() (+29 more)

### Community 16 - "next"
Cohesion: 0.06
Nodes (35): nextConfig, next, AdminLayout(), glassCard, labelStyle, platformLogos, Summary, TranslationKeys (+27 more)

### Community 17 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 18 - "useAuth"
Cohesion: 0.07
Nodes (37): ChironSyncPage(), Company, Contract, Signature, ContractPrintPage(), PrintableContract, DriverLoginPage(), DriverNotificationsPage() (+29 more)

### Community 19 - "session.tsx"
Cohesion: 0.10
Nodes (32): App(), logout(), styles, createActionGate(), apiConnectionKey(), DriverTripSummary, JourneyLoading(), clearReceiptCache() (+24 more)

### Community 20 - "end/route.ts"
Cohesion: 0.12
Nodes (23): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError, numeric() (+15 more)

### Community 21 - "driver-app/package.json"
Cohesion: 0.05
Nodes (38): eslint, react, react-dom, @types/react, typescript, main, name, overrides (+30 more)

### Community 22 - "dependencies"
Cohesion: 0.05
Nodes (41): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+33 more)

### Community 23 - "package.json"
Cohesion: 0.05
Nodes (38): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+30 more)

### Community 24 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 25 - "preferences.tsx"
Cohesion: 0.10
Nodes (26): RoadArt(), BrandMark(), icon, companyCopy, copy, CopyKey, Language, JourneyMark() (+18 more)

### Community 26 - "DriverDashboard.tsx"
Cohesion: 0.12
Nodes (28): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), ChironSettingsPage(), Company (+20 more)

### Community 27 - "_layout.tsx"
Cohesion: 0.09
Nodes (26): Period, periodDates(), validDay(), validRange(), DriverMessage, DriverNotification, Layout(), Navigation() (+18 more)

### Community 28 - "mobile-location.ts"
Cohesion: 0.10
Nodes (24): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+16 more)

### Community 29 - "utils.ts"
Cohesion: 0.06
Nodes (23): clsx, @radix-ui/react-checkbox, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+15 more)

### Community 30 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 31 - "DriverShifts.tsx"
Cohesion: 0.13
Nodes (23): qrcode, ShiftPage(), GET, DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy (+15 more)

### Community 32 - "scripts"
Cohesion: 0.06
Nodes (30): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+22 more)

### Community 33 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 34 - "stripe-billing.ts"
Cohesion: 0.19
Nodes (24): stripe, runtime, runtime, bind(), Client, completeSetup(), assertStripeInvoice(), finiteSchedule() (+16 more)

### Community 35 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 36 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 37 - "driver/taximeter/page.tsx"
Cohesion: 0.13
Nodes (23): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard(), LocationPoint (+15 more)

### Community 38 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 39 - "DriverMap.tsx"
Cohesion: 0.16
Nodes (21): DriverMap(), DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, search() (+13 more)

### Community 40 - "20261024_stripe_billing.sql"
Cohesion: 0.12
Nodes (13): "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts, stripe_company_lifecycle_guard (+5 more)

### Community 41 - "PlatformLanding.tsx"
Cohesion: 0.13
Nodes (12): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), openRegistration(), Route(), translations (+4 more)

### Community 42 - "hashString"
Cohesion: 0.14
Nodes (20): GET, resolveDistributorInfo(), resolveEffectiveUserType(), DELETE, POST, PUT, DELETE, POST (+12 more)

### Community 43 - "company-registrations/route.ts"
Cohesion: 0.20
Nodes (21): GET, PUT, review, DELETE, document(), failed(), GET, positiveId() (+13 more)

### Community 44 - "native-journal.ts"
Cohesion: 0.13
Nodes (12): login(), journalBytes(), assertNativeCryptoReady(), keys, createSqlTripStore(), open(), seal(), Database (+4 more)

### Community 45 - "20261018_company_lifecycle.sql"
Cohesion: 0.12
Nodes (12): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+4 more)

### Community 46 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (13): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+5 more)

### Community 47 - "validateRequestBody"
Cohesion: 0.20
Nodes (15): POST, POST, PUT, POST, GET, POST, POST, POST (+7 more)

### Community 48 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 49 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 50 - "DirectoryToolbar.tsx"
Cohesion: 0.14
Nodes (17): cmdk, @radix-ui/react-popover, directoryCopy, CompanyOption, CompanyPicker(), DirectoryKind, DirectoryResult, Command (+9 more)

### Community 51 - "DriverGdprSection.tsx"
Cohesion: 0.15
Nodes (18): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+10 more)

### Community 52 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 53 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 56 - "ref_node_crypto"
Cohesion: 0.15
Nodes (13): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+5 more)

### Community 57 - "ref_node_fs"
Cohesion: 0.15
Nodes (9): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv(), mobileConfig(), [id,output] (+1 more)

### Community 58 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 59 - "navigation-menu.tsx"
Cohesion: 0.14
Nodes (16): class-variance-authority, @radix-ui/react-navigation-menu, @radix-ui/react-toggle, @radix-ui/react-toggle-group, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList (+8 more)

### Community 60 - "welcome-config.ts"
Cohesion: 0.22
Nodes (15): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster() (+7 more)

### Community 62 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 63 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 64 - "vervoerbewijs.ts"
Cohesion: 0.17
Nodes (14): qrcode, chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs(), VervoerbewijsChiron (+6 more)

### Community 65 - "generateAcceptanceReportPdf"
Cohesion: 0.26
Nodes (14): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+6 more)

### Community 66 - "createTripJournal"
Cohesion: 0.24
Nodes (14): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+6 more)

### Community 67 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 68 - "configure-stripe.mjs"
Cohesion: 0.16
Nodes (10): dir, checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys (+2 more)

### Community 69 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 70 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 71 - "20261019_driver_shifts.sql"
Cohesion: 0.23
Nodes (10): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_immutable_shift_event() (+2 more)

### Community 72 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 73 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 74 - "api-client.ts"
Cohesion: 0.27
Nodes (12): apiRequest(), ApiResponse, buildApiUrl(), getLoginPath(), getServerApiBaseUrl(), normalizeBaseUrl(), parseApiResponse(), redirectToLogin() (+4 more)

### Community 75 - "subscription-scheduler.ts"
Cohesion: 0.27
Nodes (10): jspdf, register(), configurePdfFonts(), MailMessage, euro(), SubscriptionDocument, subscriptionPdf(), escape() (+2 more)

### Community 76 - "driverShiftPdf"
Cohesion: 0.23
Nodes (11): jose, apply, headers, url, driverShiftPdf(), ensure(), page(), pairs() (+3 more)

### Community 77 - "DriverFleetShift.tsx"
Cohesion: 0.26
Nodes (10): copy, DriverFleetShift(), registerFleetSharingStopper(), stopFleetSharingRuntime(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus (+2 more)

### Community 78 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 79 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 80 - "[token]/route.ts"
Cohesion: 0.29
Nodes (10): dynamic, GET(), headers, runtime, getVervoerbewijsArrayBuffer(), documentOrigin, receiptCapability(), receiptDocumentUrl() (+2 more)

### Community 81 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 83 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 84 - "HomepageAdSlotSection.tsx"
Cohesion: 0.31
Nodes (7): dompurify, FloatingCard(), FloatingCardProps, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 85 - "sheet.tsx"
Cohesion: 0.24
Nodes (9): @radix-ui/react-dialog, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+1 more)

### Community 86 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 87 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 88 - "DriverGuideSection.tsx"
Cohesion: 0.27
Nodes (9): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+1 more)

### Community 89 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 90 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 91 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 92 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 94 - "rollout.mjs"
Cohesion: 0.29
Nodes (7): compose(), directory, env, [image, revision, target], lock, root, run()

### Community 95 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 96 - "ContractDocument.tsx"
Cohesion: 0.32
Nodes (5): dompurify, CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 97 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 99 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 100 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 101 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 102 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 103 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 104 - "brevo/route.ts"
Cohesion: 0.52
Nodes (5): POST(), runtime, brevoMailEvent(), brevoProviderId(), brevoWebhookAuthorized()

### Community 105 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 106 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 107 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 108 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 109 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 110 - "start/route.ts"
Cohesion: 0.53
Nodes (4): generateTripHash(), generateTripUuid(), getRetentionDate(), POST

### Community 111 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 114 - "ModeEnum"
Cohesion: 0.40
Nodes (5): ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET

### Community 115 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 116 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 120 - "scroll-area.tsx"
Cohesion: 0.67
Nodes (3): @radix-ui/react-scroll-area, ScrollArea, ScrollBar

### Community 121 - "login/page.tsx"
Cohesion: 0.67
Nodes (3): dynamic, LoginPage(), LoginPageClient()

### Community 122 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 123 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

### Community 133 - "PortalEnum"
Cohesion: 0.67
Nodes (3): PortalEnum, ADMIN, COMPANY

## Knowledge Gaps
- **730 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+725 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1031 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **46 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTripController()` connect `useTripController.ts` to `api.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _730 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.06984478935698447 - nodes in this community are weakly interconnected._
- **Why does `BackgroundGeolocation` connect `BackgroundGeolocation` to `android.content.Intent`, `Override`, `BackgroundGeolocationService.java`, `BackgroundGeolocation.java`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.0706896551724138 - nodes in this community are weakly interconnected._
- **Should `requestMiddleware` be split into smaller, more focused modules?**
  _Cohesion score 0.05471226021684737 - nodes in this community are weakly interconnected._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.057455540355677154 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 167 unresolved internal-endpoint edges and 21 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 233 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
