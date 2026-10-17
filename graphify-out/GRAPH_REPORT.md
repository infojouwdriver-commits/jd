# Graph Report - JOUW DRIVER  (2026-10-18)

## Corpus Check
- 458 files · ~200,755 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2627 nodes · 8960 edges · 146 communities (111 shown, 35 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 266 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9e0d08d6`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- api-utils.ts
- authCrudOperations
- next
- useAuth
- dependencies
- Input
- ref_react
- cn
- admin/messages/page.tsx
- pdf-generator.ts
- validateRequestBody
- BackgroundGeolocation
- Label
- package.json
- InvoicesFeaturePage.tsx
- sidebar.tsx
- ChironError
- framer-motion
- BackgroundGeolocationService.java
- mobile-location.ts
- CookieBanner.tsx
- App.tsx
- driver-app/package.json
- utils.ts
- useTripController.ts
- ui.tsx
- use-toast.ts
- native-journal.ts
- dependencies
- _layout.tsx
- mobile/package.json
- driver/taximeter/page.tsx
- SiteAIAgent.tsx
- DriverRegisterForm.tsx
- TripPanel.tsx
- form.tsx
- TripPointJournal.java
- ref_node_fs
- DriverMap.tsx
- PlatformLanding.tsx
- contracts/route.ts
- compilerOptions
- api.ts
- Trips.tsx
- getAuthRoles
- BackgroundGeolocation
- 20261016_native_push.sql
- createTripJournal
- code-map.py
- usePreferences
- scripts
- LoginForm.tsx
- mail-service.ts
- convert-database.mjs
- useLanguage
- RouteMap.tsx
- security-policy.ts
- RegisterForm.tsx
- ActivityFilters.tsx
- carousel.tsx
- apply-release.mjs
- hashString
- ref_node_crypto
- LoginPageClient.tsx
- api-client.ts
- devDependencies
- push-worker.mjs
- update-customer-portal.sh
- "schema".company_registrations
- command.tsx
- chart.tsx
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- HomepageAdSlotSection.tsx
- driver/notifications/page.tsx
- DriverProfilePage.tsx
- "schema".security_save_company_account
- class-variance-authority
- transformSecrets
- FaqPage.tsx
- chat/route.ts
- DriverGuideSection.tsx
- pagination.tsx
- scripts
- createTripEngine
- 20261013_mail_delivery.sql
- navigation-menu.tsx
- drawer.tsx
- sheet.tsx
- LanguageContext.tsx
- Override
- verify-private-owner.cjs
- [...path]/route.ts
- android.content.Intent
- LiveMap.tsx
- definitions.d.ts
- database-readiness.mjs
- TeamManagementPage.tsx
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- driver-app/tsconfig.json
- admin-enrollment.mjs
- 20261009_security.sql
- start/route.ts
- ModeEnum
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- invoices/send/route.ts
- view/route.ts
- websocket/route.ts
- ModeEnum
- backup.sh
- public.security_enroll_initial_owner
- 20261010_admin_mfa.sql
- trips_user_completion_request_idx
- "schema".security_create_trip_invoice
- preflight.mjs
- global-error.tsx
- privacy-policy/page.tsx
- PortalEnum
- backup-foundation.sh
- import-private-archive.sh
- Package.swift

## God Nodes (most connected - your core abstractions)
1. `createErrorResponse()` - 238 edges
2. `CrudOperations` - 237 edges
3. `createSuccessResponse()` - 234 edges
4. `cn()` - 230 edges
5. `generateAdminUserToken()` - 222 edges
6. `validateRequestBody()` - 139 edges
7. `Button` - 120 edges
8. `requestMiddleware()` - 104 edges
9. `parseQueryParams()` - 99 edges
10. `lucide-react` - 98 edges

## Surprising Connections (you probably didn't know these)
- `search()` --indirect_call--> `value()`  [INFERRED]
  driver-app/src/experience/AddressField.tsx → scripts/convert-database.mjs
- `DriverMapView()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `locate()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `FleetLocation()` --references--> `Location`  [EXTRACTED]
  driver-app/src/FleetLocation.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `ActiveTrip()` --references--> `Alert`  [EXTRACTED]
  driver-app/src/experience/ActiveTrip.tsx → src/components/ui/alert.tsx

## Import Cycles
- 2-file cycle: `src/lib/api-utils.ts -> src/lib/create-response.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (146 total, 35 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.08
Nodes (123): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+115 more)

### Community 1 - "api-utils.ts"
Cohesion: 0.07
Nodes (37): bcryptjs, sendContractEmail(), registrationSchema, GET, GET, POST, AuthContextType, AUTH_ENABLED (+29 more)

### Community 2 - "authCrudOperations"
Cohesion: 0.08
Nodes (61): zod, GET, PUT, available(), GET, POST, schema, driverLoginSchema (+53 more)

### Community 3 - "next"
Cohesion: 0.07
Nodes (58): nextConfig, next, sonner, Company, EditCompanyPage(), Company, Distributor, DistributorsPage() (+50 more)

### Community 4 - "useAuth"
Cohesion: 0.10
Nodes (50): AdminAccountPage(), ChironSyncPage(), FailedTrip, ChironSettingsPage(), Company, Company, CompanySettingsPage(), AdminFleetPage() (+42 more)

### Community 5 - "dependencies"
Cohesion: 0.03
Nodes (62): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+54 more)

### Community 6 - "Input"
Cohesion: 0.11
Nodes (43): Company, CompanyContractsPage(), Contract, Signature, PlatformContract, PlatformContractsPage(), AdminTripsPage(), Trip (+35 more)

### Community 7 - "ref_react"
Cohesion: 0.07
Nodes (35): lucide-react, ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), Company (+27 more)

### Community 8 - "cn"
Cohesion: 0.06
Nodes (51): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+43 more)

### Community 9 - "admin/messages/page.tsx"
Cohesion: 0.12
Nodes (44): AdSlot, AdSlotsPage(), EMPTY_FORM, CompaniesPage(), Company, emptyNew, AdminDriversPage(), Company (+36 more)

### Community 10 - "pdf-generator.ts"
Cohesion: 0.07
Nodes (38): jspdf, configurePdfFonts(), chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs() (+30 more)

### Community 11 - "validateRequestBody"
Cohesion: 0.09
Nodes (36): POST, POST, PUT, GET, POST, PUT, review, actorId() (+28 more)

### Community 12 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 13 - "Label"
Cohesion: 0.21
Nodes (25): AccountInfo, Account(), ActiveTrip(), Home(), useInbox(), Messages(), Notifications(), Breakdown() (+17 more)

### Community 14 - "package.json"
Cohesion: 0.05
Nodes (40): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+32 more)

### Community 15 - "InvoicesFeaturePage.tsx"
Cohesion: 0.08
Nodes (32): Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps, FeaturePageLayout() (+24 more)

### Community 16 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 17 - "ChironError"
Cohesion: 0.13
Nodes (19): POST, canonicalChironEnvironment(), chironDestination(), ChironError, numeric(), rideMessage(), timestamp(), retryChironTrip() (+11 more)

### Community 18 - "framer-motion"
Cohesion: 0.08
Nodes (21): framer-motion, DriverLayout(), DriverInfo, DriverLayoutContent(), DriverLayoutShell(), TabItem(), VehicleData, DriverSplashScreen() (+13 more)

### Community 19 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 20 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 21 - "CookieBanner.tsx"
Cohesion: 0.10
Nodes (24): next-themes, dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider(), CookieBanner() (+16 more)

### Community 22 - "App.tsx"
Cohesion: 0.11
Nodes (21): App(), logout(), styles, ActionGate, createActionGate(), DriverProfile, DriverTripSummary, clearReceiptCache() (+13 more)

### Community 23 - "driver-app/package.json"
Cohesion: 0.07
Nodes (29): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+21 more)

### Community 24 - "utils.ts"
Cohesion: 0.07
Nodes (21): clsx, @radix-ui/react-checkbox, @radix-ui/react-hover-card, @radix-ui/react-popover, @radix-ui/react-progress, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker (+13 more)

### Community 25 - "useTripController.ts"
Cohesion: 0.16
Nodes (24): enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), locate(), nativeEngine(), tripDurationSeconds(), TripSyncReceipt, messages (+16 more)

### Community 26 - "ui.tsx"
Cohesion: 0.15
Nodes (18): RoadArt(), copy, CopyKey, Language, Entrance(), useRouteMotion(), NavigationRoute, portalCopy (+10 more)

### Community 27 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 28 - "native-journal.ts"
Cohesion: 0.13
Nodes (14): login(), journalBytes(), assertNativeCryptoReady(), keys, nativeJournal(), engines, createSqlTripStore(), open() (+6 more)

### Community 29 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+19 more)

### Community 30 - "_layout.tsx"
Cohesion: 0.11
Nodes (22): driverApi, DriverMessage, Layout(), Navigation(), ActivityProvider(), Context, InboxProvider(), useInboxState() (+14 more)

### Community 31 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 32 - "driver/taximeter/page.tsx"
Cohesion: 0.13
Nodes (23): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), GlassCard(), GoldButton(), LocationPoint (+15 more)

### Community 33 - "SiteAIAgent.tsx"
Cohesion: 0.14
Nodes (24): apiFetch(), ApiResponse, buildApiUrl(), ChatMessage, ConversationStep, detectChangeIntent(), detectSearchIntent(), formatEntityInfo() (+16 more)

### Community 34 - "DriverRegisterForm.tsx"
Cohesion: 0.11
Nodes (23): DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data, step1Schema, Step2Data, step2Schema (+15 more)

### Community 35 - "TripPanel.tsx"
Cohesion: 0.20
Nodes (16): DriverVehicle, Context, FleetLocation(), owners, publishFleetPoint(), resumeFleetPublishing(), State, NativeTrip (+8 more)

### Community 36 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 38 - "ref_node_fs"
Cohesion: 0.13
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 39 - "DriverMap.tsx"
Cohesion: 0.20
Nodes (17): DriverMap(), DriverMapProps, DriverMapView(), calculateRoute(), navigate(), token, coordinate(), createAddressSearch() (+9 more)

### Community 41 - "PlatformLanding.tsx"
Cohesion: 0.15
Nodes (8): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), Route(), translations, registrationCopy

### Community 42 - "contracts/route.ts"
Cohesion: 0.25
Nodes (15): document(), failed(), GET, positiveId(), POST, PUT, CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR (+7 more)

### Community 43 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 44 - "api.ts"
Cohesion: 0.17
Nodes (16): ActivityPage, ActivityQuery, ActivityTrip, API_ORIGIN, ApiError, createDriverApi(), loadProfile(), ownerRead() (+8 more)

### Community 45 - "Trips.tsx"
Cohesion: 0.19
Nodes (11): invoice(), directory(), shareReceipt(), useReportFormat(), Trips(), invoice(), RouteStops(), reportErrorKey() (+3 more)

### Community 46 - "getAuthRoles"
Cohesion: 0.20
Nodes (16): GET, resolveDistributorInfo(), resolveEffectiveUserType(), GET, normalizeUrlPreview(), getConfiguredHostnames(), getConfiguredOrigins(), getHostname() (+8 more)

### Community 48 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 49 - "createTripJournal"
Cohesion: 0.24
Nodes (14): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+6 more)

### Community 50 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 51 - "usePreferences"
Cohesion: 0.28
Nodes (14): AddressField(), search(), JourneyLoading(), JourneyMark(), WelcomeHeader(), usePreferences(), Context, Login() (+6 more)

### Community 52 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 53 - "LoginForm.tsx"
Cohesion: 0.17
Nodes (12): @hookform/resolvers, react-hook-form, CompanyLoginFormData, CompanyLoginFormProps, companyLoginSchema, GoogleLoginButton(), LoginFormData, LoginFormProps (+4 more)

### Community 54 - "mail-service.ts"
Cohesion: 0.17
Nodes (12): resend, POST(), runtime, events, MAIL_FREE_LIMITS, mailConfiguration(), mailEvent(), mailEventKey() (+4 more)

### Community 55 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 56 - "useLanguage"
Cohesion: 0.23
Nodes (12): DriverLoginPage(), DriverGoogleLoginButton(), DriverLoginClient(), DriverLoginContent(), LanguageToggle(), AnimatedLogo(), AnimatedLogoProps, LandingNav() (+4 more)

### Community 57 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 58 - "security-policy.ts"
Cohesion: 0.21
Nodes (11): POST, VALID_TYPES, authorizeEndpoint(), calendarMonthDeadline(), memberEndpoint(), originAllowed(), ownsRecord(), stripSecrets() (+3 more)

### Community 59 - "RegisterForm.tsx"
Cohesion: 0.16
Nodes (13): CredentialsFormData, credentialsSchema, RegisterFormProps, VerificationFormData, verificationSchema, EmailFormData, emailSchema, ResetPasswordFormData (+5 more)

### Community 60 - "ActivityFilters.tsx"
Cohesion: 0.29
Nodes (11): Period, periodDates(), validDay(), validRange(), Context, useActivityFilters(), useStateValue(), ActivityFilters() (+3 more)

### Community 61 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 62 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 63 - "hashString"
Cohesion: 0.38
Nodes (12): DELETE, getManagerCompanyId(), POST, PUT, POST, PUT, driverFieldsSchema, driverValidationError() (+4 more)

### Community 64 - "ref_node_crypto"
Cohesion: 0.19
Nodes (6): dir, aad, openPushCredential(), decodeTotpSecret(), matchingTotpStep(), totpAt()

### Community 65 - "LoginPageClient.tsx"
Cohesion: 0.32
Nodes (11): LoginPage(), CompanyLoginForm(), LoginForm(), LoginPageClient(), LoginPageContent(), RegisterForm(), ResetPasswordForm(), LoginModal() (+3 more)

### Community 66 - "api-client.ts"
Cohesion: 0.25
Nodes (11): ApiError, apiRequest(), ApiResponse, buildApiUrl(), getLoginPath(), getServerApiBaseUrl(), normalizeBaseUrl(), parseApiResponse() (+3 more)

### Community 67 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+5 more)

### Community 68 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 69 - "update-customer-portal.sh"
Cohesion: 0.17
Nodes (10): CUSTOMER_IMAGE, CUSTOMER_REVISION, FLEET_MIGRATION, MAIL_MIGRATION, PORTAL_MIGRATION, PRICING_MIGRATION, PUSH_MIGRATION, REGISTRATION_MIGRATION (+2 more)

### Community 70 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 71 - "command.tsx"
Cohesion: 0.18
Nodes (11): cmdk, @radix-ui/react-dialog, Command, CommandDialog(), CommandEmpty, CommandGroup, CommandInput, CommandItem (+3 more)

### Community 72 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 73 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 74 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 75 - "HomepageAdSlotSection.tsx"
Cohesion: 0.27
Nodes (8): dompurify, dompurify, FloatingCard(), FloatingCardProps, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 76 - "driver/notifications/page.tsx"
Cohesion: 0.25
Nodes (9): DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), ar, driverTranslations, fr (+1 more)

### Community 77 - "DriverProfilePage.tsx"
Cohesion: 0.31
Nodes (9): DriverProfileRoute(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge(), VehicleCard() (+1 more)

### Community 79 - "class-variance-authority"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 80 - "transformSecrets"
Cohesion: 0.31
Nodes (8): jose, apply, headers, url, decryptSecret(), encryptSecret(), key(), transformSecrets()

### Community 81 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 82 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 83 - "DriverGuideSection.tsx"
Cohesion: 0.27
Nodes (9): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+1 more)

### Community 84 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 85 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 86 - "createTripEngine"
Cohesion: 0.31
Nodes (3): address(), createTripEngine(), TripStore

### Community 87 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 88 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 89 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 90 - "sheet.tsx"
Cohesion: 0.28
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 91 - "LanguageContext.tsx"
Cohesion: 0.42
Nodes (8): detectBrowserLanguage(), LanguageContext, LanguageContextValue, LanguageProvider(), normalizeLanguage(), readCookieLanguage(), setDocumentDirection(), setLanguageCookie()

### Community 93 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 94 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 96 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 97 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 98 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 99 - "TeamManagementPage.tsx"
Cohesion: 0.38
Nodes (5): Page(), contentFr, contentNl, icons, TeamManagementPage()

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

### Community 106 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 108 - "start/route.ts"
Cohesion: 0.70
Nodes (4): generateTripHash(), generateTripUuid(), getRetentionDate(), POST

### Community 109 - "ModeEnum"
Cohesion: 0.40
Nodes (5): ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET

### Community 110 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 111 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 112 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 114 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 115 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 116 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 117 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

### Community 126 - "PortalEnum"
Cohesion: 0.67
Nodes (3): PortalEnum, ADMIN, COMPANY

## Knowledge Gaps
- **646 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+641 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 852 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `generateAdminUserToken()` connect `createErrorResponse` to `authCrudOperations`, `getAuthRoles`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _646 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07739463601532567 - nodes in this community are weakly interconnected._
- **Should `api-utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06794783802333562 - nodes in this community are weakly interconnected._
- **Should `authCrudOperations` be split into smaller, more focused modules?**
  _Cohesion score 0.08225108225108226 - nodes in this community are weakly interconnected._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.06702702702702702 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.10316066725197541 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 144 unresolved internal-endpoint edges and 17 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 137 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
