# Graph Report - JOUW DRIVER  (2026-10-19)

## Corpus Check
- 526 files · ~226,991 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2971 nodes · 10070 edges · 154 communities (110 shown, 44 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 247 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b863a459`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- lucide-react
- requestMiddleware
- Input
- SelectContent
- Button
- DriverRegisterForm.tsx
- useTripController.ts
- lib/auth.ts
- usePreferences
- dependencies
- api-utils.ts
- cn
- BackgroundGeolocation
- end/route.ts
- package.json
- GdprAdminClient.tsx
- CookieBanner.tsx
- sidebar.tsx
- ref_react
- driver-app/package.json
- session.tsx
- _layout.tsx
- api-client.ts
- BackgroundGeolocationService.java
- mobile-location.ts
- subscription-billing.ts
- utils.ts
- use-toast.ts
- preferences.tsx
- dependencies
- mobile/package.json
- api.ts
- 20261018_subscription_billing.sql
- driver/taximeter/page.tsx
- native-journal.ts
- 20261018_company_lifecycle.sql
- 20261018_contract_billing.sql
- DriverGdprSection.tsx
- update-customer-portal.sh
- form.tsx
- TripPointJournal.java
- ref_node_fs
- companies/route.ts
- PlatformLanding.tsx
- compilerOptions
- SiteAIAgent
- generateAcceptanceReportPdf
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- createTripJournal
- code-map.py
- scripts
- command.tsx
- convert-database.mjs
- RouteMap.tsx
- next_api/contracts/route.ts
- 20261019_driver_shifts.sql
- carousel.tsx
- apply-release.mjs
- vervoerbewijs.ts
- devDependencies
- push-worker.mjs
- mail-service.ts
- PDFGenerator
- "schema".company_registrations
- chart.tsx
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- HomepageAdSlotSection.tsx
- pdf-generator.ts
- next_api/drivers/route.ts
- ref_node_crypto
- "schema".security_save_company_account
- "schema".company_change_requests
- class-variance-authority
- mail-policy.ts
- FaqPage.tsx
- chat/route.ts
- DriverGuideSection.tsx
- pagination.tsx
- subscription-scheduler.ts
- scripts
- 20261013_mail_delivery.sql
- navigation-menu.tsx
- drawer.tsx
- sheet.tsx
- apiRequest
- Override
- configure-mail.mjs
- verify-private-owner.cjs
- [...path]/route.ts
- android.content.Intent
- native-addresses.ts
- LiveMap.tsx
- 20261019_email_identity.sql
- definitions.d.ts
- database-readiness.mjs
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
- scroll-area.tsx
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
- `search()` --indirect_call--> `value()`  [INFERRED]
  driver-app/src/experience/AddressField.tsx → scripts/convert-database.mjs
- `locate()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `FleetLocation()` --references--> `Location`  [EXTRACTED]
  driver-app/src/FleetLocation.tsx → mobile/plugins/background-geolocation/definitions.d.ts
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

## Communities (154 total, 44 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (116): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+108 more)

### Community 1 - "lucide-react"
Cohesion: 0.04
Nodes (87): nextConfig, framer-motion, lucide-react, next, AdminLayout(), DriverLoginPage(), DriverNotificationsPage(), glassCard (+79 more)

### Community 2 - "requestMiddleware"
Cohesion: 0.06
Nodes (71): zod, available(), GET, POST, schema, POST, schema, POST (+63 more)

### Community 3 - "Input"
Cohesion: 0.09
Nodes (77): AdSlot, AdSlotsPage(), EMPTY_FORM, CompanyContractsPage(), CompaniesPage(), CompaniesPageContent(), Company, emptyNew (+69 more)

### Community 4 - "SelectContent"
Cohesion: 0.06
Nodes (66): Page(), Page(), AdminTripsPage(), Trip, CompanyDashboardPage(), glassCard, Message, Reply (+58 more)

### Community 5 - "Button"
Cohesion: 0.09
Nodes (60): sonner, AdminAccountPage(), ChironSyncPage(), FailedTrip, ChironSettingsPage(), Company, Company, EditCompanyPage() (+52 more)

### Community 6 - "DriverRegisterForm.tsx"
Cohesion: 0.05
Nodes (69): @hookform/resolvers, react-hook-form, dynamic, LoginPage(), CompanyLoginForm(), DriverRegisterForm(), DriverRegisterFormProps, FormField() (+61 more)

### Community 7 - "useTripController.ts"
Cohesion: 0.07
Nodes (55): ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), DriverMap() (+47 more)

### Community 8 - "lib/auth.ts"
Cohesion: 0.09
Nodes (56): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+48 more)

### Community 9 - "usePreferences"
Cohesion: 0.17
Nodes (39): Account(), ActiveTrip(), useActivityFilters(), ActivityFilters(), AddressField(), BillingReminder(), dismissed, Home() (+31 more)

### Community 10 - "dependencies"
Cohesion: 0.03
Nodes (62): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+54 more)

### Community 11 - "api-utils.ts"
Cohesion: 0.06
Nodes (47): POST, VALID_TYPES, generateTripHash(), generateTripUuid(), getRetentionDate(), POST, AUTH_ENABLED, authConfig (+39 more)

### Community 12 - "cn"
Cohesion: 0.06
Nodes (51): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+43 more)

### Community 13 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 14 - "end/route.ts"
Cohesion: 0.11
Nodes (24): POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError (+16 more)

### Community 15 - "package.json"
Cohesion: 0.04
Nodes (42): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+34 more)

### Community 16 - "GdprAdminClient.tsx"
Cohesion: 0.09
Nodes (36): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), GdprAdminPage(), metadata (+28 more)

### Community 17 - "CookieBanner.tsx"
Cohesion: 0.07
Nodes (34): next-themes, @radix-ui/react-switch, DriverLayout(), dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh() (+26 more)

### Community 18 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 19 - "ref_react"
Cohesion: 0.07
Nodes (22): Company, Contract, Signature, ContractPrintPage(), PrintableContract, ContractData, SignatureInfo, SignContractPage() (+14 more)

### Community 20 - "driver-app/package.json"
Cohesion: 0.06
Nodes (36): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+28 more)

### Community 21 - "session.tsx"
Cohesion: 0.12
Nodes (26): App(), logout(), styles, createActionGate(), apiConnectionKey(), driverApi, clearReceiptCache(), Context (+18 more)

### Community 22 - "_layout.tsx"
Cohesion: 0.09
Nodes (29): Period, periodDates(), validDay(), validRange(), Layout(), Navigation(), ActivityProvider(), Context (+21 more)

### Community 23 - "api-client.ts"
Cohesion: 0.09
Nodes (22): ShiftPage(), DriverShifts(), statuses, shiftCopy, directoryCopy, CompanyOption, DirectoryKind, DirectoryResult (+14 more)

### Community 24 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 25 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 26 - "subscription-billing.ts"
Cohesion: 0.13
Nodes (19): changeFingerprint(), submitCompanyChange(), command, staffGET, staffPOST, sections, workspaceGET, command (+11 more)

### Community 27 - "utils.ts"
Cohesion: 0.07
Nodes (21): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-slider, react-day-picker, react-resizable-panels, tailwind-merge (+13 more)

### Community 28 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 29 - "preferences.tsx"
Cohesion: 0.12
Nodes (18): RoadArt(), companyCopy, copy, CopyKey, Language, JourneyLoading(), JourneyMark(), WelcomeHeader() (+10 more)

### Community 30 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+19 more)

### Community 31 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 32 - "api.ts"
Cohesion: 0.11
Nodes (23): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, API_ORIGIN, ApiError, createDriverApi(), loadProfile() (+15 more)

### Community 33 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 34 - "driver/taximeter/page.tsx"
Cohesion: 0.13
Nodes (23): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), GlassCard(), GoldButton(), LocationPoint (+15 more)

### Community 35 - "native-journal.ts"
Cohesion: 0.13
Nodes (13): login(), journalBytes(), assertNativeCryptoReady(), keys, nativeJournal(), createSqlTripStore(), open(), seal() (+5 more)

### Community 36 - "20261018_company_lifecycle.sql"
Cohesion: 0.12
Nodes (12): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+4 more)

### Community 37 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 38 - "DriverGdprSection.tsx"
Cohesion: 0.15
Nodes (18): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+10 more)

### Community 39 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (20): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+12 more)

### Community 40 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 42 - "ref_node_fs"
Cohesion: 0.13
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 44 - "companies/route.ts"
Cohesion: 0.21
Nodes (13): POST, POST, PUT, POST, GET, POST, POST, credentials (+5 more)

### Community 45 - "PlatformLanding.tsx"
Cohesion: 0.15
Nodes (8): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), Route(), translations, registrationCopy

### Community 46 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 47 - "SiteAIAgent"
Cohesion: 0.19
Nodes (18): apiFetch(), buildApiUrl(), detectChangeIntent(), detectSearchIntent(), formatEntityInfo(), generateId(), SiteAIAgent(), addAssistantMessage() (+10 more)

### Community 48 - "generateAcceptanceReportPdf"
Cohesion: 0.24
Nodes (15): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+7 more)

### Community 50 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 51 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 52 - "createTripJournal"
Cohesion: 0.24
Nodes (14): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+6 more)

### Community 53 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 54 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 55 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 56 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 57 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 58 - "next_api/contracts/route.ts"
Cohesion: 0.36
Nodes (14): PUT, DELETE, document(), failed(), GET, positiveId(), POST, PUT (+6 more)

### Community 59 - "20261019_driver_shifts.sql"
Cohesion: 0.23
Nodes (10): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_immutable_shift_event() (+2 more)

### Community 60 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 61 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 62 - "vervoerbewijs.ts"
Cohesion: 0.20
Nodes (12): chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs(), VervoerbewijsChiron, VervoerbewijsCompany (+4 more)

### Community 63 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+5 more)

### Community 64 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 65 - "mail-service.ts"
Cohesion: 0.28
Nodes (10): POST(), runtime, brevoIdempotencyKey(), brevoMailEvent(), brevoProviderId(), brevoWebhookAuthorized(), mailEventKey(), MailMessage (+2 more)

### Community 67 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 68 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 69 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 70 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 71 - "HomepageAdSlotSection.tsx"
Cohesion: 0.27
Nodes (8): dompurify, dompurify, FloatingCard(), FloatingCardProps, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 72 - "pdf-generator.ts"
Cohesion: 0.22
Nodes (9): jspdf, configurePdfFonts(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, TestResult, TripInvoiceData (+1 more)

### Community 73 - "next_api/drivers/route.ts"
Cohesion: 0.40
Nodes (9): DELETE, GET, POST, PUT, driverFieldsSchema, driverValidationError(), mutateDriverAccount(), optionalText (+1 more)

### Community 74 - "ref_node_crypto"
Cohesion: 0.24
Nodes (3): dir, aad, openPushCredential()

### Community 76 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 77 - "class-variance-authority"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 78 - "mail-policy.ts"
Cohesion: 0.24
Nodes (7): resend, POST(), runtime, events, MAIL_FREE_LIMITS, mailEvent(), MailStatus

### Community 79 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 80 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 81 - "DriverGuideSection.tsx"
Cohesion: 0.27
Nodes (9): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+1 more)

### Community 82 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 83 - "subscription-scheduler.ts"
Cohesion: 0.40
Nodes (7): register(), euro(), SubscriptionDocument, subscriptionPdf(), escape(), startSubscriptionScheduler(), subscriptionTick()

### Community 84 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 85 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 86 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 87 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 88 - "sheet.tsx"
Cohesion: 0.28
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 89 - "apiRequest"
Cohesion: 0.33
Nodes (8): apiRequest(), buildApiUrl(), getLoginPath(), parseApiResponse(), redirectToLogin(), refreshToken(), connectionFailure, connectionMessage()

### Community 91 - "configure-mail.mjs"
Cohesion: 0.39
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 92 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 93 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 95 - "native-addresses.ts"
Cohesion: 0.48
Nodes (6): search(), coordinate(), createAddressSearch(), freshSearchPoint(), parseBelgianAddresses(), searchBelgianAddresses

### Community 96 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 97 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 98 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 99 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

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

### Community 107 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 110 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 111 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 114 - "scroll-area.tsx"
Cohesion: 0.67
Nodes (3): @radix-ui/react-scroll-area, ScrollArea, ScrollBar

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
- **691 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+686 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 960 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DriverDashboard()` connect `Button` to `GdprAdminClient.tsx`, `Input`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _691 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07023793520634494 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.036585365853658534 - nodes in this community are weakly interconnected._
- **Should `requestMiddleware` be split into smaller, more focused modules?**
  _Cohesion score 0.055713094245204334 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.08905899925317401 - nodes in this community are weakly interconnected._
- **Should `SelectContent` be split into smaller, more focused modules?**
  _Cohesion score 0.055991041433370664 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 162 unresolved internal-endpoint edges and 18 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 199 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
