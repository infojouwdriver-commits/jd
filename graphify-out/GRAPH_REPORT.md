# Graph Report - JOUW DRIVER  (2026-10-23)

## Corpus Check
- 561 files · ~241,942 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3180 nodes · 10819 edges · 156 communities (111 shown, 45 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 250 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6bc6e4c1`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- ref_react
- Input
- requestMiddleware
- DriverRegisterForm.tsx
- lib/auth.ts
- admin/drivers/page.tsx
- usePreferences
- Button
- dependencies
- useTripController.ts
- api-utils.ts
- cn
- useAuth
- account/route.ts
- driver-app/package.json
- InvoicesFeaturePage.tsx
- session.tsx
- SiteAIAgent.tsx
- BackgroundGeolocation
- package.json
- api.ts
- preferences.tsx
- sidebar.tsx
- CookieBanner.tsx
- ChironError
- _layout.tsx
- DriverDashboard.tsx
- BackgroundGeolocationService.java
- DriverShifts.tsx
- ref_node_fs
- mobile-location.ts
- utils.ts
- company-changes.ts
- validateRequestBody
- use-toast.ts
- dependencies
- mobile/package.json
- 20261018_subscription_billing.sql
- driver/taximeter/page.tsx
- api-client.ts
- jouww-cutover.mjs
- DriverMap.tsx
- command.tsx
- PlatformLanding.tsx
- 20261018_company_lifecycle.sql
- 20261019_shift_activity.sql
- company-registrations/route.ts
- 20261018_contract_billing.sql
- update-customer-portal.sh
- form.tsx
- TripPointJournal.java
- createTripJournal
- compilerOptions
- ref_node_crypto
- welcome-config.ts
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- vervoerbewijs.ts
- code-map.py
- scripts
- convert-database.mjs
- RouteMap.tsx
- generateAcceptanceReportPdf
- 20261019_driver_shifts.sql
- carousel.tsx
- pdf-generator.ts
- apply-release.mjs
- devDependencies
- end/route.ts
- driverShiftPdf
- push-worker.mjs
- DriverFleetShift.tsx
- "schema".company_registrations
- chart.tsx
- "schema".security_fleet_locations
- HomepageAdSlotSection.tsx
- subscription-scheduler.ts
- PDFGenerator
- "schema".security_save_company_account
- "schema".company_change_requests
- FaqPage.tsx
- chat/route.ts
- DriverGuideSection.tsx
- pagination.tsx
- scripts
- 20261013_mail_delivery.sql
- navigation-menu.tsx
- drawer.tsx
- Override
- verify-private-owner.cjs
- receipt.ts
- [...path]/route.ts
- android.content.Intent
- createDriverApi
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
- contract-template.ts
- devDependencies
- 20261009_security.sql
- 20261018_web_billing.sql
- container-scroll-animation.tsx
- document-links.ts
- driver-activity.ts
- prepare-customer-runtime.sh
- save
- "schema".security_create_driver_account
- "schema".company_staff_events
- 20261023_app_experience.sql
- company-portal/drivers/route.ts
- company-portal/vehicles/route.ts
- invoices/send/route.ts
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
1. `createErrorResponse()` - 261 edges
2. `createSuccessResponse()` - 256 edges
3. `generateAdminUserToken()` - 248 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 218 edges
6. `validateRequestBody()` - 150 edges
7. `Button` - 148 edges
8. `requestMiddleware()` - 116 edges
9. `lucide-react` - 96 edges
10. `createPostgrestClient()` - 96 edges

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

## Communities (156 total, 45 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (115): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+107 more)

### Community 1 - "ref_react"
Cohesion: 0.03
Nodes (77): nextConfig, framer-motion, lucide-react, next, AdminLayout(), ContractPrintPage(), PrintableContract, DriverLoginPage() (+69 more)

### Community 2 - "Input"
Cohesion: 0.07
Nodes (79): Company, CompanyContractsPage(), Contract, Signature, Company, EditCompanyPage(), Company, Distributor (+71 more)

### Community 3 - "requestMiddleware"
Cohesion: 0.07
Nodes (50): welcomePayload(), zod, GET, PUT, command, POST, filters, GET (+42 more)

### Community 4 - "DriverRegisterForm.tsx"
Cohesion: 0.05
Nodes (69): @hookform/resolvers, react-hook-form, dynamic, LoginPage(), CompanyLoginForm(), DriverRegisterForm(), DriverRegisterFormProps, FormField() (+61 more)

### Community 5 - "lib/auth.ts"
Cohesion: 0.08
Nodes (60): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+52 more)

### Community 6 - "admin/drivers/page.tsx"
Cohesion: 0.08
Nodes (51): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, CompaniesPage(), CompaniesPageContent(), Company (+43 more)

### Community 7 - "usePreferences"
Cohesion: 0.16
Nodes (43): Account(), ActiveTrip(), useActivityFilters(), ActivityFilters(), AddressField(), BillingReminder(), dismissed, Home() (+35 more)

### Community 8 - "Button"
Cohesion: 0.10
Nodes (40): Page(), CompanyDashboardPage(), CompanyDashboard(), PortalData, DriversTab(), VehiclesTab(), DriverShiftWorkspace(), Error() (+32 more)

### Community 9 - "dependencies"
Cohesion: 0.03
Nodes (62): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+54 more)

### Community 10 - "useTripController.ts"
Cohesion: 0.09
Nodes (43): ActionGate, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), nativeJournal(), engines (+35 more)

### Community 11 - "api-utils.ts"
Cohesion: 0.06
Nodes (45): bcryptjs, POST, registrationSchema, GET, GET, POST, GET, POST (+37 more)

### Community 12 - "cn"
Cohesion: 0.06
Nodes (52): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger (+44 more)

### Community 13 - "useAuth"
Cohesion: 0.11
Nodes (43): sonner, AdminAccountPage(), ChironSyncPage(), FailedTrip, ChironSettingsPage(), Company, PlatformContract, PlatformContractsPage() (+35 more)

### Community 14 - "account/route.ts"
Cohesion: 0.07
Nodes (39): resend, dynamic, GET(), headers, runtime, available(), GET, POST (+31 more)

### Community 15 - "driver-app/package.json"
Cohesion: 0.05
Nodes (40): login(), eslint, react, react-dom, @types/react, typescript, main, name (+32 more)

### Community 16 - "InvoicesFeaturePage.tsx"
Cohesion: 0.07
Nodes (37): Page(), Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps (+29 more)

### Community 17 - "session.tsx"
Cohesion: 0.08
Nodes (35): App(), logout(), styles, createActionGate(), apiConnectionKey(), ApiError, DriverProfile, DriverTripSummary (+27 more)

### Community 18 - "SiteAIAgent.tsx"
Cohesion: 0.07
Nodes (41): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, apiFetch(), ApiResponse (+33 more)

### Community 19 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 20 - "package.json"
Cohesion: 0.04
Nodes (42): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+34 more)

### Community 21 - "api.ts"
Cohesion: 0.09
Nodes (32): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, driverApi, DriverDetails, DriverReply, RevenueSummary (+24 more)

### Community 22 - "preferences.tsx"
Cohesion: 0.09
Nodes (29): RoadArt(), BrandMark(), icon, companyCopy, copy, CopyKey, Language, JourneyLoading() (+21 more)

### Community 23 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 24 - "CookieBanner.tsx"
Cohesion: 0.09
Nodes (30): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+22 more)

### Community 25 - "ChironError"
Cohesion: 0.14
Nodes (18): canonicalChironEnvironment(), chironDestination(), ChironError, numeric(), rideMessage(), timestamp(), retryChironTrip(), ChironService (+10 more)

### Community 26 - "_layout.tsx"
Cohesion: 0.09
Nodes (27): Period, periodDates(), validDay(), validRange(), DriverMessage, DriverNotification, Layout(), Navigation() (+19 more)

### Community 27 - "DriverDashboard.tsx"
Cohesion: 0.15
Nodes (25): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), DashboardPage(), ApprovalRequest (+17 more)

### Community 28 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 29 - "DriverShifts.tsx"
Cohesion: 0.13
Nodes (23): qrcode, ShiftPage(), GET, DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy (+15 more)

### Community 30 - "ref_node_fs"
Cohesion: 0.10
Nodes (16): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv(), compose(), directory (+8 more)

### Community 31 - "mobile-location.ts"
Cohesion: 0.11
Nodes (22): messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch(), createNativeTripReplay() (+14 more)

### Community 32 - "utils.ts"
Cohesion: 0.08
Nodes (22): class-variance-authority, clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-scroll-area, @radix-ui/react-slider, @radix-ui/react-toggle, @radix-ui/react-toggle-group (+14 more)

### Community 33 - "company-changes.ts"
Cohesion: 0.16
Nodes (21): GET, resolveDistributorInfo(), resolveEffectiveUserType(), POST, PUT, getAuthRoles(), changeFingerprint(), changesGET (+13 more)

### Community 34 - "validateRequestBody"
Cohesion: 0.15
Nodes (19): POST, POST, PUT, POST, VALID_TYPES, GET, POST, GET (+11 more)

### Community 35 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 36 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+19 more)

### Community 37 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 38 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 39 - "driver/taximeter/page.tsx"
Cohesion: 0.13
Nodes (23): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard(), LocationPoint (+15 more)

### Community 40 - "api-client.ts"
Cohesion: 0.14
Nodes (17): directoryCopy, CompanyOption, DirectoryKind, DirectoryResult, ApiError, apiRequest(), ApiResponse, buildApiUrl() (+9 more)

### Community 41 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 42 - "DriverMap.tsx"
Cohesion: 0.15
Nodes (21): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, search(), coordinate() (+13 more)

### Community 43 - "command.tsx"
Cohesion: 0.10
Nodes (22): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+14 more)

### Community 44 - "PlatformLanding.tsx"
Cohesion: 0.13
Nodes (12): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), openRegistration(), Route(), translations (+4 more)

### Community 45 - "20261018_company_lifecycle.sql"
Cohesion: 0.12
Nodes (12): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+4 more)

### Community 46 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (13): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+5 more)

### Community 47 - "company-registrations/route.ts"
Cohesion: 0.22
Nodes (20): PUT, review, DELETE, document(), failed(), GET, positiveId(), POST (+12 more)

### Community 48 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 49 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 50 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 52 - "createTripJournal"
Cohesion: 0.17
Nodes (18): attemptSilentRefresh(), AuthProvider(), stopFleetSharingRuntime(), stopAllMobileLocationWatches(), createTripJournal(), complete(), encryptRecord(), list() (+10 more)

### Community 54 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 55 - "ref_node_crypto"
Cohesion: 0.15
Nodes (9): createEnrollmentHandler(), escapeHtml(), totp(), dir, aad, openPushCredential(), decodeTotpSecret(), matchingTotpStep() (+1 more)

### Community 56 - "welcome-config.ts"
Cohesion: 0.22
Nodes (15): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster() (+7 more)

### Community 58 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 59 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 60 - "vervoerbewijs.ts"
Cohesion: 0.17
Nodes (14): qrcode, chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs(), VervoerbewijsChiron (+6 more)

### Community 61 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 62 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 63 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 64 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 65 - "generateAcceptanceReportPdf"
Cohesion: 0.24
Nodes (14): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+6 more)

### Community 66 - "20261019_driver_shifts.sql"
Cohesion: 0.23
Nodes (10): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_immutable_shift_event() (+2 more)

### Community 67 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 68 - "pdf-generator.ts"
Cohesion: 0.21
Nodes (11): jspdf, configurePdfFonts(), ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo (+3 more)

### Community 69 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 70 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+6 more)

### Community 71 - "end/route.ts"
Cohesion: 0.23
Nodes (9): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST (+1 more)

### Community 72 - "driverShiftPdf"
Cohesion: 0.23
Nodes (11): jose, apply, headers, url, driverShiftPdf(), ensure(), page(), pairs() (+3 more)

### Community 73 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 74 - "DriverFleetShift.tsx"
Cohesion: 0.26
Nodes (10): copy, DriverFleetShift(), GeolocationPoint, registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus (+2 more)

### Community 75 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 76 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 77 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 78 - "HomepageAdSlotSection.tsx"
Cohesion: 0.27
Nodes (8): dompurify, dompurify, FloatingCard(), FloatingCardProps, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 79 - "subscription-scheduler.ts"
Cohesion: 0.35
Nodes (8): register(), MailMessage, euro(), SubscriptionDocument, subscriptionPdf(), escape(), startSubscriptionScheduler(), subscriptionTick()

### Community 82 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 83 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 84 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 85 - "DriverGuideSection.tsx"
Cohesion: 0.27
Nodes (9): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+1 more)

### Community 86 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 87 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 88 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 89 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 90 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 92 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 93 - "receipt.ts"
Cohesion: 0.32
Nodes (7): invoice(), directory(), shareReceipt(), shareShiftReport(), pdf(), invoice(), expo-sharing

### Community 94 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 96 - "createDriverApi"
Cohesion: 0.57
Nodes (7): createDriverApi(), loadProfile(), ownerRead(), profile(), request(), requestOnce(), vehicles()

### Community 97 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 98 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 99 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 100 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 101 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 102 - "brevo/route.ts"
Cohesion: 0.52
Nodes (5): POST(), runtime, brevoMailEvent(), brevoProviderId(), brevoWebhookAuthorized()

### Community 103 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 104 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 105 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 106 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 107 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 108 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 109 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, eslint, eslint-config-expo, @types/react, typescript

### Community 112 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 113 - "document-links.ts"
Cohesion: 0.60
Nodes (4): documentOrigin, receiptCapability(), signature(), verifyReceiptCapability()

### Community 114 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 115 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 116 - "save"
Cohesion: 0.50
Nodes (4): clearForm(), commit(), retry(), save()

### Community 120 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 121 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 122 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

## Knowledge Gaps
- **715 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+710 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1006 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **45 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `requestMiddleware()` connect `requestMiddleware` to `createErrorResponse`, `api-utils.ts`, `lib/auth.ts`, `account/route.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _715 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.06864841745081265 - nodes in this community are weakly interconnected._
- **Why does `generateAdminUserToken()` connect `createErrorResponse` to `company-changes.ts`, `lib/auth.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.032616436405070504 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.07088696878857344 - nodes in this community are weakly interconnected._
- **Should `requestMiddleware` be split into smaller, more focused modules?**
  _Cohesion score 0.06867088607594937 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 167 unresolved internal-endpoint edges and 19 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 229 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
