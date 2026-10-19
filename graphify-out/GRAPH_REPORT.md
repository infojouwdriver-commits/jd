# Graph Report - JOUW DRIVER  (2026-10-19)

## Corpus Check
- 517 files · ~223,160 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2916 nodes · 9914 edges · 161 communities (117 shown, 44 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 247 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3085a80f`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- requestMiddleware
- Input
- useTripController.ts
- useAuth
- ref_react
- lib/auth.ts
- usePreferences
- Button
- cn
- admin/messages/page.tsx
- api-utils.ts
- dependencies
- preferences.tsx
- BackgroundGeolocation
- package.json
- ReportsPage.tsx
- end/route.ts
- sidebar.tsx
- distributor/dashboard/page.tsx
- validateRequestBody
- create-response.ts
- framer-motion
- BackgroundGeolocationService.java
- driver-app/package.json
- scripts
- utils.ts
- use-toast.ts
- dependencies
- mobile/package.json
- 20261018_subscription_billing.sql
- driver/taximeter/page.tsx
- useSessionState
- SiteAIAgent.tsx
- DirectoryToolbar.tsx
- 20261018_contract_billing.sql
- company-registrations/route.ts
- api.ts
- DriverMap.tsx
- form.tsx
- DriverGdprSection.tsx
- TripPointJournal.java
- ref_node_fs
- update-customer-portal.sh
- api-client.ts
- PlatformLanding.tsx
- compilerOptions
- mobile-location.ts
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- app/layout.tsx
- code-map.py
- 20261018_company_lifecycle.sql
- convert-database.mjs
- RouteMap.tsx
- send-signature-link/route.ts
- generateAcceptanceReportPdf
- createTripJournal
- carousel.tsx
- apply-release.mjs
- ActivityFilters.tsx
- vervoerbewijs.ts
- subscription-scheduler.ts
- push-worker.mjs
- DriverGuideSection.tsx
- useGeolocation.ts
- PDFGenerator
- "schema".company_registrations
- chart.tsx
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- HomepageAdSlotSection.tsx
- sheet.tsx
- driver/notifications/page.tsx
- LanguageContext.tsx
- ref_node_crypto
- "schema".security_save_company_account
- "schema".company_change_requests
- sign-contract/[token]/page.tsx
- FaqPage.tsx
- chat/route.ts
- pagination.tsx
- scripts
- ApiError
- 20261013_mail_delivery.sql
- navigation-menu.tsx
- toggle-group.tsx
- useLanguage
- pdf-generator.ts
- Override
- verify-private-owner.cjs
- "schema".security_archive_company
- InvoicesFeaturePage.tsx
- [...path]/route.ts
- cookie-consent.ts
- android.content.Intent
- configure-mail.mjs
- login
- LiveMap.tsx
- definitions.d.ts
- database-readiness.mjs
- brevo/route.ts
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
- resend/route.ts
- ModeEnum
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
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
- privacy-policy/page.tsx
- PortalEnum
- backup-foundation.sh
- import-private-archive.sh
- Package.swift

## God Nodes (most connected - your core abstractions)
1. `createErrorResponse()` - 254 edges
2. `createSuccessResponse()` - 250 edges
3. `generateAdminUserToken()` - 235 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 218 edges
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
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (161 total, 44 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (109): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+101 more)

### Community 1 - "requestMiddleware"
Cohesion: 0.06
Nodes (61): zod, command, POST, filters, GET, GET, POST, GET (+53 more)

### Community 2 - "Input"
Cohesion: 0.07
Nodes (74): Company, CompanyContractsPage(), Contract, Signature, Company, Distributor, DistributorsPage(), Page() (+66 more)

### Community 3 - "useTripController.ts"
Cohesion: 0.06
Nodes (55): styles, ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt() (+47 more)

### Community 4 - "useAuth"
Cohesion: 0.07
Nodes (63): nextConfig, next, sonner, AdminAccountPage(), ChironSyncPage(), FailedTrip, ChironSettingsPage(), Company (+55 more)

### Community 5 - "ref_react"
Cohesion: 0.06
Nodes (62): @hookform/resolvers, lucide-react, react-hook-form, DriverLoginPage(), LoginPage(), CompanyLoginForm(), CompanyLoginFormData, CompanyLoginFormProps (+54 more)

### Community 6 - "lib/auth.ts"
Cohesion: 0.09
Nodes (60): GET, PUT, available(), GET, POST, schema, driverLoginSchema, findCredentialByPhoneSafely() (+52 more)

### Community 7 - "usePreferences"
Cohesion: 0.14
Nodes (45): ActivityPage, Account(), ActiveTrip(), AddressField(), search(), BillingReminder(), dismissed, Home() (+37 more)

### Community 8 - "Button"
Cohesion: 0.08
Nodes (45): class-variance-authority, Page(), CompanyDashboardPage(), Invoice, Trip, TripsPage(), CompanyDashboard(), PortalData (+37 more)

### Community 9 - "cn"
Cohesion: 0.05
Nodes (59): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger (+51 more)

### Community 10 - "admin/messages/page.tsx"
Cohesion: 0.10
Nodes (50): AdSlot, AdSlotsPage(), EMPTY_FORM, CompaniesPage(), CompaniesPageContent(), Company, emptyNew, AdminDriversPage() (+42 more)

### Community 11 - "api-utils.ts"
Cohesion: 0.06
Nodes (48): GET, POST, VALID_TYPES, GET, POST, GET, normalizeUrlPreview(), ApiParams (+40 more)

### Community 12 - "dependencies"
Cohesion: 0.03
Nodes (62): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+54 more)

### Community 13 - "preferences.tsx"
Cohesion: 0.07
Nodes (40): Layout(), Navigation(), ActivityProvider(), RoadArt(), companyCopy, copy, CopyKey, Language (+32 more)

### Community 14 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 15 - "package.json"
Cohesion: 0.04
Nodes (42): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+34 more)

### Community 16 - "ReportsPage.tsx"
Cohesion: 0.08
Nodes (31): Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps, FeaturePageLayout() (+23 more)

### Community 17 - "end/route.ts"
Cohesion: 0.12
Nodes (23): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError, numeric() (+15 more)

### Community 18 - "sidebar.tsx"
Cohesion: 0.07
Nodes (31): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup, SidebarGroupAction (+23 more)

### Community 19 - "distributor/dashboard/page.tsx"
Cohesion: 0.10
Nodes (29): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), GdprAdminPage(), metadata (+21 more)

### Community 20 - "validateRequestBody"
Cohesion: 0.13
Nodes (23): POST, POST, PUT, POST, registerSchema, POST, PUT, POST (+15 more)

### Community 21 - "create-response.ts"
Cohesion: 0.10
Nodes (18): bcryptjs, GET, resolveDistributorInfo(), resolveEffectiveUserType(), registrationSchema, GET, POST, generateTripHash() (+10 more)

### Community 22 - "framer-motion"
Cohesion: 0.09
Nodes (17): framer-motion, DriverLayout(), DriverInfo, DriverLayoutContent(), DriverLayoutShell(), TabItem(), VehicleData, DriverSplashScreen() (+9 more)

### Community 23 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 24 - "driver-app/package.json"
Cohesion: 0.07
Nodes (29): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+21 more)

### Community 25 - "scripts"
Cohesion: 0.07
Nodes (29): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+21 more)

### Community 26 - "utils.ts"
Cohesion: 0.07
Nodes (21): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-slider, react-day-picker, react-resizable-panels, tailwind-merge (+13 more)

### Community 27 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 28 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+19 more)

### Community 29 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 30 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 31 - "driver/taximeter/page.tsx"
Cohesion: 0.13
Nodes (23): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), GlassCard(), GoldButton(), LocationPoint (+15 more)

### Community 32 - "useSessionState"
Cohesion: 0.12
Nodes (19): App(), logout(), createActionGate(), apiConnectionKey(), invoice(), clearReceiptCache(), directory(), shareReceipt() (+11 more)

### Community 33 - "SiteAIAgent.tsx"
Cohesion: 0.14
Nodes (24): apiFetch(), ApiResponse, buildApiUrl(), ChatMessage, ConversationStep, detectChangeIntent(), detectSearchIntent(), formatEntityInfo() (+16 more)

### Community 34 - "DirectoryToolbar.tsx"
Cohesion: 0.14
Nodes (17): cmdk, @radix-ui/react-popover, directoryCopy, CompanyOption, CompanyPicker(), DirectoryKind, DirectoryResult, Command (+9 more)

### Community 35 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 36 - "company-registrations/route.ts"
Cohesion: 0.23
Nodes (19): PUT, review, DELETE, document(), failed(), GET, positiveId(), POST (+11 more)

### Community 37 - "api.ts"
Cohesion: 0.14
Nodes (16): AccountInfo, ActivityQuery, ActivityTrip, API_ORIGIN, driverApi, DriverDetails, DriverMessage, DriverNotification (+8 more)

### Community 38 - "DriverMap.tsx"
Cohesion: 0.19
Nodes (18): DriverMap(), DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, coordinate() (+10 more)

### Community 39 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 40 - "DriverGdprSection.tsx"
Cohesion: 0.16
Nodes (18): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+10 more)

### Community 42 - "ref_node_fs"
Cohesion: 0.13
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 44 - "update-customer-portal.sh"
Cohesion: 0.10
Nodes (18): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, FLEET_MIGRATION, LIFECYCLE_MIGRATION (+10 more)

### Community 45 - "api-client.ts"
Cohesion: 0.18
Nodes (15): Vehicle, VehicleData, ApiError, apiRequest(), ApiResponse, buildApiUrl(), getLoginPath(), getServerApiBaseUrl() (+7 more)

### Community 46 - "PlatformLanding.tsx"
Cohesion: 0.15
Nodes (8): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), Route(), translations, registrationCopy

### Community 47 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 48 - "mobile-location.ts"
Cohesion: 0.15
Nodes (12): clearNativeTripPoints(), createNativeLocationWatch(), createNativeTripReplay(), LocationError, NativeLocation, NativeLocationPlugin, nativePlugin, NativeTripIdentity (+4 more)

### Community 50 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 51 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 52 - "app/layout.tsx"
Cohesion: 0.17
Nodes (13): next-themes, dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider(), GlobalClientEffects() (+5 more)

### Community 53 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 54 - "20261018_company_lifecycle.sql"
Cohesion: 0.17
Nodes (10): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+2 more)

### Community 55 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 56 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 57 - "send-signature-link/route.ts"
Cohesion: 0.22
Nodes (11): command, POST, contractInvitation(), events, MAIL_FREE_LIMITS, mailConfiguration(), mailEventKey(), MailStatus (+3 more)

### Community 58 - "generateAcceptanceReportPdf"
Cohesion: 0.28
Nodes (13): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+5 more)

### Community 59 - "createTripJournal"
Cohesion: 0.25
Nodes (13): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+5 more)

### Community 60 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 61 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 62 - "ActivityFilters.tsx"
Cohesion: 0.31
Nodes (10): Period, periodDates(), validDay(), validRange(), Context, useActivityFilters(), useStateValue(), ActivityFilters() (+2 more)

### Community 63 - "vervoerbewijs.ts"
Cohesion: 0.20
Nodes (12): chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs(), VervoerbewijsChiron, VervoerbewijsCompany (+4 more)

### Community 64 - "subscription-scheduler.ts"
Cohesion: 0.31
Nodes (9): jspdf, register(), configurePdfFonts(), euro(), SubscriptionDocument, subscriptionPdf(), escape(), startSubscriptionScheduler() (+1 more)

### Community 65 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 66 - "DriverGuideSection.tsx"
Cohesion: 0.22
Nodes (11): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+3 more)

### Community 67 - "useGeolocation.ts"
Cohesion: 0.24
Nodes (11): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), isFreshAccurateLocation(), isNativeMobile() (+3 more)

### Community 69 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 70 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 71 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 72 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 73 - "HomepageAdSlotSection.tsx"
Cohesion: 0.25
Nodes (8): dompurify, dompurify, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml(), LandingLanguage, landingTranslations

### Community 74 - "sheet.tsx"
Cohesion: 0.22
Nodes (10): @radix-ui/react-dialog, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+2 more)

### Community 75 - "driver/notifications/page.tsx"
Cohesion: 0.25
Nodes (9): DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), ar, driverTranslations, fr (+1 more)

### Community 76 - "LanguageContext.tsx"
Cohesion: 0.31
Nodes (10): VehicleSelectionModalProps, AppLanguage, detectBrowserLanguage(), LanguageContext, LanguageContextValue, LanguageProvider(), normalizeLanguage(), readCookieLanguage() (+2 more)

### Community 77 - "ref_node_crypto"
Cohesion: 0.24
Nodes (3): dir, aad, openPushCredential()

### Community 79 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 80 - "sign-contract/[token]/page.tsx"
Cohesion: 0.29
Nodes (7): ContractPrintPage(), PrintableContract, ContractData, SignatureInfo, SignContractPage(), translations, ContractDocument()

### Community 81 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 82 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 83 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 84 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 85 - "ApiError"
Cohesion: 0.44
Nodes (8): ApiError, createDriverApi(), loadProfile(), ownerRead(), profile(), request(), requestOnce(), vehicles()

### Community 86 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 87 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 88 - "toggle-group.tsx"
Cohesion: 0.31
Nodes (7): @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 89 - "useLanguage"
Cohesion: 0.39
Nodes (7): AnimatedLogo(), AnimatedLogoProps, LandingNav(), LandingNavProps, LANG_OPTIONS, LanguageSwitcher(), useLanguage()

### Community 90 - "pdf-generator.ts"
Cohesion: 0.25
Nodes (8): ChironTestMessage, AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, TestResult, TripInvoiceData, VehicleInfo

### Community 92 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 94 - "InvoicesFeaturePage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, InvoicesFeaturePage(), PublicStats

### Community 95 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 96 - "cookie-consent.ts"
Cohesion: 0.32
Nodes (6): COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION, COOKIE_PREFERENCES_EVENT, CookieConsent, parseCookieConsent(), readCookieConsent()

### Community 98 - "configure-mail.mjs"
Cohesion: 0.43
Nodes (5): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readMailRuntimeEnv()

### Community 99 - "login"
Cohesion: 0.33
Nodes (5): login(), open(), seal(), identity(), JournalCipher

### Community 100 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 101 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 102 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 103 - "brevo/route.ts"
Cohesion: 0.52
Nodes (5): POST(), runtime, brevoMailEvent(), brevoProviderId(), brevoWebhookAuthorized()

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

### Community 109 - "driver-app/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, strict, exclude, extends, expo/tsconfig.base

### Community 110 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 111 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 114 - "resend/route.ts"
Cohesion: 0.50
Nodes (4): resend, POST(), runtime, mailEvent()

### Community 115 - "ModeEnum"
Cohesion: 0.40
Nodes (5): ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET

### Community 116 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 117 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 120 - "scroll-area.tsx"
Cohesion: 0.67
Nodes (3): @radix-ui/react-scroll-area, ScrollArea, ScrollBar

### Community 121 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 122 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 123 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 124 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 125 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 126 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

### Community 127 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

### Community 137 - "PortalEnum"
Cohesion: 0.67
Nodes (3): PortalEnum, ADMIN, COMPANY

## Knowledge Gaps
- **685 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+680 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 945 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `generateAdminUserToken()` connect `createErrorResponse` to `requestMiddleware`, `lib/auth.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _685 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07248960190136661 - nodes in this community are weakly interconnected._
- **Why does `getAuthRoles()` connect `requestMiddleware` to `api-utils.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `requestMiddleware` be split into smaller, more focused modules?**
  _Cohesion score 0.06271929824561404 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.07346024636058231 - nodes in this community are weakly interconnected._
- **Should `useTripController.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06347469220246238 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 162 unresolved internal-endpoint edges and 18 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 193 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
