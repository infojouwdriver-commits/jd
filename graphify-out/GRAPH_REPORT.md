# Graph Report - JOUW DRIVER  (2026-10-27)

## Corpus Check
- 591 files · ~250,186 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3381 nodes · 11341 edges · 176 communities (123 shown, 53 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 244 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c69ccb60`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- requestMiddleware
- useAuth
- ref_react
- lucide-react
- Label
- Input
- usePreferences
- stripe-billing.ts
- lib/auth.ts
- cn
- dependencies
- useTripController.ts
- api-utils.ts
- company-changes.ts
- api.ts
- api-client.ts
- BackgroundGeolocation
- end/route.ts
- package.json
- session.tsx
- driver-app/package.json
- preferences.tsx
- 20261026_invoice_checkout.sql
- CookieBanner.tsx
- _layout.tsx
- driver/taximeter/page.tsx
- dependencies
- BackgroundGeolocationService.java
- mobile-location.ts
- scripts
- utils.ts
- use-toast.ts
- mobile/package.json
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- DriverMap.tsx
- 20261024_stripe_billing.sql
- PlatformLanding.tsx
- SiteAIAgent.tsx
- native-journal.ts
- 20261018_company_lifecycle.sql
- 20261019_shift_activity.sql
- DirectoryToolbar.tsx
- update-customer-portal.sh
- 20261018_contract_billing.sql
- vervoerbewijs.ts
- form.tsx
- DriverRegisterForm.tsx
- TripPointJournal.java
- ref_node_fs
- compilerOptions
- navigation-menu.tsx
- welcome-config.ts
- app/layout.tsx
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- code-map.py
- ref_node_crypto
- convert-database.mjs
- RouteMap.tsx
- next_api/contracts/route.ts
- generateAcceptanceReportPdf
- createTripJournal
- rollout.mjs
- 20261019_driver_shifts.sql
- carousel.tsx
- apply-release.mjs
- password/route.ts
- ResetPasswordForm.tsx
- LoginPageClient.tsx
- RegisterForm.tsx
- driverShiftPdf
- "schema".company_registrations
- chart.tsx
- [token]/route.ts
- LoginForm.tsx
- DriverFleetShift.tsx
- pdf-generator.ts
- "schema".security_fleet_locations
- HomepageAdSlotSection.tsx
- context-menu.tsx
- dropdown-menu.tsx
- driver-shifts.ts
- PDFGenerator
- "schema".security_save_company_account
- "schema".company_change_requests
- start/route.ts
- FaqPage.tsx
- chat/route.ts
- DriverGuideSection.tsx
- LoginModal.tsx
- pagination.tsx
- configure-stripe.mjs
- recover-db-log.mjs
- scripts
- 20261013_mail_delivery.sql
- drawer.tsx
- LanguageProvider
- sheet.tsx
- Override
- "schema".security_email_contract
- verify-private-owner.cjs
- [...path]/route.ts
- android.content.Intent
- driver-app/tsconfig.json
- 20261019_email_identity.sql
- "schema".manual_invoices
- definitions.d.ts
- database-readiness.mjs
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- contract-template.ts
- admin-enrollment.mjs
- 20261009_security.sql
- 20261018_web_billing.sql
- invoice_bank_snapshot
- migrate-secrets.mjs
- accordion.tsx
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
- 20261023_app_experience.sql
- company-portal/drivers/route.ts
- company-portal/vehicles/route.ts
- gdpr/data-subject-requests/route.ts
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
1. `createErrorResponse()` - 266 edges
2. `createSuccessResponse()` - 261 edges
3. `generateAdminUserToken()` - 253 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 213 edges
6. `Button` - 156 edges
7. `validateRequestBody()` - 154 edges
8. `requestMiddleware()` - 119 edges
9. `createPostgrestClient()` - 108 edges
10. `useLanguage()` - 101 edges

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

## Communities (176 total, 53 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (117): GET, GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE (+109 more)

### Community 1 - "requestMiddleware"
Cohesion: 0.04
Nodes (83): resend, zod, available(), GET, POST, schema, POST, schema (+75 more)

### Community 2 - "useAuth"
Cohesion: 0.05
Nodes (89): sonner, AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard() (+81 more)

### Community 3 - "ref_react"
Cohesion: 0.06
Nodes (73): Page(), Page(), Page(), ContractPrintPage(), PrintableContract, ShiftPage(), InvoicePayment(), words (+65 more)

### Community 4 - "lucide-react"
Cohesion: 0.04
Nodes (63): nextConfig, framer-motion, lucide-react, next, Page(), Page(), Page(), Page() (+55 more)

### Community 5 - "Label"
Cohesion: 0.09
Nodes (65): Company, CompanyContractsPage(), Contract, Signature, PlatformContract, PlatformContractsPage(), Company, Distributor (+57 more)

### Community 6 - "Input"
Cohesion: 0.08
Nodes (57): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, CompaniesPage(), CompaniesPageContent(), Company (+49 more)

### Community 7 - "usePreferences"
Cohesion: 0.15
Nodes (45): Account(), ActiveTrip(), useActivityFilters(), ActivityFilters(), AddressField(), BillingReminder(), dismissed, Home() (+37 more)

### Community 8 - "stripe-billing.ts"
Cohesion: 0.06
Nodes (62): stripe, runtime, runtime, register(), BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState (+54 more)

### Community 9 - "lib/auth.ts"
Cohesion: 0.09
Nodes (56): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+48 more)

### Community 10 - "cn"
Cohesion: 0.06
Nodes (54): @radix-ui/react-menubar, CardFooter, Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem (+46 more)

### Community 11 - "dependencies"
Cohesion: 0.03
Nodes (63): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+55 more)

### Community 12 - "useTripController.ts"
Cohesion: 0.09
Nodes (42): ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), nativeJournal() (+34 more)

### Community 13 - "api-utils.ts"
Cohesion: 0.06
Nodes (44): bcryptjs, POST, registrationSchema, GET, GET, POST, GET, normalizeUrlPreview() (+36 more)

### Community 14 - "company-changes.ts"
Cohesion: 0.09
Nodes (38): welcomePayload(), PUT, GET, DELETE, GET, POST, PUT, GET (+30 more)

### Community 15 - "api.ts"
Cohesion: 0.06
Nodes (46): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead() (+38 more)

### Community 16 - "api-client.ts"
Cohesion: 0.07
Nodes (38): DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), glassCard, labelStyle (+30 more)

### Community 17 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 18 - "end/route.ts"
Cohesion: 0.12
Nodes (24): POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError (+16 more)

### Community 19 - "package.json"
Cohesion: 0.05
Nodes (41): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+33 more)

### Community 20 - "session.tsx"
Cohesion: 0.10
Nodes (32): App(), logout(), styles, createActionGate(), apiConnectionKey(), DriverTripSummary, JourneyLoading(), clearReceiptCache() (+24 more)

### Community 21 - "driver-app/package.json"
Cohesion: 0.05
Nodes (38): eslint, react, react-dom, @types/react, typescript, main, name, overrides (+30 more)

### Community 22 - "preferences.tsx"
Cohesion: 0.10
Nodes (26): RoadArt(), BrandMark(), icon, companyCopy, copy, CopyKey, Language, JourneyMark() (+18 more)

### Community 23 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (21): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+13 more)

### Community 24 - "CookieBanner.tsx"
Cohesion: 0.10
Nodes (29): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+21 more)

### Community 25 - "_layout.tsx"
Cohesion: 0.09
Nodes (26): Period, periodDates(), validDay(), validRange(), DriverMessage, DriverNotification, Layout(), Navigation() (+18 more)

### Community 26 - "driver/taximeter/page.tsx"
Cohesion: 0.10
Nodes (28): leaflet, BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard() (+20 more)

### Community 27 - "dependencies"
Cohesion: 0.06
Nodes (32): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+24 more)

### Community 28 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 29 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 30 - "scripts"
Cohesion: 0.06
Nodes (30): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+22 more)

### Community 31 - "utils.ts"
Cohesion: 0.07
Nodes (21): clsx, @radix-ui/react-avatar, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-resizable-panels (+13 more)

### Community 32 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 33 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 34 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 35 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 36 - "DriverMap.tsx"
Cohesion: 0.16
Nodes (21): DriverMap(), DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, search() (+13 more)

### Community 37 - "20261024_stripe_billing.sql"
Cohesion: 0.12
Nodes (13): "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts, stripe_company_lifecycle_guard (+5 more)

### Community 38 - "PlatformLanding.tsx"
Cohesion: 0.13
Nodes (12): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), openRegistration(), Route(), translations (+4 more)

### Community 39 - "SiteAIAgent.tsx"
Cohesion: 0.14
Nodes (24): apiFetch(), ApiResponse, buildApiUrl(), ChatMessage, ConversationStep, detectChangeIntent(), detectSearchIntent(), formatEntityInfo() (+16 more)

### Community 40 - "native-journal.ts"
Cohesion: 0.13
Nodes (12): login(), journalBytes(), assertNativeCryptoReady(), keys, createSqlTripStore(), open(), seal(), Database (+4 more)

### Community 41 - "20261018_company_lifecycle.sql"
Cohesion: 0.12
Nodes (12): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+4 more)

### Community 42 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (13): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+5 more)

### Community 43 - "DirectoryToolbar.tsx"
Cohesion: 0.13
Nodes (18): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, directoryCopy, CompanyOption, CompanyPicker(), DirectoryKind, DirectoryResult (+10 more)

### Community 44 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 45 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 46 - "vervoerbewijs.ts"
Cohesion: 0.16
Nodes (17): jspdf, qrcode, downloadPdf(), configurePdfFonts(), chironColor(), chironLabel(), fmtDateTime(), fmtGps() (+9 more)

### Community 47 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 48 - "DriverRegisterForm.tsx"
Cohesion: 0.12
Nodes (21): DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data, step1Schema, Step2Data, step2Schema (+13 more)

### Community 51 - "ref_node_fs"
Cohesion: 0.15
Nodes (9): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv(), mobileConfig(), [id,output] (+1 more)

### Community 52 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 53 - "navigation-menu.tsx"
Cohesion: 0.14
Nodes (16): class-variance-authority, @radix-ui/react-navigation-menu, @radix-ui/react-toggle, @radix-ui/react-toggle-group, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList (+8 more)

### Community 54 - "welcome-config.ts"
Cohesion: 0.22
Nodes (15): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster() (+7 more)

### Community 55 - "app/layout.tsx"
Cohesion: 0.16
Nodes (13): next-themes, dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider(), GlobalClientEffects() (+5 more)

### Community 57 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 58 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 59 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 60 - "ref_node_crypto"
Cohesion: 0.18
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 61 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 62 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 63 - "next_api/contracts/route.ts"
Cohesion: 0.36
Nodes (14): PUT, DELETE, document(), failed(), GET, positiveId(), POST, PUT (+6 more)

### Community 64 - "generateAcceptanceReportPdf"
Cohesion: 0.28
Nodes (13): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+5 more)

### Community 65 - "createTripJournal"
Cohesion: 0.25
Nodes (13): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+5 more)

### Community 66 - "rollout.mjs"
Cohesion: 0.15
Nodes (10): dir, aad, openPushCredential(), compose(), directory, env, [image, revision, target], lock (+2 more)

### Community 67 - "20261019_driver_shifts.sql"
Cohesion: 0.23
Nodes (10): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_immutable_shift_event() (+2 more)

### Community 68 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 69 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 70 - "password/route.ts"
Cohesion: 0.29
Nodes (10): POST, PUT, GET, POST, GET, POST, accessibleMessage(), fields (+2 more)

### Community 71 - "ResetPasswordForm.tsx"
Cohesion: 0.19
Nodes (11): @hookform/resolvers, react-hook-form, CompanyLoginFormData, CompanyLoginFormProps, companyLoginSchema, PasswordInput, EmailFormData, emailSchema (+3 more)

### Community 72 - "LoginPageClient.tsx"
Cohesion: 0.19
Nodes (12): dynamic, LoginPage(), CompanyLoginForm(), LoginPageClient(), LoginPageContent(), ModeEnum, LOGIN, REGISTER (+4 more)

### Community 73 - "RegisterForm.tsx"
Cohesion: 0.24
Nodes (12): CredentialsFormData, credentialsSchema, RegisterForm(), RegisterFormProps, VerificationFormData, verificationSchema, ResetPasswordForm(), LoginModal() (+4 more)

### Community 74 - "driverShiftPdf"
Cohesion: 0.27
Nodes (11): qrcode, GET, driverShiftPdf(), ensure(), page(), pairs(), paragraph(), section() (+3 more)

### Community 75 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 76 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 77 - "[token]/route.ts"
Cohesion: 0.29
Nodes (10): dynamic, GET(), headers, runtime, getVervoerbewijsArrayBuffer(), documentOrigin, receiptCapability(), receiptDocumentUrl() (+2 more)

### Community 78 - "LoginForm.tsx"
Cohesion: 0.27
Nodes (9): GoogleLoginButton(), LoginForm(), LoginFormData, LoginFormProps, loginSchema, Alert, AlertDescription, AlertTitle (+1 more)

### Community 79 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 80 - "pdf-generator.ts"
Cohesion: 0.20
Nodes (9): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, TestResult, TripInvoiceData (+1 more)

### Community 81 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 82 - "HomepageAdSlotSection.tsx"
Cohesion: 0.27
Nodes (8): dompurify, dompurify, FloatingCard(), FloatingCardProps, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 83 - "context-menu.tsx"
Cohesion: 0.18
Nodes (10): @radix-ui/react-context-menu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut() (+2 more)

### Community 84 - "dropdown-menu.tsx"
Cohesion: 0.18
Nodes (10): @radix-ui/react-dropdown-menu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut() (+2 more)

### Community 85 - "driver-shifts.ts"
Cohesion: 0.18
Nodes (10): DriverShift, km, ShiftActivity, shiftDeclaration, ShiftDetail, ShiftEvent, ShiftList, ShiftPaymentSummary (+2 more)

### Community 88 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 89 - "start/route.ts"
Cohesion: 0.29
Nodes (7): GET, resolveDistributorInfo(), resolveEffectiveUserType(), generateTripHash(), generateTripUuid(), getRetentionDate(), POST

### Community 90 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 91 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 92 - "DriverGuideSection.tsx"
Cohesion: 0.27
Nodes (9): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+1 more)

### Community 93 - "LoginModal.tsx"
Cohesion: 0.22
Nodes (8): LoginModalProps, ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET, LandingLanguage, landingTranslations

### Community 94 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 95 - "configure-stripe.mjs"
Cohesion: 0.31
Nodes (7): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys

### Community 96 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 97 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 98 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 99 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 100 - "LanguageProvider"
Cohesion: 0.31
Nodes (8): DriverLayout(), DriverLayoutShell(), detectBrowserLanguage(), LanguageProvider(), normalizeLanguage(), readCookieLanguage(), setDocumentDirection(), setLanguageCookie()

### Community 101 - "sheet.tsx"
Cohesion: 0.28
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 104 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 105 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 107 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 108 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 109 - ""schema".manual_invoices"
Cohesion: 0.38
Nodes (3): manual_invoice_immutable, "schema".manual_invoice_payments, "schema".manual_invoices

### Community 110 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 111 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 112 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 113 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 114 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 115 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 116 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 117 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 118 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 122 - "migrate-secrets.mjs"
Cohesion: 0.40
Nodes (4): jose, apply, headers, url

### Community 123 - "accordion.tsx"
Cohesion: 0.40
Nodes (4): @radix-ui/react-accordion, AccordionContent, AccordionItem, AccordionTrigger

### Community 124 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 125 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 126 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 130 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 131 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 132 - "gdpr/data-subject-requests/route.ts"
Cohesion: 0.83
Nodes (3): POST, VALID_TYPES, calendarMonthDeadline()

### Community 133 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 134 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 135 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 136 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

## Knowledge Gaps
- **740 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+735 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1067 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **53 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTripController()` connect `useTripController.ts` to `api.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _740 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.0709234326125391 - nodes in this community are weakly interconnected._
- **Should `requestMiddleware` be split into smaller, more focused modules?**
  _Cohesion score 0.043137254901960784 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.05266106442577031 - nodes in this community are weakly interconnected._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.057513348588863464 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.03838383838383838 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 169 unresolved internal-endpoint edges and 21 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 243 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
