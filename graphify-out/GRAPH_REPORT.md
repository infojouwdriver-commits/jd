# Graph Report - JOUW DRIVER  (2026-10-19)

## Corpus Check
- 517 files · ~223,136 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2914 nodes · 9911 edges · 150 communities (107 shown, 43 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 247 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ba72676e`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- Card
- ref_react
- lib/auth.ts
- requestMiddleware
- useAuth
- usePreferences
- lucide-react
- pdf-generator.ts
- Button
- dependencies
- useTripController.ts
- cn
- api-utils.ts
- BackgroundGeolocation
- end/route.ts
- package.json
- mobile-location.ts
- session.tsx
- sidebar.tsx
- driver/taximeter/page.tsx
- driver-app/package.json
- sonner
- InvoicesFeaturePage.tsx
- _layout.tsx
- BackgroundGeolocationService.java
- preferences.tsx
- scripts
- utils.ts
- use-toast.ts
- AccountSettings.tsx
- ref_node_fs
- dependencies
- mobile/package.json
- DriverMap.tsx
- 20261018_subscription_billing.sql
- send-signature-link/route.ts
- SiteAIAgent.tsx
- api.ts
- DriverGuideSection.tsx
- 20261018_contract_billing.sql
- validateRequestBody
- company-registrations/route.ts
- form.tsx
- TripPointJournal.java
- update-customer-portal.sh
- api-client.ts
- PlatformLanding.tsx
- compilerOptions
- app/layout.tsx
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- framer-motion
- getAuthRoles
- code-map.py
- 20261018_company_lifecycle.sql
- command.tsx
- CookieBanner.tsx
- convert-database.mjs
- createTripJournal
- carousel.tsx
- apply-release.mjs
- ref_node_crypto
- Database
- push-worker.mjs
- "schema".company_registrations
- chart.tsx
- "schema".security_fleet_locations
- mapbox-route.ts
- "schema".security_save_company_account
- "schema".company_change_requests
- class-variance-authority
- secret-vault.ts
- FaqPage.tsx
- chat/route.ts
- pagination.tsx
- scripts
- 20261013_mail_delivery.sql
- navigation-menu.tsx
- drawer.tsx
- LanguageProvider
- sheet.tsx
- apiRequest
- Override
- verify-private-owner.cjs
- "schema".security_archive_company
- ReportsPage.tsx
- TripManagementPage.tsx
- [...path]/route.ts
- android.content.Intent
- createDriverApi
- definitions.d.ts
- database-readiness.mjs
- brevo/route.ts
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- driver-app/tsconfig.json
- start/route.ts
- contract-template.ts
- 20261009_security.sql
- 20261018_web_billing.sql
- ModeEnum
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
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
- `FleetLocation()` --references--> `Location`  [EXTRACTED]
  driver-app/src/FleetLocation.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `ActiveTrip()` --references--> `Alert`  [EXTRACTED]
  driver-app/src/experience/ActiveTrip.tsx → src/components/ui/alert.tsx

## Import Cycles
- 2-file cycle: `src/lib/api-utils.ts -> src/lib/create-response.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (150 total, 43 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (115): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+107 more)

### Community 1 - "Card"
Cohesion: 0.08
Nodes (81): Company, CompanyContractsPage(), Contract, Signature, Company, EditCompanyPage(), PlatformContract, PlatformContractsPage() (+73 more)

### Community 2 - "ref_react"
Cohesion: 0.06
Nodes (71): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), FailedTrip, Page() (+63 more)

### Community 3 - "lib/auth.ts"
Cohesion: 0.07
Nodes (76): bcryptjs, GET, PUT, available(), GET, POST, schema, driverLoginSchema (+68 more)

### Community 4 - "requestMiddleware"
Cohesion: 0.07
Nodes (55): zod, command, POST, filters, GET, GET, POST, GET (+47 more)

### Community 5 - "useAuth"
Cohesion: 0.04
Nodes (55): nextConfig, next, ChironSyncPage(), AdminLayout(), ContractPrintPage(), PrintableContract, DriverLoginPage(), DriverNotificationsPage() (+47 more)

### Community 6 - "usePreferences"
Cohesion: 0.17
Nodes (39): Account(), ActiveTrip(), useActivityFilters(), ActivityFilters(), AddressField(), BillingReminder(), dismissed, Home() (+31 more)

### Community 7 - "lucide-react"
Cohesion: 0.07
Nodes (57): @hookform/resolvers, lucide-react, react-hook-form, LoginPage(), CompanyLoginForm(), CompanyLoginFormData, CompanyLoginFormProps, companyLoginSchema (+49 more)

### Community 8 - "pdf-generator.ts"
Cohesion: 0.06
Nodes (45): jspdf, register(), configurePdfFonts(), chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime() (+37 more)

### Community 9 - "Button"
Cohesion: 0.10
Nodes (46): AdSlot, AdSlotsPage(), EMPTY_FORM, CompaniesPage(), CompaniesPageContent(), Company, emptyNew, AdminDriversPage() (+38 more)

### Community 10 - "dependencies"
Cohesion: 0.03
Nodes (62): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+54 more)

### Community 11 - "useTripController.ts"
Cohesion: 0.09
Nodes (42): ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), nativeJournal() (+34 more)

### Community 12 - "cn"
Cohesion: 0.06
Nodes (52): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger, AlertTitle (+44 more)

### Community 13 - "api-utils.ts"
Cohesion: 0.07
Nodes (40): GET, POST, VALID_TYPES, GET, POST, ApiParams, appendCorsHeaders(), clearCookie() (+32 more)

### Community 14 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 15 - "end/route.ts"
Cohesion: 0.12
Nodes (24): POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError (+16 more)

### Community 16 - "package.json"
Cohesion: 0.05
Nodes (40): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+32 more)

### Community 17 - "mobile-location.ts"
Cohesion: 0.08
Nodes (32): copy, DriverFleetShift(), GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation() (+24 more)

### Community 18 - "session.tsx"
Cohesion: 0.11
Nodes (27): App(), logout(), styles, createActionGate(), apiConnectionKey(), ApiError, clearReceiptCache(), Context (+19 more)

### Community 19 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 20 - "driver/taximeter/page.tsx"
Cohesion: 0.09
Nodes (32): leaflet, BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), GlassCard(), GoldButton() (+24 more)

### Community 21 - "driver-app/package.json"
Cohesion: 0.06
Nodes (34): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+26 more)

### Community 22 - "sonner"
Cohesion: 0.13
Nodes (28): sonner, ChironSettingsPage(), Company, Company, CompanySettingsPage(), AdminFleetPage(), AcceptanceTestPage(), Company (+20 more)

### Community 23 - "InvoicesFeaturePage.tsx"
Cohesion: 0.10
Nodes (25): Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps, FeaturePageLayout(), FeaturePageLayoutProps (+17 more)

### Community 24 - "_layout.tsx"
Cohesion: 0.10
Nodes (27): Period, periodDates(), validDay(), validRange(), Layout(), Navigation(), ActivityProvider(), Context (+19 more)

### Community 25 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 26 - "preferences.tsx"
Cohesion: 0.11
Nodes (20): RoadArt(), companyCopy, copy, CopyKey, Language, JourneyLoading(), JourneyMark(), WelcomeHeader() (+12 more)

### Community 27 - "scripts"
Cohesion: 0.07
Nodes (29): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+21 more)

### Community 28 - "utils.ts"
Cohesion: 0.07
Nodes (21): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, tailwind-merge (+13 more)

### Community 29 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 30 - "AccountSettings.tsx"
Cohesion: 0.13
Nodes (22): AdminAccountPage(), DriverProfileRoute(), PrivacyCenter(), AccountSettings(), labels, DriverData, DriverProfilePage(), GlassCard() (+14 more)

### Community 31 - "ref_node_fs"
Cohesion: 0.11
Nodes (14): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), compose(), directory, env, [image, revision, target] (+6 more)

### Community 32 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+19 more)

### Community 33 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 34 - "DriverMap.tsx"
Cohesion: 0.15
Nodes (22): DriverMap(), DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, search() (+14 more)

### Community 35 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 36 - "send-signature-link/route.ts"
Cohesion: 0.12
Nodes (16): resend, command, POST, sendInvoiceToClient(), POST(), runtime, contractInvitation(), events (+8 more)

### Community 37 - "SiteAIAgent.tsx"
Cohesion: 0.14
Nodes (24): apiFetch(), ApiResponse, buildApiUrl(), ChatMessage, ConversationStep, detectChangeIntent(), detectSearchIntent(), formatEntityInfo() (+16 more)

### Community 38 - "api.ts"
Cohesion: 0.11
Nodes (20): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, API_ORIGIN, driverApi, DriverDetails, DriverMessage (+12 more)

### Community 39 - "DriverGuideSection.tsx"
Cohesion: 0.12
Nodes (19): dompurify, dompurify, DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep (+11 more)

### Community 40 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 41 - "validateRequestBody"
Cohesion: 0.21
Nodes (15): POST, POST, PUT, GET, POST, GET, POST, POST (+7 more)

### Community 42 - "company-registrations/route.ts"
Cohesion: 0.23
Nodes (19): POST, PUT, review, DELETE, document(), failed(), GET, positiveId() (+11 more)

### Community 43 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 46 - "update-customer-portal.sh"
Cohesion: 0.10
Nodes (18): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, FLEET_MIGRATION, LIFECYCLE_MIGRATION (+10 more)

### Community 47 - "api-client.ts"
Cohesion: 0.11
Nodes (15): glassCard, labelStyle, platformLogos, Summary, TranslationKeys, translations, Trip, Vehicle (+7 more)

### Community 48 - "PlatformLanding.tsx"
Cohesion: 0.15
Nodes (8): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), Route(), translations, registrationCopy

### Community 49 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 50 - "app/layout.tsx"
Cohesion: 0.16
Nodes (13): next-themes, dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider(), GlobalClientEffects() (+5 more)

### Community 52 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 53 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 54 - "framer-motion"
Cohesion: 0.15
Nodes (9): framer-motion, AnimatedLogo(), AnimatedLogoProps, LandingNav(), LandingNavProps, LANG_OPTIONS, LanguageSwitcher(), ParallaxSectionProps (+1 more)

### Community 55 - "getAuthRoles"
Cohesion: 0.23
Nodes (13): GET, resolveDistributorInfo(), resolveEffectiveUserType(), POST, PUT, GET, normalizeUrlPreview(), getAuthRoles() (+5 more)

### Community 56 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 57 - "20261018_company_lifecycle.sql"
Cohesion: 0.17
Nodes (10): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+2 more)

### Community 58 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 59 - "CookieBanner.tsx"
Cohesion: 0.21
Nodes (13): @radix-ui/react-switch, CookieBanner(), CookieCategory, DEFAULT_CATEGORIES, T, Switch, COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION (+5 more)

### Community 60 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 61 - "createTripJournal"
Cohesion: 0.25
Nodes (13): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+5 more)

### Community 62 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 63 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 64 - "ref_node_crypto"
Cohesion: 0.19
Nodes (6): createEnrollmentHandler(), escapeHtml(), totp(), dir, aad, openPushCredential()

### Community 65 - "Database"
Cohesion: 0.16
Nodes (7): login(), createSqlTripStore(), open(), seal(), Database, identity(), JournalCipher

### Community 66 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 67 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 68 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 69 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 70 - "mapbox-route.ts"
Cohesion: 0.24
Nodes (10): RouteCoords, TripData, RouteMapProps, Coordinate, DrivingRoute, fetchDrivingRoute(), getDrivingRoute(), inFlight (+2 more)

### Community 72 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 73 - "class-variance-authority"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 74 - "secret-vault.ts"
Cohesion: 0.24
Nodes (8): jose, apply, headers, url, close(), decryptSecret(), encryptSecret(), key()

### Community 75 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 76 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 77 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 78 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 79 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 80 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 81 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 82 - "LanguageProvider"
Cohesion: 0.31
Nodes (8): DriverLayout(), DriverLayoutShell(), detectBrowserLanguage(), LanguageProvider(), normalizeLanguage(), readCookieLanguage(), setDocumentDirection(), setLanguageCookie()

### Community 83 - "sheet.tsx"
Cohesion: 0.28
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 84 - "apiRequest"
Cohesion: 0.33
Nodes (8): apiRequest(), buildApiUrl(), getLoginPath(), parseApiResponse(), redirectToLogin(), refreshToken(), connectionFailure, connectionMessage()

### Community 86 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 88 - "ReportsPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, ReportsPage()

### Community 89 - "TripManagementPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, TripManagementPage()

### Community 90 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 92 - "createDriverApi"
Cohesion: 0.57
Nodes (7): createDriverApi(), loadProfile(), ownerRead(), profile(), request(), requestOnce(), vehicles()

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

### Community 102 - "start/route.ts"
Cohesion: 0.53
Nodes (4): generateTripHash(), generateTripUuid(), getRetentionDate(), POST

### Community 103 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 106 - "ModeEnum"
Cohesion: 0.40
Nodes (5): ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET

### Community 107 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 108 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 111 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 112 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 113 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 114 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 115 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 116 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

### Community 126 - "PortalEnum"
Cohesion: 0.67
Nodes (3): PortalEnum, ADMIN, COMPANY

## Knowledge Gaps
- **685 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+680 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 944 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **43 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `generateAdminUserToken()` connect `createErrorResponse` to `lib/auth.ts`, `getAuthRoles`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _685 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.06879098944967209 - nodes in this community are weakly interconnected._
- **Why does `requestMiddleware()` connect `requestMiddleware` to `createErrorResponse`, `company-registrations/route.ts`, `lib/auth.ts`, `api-utils.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `Card` be split into smaller, more focused modules?**
  _Cohesion score 0.08082381446867429 - nodes in this community are weakly interconnected._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.06136483865279492 - nodes in this community are weakly interconnected._
- **Should `lib/auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06613861386138614 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 162 unresolved internal-endpoint edges and 18 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 193 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
