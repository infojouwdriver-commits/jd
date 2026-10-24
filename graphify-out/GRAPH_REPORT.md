# Graph Report - JOUW DRIVER  (2026-10-24)

## Corpus Check
- 566 files · ~240,765 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3201 nodes · 10852 edges · 159 communities (112 shown, 47 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 243 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `78fb9e6d`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- ref_react
- api-utils.ts
- Input
- createPostgrestClient
- Button
- usePreferences
- DriverRegisterForm.tsx
- admin/messages/page.tsx
- CompanyDashboard.tsx
- authCrudOperations
- zod
- dependencies
- useTripController.ts
- cn
- api.ts
- InvoicesFeaturePage.tsx
- preferences.tsx
- BackgroundGeolocation
- package.json
- session.tsx
- end/route.ts
- sidebar.tsx
- _layout.tsx
- driver/taximeter/page.tsx
- DriverShifts.tsx
- api-client.ts
- driver-app/package.json
- BackgroundGeolocationService.java
- mobile-location.ts
- utils.ts
- use-toast.ts
- dependencies
- mobile/package.json
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- ref_node_fs
- DriverMap.tsx
- command.tsx
- convert-database.mjs
- PlatformLanding.tsx
- SiteAIAgent.tsx
- native-journal.ts
- 20261018_company_lifecycle.sql
- 20261019_shift_activity.sql
- 20261018_contract_billing.sql
- update-customer-portal.sh
- pdf-generator.ts
- form.tsx
- TripPointJournal.java
- compilerOptions
- ref_node_crypto
- app/layout.tsx
- next_api/drivers/route.ts
- generateAcceptanceReportPdf
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- code-map.py
- welcome-config.ts
- scripts
- RouteMap.tsx
- next_api/contracts/route.ts
- createTripJournal
- 20261019_driver_shifts.sql
- carousel.tsx
- devDependencies
- vervoerbewijs.ts
- driverShiftPdf
- "schema".company_registrations
- chart.tsx
- [token]/route.ts
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- HomepageAdSlotSection.tsx
- subscription-scheduler.ts
- "schema".security_save_company_account
- "schema".company_change_requests
- FaqPage.tsx
- chat/route.ts
- DriverGuideSection.tsx
- pagination.tsx
- recover-db-log.mjs
- scripts
- 20261013_mail_delivery.sql
- navigation-menu.tsx
- drawer.tsx
- LanguageProvider
- Override
- configure-mail.mjs
- verify-private-owner.cjs
- [...path]/route.ts
- android.content.Intent
- configure-native-push.mjs
- driver-app/tsconfig.json
- 20261019_email_identity.sql
- definitions.d.ts
- database-readiness.mjs
- brevo/route.ts
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- start/route.ts
- contract-template.ts
- admin-enrollment.mjs
- devDependencies
- 20261009_security.sql
- 20261018_web_billing.sql
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
- 20261023_app_experience.sql
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
- acceptance-test/route.ts
- privacy-policy/page.tsx
- backup-foundation.sh
- import-private-archive.sh
- Package.swift

## God Nodes (most connected - your core abstractions)
1. `createErrorResponse()` - 259 edges
2. `createSuccessResponse()` - 254 edges
3. `generateAdminUserToken()` - 246 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 213 edges
6. `validateRequestBody()` - 150 edges
7. `Button` - 148 edges
8. `requestMiddleware()` - 116 edges
9. `createPostgrestClient()` - 98 edges
10. `lucide-react` - 95 edges

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

## Communities (159 total, 47 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.08
Nodes (122): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+114 more)

### Community 1 - "ref_react"
Cohesion: 0.03
Nodes (96): nextConfig, framer-motion, lucide-react, next, AdminLayout(), DriverLoginPage(), DriverNotificationsPage(), glassCard (+88 more)

### Community 2 - "api-utils.ts"
Cohesion: 0.05
Nodes (57): command, filters, POST, registrationSchema, runtime, VALID_STATUSES, GET, GET (+49 more)

### Community 3 - "Input"
Cohesion: 0.09
Nodes (77): Company, CompanyContractsPage(), Contract, Signature, PlatformContract, PlatformContractsPage(), Company, Distributor (+69 more)

### Community 4 - "createPostgrestClient"
Cohesion: 0.06
Nodes (54): welcomePayload(), resend, GET, PUT, POST, GET, GET, GET (+46 more)

### Community 5 - "Button"
Cohesion: 0.08
Nodes (60): sonner, AdminAccountPage(), ChironSyncPage(), FailedTrip, ChironSettingsPage(), Company, Company, EditCompanyPage() (+52 more)

### Community 6 - "usePreferences"
Cohesion: 0.15
Nodes (45): Account(), ActiveTrip(), useActivityFilters(), ActivityFilters(), AddressField(), BillingReminder(), dismissed, Home() (+37 more)

### Community 7 - "DriverRegisterForm.tsx"
Cohesion: 0.05
Nodes (69): @hookform/resolvers, react-hook-form, dynamic, LoginPage(), CompanyLoginForm(), DriverRegisterForm(), DriverRegisterFormProps, FormField() (+61 more)

### Community 8 - "admin/messages/page.tsx"
Cohesion: 0.08
Nodes (53): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, CompaniesPage(), CompaniesPageContent(), Company (+45 more)

### Community 9 - "CompanyDashboard.tsx"
Cohesion: 0.06
Nodes (52): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), Page(), GdprAdminPage() (+44 more)

### Community 10 - "authCrudOperations"
Cohesion: 0.08
Nodes (55): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+47 more)

### Community 11 - "zod"
Cohesion: 0.07
Nodes (51): bcryptjs, zod, available(), GET, POST, schema, verifyPasswordAgainstHash(), POST (+43 more)

### Community 12 - "dependencies"
Cohesion: 0.03
Nodes (63): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+55 more)

### Community 13 - "useTripController.ts"
Cohesion: 0.09
Nodes (44): ActionGate, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), nativeJournal(), engines (+36 more)

### Community 14 - "cn"
Cohesion: 0.06
Nodes (52): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger (+44 more)

### Community 15 - "api.ts"
Cohesion: 0.07
Nodes (42): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead() (+34 more)

### Community 16 - "InvoicesFeaturePage.tsx"
Cohesion: 0.07
Nodes (37): Page(), Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps (+29 more)

### Community 17 - "preferences.tsx"
Cohesion: 0.08
Nodes (32): APP_ORIGIN, companyRegistrationUrl(), LEGACY_APP_ORIGIN, RoadArt(), BrandMark(), icon, companyCopy, copy (+24 more)

### Community 18 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 19 - "package.json"
Cohesion: 0.04
Nodes (42): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+34 more)

### Community 20 - "session.tsx"
Cohesion: 0.10
Nodes (32): App(), logout(), styles, createActionGate(), apiConnectionKey(), driverApi, DriverProfile, DriverTripSummary (+24 more)

### Community 21 - "end/route.ts"
Cohesion: 0.12
Nodes (23): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError, numeric() (+15 more)

### Community 22 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 23 - "_layout.tsx"
Cohesion: 0.08
Nodes (31): Period, periodDates(), validDay(), validRange(), DriverMessage, DriverNotification, Layout(), Navigation() (+23 more)

### Community 24 - "driver/taximeter/page.tsx"
Cohesion: 0.10
Nodes (29): leaflet, BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard() (+21 more)

### Community 25 - "DriverShifts.tsx"
Cohesion: 0.12
Nodes (24): jspdf, qrcode, ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy (+16 more)

### Community 26 - "api-client.ts"
Cohesion: 0.11
Nodes (22): ContractReview, SignContractPage(), ContractDocument(), Contract, ContractBillingPanel(), directoryCopy, CompanyOption, DirectoryKind (+14 more)

### Community 27 - "driver-app/package.json"
Cohesion: 0.07
Nodes (30): eslint, react, react-dom, @types/react, typescript, main, name, overrides (+22 more)

### Community 28 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 29 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 30 - "utils.ts"
Cohesion: 0.08
Nodes (22): class-variance-authority, clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-scroll-area, @radix-ui/react-slider, @radix-ui/react-toggle, @radix-ui/react-toggle-group (+14 more)

### Community 31 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 32 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+19 more)

### Community 33 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 34 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 35 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 36 - "ref_node_fs"
Cohesion: 0.11
Nodes (12): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+4 more)

### Community 37 - "DriverMap.tsx"
Cohesion: 0.15
Nodes (21): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, search(), coordinate() (+13 more)

### Community 38 - "command.tsx"
Cohesion: 0.10
Nodes (22): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+14 more)

### Community 39 - "convert-database.mjs"
Cohesion: 0.17
Nodes (20): main(), convertExport(), EXCLUDED, identifier(), integer(), JsonNumber, literal(), main() (+12 more)

### Community 40 - "PlatformLanding.tsx"
Cohesion: 0.13
Nodes (12): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), openRegistration(), Route(), translations (+4 more)

### Community 41 - "SiteAIAgent.tsx"
Cohesion: 0.14
Nodes (24): apiFetch(), ApiResponse, buildApiUrl(), ChatMessage, ConversationStep, detectChangeIntent(), detectSearchIntent(), formatEntityInfo() (+16 more)

### Community 42 - "native-journal.ts"
Cohesion: 0.12
Nodes (12): login(), journalBytes(), keys, createSqlTripStore(), open(), seal(), Database, identity() (+4 more)

### Community 43 - "20261018_company_lifecycle.sql"
Cohesion: 0.12
Nodes (12): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+4 more)

### Community 44 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (13): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+5 more)

### Community 45 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 46 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 47 - "pdf-generator.ts"
Cohesion: 0.12
Nodes (11): configurePdfFonts(), ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator (+3 more)

### Community 48 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 51 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 52 - "ref_node_crypto"
Cohesion: 0.16
Nodes (11): [id,output], copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account (+3 more)

### Community 53 - "app/layout.tsx"
Cohesion: 0.16
Nodes (13): next-themes, dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider(), GlobalClientEffects() (+5 more)

### Community 54 - "next_api/drivers/route.ts"
Cohesion: 0.20
Nodes (14): POST, PUT, POST, registration, close(), driverFieldsSchema, driverValidationError(), mutateDriverAccount() (+6 more)

### Community 55 - "generateAcceptanceReportPdf"
Cohesion: 0.24
Nodes (14): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+6 more)

### Community 57 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 58 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 59 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 60 - "welcome-config.ts"
Cohesion: 0.23
Nodes (14): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster(), WELCOME_LANGUAGES (+6 more)

### Community 61 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 62 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 63 - "next_api/contracts/route.ts"
Cohesion: 0.36
Nodes (14): PUT, DELETE, document(), failed(), GET, positiveId(), POST, PUT (+6 more)

### Community 64 - "createTripJournal"
Cohesion: 0.25
Nodes (13): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+5 more)

### Community 65 - "20261019_driver_shifts.sql"
Cohesion: 0.23
Nodes (10): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_immutable_shift_event() (+2 more)

### Community 66 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 67 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+6 more)

### Community 68 - "vervoerbewijs.ts"
Cohesion: 0.20
Nodes (12): chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs(), VervoerbewijsChiron, VervoerbewijsCompany (+4 more)

### Community 69 - "driverShiftPdf"
Cohesion: 0.23
Nodes (11): jose, apply, headers, url, driverShiftPdf(), ensure(), page(), pairs() (+3 more)

### Community 70 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 71 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 72 - "[token]/route.ts"
Cohesion: 0.29
Nodes (10): dynamic, GET(), headers, runtime, getVervoerbewijsArrayBuffer(), documentOrigin, receiptCapability(), receiptDocumentUrl() (+2 more)

### Community 73 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 74 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 75 - "HomepageAdSlotSection.tsx"
Cohesion: 0.27
Nodes (8): dompurify, dompurify, FloatingCard(), FloatingCardProps, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 76 - "subscription-scheduler.ts"
Cohesion: 0.35
Nodes (8): register(), MailMessage, euro(), SubscriptionDocument, subscriptionPdf(), escape(), startSubscriptionScheduler(), subscriptionTick()

### Community 78 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

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

### Community 83 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

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

### Community 88 - "LanguageProvider"
Cohesion: 0.31
Nodes (8): DriverLayout(), DriverLayoutShell(), detectBrowserLanguage(), LanguageProvider(), normalizeLanguage(), readCookieLanguage(), setDocumentDirection(), setLanguageCookie()

### Community 90 - "configure-mail.mjs"
Cohesion: 0.39
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 91 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 92 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 94 - "configure-native-push.mjs"
Cohesion: 0.33
Nodes (3): dir, aad, openPushCredential()

### Community 95 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 96 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 97 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 98 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

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

### Community 105 - "start/route.ts"
Cohesion: 0.53
Nodes (4): generateTripHash(), generateTripUuid(), getRetentionDate(), POST

### Community 106 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 107 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 108 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, eslint, eslint-config-expo, @types/react, typescript

### Community 111 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 112 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 113 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 117 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 118 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 119 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 120 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 121 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 122 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

## Knowledge Gaps
- **720 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+715 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1012 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **47 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BackgroundGeolocation` connect `BackgroundGeolocation` to `Override`, `BackgroundGeolocation.java`, `BackgroundGeolocationService.java`, `android.content.Intent`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _720 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.08023483365949119 - nodes in this community are weakly interconnected._
- **Why does `requestMiddleware()` connect `api-utils.ts` to `createErrorResponse`, `authCrudOperations`, `zod`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.03116571771051843 - nodes in this community are weakly interconnected._
- **Should `api-utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.054858429858429855 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.08756534727408513 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 167 unresolved internal-endpoint edges and 20 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 229 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
