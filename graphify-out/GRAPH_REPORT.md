# Graph Report - JOUW DRIVER  (2026-10-18)

## Corpus Check
- 513 files · ~223,207 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2900 nodes · 9873 edges · 152 communities (108 shown, 44 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d36134aa`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- ref_react
- Input
- requestMiddleware
- lib/auth.ts
- useTripController.ts
- Button
- api-utils.ts
- DriverRegisterForm.tsx
- usePreferences
- dependencies
- cn
- preferences.tsx
- Card
- BackgroundGeolocation
- package.json
- end/route.ts
- sidebar.tsx
- GdprAdminClient.tsx
- scripts
- CookieBanner.tsx
- dependencies
- driver/taximeter/page.tsx
- BackgroundGeolocationService.java
- mobile-location.ts
- driver-app/package.json
- utils.ts
- use-toast.ts
- mobile/package.json
- 20261018_subscription_billing.sql
- useSessionState
- SiteAIAgent.tsx
- 20261018_contract_billing.sql
- form.tsx
- company-registrations/route.ts
- ref_node_fs
- api.ts
- DriverMap.tsx
- companies/route.ts
- TripPointJournal.java
- DriverGuideSection.tsx
- update-customer-portal.sh
- PlatformLanding.tsx
- compilerOptions
- vervoerbewijs.ts
- app/layout.tsx
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- generateAcceptanceReportPdf
- code-map.py
- 20261018_company_lifecycle.sql
- command.tsx
- convert-database.mjs
- RouteMap.tsx
- createTripJournal
- carousel.tsx
- apply-release.mjs
- ActivityFilters.tsx
- subscription-scheduler.ts
- ref_node_crypto
- push-worker.mjs
- "schema".company_registrations
- framer-motion
- chart.tsx
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- subscription-billing.ts
- LandingNav.tsx
- pdf-generator.ts
- PDFGenerator
- "schema".security_save_company_account
- "schema".company_change_requests
- class-variance-authority
- start/route.ts
- FaqPage.tsx
- FeaturePageLayout
- FeatureDetailCard
- chat/route.ts
- pagination.tsx
- ApiError
- 20261013_mail_delivery.sql
- navigation-menu.tsx
- drawer.tsx
- LanguageProvider
- mail-policy.ts
- DirectoryToolbar.tsx
- sheet.tsx
- apiRequest
- Override
- verify-private-owner.cjs
- "schema".security_archive_company
- InvoicesFeaturePage.tsx
- ReportsPage.tsx
- TripManagementPage.tsx
- [...path]/route.ts
- android.content.Intent
- login
- definitions.d.ts
- database-readiness.mjs
- TeamManagementPage.tsx
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- driver-app/tsconfig.json
- contract-template.ts
- admin-enrollment.mjs
- 20261009_security.sql
- 20261018_web_billing.sql
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
- company-portal/drivers/route.ts
- company-portal/vehicles/route.ts
- invoices/send/route.ts
- view/route.ts
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
1. `createErrorResponse()` - 254 edges
2. `createSuccessResponse()` - 250 edges
3. `generateAdminUserToken()` - 233 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 220 edges
6. `validateRequestBody()` - 146 edges
7. `Button` - 140 edges
8. `requestMiddleware()` - 113 edges
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
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (152 total, 44 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (120): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+112 more)

### Community 1 - "ref_react"
Cohesion: 0.04
Nodes (87): nextConfig, lucide-react, next, sonner, FailedTrip, Company, Contract, Signature (+79 more)

### Community 2 - "Input"
Cohesion: 0.08
Nodes (80): AdSlot, AdSlotsPage(), EMPTY_FORM, CompanyContractsPage(), CompaniesPage(), CompaniesPageContent(), Company, emptyNew (+72 more)

### Community 3 - "requestMiddleware"
Cohesion: 0.07
Nodes (54): zod, command, POST, filters, POST, GET, GET, GET (+46 more)

### Community 4 - "lib/auth.ts"
Cohesion: 0.08
Nodes (66): GET, PUT, available(), GET, POST, schema, driverLoginSchema, findCredentialByPhoneSafely() (+58 more)

### Community 5 - "useTripController.ts"
Cohesion: 0.06
Nodes (55): styles, ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt() (+47 more)

### Community 6 - "Button"
Cohesion: 0.08
Nodes (60): ChironSyncPage(), Page(), MessagesList(), Reply, Page(), CompanyDashboardPage(), SummaryPage(), DriverTripsPage() (+52 more)

### Community 7 - "api-utils.ts"
Cohesion: 0.05
Nodes (55): bcryptjs, registrationSchema, GET, POST, VALID_TYPES, GET, POST, POST (+47 more)

### Community 8 - "DriverRegisterForm.tsx"
Cohesion: 0.05
Nodes (66): @hookform/resolvers, input-otp, LoginPage(), CompanyLoginForm(), DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader() (+58 more)

### Community 9 - "usePreferences"
Cohesion: 0.14
Nodes (45): ActivityPage, Account(), ActiveTrip(), AddressField(), search(), BillingReminder(), dismissed, Home() (+37 more)

### Community 10 - "dependencies"
Cohesion: 0.03
Nodes (62): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+54 more)

### Community 11 - "cn"
Cohesion: 0.06
Nodes (51): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+43 more)

### Community 12 - "preferences.tsx"
Cohesion: 0.07
Nodes (40): Layout(), Navigation(), ActivityProvider(), RoadArt(), companyCopy, copy, CopyKey, Language (+32 more)

### Community 13 - "Card"
Cohesion: 0.10
Nodes (40): AdminAccountPage(), ChironSettingsPage(), Company, PlatformContract, PlatformContractsPage(), Company, CompanySettingsPage(), AdminFleetPage() (+32 more)

### Community 14 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 15 - "package.json"
Cohesion: 0.05
Nodes (39): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+31 more)

### Community 16 - "end/route.ts"
Cohesion: 0.13
Nodes (23): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError, numeric() (+15 more)

### Community 17 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 18 - "GdprAdminClient.tsx"
Cohesion: 0.10
Nodes (32): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), GdprAdminPage(), metadata (+24 more)

### Community 19 - "scripts"
Cohesion: 0.05
Nodes (38): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+30 more)

### Community 20 - "CookieBanner.tsx"
Cohesion: 0.09
Nodes (30): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+22 more)

### Community 21 - "dependencies"
Cohesion: 0.05
Nodes (36): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+28 more)

### Community 22 - "driver/taximeter/page.tsx"
Cohesion: 0.10
Nodes (28): leaflet, BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), GlassCard(), GoldButton() (+20 more)

### Community 23 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 24 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 25 - "driver-app/package.json"
Cohesion: 0.07
Nodes (29): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+21 more)

### Community 26 - "utils.ts"
Cohesion: 0.07
Nodes (22): clsx, @radix-ui/react-hover-card, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, react-resizable-panels, tailwind-merge (+14 more)

### Community 27 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 28 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 29 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 30 - "useSessionState"
Cohesion: 0.12
Nodes (19): App(), logout(), createActionGate(), apiConnectionKey(), invoice(), clearReceiptCache(), directory(), shareReceipt() (+11 more)

### Community 31 - "SiteAIAgent.tsx"
Cohesion: 0.14
Nodes (24): apiFetch(), ApiResponse, buildApiUrl(), ChatMessage, ConversationStep, detectChangeIntent(), detectSearchIntent(), formatEntityInfo() (+16 more)

### Community 32 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 33 - "form.tsx"
Cohesion: 0.10
Nodes (20): @radix-ui/react-label, @radix-ui/react-slot, react-hook-form, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList (+12 more)

### Community 34 - "company-registrations/route.ts"
Cohesion: 0.23
Nodes (19): POST, PUT, review, DELETE, document(), failed(), GET, positiveId() (+11 more)

### Community 35 - "ref_node_fs"
Cohesion: 0.13
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 36 - "api.ts"
Cohesion: 0.14
Nodes (16): AccountInfo, ActivityQuery, ActivityTrip, API_ORIGIN, driverApi, DriverDetails, DriverMessage, DriverNotification (+8 more)

### Community 37 - "DriverMap.tsx"
Cohesion: 0.19
Nodes (18): DriverMap(), DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, coordinate() (+10 more)

### Community 38 - "companies/route.ts"
Cohesion: 0.19
Nodes (14): POST, POST, PUT, GET, POST, GET, POST, POST (+6 more)

### Community 40 - "DriverGuideSection.tsx"
Cohesion: 0.14
Nodes (17): dompurify, dompurify, DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep (+9 more)

### Community 42 - "update-customer-portal.sh"
Cohesion: 0.10
Nodes (18): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, FLEET_MIGRATION, LIFECYCLE_MIGRATION (+10 more)

### Community 43 - "PlatformLanding.tsx"
Cohesion: 0.15
Nodes (8): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), Route(), translations, registrationCopy

### Community 44 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 45 - "vervoerbewijs.ts"
Cohesion: 0.18
Nodes (14): jspdf, configurePdfFonts(), chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs() (+6 more)

### Community 46 - "app/layout.tsx"
Cohesion: 0.16
Nodes (13): next-themes, dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider(), GlobalClientEffects() (+5 more)

### Community 48 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 49 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 50 - "generateAcceptanceReportPdf"
Cohesion: 0.26
Nodes (14): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+6 more)

### Community 51 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 52 - "20261018_company_lifecycle.sql"
Cohesion: 0.17
Nodes (10): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+2 more)

### Community 53 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 54 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 55 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 56 - "createTripJournal"
Cohesion: 0.25
Nodes (13): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+5 more)

### Community 57 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 58 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 59 - "ActivityFilters.tsx"
Cohesion: 0.31
Nodes (10): Period, periodDates(), validDay(), validRange(), Context, useActivityFilters(), useStateValue(), ActivityFilters() (+2 more)

### Community 60 - "subscription-scheduler.ts"
Cohesion: 0.26
Nodes (11): register(), mailConfiguration(), mailEventKey(), MailMessage, MailResult, sendTransactionalMail(), euro(), subscriptionPdf() (+3 more)

### Community 61 - "ref_node_crypto"
Cohesion: 0.21
Nodes (6): dir, aad, openPushCredential(), decodeTotpSecret(), matchingTotpStep(), totpAt()

### Community 62 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 63 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 64 - "framer-motion"
Cohesion: 0.17
Nodes (4): framer-motion, FeatureCardProps, ParallaxSectionProps, StatCounterProps

### Community 65 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 66 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 67 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 68 - "subscription-billing.ts"
Cohesion: 0.25
Nodes (8): billingGET, billingPOST, command, date, expected, id, profile, SubscriptionDocument

### Community 69 - "LandingNav.tsx"
Cohesion: 0.27
Nodes (8): AnimatedLogo(), AnimatedLogoProps, LandingNav(), LandingNavProps, LANG_OPTIONS, LanguageSwitcher(), LandingLanguage, landingTranslations

### Community 70 - "pdf-generator.ts"
Cohesion: 0.22
Nodes (9): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, TestResult, TripInvoiceData (+1 more)

### Community 73 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 74 - "class-variance-authority"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 75 - "start/route.ts"
Cohesion: 0.27
Nodes (6): resend, sendContractEmail(), generateTripHash(), generateTripUuid(), getRetentionDate(), POST

### Community 76 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 77 - "FeaturePageLayout"
Cohesion: 0.29
Nodes (7): Page(), FeaturePageLayout(), FeaturePageLayoutProps, contentFr, contentNl, icons, NotificationsPage()

### Community 78 - "FeatureDetailCard"
Cohesion: 0.29
Nodes (7): Page(), FeatureDetailCard(), FeatureDetailCardProps, contentFr, contentNl, icons, SecurityPage()

### Community 79 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 80 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 81 - "ApiError"
Cohesion: 0.44
Nodes (8): ApiError, createDriverApi(), loadProfile(), ownerRead(), profile(), request(), requestOnce(), vehicles()

### Community 82 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 83 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 84 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 85 - "LanguageProvider"
Cohesion: 0.31
Nodes (8): DriverLayout(), DriverLayoutShell(), detectBrowserLanguage(), LanguageProvider(), normalizeLanguage(), readCookieLanguage(), setDocumentDirection(), setLanguageCookie()

### Community 86 - "mail-policy.ts"
Cohesion: 0.28
Nodes (6): POST(), runtime, events, MAIL_FREE_LIMITS, mailEvent(), MailStatus

### Community 87 - "DirectoryToolbar.tsx"
Cohesion: 0.31
Nodes (4): directoryCopy, CompanyOption, DirectoryKind, DirectoryResult

### Community 88 - "sheet.tsx"
Cohesion: 0.28
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 89 - "apiRequest"
Cohesion: 0.33
Nodes (8): apiRequest(), buildApiUrl(), getLoginPath(), parseApiResponse(), redirectToLogin(), refreshToken(), connectionFailure, connectionMessage()

### Community 91 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 93 - "InvoicesFeaturePage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, InvoicesFeaturePage(), PublicStats

### Community 94 - "ReportsPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, ReportsPage()

### Community 95 - "TripManagementPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, TripManagementPage()

### Community 96 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 98 - "login"
Cohesion: 0.33
Nodes (5): login(), open(), seal(), identity(), JournalCipher

### Community 99 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 100 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 101 - "TeamManagementPage.tsx"
Cohesion: 0.38
Nodes (5): Page(), contentFr, contentNl, icons, TeamManagementPage()

### Community 102 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 103 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 104 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 105 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 106 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 107 - "driver-app/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, strict, exclude, extends, expo/tsconfig.base

### Community 108 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 109 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 112 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 113 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 116 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 117 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 118 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 119 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

## Knowledge Gaps
- **682 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+677 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 940 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `generateAdminUserToken()` connect `createErrorResponse` to `lib/auth.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _682 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.06902597402597403 - nodes in this community are weakly interconnected._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.03826279527559055 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.08413770913770914 - nodes in this community are weakly interconnected._
- **Should `requestMiddleware` be split into smaller, more focused modules?**
  _Cohesion score 0.07110398289227479 - nodes in this community are weakly interconnected._
- **Should `lib/auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07832130446404705 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 162 unresolved internal-endpoint edges and 18 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 193 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
