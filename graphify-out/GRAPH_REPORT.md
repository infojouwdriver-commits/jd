# Graph Report - JOUW DRIVER  (2026-10-24)

## Corpus Check
- 573 files · ~244,263 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3268 nodes · 11026 edges · 165 communities (118 shown, 47 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 243 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eccd537e`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- Input
- requestMiddleware
- useAuth
- usePreferences
- ref_react
- next
- Button
- contract-email-handler.ts
- lib/auth.ts
- dependencies
- useTripController.ts
- api.ts
- api-utils.ts
- cn
- InvoicesFeaturePage.tsx
- BackgroundGeolocation
- session.tsx
- end/route.ts
- driver-app/package.json
- package.json
- dependencies
- SiteAIAgent.tsx
- sidebar.tsx
- validateRequestBody
- preferences.tsx
- GdprAdminClient.tsx
- lucide-react
- CookieBanner.tsx
- _layout.tsx
- mobile-location.ts
- BackgroundGeolocationService.java
- scripts
- DriverShifts.tsx
- use-toast.ts
- stripe-billing.ts
- mobile/package.json
- 20261018_subscription_billing.sql
- driver/taximeter/page.tsx
- jouww-cutover.mjs
- DriverMap.tsx
- 20261024_stripe_billing.sql
- PlatformLanding.tsx
- native-journal.ts
- 20261018_company_lifecycle.sql
- 20261019_shift_activity.sql
- utils.ts
- company-registrations/route.ts
- update-customer-portal.sh
- 20261018_contract_billing.sql
- DirectoryToolbar.tsx
- form.tsx
- TripPointJournal.java
- ref_node_fs
- vervoerbewijs.ts
- compilerOptions
- navigation-menu.tsx
- api-client.ts
- welcome-config.ts
- messages/route.ts
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- generateAcceptanceReportPdf
- code-map.py
- ref_node_crypto
- convert-database.mjs
- RouteMap.tsx
- createTripJournal
- rollout.mjs
- 20261019_driver_shifts.sql
- carousel.tsx
- apply-release.mjs
- driverShiftPdf
- DriverFleetShift.tsx
- DriverGuideSection.tsx
- "schema".company_registrations
- chart.tsx
- [token]/route.ts
- "schema".security_fleet_locations
- pdf-generator.ts
- PDFGenerator
- "schema".security_save_company_account
- "schema".company_change_requests
- HomepageAdSlotSection.tsx
- sheet.tsx
- FaqPage.tsx
- chat/route.ts
- pagination.tsx
- configure-stripe.mjs
- recover-db-log.mjs
- 20261013_mail_delivery.sql
- drawer.tsx
- Override
- verify-private-owner.cjs
- ContractDocument.tsx
- [...path]/route.ts
- android.content.Intent
- driver-app/tsconfig.json
- LiveMap.tsx
- 20261019_email_identity.sql
- definitions.d.ts
- database-readiness.mjs
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
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
- 20261023_app_experience.sql
- scroll-area.tsx
- user/route.ts
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
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (165 total, 47 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (114): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+106 more)

### Community 1 - "Input"
Cohesion: 0.07
Nodes (91): AdSlot, AdSlotsPage(), EMPTY_FORM, Company, CompanyContractsPage(), Contract, Signature, Company (+83 more)

### Community 2 - "requestMiddleware"
Cohesion: 0.06
Nodes (57): welcomePayload(), zod, GET, PUT, command, POST, filters, GET (+49 more)

### Community 3 - "useAuth"
Cohesion: 0.06
Nodes (65): sonner, AdminAccountPage(), AppExperiencePage(), metadata, ChironSyncPage(), FailedTrip, ChironSettingsPage(), Company (+57 more)

### Community 4 - "usePreferences"
Cohesion: 0.15
Nodes (45): Account(), ActiveTrip(), useActivityFilters(), ActivityFilters(), AddressField(), BillingReminder(), dismissed, Home() (+37 more)

### Community 5 - "ref_react"
Cohesion: 0.08
Nodes (50): Page(), Page(), ContractPrintPage(), PrintableContract, ContractReview, SignContractPage(), PortalData, DriversTab() (+42 more)

### Community 6 - "next"
Cohesion: 0.04
Nodes (52): nextConfig, framer-motion, next, DriverLayout(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission() (+44 more)

### Community 7 - "Button"
Cohesion: 0.07
Nodes (57): @hookform/resolvers, react-hook-form, CompanyLoginForm(), CompanyLoginFormData, CompanyLoginFormProps, companyLoginSchema, DriverRegisterForm(), DriverRegisterFormProps (+49 more)

### Community 8 - "contract-email-handler.ts"
Cohesion: 0.06
Nodes (49): resend, dynamic, LoginPage(), command, POST, POST, POST, POST() (+41 more)

### Community 9 - "lib/auth.ts"
Cohesion: 0.10
Nodes (52): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+44 more)

### Community 10 - "dependencies"
Cohesion: 0.03
Nodes (64): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+56 more)

### Community 11 - "useTripController.ts"
Cohesion: 0.09
Nodes (42): ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), nativeJournal() (+34 more)

### Community 12 - "api.ts"
Cohesion: 0.06
Nodes (46): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead() (+38 more)

### Community 13 - "api-utils.ts"
Cohesion: 0.06
Nodes (45): bcryptjs, registrationSchema, POST, VALID_TYPES, GET, normalizeUrlPreview(), ApiParams, appendCorsHeaders() (+37 more)

### Community 14 - "cn"
Cohesion: 0.06
Nodes (52): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger, AlertTitle (+44 more)

### Community 15 - "InvoicesFeaturePage.tsx"
Cohesion: 0.07
Nodes (37): Page(), Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps (+29 more)

### Community 16 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 17 - "session.tsx"
Cohesion: 0.10
Nodes (32): App(), logout(), styles, createActionGate(), apiConnectionKey(), DriverTripSummary, JourneyLoading(), clearReceiptCache() (+24 more)

### Community 18 - "end/route.ts"
Cohesion: 0.12
Nodes (23): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError, numeric() (+15 more)

### Community 19 - "driver-app/package.json"
Cohesion: 0.05
Nodes (38): eslint, react, react-dom, @types/react, typescript, main, name, overrides (+30 more)

### Community 20 - "package.json"
Cohesion: 0.05
Nodes (39): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+31 more)

### Community 21 - "dependencies"
Cohesion: 0.05
Nodes (41): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+33 more)

### Community 22 - "SiteAIAgent.tsx"
Cohesion: 0.08
Nodes (35): next-themes, dynamic, metadata, RootLayout(), viewport, apiFetch(), ApiResponse, buildApiUrl() (+27 more)

### Community 23 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 24 - "validateRequestBody"
Cohesion: 0.12
Nodes (30): available(), GET, POST, schema, POST, schema, POST, schema (+22 more)

### Community 25 - "preferences.tsx"
Cohesion: 0.10
Nodes (26): RoadArt(), BrandMark(), icon, companyCopy, copy, CopyKey, Language, JourneyMark() (+18 more)

### Community 26 - "GdprAdminClient.tsx"
Cohesion: 0.09
Nodes (34): GdprAdminPage(), metadata, glassCard, labelStyle, PeriodType, StatCard(), SummaryData, SummaryPage() (+26 more)

### Community 27 - "lucide-react"
Cohesion: 0.12
Nodes (26): lucide-react, ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), AdminLayout() (+18 more)

### Community 28 - "CookieBanner.tsx"
Cohesion: 0.10
Nodes (29): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+21 more)

### Community 29 - "_layout.tsx"
Cohesion: 0.09
Nodes (26): Period, periodDates(), validDay(), validRange(), DriverMessage, DriverNotification, Layout(), Navigation() (+18 more)

### Community 30 - "mobile-location.ts"
Cohesion: 0.10
Nodes (24): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+16 more)

### Community 31 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 32 - "scripts"
Cohesion: 0.06
Nodes (30): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+22 more)

### Community 33 - "DriverShifts.tsx"
Cohesion: 0.14
Nodes (22): qrcode, ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy, DriverShift (+14 more)

### Community 34 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 35 - "stripe-billing.ts"
Cohesion: 0.18
Nodes (25): stripe, runtime, runtime, bind(), Client, completeSetup(), assertStripeInvoice(), finiteSchedule() (+17 more)

### Community 36 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 37 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 38 - "driver/taximeter/page.tsx"
Cohesion: 0.13
Nodes (23): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard(), LocationPoint (+15 more)

### Community 39 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 40 - "DriverMap.tsx"
Cohesion: 0.16
Nodes (21): DriverMap(), DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, search() (+13 more)

### Community 41 - "20261024_stripe_billing.sql"
Cohesion: 0.12
Nodes (13): "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts, stripe_company_lifecycle_guard (+5 more)

### Community 42 - "PlatformLanding.tsx"
Cohesion: 0.13
Nodes (12): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), openRegistration(), Route(), translations (+4 more)

### Community 43 - "native-journal.ts"
Cohesion: 0.13
Nodes (12): login(), journalBytes(), assertNativeCryptoReady(), keys, createSqlTripStore(), open(), seal(), Database (+4 more)

### Community 44 - "20261018_company_lifecycle.sql"
Cohesion: 0.12
Nodes (12): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+4 more)

### Community 45 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (13): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+5 more)

### Community 46 - "utils.ts"
Cohesion: 0.08
Nodes (17): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-slider, react-day-picker, react-resizable-panels, tailwind-merge (+9 more)

### Community 47 - "company-registrations/route.ts"
Cohesion: 0.22
Nodes (20): PUT, review, DELETE, document(), failed(), GET, positiveId(), POST (+12 more)

### Community 48 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 49 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 50 - "DirectoryToolbar.tsx"
Cohesion: 0.14
Nodes (17): cmdk, @radix-ui/react-popover, directoryCopy, CompanyOption, CompanyPicker(), DirectoryKind, DirectoryResult, Command (+9 more)

### Community 51 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 54 - "ref_node_fs"
Cohesion: 0.15
Nodes (9): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv(), mobileConfig(), [id,output] (+1 more)

### Community 55 - "vervoerbewijs.ts"
Cohesion: 0.16
Nodes (15): jspdf, configurePdfFonts(), chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs() (+7 more)

### Community 56 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 57 - "navigation-menu.tsx"
Cohesion: 0.14
Nodes (16): class-variance-authority, @radix-ui/react-navigation-menu, @radix-ui/react-toggle, @radix-ui/react-toggle-group, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList (+8 more)

### Community 58 - "api-client.ts"
Cohesion: 0.19
Nodes (15): Vehicle, VehicleSelector(), VehicleSelectorProps, apiRequest(), ApiResponse, buildApiUrl(), getLoginPath(), getServerApiBaseUrl() (+7 more)

### Community 59 - "welcome-config.ts"
Cohesion: 0.22
Nodes (15): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster() (+7 more)

### Community 60 - "messages/route.ts"
Cohesion: 0.24
Nodes (12): POST, PUT, GET, POST, GET, POST, POST, saveCompanyAccount() (+4 more)

### Community 62 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 63 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 64 - "generateAcceptanceReportPdf"
Cohesion: 0.26
Nodes (14): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+6 more)

### Community 65 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 66 - "ref_node_crypto"
Cohesion: 0.18
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 67 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 68 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 69 - "createTripJournal"
Cohesion: 0.25
Nodes (13): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+5 more)

### Community 70 - "rollout.mjs"
Cohesion: 0.15
Nodes (10): dir, aad, openPushCredential(), compose(), directory, env, [image, revision, target], lock (+2 more)

### Community 71 - "20261019_driver_shifts.sql"
Cohesion: 0.23
Nodes (10): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_immutable_shift_event() (+2 more)

### Community 72 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 73 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 74 - "driverShiftPdf"
Cohesion: 0.23
Nodes (11): jose, apply, headers, url, driverShiftPdf(), ensure(), page(), pairs() (+3 more)

### Community 75 - "DriverFleetShift.tsx"
Cohesion: 0.26
Nodes (10): copy, DriverFleetShift(), registerFleetSharingStopper(), stopFleetSharingRuntime(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus (+2 more)

### Community 76 - "DriverGuideSection.tsx"
Cohesion: 0.22
Nodes (11): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+3 more)

### Community 77 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 78 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 79 - "[token]/route.ts"
Cohesion: 0.29
Nodes (10): dynamic, GET(), headers, runtime, getVervoerbewijsArrayBuffer(), documentOrigin, receiptCapability(), receiptDocumentUrl() (+2 more)

### Community 80 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 81 - "pdf-generator.ts"
Cohesion: 0.22
Nodes (9): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, TestResult, TripInvoiceData (+1 more)

### Community 84 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 85 - "HomepageAdSlotSection.tsx"
Cohesion: 0.29
Nodes (7): dompurify, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml(), LandingLanguage, landingTranslations

### Community 86 - "sheet.tsx"
Cohesion: 0.24
Nodes (9): @radix-ui/react-dialog, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+1 more)

### Community 87 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 88 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 89 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 90 - "configure-stripe.mjs"
Cohesion: 0.31
Nodes (7): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys

### Community 91 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 92 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 93 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

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

### Community 104 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 105 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 106 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 107 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 108 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 109 - "start/route.ts"
Cohesion: 0.53
Nodes (4): generateTripHash(), generateTripUuid(), getRetentionDate(), POST

### Community 110 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 113 - "ModeEnum"
Cohesion: 0.40
Nodes (5): ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET

### Community 114 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 115 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 116 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 120 - "scroll-area.tsx"
Cohesion: 0.67
Nodes (3): @radix-ui/react-scroll-area, ScrollArea, ScrollBar

### Community 121 - "user/route.ts"
Cohesion: 0.83
Nodes (3): GET, resolveDistributorInfo(), resolveEffectiveUserType()

### Community 122 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 123 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 124 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 125 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 126 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 127 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

### Community 128 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

### Community 138 - "PortalEnum"
Cohesion: 0.67
Nodes (3): PortalEnum, ADMIN, COMPANY

## Knowledge Gaps
- **730 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+725 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1031 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **47 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTripController()` connect `useTripController.ts` to `api.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _730 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.06914932457101132 - nodes in this community are weakly interconnected._
- **Why does `BackgroundGeolocation` connect `BackgroundGeolocation` to `android.content.Intent`, `BackgroundGeolocation.java`, `Override`, `BackgroundGeolocationService.java`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.07406496062992125 - nodes in this community are weakly interconnected._
- **Should `requestMiddleware` be split into smaller, more focused modules?**
  _Cohesion score 0.06314432989690721 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.06147732585320243 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 167 unresolved internal-endpoint edges and 21 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 233 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
