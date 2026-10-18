# Graph Report - JOUW DRIVER  (2026-10-18)

## Corpus Check
- 507 files · ~220,392 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2863 nodes · 9764 edges · 151 communities (109 shown, 42 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `486953d0`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- api-utils.ts
- useLanguage
- Input
- ref_react
- authCrudOperations
- Button
- createPostgrestClient
- usePreferences
- lucide-react
- cn
- SiteAIAgent.tsx
- useTripController.ts
- dependencies
- preferences.tsx
- session.tsx
- BackgroundGeolocation
- driver/taximeter/page.tsx
- package.json
- mobile-location.ts
- end/route.ts
- sidebar.tsx
- ReportsPage.tsx
- BackgroundGeolocationService.java
- validateRequestBody
- use-toast.ts
- DriverProfilePage.tsx
- dependencies
- mobile/package.json
- utils.ts
- driver-app/package.json
- 20261018_subscription_billing.sql
- DriverMap.tsx
- framer-motion
- DriverGuideSection.tsx
- native-journal.ts
- ref_node_fs
- TripPointJournal.java
- update-customer-portal.sh
- navigation-menu.tsx
- PlatformLanding.tsx
- contracts/route.ts
- compilerOptions
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- generateAcceptanceReportPdf
- code-map.py
- 20261018_company_lifecycle.sql
- scripts
- command.tsx
- mail-service.ts
- convert-database.mjs
- RouteMap.tsx
- createTripJournal
- carousel.tsx
- apply-release.mjs
- DriverLayoutShell.tsx
- ActivityFilters.tsx
- form.tsx
- PDFGenerator
- vervoerbewijs.ts
- ref_node_crypto
- devDependencies
- push-worker.mjs
- "schema".company_registrations
- chart.tsx
- "schema".security_fleet_locations
- pdf-generator.ts
- "schema".security_save_company_account
- "schema".company_change_requests
- FaqPage.tsx
- chat/route.ts
- subscription-billing.ts
- pagination.tsx
- subscription-scheduler.ts
- scripts
- ApiError
- 20261013_mail_delivery.sql
- drawer.tsx
- devices/route.ts
- DirectoryToolbar.tsx
- sheet.tsx
- apiRequest
- Override
- verify-private-owner.cjs
- "schema".security_archive_company
- InvoicesFeaturePage.tsx
- TripManagementPage.tsx
- [...path]/route.ts
- android.content.Intent
- definitions.d.ts
- database-readiness.mjs
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- driver-app/tsconfig.json
- admin-enrollment.mjs
- devDependencies
- 20261009_security.sql
- 20261018_web_billing.sql
- start/route.ts
- ModeEnum
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
- scroll-area.tsx
- user/route.ts
- company-portal/drivers/route.ts
- company-portal/vehicles/route.ts
- invoices/send/route.ts
- view/route.ts
- websocket/route.ts
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
1. `createErrorResponse()` - 252 edges
2. `createSuccessResponse()` - 247 edges
3. `generateAdminUserToken()` - 233 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 220 edges
6. `validateRequestBody()` - 144 edges
7. `Button` - 138 edges
8. `requestMiddleware()` - 112 edges
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
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (151 total, 42 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.08
Nodes (121): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+113 more)

### Community 1 - "api-utils.ts"
Cohesion: 0.06
Nodes (53): POST, filters, sendContractEmail(), registrationSchema, GET, GET, POST, GET (+45 more)

### Community 2 - "useLanguage"
Cohesion: 0.06
Nodes (72): Page(), Company, Distributor, Page(), AdminTripsPage(), Trip, glassCard, labelStyle (+64 more)

### Community 3 - "Input"
Cohesion: 0.09
Nodes (71): AdSlot, AdSlotsPage(), EMPTY_FORM, CompaniesPage(), CompaniesPageContent(), Company, emptyNew, DistributorsPage() (+63 more)

### Community 4 - "ref_react"
Cohesion: 0.06
Nodes (60): nextConfig, next, sonner, AdminAccountPage(), FailedTrip, Company, Company, Contract (+52 more)

### Community 5 - "authCrudOperations"
Cohesion: 0.07
Nodes (63): bcryptjs, GET, PUT, available(), GET, POST, schema, driverLoginSchema (+55 more)

### Community 6 - "Button"
Cohesion: 0.07
Nodes (64): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), ChironSyncPage(), ChironSettingsPage() (+56 more)

### Community 7 - "createPostgrestClient"
Cohesion: 0.08
Nodes (49): zod, command, POST, POST, GET, POST, review, GET (+41 more)

### Community 8 - "usePreferences"
Cohesion: 0.15
Nodes (41): Account(), ActiveTrip(), invoice(), AddressField(), BillingReminder(), dismissed, Home(), useInbox() (+33 more)

### Community 9 - "lucide-react"
Cohesion: 0.07
Nodes (57): @hookform/resolvers, lucide-react, react-hook-form, LoginPage(), CompanyLoginForm(), CompanyLoginFormData, CompanyLoginFormProps, companyLoginSchema (+49 more)

### Community 10 - "cn"
Cohesion: 0.05
Nodes (60): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger (+52 more)

### Community 11 - "SiteAIAgent.tsx"
Cohesion: 0.05
Nodes (56): next-themes, @radix-ui/react-switch, dynamic, metadata, RootLayout(), viewport, apiFetch(), ApiResponse (+48 more)

### Community 12 - "useTripController.ts"
Cohesion: 0.09
Nodes (44): ActionGate, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), TripRuntime(), FleetLocation() (+36 more)

### Community 13 - "dependencies"
Cohesion: 0.03
Nodes (62): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+54 more)

### Community 14 - "preferences.tsx"
Cohesion: 0.07
Nodes (39): Layout(), Navigation(), ActivityProvider(), RoadArt(), companyCopy, copy, CopyKey, Language (+31 more)

### Community 15 - "session.tsx"
Cohesion: 0.07
Nodes (40): App(), logout(), styles, createActionGate(), AccountInfo, ActivityPage, ActivityQuery, ActivityTrip (+32 more)

### Community 16 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 17 - "driver/taximeter/page.tsx"
Cohesion: 0.08
Nodes (36): leaflet, AdminFleetPage(), BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), GlassCard() (+28 more)

### Community 18 - "package.json"
Cohesion: 0.05
Nodes (39): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+31 more)

### Community 19 - "mobile-location.ts"
Cohesion: 0.08
Nodes (32): copy, DriverFleetShift(), GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation() (+24 more)

### Community 20 - "end/route.ts"
Cohesion: 0.12
Nodes (23): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError, numeric() (+15 more)

### Community 21 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 22 - "ReportsPage.tsx"
Cohesion: 0.10
Nodes (25): Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps, FeaturePageLayout(), FeaturePageLayoutProps (+17 more)

### Community 23 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 24 - "validateRequestBody"
Cohesion: 0.14
Nodes (20): POST, PUT, PUT, actorId(), GET, POST, POST, VALID_TYPES (+12 more)

### Community 25 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 26 - "DriverProfilePage.tsx"
Cohesion: 0.11
Nodes (23): DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), DriverProfileRoute(), DriverGoogleLoginButton() (+15 more)

### Community 27 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+19 more)

### Community 28 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 29 - "utils.ts"
Cohesion: 0.07
Nodes (19): clsx, @radix-ui/react-checkbox, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+11 more)

### Community 30 - "driver-app/package.json"
Cohesion: 0.08
Nodes (25): eslint, react, react-dom, @types/react, typescript, main, name, overrides (+17 more)

### Community 31 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 32 - "DriverMap.tsx"
Cohesion: 0.16
Nodes (21): DriverMap(), DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, search() (+13 more)

### Community 33 - "framer-motion"
Cohesion: 0.11
Nodes (12): framer-motion, AnimatedLogo(), AnimatedLogoProps, FeatureCardProps, LandingNav(), LandingNavProps, LANG_OPTIONS, LanguageSwitcher() (+4 more)

### Community 34 - "DriverGuideSection.tsx"
Cohesion: 0.12
Nodes (19): dompurify, dompurify, DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep (+11 more)

### Community 35 - "native-journal.ts"
Cohesion: 0.13
Nodes (12): login(), journalBytes(), assertNativeCryptoReady(), keys, nativeJournal(), createSqlTripStore(), open(), seal() (+4 more)

### Community 36 - "ref_node_fs"
Cohesion: 0.13
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 39 - "update-customer-portal.sh"
Cohesion: 0.11
Nodes (17): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, FLEET_MIGRATION, LIFECYCLE_MIGRATION, MAIL_MIGRATION (+9 more)

### Community 40 - "navigation-menu.tsx"
Cohesion: 0.14
Nodes (16): class-variance-authority, @radix-ui/react-navigation-menu, @radix-ui/react-toggle, @radix-ui/react-toggle-group, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList (+8 more)

### Community 41 - "PlatformLanding.tsx"
Cohesion: 0.15
Nodes (8): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), Route(), translations, registrationCopy

### Community 42 - "contracts/route.ts"
Cohesion: 0.25
Nodes (15): document(), failed(), GET, positiveId(), POST, PUT, CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR (+7 more)

### Community 43 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 45 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 46 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 47 - "generateAcceptanceReportPdf"
Cohesion: 0.26
Nodes (14): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+6 more)

### Community 48 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 49 - "20261018_company_lifecycle.sql"
Cohesion: 0.17
Nodes (10): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+2 more)

### Community 50 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 51 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 52 - "mail-service.ts"
Cohesion: 0.17
Nodes (12): resend, POST(), runtime, events, MAIL_FREE_LIMITS, mailConfiguration(), mailEvent(), mailEventKey() (+4 more)

### Community 53 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 54 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 55 - "createTripJournal"
Cohesion: 0.25
Nodes (13): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+5 more)

### Community 56 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 57 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 58 - "DriverLayoutShell.tsx"
Cohesion: 0.22
Nodes (11): DriverLayout(), DriverInfo, DriverLayoutContent(), DriverLayoutShell(), TabItem(), VehicleData, DriverSplashScreen(), DriverSplashScreenProps (+3 more)

### Community 59 - "ActivityFilters.tsx"
Cohesion: 0.31
Nodes (10): Period, periodDates(), validDay(), validRange(), Context, useActivityFilters(), useStateValue(), ActivityFilters() (+2 more)

### Community 60 - "form.tsx"
Cohesion: 0.19
Nodes (12): @radix-ui/react-label, @radix-ui/react-slot, FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext (+4 more)

### Community 61 - "PDFGenerator"
Cohesion: 0.19
Nodes (3): configurePdfFonts(), structuredPaymentReference(), PDFGenerator

### Community 62 - "vervoerbewijs.ts"
Cohesion: 0.20
Nodes (12): chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs(), VervoerbewijsChiron, VervoerbewijsCompany (+4 more)

### Community 63 - "ref_node_crypto"
Cohesion: 0.21
Nodes (6): dir, aad, openPushCredential(), decodeTotpSecret(), matchingTotpStep(), totpAt()

### Community 64 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+5 more)

### Community 65 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 66 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 67 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 68 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 69 - "pdf-generator.ts"
Cohesion: 0.22
Nodes (9): jspdf, ChironTestMessage, AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, TestResult, TripInvoiceData (+1 more)

### Community 71 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 72 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 73 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 74 - "subscription-billing.ts"
Cohesion: 0.29
Nodes (7): billingGET, billingPOST, command, date, expected, id, profile

### Community 75 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 76 - "subscription-scheduler.ts"
Cohesion: 0.40
Nodes (7): register(), euro(), SubscriptionDocument, subscriptionPdf(), escape(), startSubscriptionScheduler(), subscriptionTick()

### Community 77 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 78 - "ApiError"
Cohesion: 0.44
Nodes (8): ApiError, createDriverApi(), loadProfile(), ownerRead(), profile(), request(), requestOnce(), vehicles()

### Community 79 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 80 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 81 - "devices/route.ts"
Cohesion: 0.39
Nodes (7): POST, registration, close(), decryptSecret(), encryptSecret(), key(), transformSecrets()

### Community 82 - "DirectoryToolbar.tsx"
Cohesion: 0.31
Nodes (4): directoryCopy, CompanyOption, DirectoryKind, DirectoryResult

### Community 83 - "sheet.tsx"
Cohesion: 0.28
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 84 - "apiRequest"
Cohesion: 0.33
Nodes (8): apiRequest(), buildApiUrl(), getLoginPath(), parseApiResponse(), redirectToLogin(), refreshToken(), connectionFailure, connectionMessage()

### Community 86 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 88 - "InvoicesFeaturePage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, InvoicesFeaturePage(), PublicStats

### Community 89 - "TripManagementPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, TripManagementPage()

### Community 90 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 92 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 93 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 94 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 95 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 96 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 97 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 98 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 99 - "driver-app/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, strict, exclude, extends, expo/tsconfig.base

### Community 100 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 101 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, eslint, eslint-config-expo, @types/react, typescript

### Community 104 - "start/route.ts"
Cohesion: 0.70
Nodes (4): generateTripHash(), generateTripUuid(), getRetentionDate(), POST

### Community 105 - "ModeEnum"
Cohesion: 0.40
Nodes (5): ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET

### Community 106 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 107 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 108 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 111 - "scroll-area.tsx"
Cohesion: 0.67
Nodes (3): @radix-ui/react-scroll-area, ScrollArea, ScrollBar

### Community 112 - "user/route.ts"
Cohesion: 0.83
Nodes (3): GET, resolveDistributorInfo(), resolveEffectiveUserType()

### Community 113 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 114 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 115 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 116 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 117 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 118 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

### Community 128 - "PortalEnum"
Cohesion: 0.67
Nodes (3): PortalEnum, ADMIN, COMPANY

## Knowledge Gaps
- **679 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+674 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 930 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **42 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionProvider()` connect `preferences.tsx` to `usePreferences`, `useTripController.ts`, `session.tsx`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _679 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07682595182595182 - nodes in this community are weakly interconnected._
- **Why does `generateAdminUserToken()` connect `createErrorResponse` to `authCrudOperations`, `createPostgrestClient`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `api-utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05711318795430945 - nodes in this community are weakly interconnected._
- **Should `useLanguage` be split into smaller, more focused modules?**
  _Cohesion score 0.0566880217433508 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.09451754385964913 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 162 unresolved internal-endpoint edges and 18 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 191 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
