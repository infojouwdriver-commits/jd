# Graph Report - JOUW DRIVER  (2026-10-19)

## Corpus Check
- 527 files · ~227,533 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2975 nodes · 10087 edges · 154 communities (109 shown, 45 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 247 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c0e7a398`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- lib/auth.ts
- Input
- ref_react
- session.tsx
- DriverRegisterForm.tsx
- usePreferences
- authCrudOperations
- Card
- useLanguage
- cn
- api-utils.ts
- dependencies
- SiteAIAgent.tsx
- preferences.tsx
- BackgroundGeolocation
- package.json
- sidebar.tsx
- useAuth
- native-journal.ts
- dependencies
- ReportsPage.tsx
- ChironError
- Button
- BackgroundGeolocationService.java
- mobile-location.ts
- driver-app/package.json
- validateRequestBody
- use-toast.ts
- utils.ts
- mobile/package.json
- 20261018_subscription_billing.sql
- driver/taximeter/page.tsx
- DriverMap.tsx
- 20261018_company_lifecycle.sql
- 20261018_contract_billing.sql
- DirectoryToolbar.tsx
- framer-motion
- DriverGdprSection.tsx
- DriverShifts.tsx
- update-customer-portal.sh
- form.tsx
- TripPointJournal.java
- ref_node_fs
- DriverGuideSection.tsx
- navigation-menu.tsx
- PlatformLanding.tsx
- compilerOptions
- useSessionState
- companies/route.ts
- company-registrations/route.ts
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- generateAcceptanceReportPdf
- api-client.ts
- createTripJournal
- code-map.py
- scripts
- convert-database.mjs
- RouteMap.tsx
- ref_node_crypto
- 20261019_driver_shifts.sql
- carousel.tsx
- apply-release.mjs
- DriverLayoutShell.tsx
- end/route.ts
- vervoerbewijs.ts
- devDependencies
- push-worker.mjs
- PDFGenerator
- activity-state.tsx
- "schema".company_registrations
- chart.tsx
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- pdf-generator.ts
- subscription-scheduler.ts
- "schema".security_save_company_account
- "schema".company_change_requests
- secret-vault.ts
- sheet.tsx
- FaqPage.tsx
- chat/route.ts
- pagination.tsx
- ApiError
- 20261013_mail_delivery.sql
- Override
- configure-mail.mjs
- verify-private-owner.cjs
- InvoicesFeaturePage.tsx
- [...path]/route.ts
- android.content.Intent
- LiveMap.tsx
- 20261019_email_identity.sql
- definitions.d.ts
- database-readiness.mjs
- SecurityPage.tsx
- brevo/route.ts
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- driver-app/tsconfig.json
- contract-template.ts
- 20261009_security.sql
- 20261018_web_billing.sql
- sign/route.ts
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
- company-portal/drivers/route.ts
- company-portal/vehicles/route.ts
- invoices/send/route.ts
- view/route.ts
- websocket/route.ts
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
- backup-foundation.sh
- import-private-archive.sh
- Package.swift

## God Nodes (most connected - your core abstractions)
1. `createErrorResponse()` - 256 edges
2. `createSuccessResponse()` - 253 edges
3. `generateAdminUserToken()` - 242 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 218 edges
6. `validateRequestBody()` - 148 edges
7. `Button` - 144 edges
8. `requestMiddleware()` - 114 edges
9. `lucide-react` - 96 edges
10. `parseQueryParams()` - 93 edges

## Surprising Connections (you probably didn't know these)
- `locate()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `search()` --indirect_call--> `value()`  [INFERRED]
  driver-app/src/experience/AddressField.tsx → scripts/convert-database.mjs
- `DriverMapView()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `ActiveTrip()` --references--> `Alert`  [EXTRACTED]
  driver-app/src/experience/ActiveTrip.tsx → src/components/ui/alert.tsx
- `"schema".security_fleet_locations()` --reads_from--> `vehicles()`  [EXTRACTED]
  migrations/20261013_fleet_tracking.sql → driver-app/src/api.ts

## Import Cycles
- 2-file cycle: `src/lib/api-utils.ts -> src/lib/create-response.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (154 total, 45 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (113): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+105 more)

### Community 1 - "lib/auth.ts"
Cohesion: 0.04
Nodes (83): zod, available(), GET, schema, schema, command, POST, filters (+75 more)

### Community 2 - "Input"
Cohesion: 0.09
Nodes (78): AdSlotsPage(), EditCompanyPage(), PlatformContractsPage(), CompaniesPage(), CompaniesPageContent(), Company, emptyNew, DistributorsPage() (+70 more)

### Community 3 - "ref_react"
Cohesion: 0.06
Nodes (57): nextConfig, lucide-react, next, AdSlot, EMPTY_FORM, ChironSyncPage(), FailedTrip, Company (+49 more)

### Community 4 - "session.tsx"
Cohesion: 0.07
Nodes (65): App(), logout(), styles, ActionGate, createActionGate(), AccountInfo, ActivityPage, ActivityQuery (+57 more)

### Community 5 - "DriverRegisterForm.tsx"
Cohesion: 0.05
Nodes (69): @hookform/resolvers, react-hook-form, dynamic, LoginPage(), CompanyLoginForm(), DriverRegisterForm(), DriverRegisterFormProps, FormField() (+61 more)

### Community 6 - "usePreferences"
Cohesion: 0.17
Nodes (39): Account(), ActiveTrip(), useActivityFilters(), ActivityFilters(), AddressField(), BillingReminder(), dismissed, Home() (+31 more)

### Community 7 - "authCrudOperations"
Cohesion: 0.09
Nodes (54): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+46 more)

### Community 8 - "Card"
Cohesion: 0.09
Nodes (51): sonner, AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard() (+43 more)

### Community 9 - "useLanguage"
Cohesion: 0.09
Nodes (44): Page(), Page(), CompanyDashboardPage(), CompanyDashboard(), PortalData, DriversTab(), VehiclesTab(), BillingData (+36 more)

### Community 10 - "cn"
Cohesion: 0.05
Nodes (58): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, vaul, AccordionContent, AccordionItem, AccordionTrigger (+50 more)

### Community 11 - "api-utils.ts"
Cohesion: 0.06
Nodes (48): bcryptjs, registrationSchema, GET, POST, VALID_TYPES, GET, POST, AUTH_ENABLED (+40 more)

### Community 12 - "dependencies"
Cohesion: 0.03
Nodes (62): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+54 more)

### Community 13 - "SiteAIAgent.tsx"
Cohesion: 0.05
Nodes (54): next-themes, dynamic, metadata, RootLayout(), viewport, apiFetch(), ApiResponse, buildApiUrl() (+46 more)

### Community 14 - "preferences.tsx"
Cohesion: 0.06
Nodes (44): DriverMessage, DriverNotification, Layout(), Navigation(), RoadArt(), companyCopy, copy, CopyKey (+36 more)

### Community 15 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 16 - "package.json"
Cohesion: 0.05
Nodes (38): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+30 more)

### Community 17 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 18 - "useAuth"
Cohesion: 0.08
Nodes (30): CompanyPricingPage(), AdminLayout(), DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification() (+22 more)

### Community 19 - "native-journal.ts"
Cohesion: 0.09
Nodes (17): login(), journalBytes(), assertNativeCryptoReady(), keys, nativeJournal(), engines, address(), createTripEngine() (+9 more)

### Community 20 - "dependencies"
Cohesion: 0.05
Nodes (36): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+28 more)

### Community 21 - "ReportsPage.tsx"
Cohesion: 0.10
Nodes (26): Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps, FeaturePageLayout(), FeaturePageLayoutProps (+18 more)

### Community 22 - "ChironError"
Cohesion: 0.14
Nodes (18): canonicalChironEnvironment(), chironDestination(), ChironError, numeric(), rideMessage(), timestamp(), retryChironTrip(), ChironService (+10 more)

### Community 23 - "Button"
Cohesion: 0.09
Nodes (25): Company, CompanyContractsPage(), Contract, Signature, ContractPrintPage(), PrintableContract, Company, Invoice (+17 more)

### Community 24 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 25 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 26 - "driver-app/package.json"
Cohesion: 0.07
Nodes (29): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+21 more)

### Community 27 - "validateRequestBody"
Cohesion: 0.16
Nodes (23): POST, POST, POST, schema, POST, registerSchema, POST, PUT (+15 more)

### Community 28 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 29 - "utils.ts"
Cohesion: 0.07
Nodes (20): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+12 more)

### Community 30 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 31 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 32 - "driver/taximeter/page.tsx"
Cohesion: 0.13
Nodes (23): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), GlassCard(), GoldButton(), LocationPoint (+15 more)

### Community 33 - "DriverMap.tsx"
Cohesion: 0.16
Nodes (21): DriverMap(), DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, search() (+13 more)

### Community 34 - "20261018_company_lifecycle.sql"
Cohesion: 0.12
Nodes (12): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+4 more)

### Community 35 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 36 - "DirectoryToolbar.tsx"
Cohesion: 0.14
Nodes (17): cmdk, @radix-ui/react-popover, directoryCopy, CompanyOption, CompanyPicker(), DirectoryKind, DirectoryResult, Command (+9 more)

### Community 37 - "framer-motion"
Cohesion: 0.12
Nodes (12): framer-motion, AnimatedLogo(), AnimatedLogoProps, FeatureCardProps, LandingNav(), LandingNavProps, LANG_OPTIONS, LanguageSwitcher() (+4 more)

### Community 38 - "DriverGdprSection.tsx"
Cohesion: 0.15
Nodes (18): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+10 more)

### Community 39 - "DriverShifts.tsx"
Cohesion: 0.17
Nodes (16): ShiftPage(), DriverShifts(), downloadPdf(), statuses, shiftCopy, configurePdfFonts(), driverShiftPdf(), DriverShift (+8 more)

### Community 40 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (20): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+12 more)

### Community 41 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 43 - "ref_node_fs"
Cohesion: 0.13
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 44 - "DriverGuideSection.tsx"
Cohesion: 0.14
Nodes (17): dompurify, dompurify, DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep (+9 more)

### Community 46 - "navigation-menu.tsx"
Cohesion: 0.14
Nodes (16): class-variance-authority, @radix-ui/react-navigation-menu, @radix-ui/react-toggle, @radix-ui/react-toggle-group, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList (+8 more)

### Community 47 - "PlatformLanding.tsx"
Cohesion: 0.15
Nodes (8): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), Route(), translations, registrationCopy

### Community 48 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 49 - "useSessionState"
Cohesion: 0.16
Nodes (13): apiConnectionKey(), invoice(), clearReceiptCache(), directory(), shareReceipt(), useSessionState(), accountChanged(), login() (+5 more)

### Community 50 - "companies/route.ts"
Cohesion: 0.23
Nodes (12): POST, POST, PUT, POST, GET, POST, POST, saveCompanyAccount() (+4 more)

### Community 51 - "company-registrations/route.ts"
Cohesion: 0.32
Nodes (15): PUT, review, DELETE, document(), failed(), GET, positiveId(), POST (+7 more)

### Community 53 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 54 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 55 - "generateAcceptanceReportPdf"
Cohesion: 0.26
Nodes (14): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+6 more)

### Community 56 - "api-client.ts"
Cohesion: 0.23
Nodes (13): ApiError, apiRequest(), ApiResponse, buildApiUrl(), getLoginPath(), getServerApiBaseUrl(), normalizeBaseUrl(), parseApiResponse() (+5 more)

### Community 57 - "createTripJournal"
Cohesion: 0.24
Nodes (14): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+6 more)

### Community 58 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 59 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 60 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 61 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 62 - "ref_node_crypto"
Cohesion: 0.17
Nodes (6): createEnrollmentHandler(), escapeHtml(), totp(), dir, aad, openPushCredential()

### Community 63 - "20261019_driver_shifts.sql"
Cohesion: 0.23
Nodes (10): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_immutable_shift_event() (+2 more)

### Community 64 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 65 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 66 - "DriverLayoutShell.tsx"
Cohesion: 0.22
Nodes (11): DriverLayout(), DriverInfo, DriverLayoutContent(), DriverLayoutShell(), TabItem(), VehicleData, DriverSplashScreen(), DriverSplashScreenProps (+3 more)

### Community 67 - "end/route.ts"
Cohesion: 0.23
Nodes (9): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST (+1 more)

### Community 68 - "vervoerbewijs.ts"
Cohesion: 0.20
Nodes (12): chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs(), VervoerbewijsChiron, VervoerbewijsCompany (+4 more)

### Community 69 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+5 more)

### Community 70 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 72 - "activity-state.tsx"
Cohesion: 0.26
Nodes (9): Period, periodDates(), validDay(), validRange(), ActivityProvider(), Context, useStateValue(), apply() (+1 more)

### Community 73 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 74 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 75 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 76 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 77 - "pdf-generator.ts"
Cohesion: 0.22
Nodes (9): jspdf, ChironTestMessage, AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, TestResult, TripInvoiceData (+1 more)

### Community 78 - "subscription-scheduler.ts"
Cohesion: 0.35
Nodes (8): register(), MailMessage, euro(), SubscriptionDocument, subscriptionPdf(), escape(), startSubscriptionScheduler(), subscriptionTick()

### Community 80 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 81 - "secret-vault.ts"
Cohesion: 0.24
Nodes (8): jose, apply, headers, url, close(), decryptSecret(), encryptSecret(), key()

### Community 82 - "sheet.tsx"
Cohesion: 0.24
Nodes (9): @radix-ui/react-dialog, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+1 more)

### Community 83 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 84 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 85 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 86 - "ApiError"
Cohesion: 0.44
Nodes (8): ApiError, createDriverApi(), loadProfile(), ownerRead(), profile(), request(), requestOnce(), vehicles()

### Community 87 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 89 - "configure-mail.mjs"
Cohesion: 0.39
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 90 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 91 - "InvoicesFeaturePage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, InvoicesFeaturePage(), PublicStats

### Community 92 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 94 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 95 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 96 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 97 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 98 - "SecurityPage.tsx"
Cohesion: 0.38
Nodes (5): Page(), contentFr, contentNl, icons, SecurityPage()

### Community 99 - "brevo/route.ts"
Cohesion: 0.52
Nodes (5): POST(), runtime, brevoMailEvent(), brevoProviderId(), brevoWebhookAuthorized()

### Community 100 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 101 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 102 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 103 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 104 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 105 - "driver-app/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, strict, exclude, extends, expo/tsconfig.base

### Community 106 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 110 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 111 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 112 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 115 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 116 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 117 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 118 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 119 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 120 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

## Knowledge Gaps
- **690 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+685 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 960 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **45 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `generateAdminUserToken()` connect `createErrorResponse` to `authCrudOperations`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _690 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.06958744067177802 - nodes in this community are weakly interconnected._
- **Why does `DriverDashboard()` connect `Card` to `useLanguage`, `useAuth`, `Input`, `Button`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `lib/auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.044529262086514 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.09379509379509379 - nodes in this community are weakly interconnected._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.05576707726763718 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 162 unresolved internal-endpoint edges and 18 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 202 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
