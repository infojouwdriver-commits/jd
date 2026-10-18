# Graph Report - JOUW DRIVER  (2026-10-18)

## Corpus Check
- 500 files · ~218,653 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2838 nodes · 9803 edges · 142 communities (102 shown, 40 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 256 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `74556752`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- lib/auth.ts
- lucide-react
- useTripController.ts
- create-response.ts
- api-utils.ts
- usePreferences
- Input
- dependencies
- cn
- Card
- 20261018_company_lifecycle.sql
- preferences.tsx
- GdprAdminClient.tsx
- ref_react
- BackgroundGeolocation
- package.json
- RegisterForm.tsx
- InvoicesFeaturePage.tsx
- SiteAIAgent.tsx
- end/route.ts
- sidebar.tsx
- dependencies
- crud-operations.ts
- subscription-billing.ts
- DriverRegisterForm.tsx
- BackgroundGeolocationService.java
- mobile-location.ts
- driver-app/package.json
- scripts
- use-toast.ts
- Button
- api
- mobile/package.json
- 20261018_subscription_billing.sql
- driver/taximeter/page.tsx
- pdf-generator.ts
- useSessionState
- utils.ts
- framer-motion
- ref_node_fs
- api.ts
- DriverMap.tsx
- form.tsx
- TripPointJournal.java
- DriverGuideSection.tsx
- contracts/route.ts
- useLanguage
- PlatformLanding.tsx
- DriverGdprSection.tsx
- compilerOptions
- vervoerbewijs.ts
- BackgroundGeolocation
- "schema".security_operations_centre
- update-customer-portal.sh
- 20261016_native_push.sql
- api-client.ts
- code-map.py
- command.tsx
- convert-database.mjs
- RouteMap.tsx
- createTripJournal
- carousel.tsx
- apply-release.mjs
- DriverLayoutShell.tsx
- ActivityFilters.tsx
- company-portal/drivers/route.ts
- ref_node_crypto
- push-worker.mjs
- PDFGenerator
- chart.tsx
- DriverFleetShift.tsx
- DriverProfilePage.tsx
- LanguageContext.tsx
- "schema".security_save_company_account
- class-variance-authority
- FaqPage.tsx
- chat/route.ts
- pagination.tsx
- 20261013_mail_delivery.sql
- navigation-menu.tsx
- drawer.tsx
- sheet.tsx
- Override
- verify-private-owner.cjs
- [...path]/route.ts
- android.content.Intent
- login
- LiveMap.tsx
- definitions.d.ts
- database-readiness.mjs
- SecurityPage.tsx
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- driver-app/tsconfig.json
- admin-enrollment.mjs
- 20261009_security.sql
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
- scroll-area.tsx
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
1. `createErrorResponse()` - 256 edges
2. `createSuccessResponse()` - 251 edges
3. `generateAdminUserToken()` - 235 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 227 edges
6. `validateRequestBody()` - 147 edges
7. `Button` - 138 edges
8. `requestMiddleware()` - 112 edges
9. `parseQueryParams()` - 99 edges
10. `lucide-react` - 98 edges

## Surprising Connections (you probably didn't know these)
- `locate()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `search()` --indirect_call--> `value()`  [INFERRED]
  driver-app/src/experience/AddressField.tsx → scripts/convert-database.mjs
- `DriverMapView()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `ActiveTrip()` --references--> `Alert`  [EXTRACTED]
  driver-app/src/experience/ActiveTrip.tsx → src/components/ui/alert.tsx
- `ContractDocument()` --references--> `dompurify`  [EXTRACTED]
  src/components/contracts/ContractDocument.tsx → package.json

## Import Cycles
- 2-file cycle: `src/lib/api-utils.ts -> src/lib/create-response.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (142 total, 40 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (118): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+110 more)

### Community 1 - "lib/auth.ts"
Cohesion: 0.07
Nodes (70): GET, PUT, available(), GET, POST, schema, driverLoginSchema, findCredentialByPhoneSafely() (+62 more)

### Community 2 - "lucide-react"
Cohesion: 0.06
Nodes (63): nextConfig, lucide-react, next, sonner, AdminAccountPage(), FailedTrip, ChironSettingsPage(), Company (+55 more)

### Community 3 - "useTripController.ts"
Cohesion: 0.06
Nodes (55): styles, ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt() (+47 more)

### Community 4 - "create-response.ts"
Cohesion: 0.07
Nodes (51): zod, command, POST, filters, GET, GET, POST, GET (+43 more)

### Community 5 - "api-utils.ts"
Cohesion: 0.05
Nodes (51): bcryptjs, registrationSchema, GET, POST, VALID_TYPES, GET, POST, POST (+43 more)

### Community 6 - "usePreferences"
Cohesion: 0.14
Nodes (45): ActivityPage, Account(), ActiveTrip(), AddressField(), search(), BillingReminder(), dismissed, Home() (+37 more)

### Community 7 - "Input"
Cohesion: 0.10
Nodes (48): Company, CompanyContractsPage(), Contract, Signature, Company, EditCompanyPage(), Company, Distributor (+40 more)

### Community 8 - "dependencies"
Cohesion: 0.03
Nodes (62): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+54 more)

### Community 9 - "cn"
Cohesion: 0.06
Nodes (51): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+43 more)

### Community 10 - "Card"
Cohesion: 0.13
Nodes (45): AdSlot, AdSlotsPage(), EMPTY_FORM, ChironSyncPage(), CompaniesPageContent(), AdminDriversPageContent(), AdminMessagesPage(), Company (+37 more)

### Community 11 - "20261018_company_lifecycle.sql"
Cohesion: 0.05
Nodes (29): ApiError, createDriverApi(), loadProfile(), ownerRead(), profile(), request(), requestOnce(), vehicles() (+21 more)

### Community 12 - "preferences.tsx"
Cohesion: 0.07
Nodes (40): Layout(), Navigation(), ActivityProvider(), RoadArt(), companyCopy, copy, CopyKey, Language (+32 more)

### Community 13 - "GdprAdminClient.tsx"
Cohesion: 0.08
Nodes (46): GdprAdminPage(), metadata, CompanyDashboardPage(), ApprovalRequest, Company, DistributorDashboardPage(), Driver, Invoice (+38 more)

### Community 14 - "ref_react"
Cohesion: 0.09
Nodes (30): Page(), Page(), Invoice, Trip, PortalData, BillingData, BillingPanel(), submit() (+22 more)

### Community 15 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 16 - "package.json"
Cohesion: 0.04
Nodes (42): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+34 more)

### Community 17 - "RegisterForm.tsx"
Cohesion: 0.10
Nodes (35): @hookform/resolvers, react-hook-form, LoginPage(), CompanyLoginForm(), CompanyLoginFormData, CompanyLoginFormProps, companyLoginSchema, GoogleLoginButton() (+27 more)

### Community 18 - "InvoicesFeaturePage.tsx"
Cohesion: 0.08
Nodes (32): Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps, FeaturePageLayout() (+24 more)

### Community 19 - "SiteAIAgent.tsx"
Cohesion: 0.08
Nodes (37): next-themes, dynamic, metadata, RootLayout(), viewport, apiFetch(), ApiResponse, buildApiUrl() (+29 more)

### Community 20 - "end/route.ts"
Cohesion: 0.12
Nodes (23): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError, numeric() (+15 more)

### Community 21 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 22 - "dependencies"
Cohesion: 0.05
Nodes (36): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+28 more)

### Community 23 - "crud-operations.ts"
Cohesion: 0.11
Nodes (20): POST, PUT, sendContractEmail(), GET, POST, GET, POST, POST (+12 more)

### Community 24 - "subscription-billing.ts"
Cohesion: 0.10
Nodes (25): resend, POST(), runtime, register(), events, MAIL_FREE_LIMITS, mailConfiguration(), mailEvent() (+17 more)

### Community 25 - "DriverRegisterForm.tsx"
Cohesion: 0.08
Nodes (29): DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data, step1Schema, Step2Data, step2Schema (+21 more)

### Community 26 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 27 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 28 - "driver-app/package.json"
Cohesion: 0.07
Nodes (29): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+21 more)

### Community 29 - "scripts"
Cohesion: 0.07
Nodes (29): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+21 more)

### Community 30 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 31 - "Button"
Cohesion: 0.11
Nodes (22): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), ContractPrintPage(), PrintableContract (+14 more)

### Community 32 - "api"
Cohesion: 0.13
Nodes (17): CompaniesPage(), Company, emptyNew, AdminDriversPage(), Company, Driver, getErrorMessage(), Company (+9 more)

### Community 33 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 34 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 35 - "driver/taximeter/page.tsx"
Cohesion: 0.13
Nodes (23): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), GlassCard(), GoldButton(), LocationPoint (+15 more)

### Community 36 - "pdf-generator.ts"
Cohesion: 0.15
Nodes (22): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+14 more)

### Community 37 - "useSessionState"
Cohesion: 0.12
Nodes (19): App(), logout(), createActionGate(), apiConnectionKey(), invoice(), clearReceiptCache(), directory(), shareReceipt() (+11 more)

### Community 38 - "utils.ts"
Cohesion: 0.08
Nodes (17): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-slider, react-day-picker, react-resizable-panels, tailwind-merge (+9 more)

### Community 39 - "framer-motion"
Cohesion: 0.12
Nodes (12): framer-motion, AnimatedLogo(), AnimatedLogoProps, FeatureCardProps, LandingNav(), LandingNavProps, LANG_OPTIONS, LanguageSwitcher() (+4 more)

### Community 40 - "ref_node_fs"
Cohesion: 0.13
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 41 - "api.ts"
Cohesion: 0.14
Nodes (16): AccountInfo, ActivityQuery, ActivityTrip, API_ORIGIN, driverApi, DriverDetails, DriverMessage, DriverNotification (+8 more)

### Community 42 - "DriverMap.tsx"
Cohesion: 0.19
Nodes (18): DriverMap(), DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, coordinate() (+10 more)

### Community 43 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 45 - "DriverGuideSection.tsx"
Cohesion: 0.14
Nodes (17): dompurify, dompurify, DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep (+9 more)

### Community 47 - "contracts/route.ts"
Cohesion: 0.25
Nodes (16): DELETE, document(), failed(), GET, positiveId(), POST, PUT, CONTRACT_DOCUMENT_CSS (+8 more)

### Community 48 - "useLanguage"
Cohesion: 0.19
Nodes (15): DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), DriverGoogleLoginButton(), DriverLoginClient() (+7 more)

### Community 49 - "PlatformLanding.tsx"
Cohesion: 0.15
Nodes (8): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), Route(), translations, registrationCopy

### Community 50 - "DriverGdprSection.tsx"
Cohesion: 0.16
Nodes (15): PrivacyCenter(), CookiePreferencesButton(), DataRequest, DriverGdprSection(), GlassCard(), REQUEST_TYPES, SectionHeader(), STATUS_CFG (+7 more)

### Community 51 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 52 - "vervoerbewijs.ts"
Cohesion: 0.18
Nodes (14): jspdf, configurePdfFonts(), chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs() (+6 more)

### Community 54 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 55 - "update-customer-portal.sh"
Cohesion: 0.12
Nodes (15): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, FLEET_MIGRATION, LIFECYCLE_MIGRATION, MAIL_MIGRATION (+7 more)

### Community 56 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 57 - "api-client.ts"
Cohesion: 0.23
Nodes (13): ApiError, apiRequest(), ApiResponse, buildApiUrl(), getLoginPath(), getServerApiBaseUrl(), normalizeBaseUrl(), parseApiResponse() (+5 more)

### Community 58 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 59 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 60 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 61 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 62 - "createTripJournal"
Cohesion: 0.25
Nodes (13): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+5 more)

### Community 63 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 64 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 65 - "DriverLayoutShell.tsx"
Cohesion: 0.22
Nodes (11): DriverLayout(), DriverInfo, DriverLayoutContent(), DriverLayoutShell(), TabItem(), VehicleData, DriverSplashScreen(), DriverSplashScreenProps (+3 more)

### Community 66 - "ActivityFilters.tsx"
Cohesion: 0.31
Nodes (10): Period, periodDates(), validDay(), validRange(), Context, useActivityFilters(), useStateValue(), ActivityFilters() (+2 more)

### Community 67 - "company-portal/drivers/route.ts"
Cohesion: 0.40
Nodes (11): DELETE, getManagerCompanyId(), POST, PUT, POST, PUT, driverFieldsSchema, driverValidationError() (+3 more)

### Community 68 - "ref_node_crypto"
Cohesion: 0.21
Nodes (6): dir, aad, openPushCredential(), decodeTotpSecret(), matchingTotpStep(), totpAt()

### Community 69 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 71 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 72 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 73 - "DriverProfilePage.tsx"
Cohesion: 0.31
Nodes (9): DriverProfileRoute(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge(), VehicleCard() (+1 more)

### Community 74 - "LanguageContext.tsx"
Cohesion: 0.31
Nodes (10): VehicleSelectionModalProps, AppLanguage, detectBrowserLanguage(), LanguageContext, LanguageContextValue, LanguageProvider(), normalizeLanguage(), readCookieLanguage() (+2 more)

### Community 76 - "class-variance-authority"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 77 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 78 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 79 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 80 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 81 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 82 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 83 - "sheet.tsx"
Cohesion: 0.28
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 85 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 86 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 88 - "login"
Cohesion: 0.33
Nodes (5): login(), open(), seal(), identity(), JournalCipher

### Community 89 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 90 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 91 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 92 - "SecurityPage.tsx"
Cohesion: 0.38
Nodes (5): Page(), contentFr, contentNl, icons, SecurityPage()

### Community 93 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 94 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 95 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 96 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 97 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 98 - "driver-app/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, strict, exclude, extends, expo/tsconfig.base

### Community 99 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 101 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 102 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 103 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 106 - "scroll-area.tsx"
Cohesion: 0.67
Nodes (3): @radix-ui/react-scroll-area, ScrollArea, ScrollBar

### Community 107 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 108 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 109 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 110 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

### Community 120 - "PortalEnum"
Cohesion: 0.67
Nodes (3): PortalEnum, ADMIN, COMPANY

## Knowledge Gaps
- **674 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+669 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 918 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **40 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `requestMiddleware()` connect `api-utils.ts` to `createErrorResponse`, `lib/auth.ts`, `create-response.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _674 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.075 - nodes in this community are weakly interconnected._
- **Why does `generateAdminUserToken()` connect `createErrorResponse` to `lib/auth.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `lib/auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07229466941203386 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.05937353903693315 - nodes in this community are weakly interconnected._
- **Should `useTripController.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06347469220246238 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 166 unresolved internal-endpoint edges and 18 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 184 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
