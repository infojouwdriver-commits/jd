# Graph Report - JOUW DRIVER  (2026-10-19)

## Corpus Check
- 520 files · ~223,744 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2933 nodes · 9972 edges · 153 communities (108 shown, 45 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 247 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6229d9db`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- useTripController.ts
- DriverRegisterForm.tsx
- Button
- requestMiddleware
- usePreferences
- Input
- useAuth
- pdf-generator.ts
- validateRequestBody
- lib/auth.ts
- dependencies
- cn
- company-changes.ts
- api-utils.ts
- preferences.tsx
- Card
- BackgroundGeolocation
- package.json
- end/route.ts
- mobile-location.ts
- sidebar.tsx
- dependencies
- lucide-react
- api
- TripManagementPage.tsx
- DriverProfilePage.tsx
- BackgroundGeolocationService.java
- CookieBanner.tsx
- driver-app/package.json
- driver/taximeter/page.tsx
- scripts
- use-toast.ts
- ref_react
- utils.ts
- mobile/package.json
- 20261018_subscription_billing.sql
- useSessionState
- SiteAIAgent.tsx
- framer-motion
- 20261018_contract_billing.sql
- DirectoryToolbar.tsx
- api.ts
- DriverMap.tsx
- form.tsx
- TripPointJournal.java
- ref_node_fs
- update-customer-portal.sh
- PlatformLanding.tsx
- api-client.ts
- navigation-menu.tsx
- compilerOptions
- DriverLayoutShell.tsx
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- code-map.py
- 20261018_company_lifecycle.sql
- convert-database.mjs
- RouteMap.tsx
- next_api/contracts/route.ts
- createTripJournal
- carousel.tsx
- apply-release.mjs
- ActivityFilters.tsx
- LanguageContext.tsx
- push-worker.mjs
- "schema".company_registrations
- chart.tsx
- "schema".security_fleet_locations
- HomepageAdSlotSection.tsx
- ref_node_crypto
- "schema".security_save_company_account
- "schema".company_change_requests
- sheet.tsx
- FaqPage.tsx
- chat/route.ts
- DriverGuideSection.tsx
- pagination.tsx
- ApiError
- 20261013_mail_delivery.sql
- drawer.tsx
- Override
- configure-mail.mjs
- verify-private-owner.cjs
- "schema".security_archive_company
- InvoicesFeaturePage.tsx
- ReportsPage.tsx
- [...path]/route.ts
- android.content.Intent
- login
- 20261019_email_identity.sql
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
- sign/route.ts
- start/route.ts
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
- user/route.ts
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
1. `createErrorResponse()` - 254 edges
2. `createSuccessResponse()` - 250 edges
3. `generateAdminUserToken()` - 239 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 218 edges
6. `validateRequestBody()` - 146 edges
7. `Button` - 142 edges
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

## Communities (153 total, 45 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (114): GET, executeApprovedRequest(), GET, POST, PUT, DELETE, POST, PUT (+106 more)

### Community 1 - "useTripController.ts"
Cohesion: 0.06
Nodes (55): styles, ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt() (+47 more)

### Community 2 - "DriverRegisterForm.tsx"
Cohesion: 0.05
Nodes (69): @hookform/resolvers, react-hook-form, dynamic, LoginPage(), CompanyLoginForm(), DriverRegisterForm(), DriverRegisterFormProps, FormField() (+61 more)

### Community 3 - "Button"
Cohesion: 0.08
Nodes (53): ChironSyncPage(), FailedTrip, MessagesList(), Reply, Page(), CompanyDashboardPage(), Invoice, Trip (+45 more)

### Community 4 - "requestMiddleware"
Cohesion: 0.07
Nodes (44): zod, getTableName(), POST, command, POST, filters, GET, POST (+36 more)

### Community 5 - "usePreferences"
Cohesion: 0.14
Nodes (45): ActivityPage, Account(), ActiveTrip(), AddressField(), search(), BillingReminder(), dismissed, Home() (+37 more)

### Community 6 - "Input"
Cohesion: 0.11
Nodes (52): AdSlot, AdSlotsPage(), EMPTY_FORM, CompaniesPage(), CompaniesPageContent(), Company, emptyNew, AdminDriversPage() (+44 more)

### Community 7 - "useAuth"
Cohesion: 0.07
Nodes (55): Company, EditCompanyPage(), Company, Distributor, DistributorsPage(), GdprAdminPage(), metadata, AcceptanceTestPage() (+47 more)

### Community 8 - "pdf-generator.ts"
Cohesion: 0.06
Nodes (46): jspdf, register(), configurePdfFonts(), chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime() (+38 more)

### Community 9 - "validateRequestBody"
Cohesion: 0.08
Nodes (44): bcryptjs, available(), GET, POST, schema, POST, schema, POST (+36 more)

### Community 10 - "lib/auth.ts"
Cohesion: 0.10
Nodes (50): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+42 more)

### Community 11 - "dependencies"
Cohesion: 0.03
Nodes (62): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+54 more)

### Community 12 - "cn"
Cohesion: 0.06
Nodes (51): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+43 more)

### Community 13 - "company-changes.ts"
Cohesion: 0.10
Nodes (36): GET, POST, PUT, getAuthRoles(), changeFingerprint(), changesGET, changesPUT, fleetChange() (+28 more)

### Community 14 - "api-utils.ts"
Cohesion: 0.07
Nodes (44): POST, VALID_TYPES, GET, normalizeUrlPreview(), ApiParams, appendCorsHeaders(), clearCookie(), extractBearerToken() (+36 more)

### Community 15 - "preferences.tsx"
Cohesion: 0.07
Nodes (40): Layout(), Navigation(), ActivityProvider(), RoadArt(), companyCopy, copy, CopyKey, Language (+32 more)

### Community 16 - "Card"
Cohesion: 0.11
Nodes (39): sonner, AdminAccountPage(), ChironSettingsPage(), Company, PlatformContract, PlatformContractsPage(), Company, CompanyPricingPage() (+31 more)

### Community 17 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 18 - "package.json"
Cohesion: 0.04
Nodes (42): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+34 more)

### Community 19 - "end/route.ts"
Cohesion: 0.12
Nodes (23): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError, numeric() (+15 more)

### Community 20 - "mobile-location.ts"
Cohesion: 0.08
Nodes (32): copy, DriverFleetShift(), GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation() (+24 more)

### Community 21 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 22 - "dependencies"
Cohesion: 0.05
Nodes (36): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+28 more)

### Community 23 - "lucide-react"
Cohesion: 0.11
Nodes (25): lucide-react, ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), Page() (+17 more)

### Community 24 - "api"
Cohesion: 0.16
Nodes (26): Company, CompanyContractsPage(), Contract, Signature, AdminTripsPage(), Trip, DriverMessagesPage(), glassCard (+18 more)

### Community 25 - "TripManagementPage.tsx"
Cohesion: 0.10
Nodes (25): Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps, FeaturePageLayout(), FeaturePageLayoutProps (+17 more)

### Community 26 - "DriverProfilePage.tsx"
Cohesion: 0.09
Nodes (27): DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), DriverProfileRoute(), DriverTestPage() (+19 more)

### Community 27 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 28 - "CookieBanner.tsx"
Cohesion: 0.10
Nodes (24): next-themes, dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider(), CookieBanner() (+16 more)

### Community 29 - "driver-app/package.json"
Cohesion: 0.07
Nodes (29): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+21 more)

### Community 30 - "driver/taximeter/page.tsx"
Cohesion: 0.12
Nodes (25): leaflet, BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), GlassCard(), GoldButton() (+17 more)

### Community 31 - "scripts"
Cohesion: 0.07
Nodes (29): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+21 more)

### Community 32 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 33 - "ref_react"
Cohesion: 0.10
Nodes (17): nextConfig, next, ContractPrintPage(), PrintableContract, Company, Invoice, InvoiceViewPage(), ShareLink (+9 more)

### Community 34 - "utils.ts"
Cohesion: 0.07
Nodes (20): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+12 more)

### Community 35 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 36 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 37 - "useSessionState"
Cohesion: 0.12
Nodes (19): App(), logout(), createActionGate(), apiConnectionKey(), invoice(), clearReceiptCache(), directory(), shareReceipt() (+11 more)

### Community 38 - "SiteAIAgent.tsx"
Cohesion: 0.14
Nodes (24): apiFetch(), ApiResponse, buildApiUrl(), ChatMessage, ConversationStep, detectChangeIntent(), detectSearchIntent(), formatEntityInfo() (+16 more)

### Community 39 - "framer-motion"
Cohesion: 0.10
Nodes (13): framer-motion, GpsLocationButtonProps, GpsStatus, LABELS, AnimatedLogo(), AnimatedLogoProps, FeatureCardProps, LandingNav() (+5 more)

### Community 40 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 41 - "DirectoryToolbar.tsx"
Cohesion: 0.14
Nodes (17): cmdk, @radix-ui/react-popover, directoryCopy, CompanyOption, CompanyPicker(), DirectoryKind, DirectoryResult, Command (+9 more)

### Community 42 - "api.ts"
Cohesion: 0.14
Nodes (16): AccountInfo, ActivityQuery, ActivityTrip, API_ORIGIN, driverApi, DriverDetails, DriverMessage, DriverNotification (+8 more)

### Community 43 - "DriverMap.tsx"
Cohesion: 0.19
Nodes (18): DriverMap(), DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, coordinate() (+10 more)

### Community 44 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 46 - "ref_node_fs"
Cohesion: 0.13
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 47 - "update-customer-portal.sh"
Cohesion: 0.10
Nodes (19): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+11 more)

### Community 48 - "PlatformLanding.tsx"
Cohesion: 0.14
Nodes (9): metadata, RegistrationPage(), CookiePreferencesButton(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), Route(), translations (+1 more)

### Community 49 - "api-client.ts"
Cohesion: 0.17
Nodes (16): Vehicle, VehicleSelector(), VehicleSelectorProps, ApiError, apiRequest(), ApiResponse, buildApiUrl(), getLoginPath() (+8 more)

### Community 51 - "navigation-menu.tsx"
Cohesion: 0.14
Nodes (16): class-variance-authority, @radix-ui/react-navigation-menu, @radix-ui/react-toggle, @radix-ui/react-toggle-group, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList (+8 more)

### Community 52 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 53 - "DriverLayoutShell.tsx"
Cohesion: 0.18
Nodes (13): DriverLayout(), DriverInfo, DriverLayoutContent(), DriverLayoutShell(), TabItem(), VehicleData, DriverSplashScreen(), DriverSplashScreenProps (+5 more)

### Community 55 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 56 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 57 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 58 - "20261018_company_lifecycle.sql"
Cohesion: 0.17
Nodes (10): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+2 more)

### Community 59 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 60 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 61 - "next_api/contracts/route.ts"
Cohesion: 0.36
Nodes (14): PUT, DELETE, document(), failed(), GET, positiveId(), POST, PUT (+6 more)

### Community 62 - "createTripJournal"
Cohesion: 0.25
Nodes (13): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+5 more)

### Community 63 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 64 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 65 - "ActivityFilters.tsx"
Cohesion: 0.31
Nodes (10): Period, periodDates(), validDay(), validRange(), Context, useActivityFilters(), useStateValue(), ActivityFilters() (+2 more)

### Community 66 - "LanguageContext.tsx"
Cohesion: 0.24
Nodes (12): Vehicle, VehicleData, VehicleSelectionModalProps, AppLanguage, detectBrowserLanguage(), LanguageContext, LanguageContextValue, LanguageProvider() (+4 more)

### Community 67 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 68 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 69 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 70 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 71 - "HomepageAdSlotSection.tsx"
Cohesion: 0.27
Nodes (8): dompurify, dompurify, FloatingCard(), FloatingCardProps, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 72 - "ref_node_crypto"
Cohesion: 0.24
Nodes (3): dir, aad, openPushCredential()

### Community 74 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 75 - "sheet.tsx"
Cohesion: 0.24
Nodes (9): @radix-ui/react-dialog, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+1 more)

### Community 76 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 77 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 78 - "DriverGuideSection.tsx"
Cohesion: 0.27
Nodes (9): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+1 more)

### Community 79 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 80 - "ApiError"
Cohesion: 0.44
Nodes (8): ApiError, createDriverApi(), loadProfile(), ownerRead(), profile(), request(), requestOnce(), vehicles()

### Community 81 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 82 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 84 - "configure-mail.mjs"
Cohesion: 0.39
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 85 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 87 - "InvoicesFeaturePage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, InvoicesFeaturePage(), PublicStats

### Community 88 - "ReportsPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, ReportsPage()

### Community 89 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 91 - "login"
Cohesion: 0.33
Nodes (5): login(), open(), seal(), identity(), JournalCipher

### Community 92 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 93 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 94 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 95 - "brevo/route.ts"
Cohesion: 0.52
Nodes (5): POST(), runtime, brevoMailEvent(), brevoProviderId(), brevoWebhookAuthorized()

### Community 96 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 97 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 98 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 99 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 100 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 101 - "driver-app/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, strict, exclude, extends, expo/tsconfig.base

### Community 102 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 103 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 107 - "start/route.ts"
Cohesion: 0.70
Nodes (4): generateTripHash(), generateTripUuid(), getRetentionDate(), POST

### Community 108 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 109 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 110 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 113 - "user/route.ts"
Cohesion: 0.83
Nodes (3): GET, resolveDistributorInfo(), resolveEffectiveUserType()

### Community 114 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 115 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 116 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 117 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 118 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 119 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

## Knowledge Gaps
- **687 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+682 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 951 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **45 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `generateAdminUserToken()` connect `createErrorResponse` to `lib/auth.ts`, `company-changes.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _687 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07002843034565315 - nodes in this community are weakly interconnected._
- **Why does `getAuthRoles()` connect `company-changes.ts` to `api-utils.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `useTripController.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06347469220246238 - nodes in this community are weakly interconnected._
- **Should `DriverRegisterForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05031645569620253 - nodes in this community are weakly interconnected._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.07816455696202532 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 162 unresolved internal-endpoint edges and 18 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 193 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
