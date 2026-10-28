# Graph Report - JOUW DRIVER  (2026-10-28)

## Corpus Check
- 598 files · ~254,458 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3423 nodes · 11470 edges · 176 communities (124 shown, 52 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 244 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ca6cc05b`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- Label
- api-utils.ts
- ref_react
- lucide-react
- createPostgrestClient
- useTripController.ts
- DriverRegisterForm.tsx
- Input
- api.ts
- usePreferences
- preferences.tsx
- authCrudOperations
- PlatformLanding.tsx
- SiteAIAgent.tsx
- dependencies
- DriverDashboard.tsx
- cn
- BackgroundGeolocation
- mobile-location.ts
- package.json
- driver/taximeter/page.tsx
- sidebar.tsx
- end/route.ts
- 20261026_invoice_checkout.sql
- dependencies
- stripe-billing.ts
- session.tsx
- BackgroundGeolocationService.java
- company-changes.ts
- driver-app/package.json
- use-toast.ts
- DriverShifts.tsx
- utils.ts
- mobile/package.json
- 20261018_subscription_billing.sql
- api-client.ts
- jouww-cutover.mjs
- 20261024_stripe_billing.sql
- 20261018_company_lifecycle.sql
- 20261019_shift_activity.sql
- validateRequestBody
- contract-email-handler.ts
- update-customer-portal.sh
- 20261018_contract_billing.sql
- pdf-generator.ts
- form.tsx
- invoice-email.ts
- TripPointJournal.java
- DriverMapView
- ref_node_fs
- vervoerbewijs.ts
- compilerOptions
- company-registrations/route.ts
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- generateAcceptanceReportPdf
- code-map.py
- ref_node_crypto
- configure-stripe.mjs
- welcome-config.ts
- scripts
- convert-database.mjs
- RouteMap.tsx
- subscription-billing.ts
- createTripJournal
- 20261019_driver_shifts.sql
- command.tsx
- carousel.tsx
- apply-release.mjs
- devDependencies
- mail-service.ts
- activity-state.tsx
- "schema".company_registrations
- framer-motion
- chart.tsx
- [token]/route.ts
- "schema".security_fleet_locations
- HomepageAdSlotSection.tsx
- "schema".security_save_company_account
- "schema".company_change_requests
- class-variance-authority
- secret-vault.ts
- sheet.tsx
- mail-policy.ts
- FaqPage.tsx
- FeatureDetailCard
- FeaturePageLayout
- chat/route.ts
- DriverGuideSection.tsx
- pagination.tsx
- recover-db-log.mjs
- 20261013_mail_delivery.sql
- navigation-menu.tsx
- drawer.tsx
- Override
- "schema".security_email_contract
- rollout.mjs
- verify-private-owner.cjs
- InvoicesFeaturePage.tsx
- ReportsPage.tsx
- TripManagementPage.tsx
- [...path]/route.ts
- driverShiftPdf
- android.content.Intent
- driver-app/tsconfig.json
- 20261019_email_identity.sql
- "schema".manual_invoices
- definitions.d.ts
- database-readiness.mjs
- TeamManagementPage.tsx
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- start/route.ts
- invoice/[token]/page.tsx
- contract-template.ts
- admin-enrollment.mjs
- 20261009_security.sql
- 20261018_web_billing.sql
- invoice_bank_snapshot
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
10. `useLanguage()` - 103 edges

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
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (176 total, 52 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.08
Nodes (114): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+106 more)

### Community 1 - "Label"
Cohesion: 0.06
Nodes (98): Company, CompanyContractsPage(), Contract, Signature, PlatformContract, PlatformContractsPage(), Company, Distributor (+90 more)

### Community 2 - "api-utils.ts"
Cohesion: 0.05
Nodes (60): bcryptjs, registrationSchema, runtime, GET, VALID_TYPES, GET, POST, POST (+52 more)

### Community 3 - "ref_react"
Cohesion: 0.06
Nodes (65): Page(), Page(), CompanyDashboardPage(), ContractPrintPage(), PrintableContract, InvoicePayment(), action(), words (+57 more)

### Community 4 - "lucide-react"
Cohesion: 0.05
Nodes (66): nextConfig, lucide-react, next, sonner, ChironSyncPage(), FailedTrip, Company, CompanyPricingPage() (+58 more)

### Community 5 - "createPostgrestClient"
Cohesion: 0.06
Nodes (56): welcomePayload(), zod, GET, PUT, POST, schema, command, POST (+48 more)

### Community 6 - "useTripController.ts"
Cohesion: 0.06
Nodes (56): login(), ActionGate, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), DriverMapProps (+48 more)

### Community 7 - "DriverRegisterForm.tsx"
Cohesion: 0.05
Nodes (69): @hookform/resolvers, react-hook-form, dynamic, LoginPage(), CompanyLoginForm(), DriverRegisterForm(), DriverRegisterFormProps, FormField() (+61 more)

### Community 8 - "Input"
Cohesion: 0.09
Nodes (53): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, Company, EditCompanyPage(), CompaniesPage() (+45 more)

### Community 9 - "api.ts"
Cohesion: 0.05
Nodes (62): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead() (+54 more)

### Community 10 - "usePreferences"
Cohesion: 0.15
Nodes (45): Account(), ActiveTrip(), invoice(), useActivityFilters(), ActivityFilters(), AddressField(), BillingReminder(), dismissed (+37 more)

### Community 11 - "preferences.tsx"
Cohesion: 0.05
Nodes (52): Layout(), Navigation(), APP_ORIGIN, companyRegistrationUrl(), LEGACY_APP_ORIGIN, RoadArt(), BrandMark(), icon (+44 more)

### Community 12 - "authCrudOperations"
Cohesion: 0.09
Nodes (56): GET, PUT, available(), GET, POST, schema, driverLoginSchema, findCredentialByPhoneSafely() (+48 more)

### Community 13 - "PlatformLanding.tsx"
Cohesion: 0.07
Nodes (44): metadata, dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props (+36 more)

### Community 14 - "SiteAIAgent.tsx"
Cohesion: 0.05
Nodes (56): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, apiFetch(), ApiResponse (+48 more)

### Community 15 - "dependencies"
Cohesion: 0.03
Nodes (64): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+56 more)

### Community 16 - "DriverDashboard.tsx"
Cohesion: 0.09
Nodes (44): AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), ChironSettingsPage() (+36 more)

### Community 17 - "cn"
Cohesion: 0.06
Nodes (51): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+43 more)

### Community 18 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 19 - "mobile-location.ts"
Cohesion: 0.08
Nodes (32): copy, DriverFleetShift(), GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation() (+24 more)

### Community 20 - "package.json"
Cohesion: 0.05
Nodes (39): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+31 more)

### Community 21 - "driver/taximeter/page.tsx"
Cohesion: 0.08
Nodes (34): leaflet, AdminFleetPage(), BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton() (+26 more)

### Community 22 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 23 - "end/route.ts"
Cohesion: 0.13
Nodes (22): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError, numeric() (+14 more)

### Community 24 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (21): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+13 more)

### Community 25 - "dependencies"
Cohesion: 0.05
Nodes (36): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+28 more)

### Community 26 - "stripe-billing.ts"
Cohesion: 0.14
Nodes (30): stripe, runtime, runtime, Checkout, Client, closeInvoiceCheckout(), invoiceCheckout(), invoiceRpc() (+22 more)

### Community 27 - "session.tsx"
Cohesion: 0.13
Nodes (23): App(), logout(), styles, createActionGate(), apiConnectionKey(), DriverProfile, DriverMap(), clearReceiptCache() (+15 more)

### Community 28 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 29 - "company-changes.ts"
Cohesion: 0.16
Nodes (22): GET, resolveDistributorInfo(), resolveEffectiveUserType(), POST, POST, PUT, getAuthRoles(), changeFingerprint() (+14 more)

### Community 30 - "driver-app/package.json"
Cohesion: 0.07
Nodes (29): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+21 more)

### Community 31 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 32 - "DriverShifts.tsx"
Cohesion: 0.14
Nodes (21): ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy, DriverShift, km (+13 more)

### Community 33 - "utils.ts"
Cohesion: 0.07
Nodes (20): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+12 more)

### Community 34 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 35 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 36 - "api-client.ts"
Cohesion: 0.14
Nodes (21): DriverProfileRoute(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge(), VehicleCard() (+13 more)

### Community 37 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 38 - "20261024_stripe_billing.sql"
Cohesion: 0.12
Nodes (13): "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts, stripe_company_lifecycle_guard (+5 more)

### Community 39 - "20261018_company_lifecycle.sql"
Cohesion: 0.12
Nodes (12): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+4 more)

### Community 40 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (13): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+5 more)

### Community 41 - "validateRequestBody"
Cohesion: 0.20
Nodes (15): POST, POST, PUT, GET, POST, GET, POST, POST (+7 more)

### Community 42 - "contract-email-handler.ts"
Cohesion: 0.16
Nodes (17): command, POST, POST, POST, emailContractHandler(), review, signature, claims (+9 more)

### Community 43 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 44 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 45 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 46 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 47 - "invoice-email.ts"
Cohesion: 0.20
Nodes (16): register(), BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState, validIban(), InvoiceSource, deliverInvoiceEmail() (+8 more)

### Community 49 - "DriverMapView"
Cohesion: 0.17
Nodes (18): DriverMapView(), calculateRoute(), locate(), navigate(), search(), coordinate(), createAddressSearch(), freshSearchPoint() (+10 more)

### Community 51 - "ref_node_fs"
Cohesion: 0.15
Nodes (9): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv(), mobileConfig(), [id,output] (+1 more)

### Community 52 - "vervoerbewijs.ts"
Cohesion: 0.16
Nodes (16): jspdf, qrcode, configurePdfFonts(), chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime() (+8 more)

### Community 53 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 54 - "company-registrations/route.ts"
Cohesion: 0.32
Nodes (15): PUT, review, DELETE, document(), failed(), GET, positiveId(), POST (+7 more)

### Community 56 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 57 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 58 - "generateAcceptanceReportPdf"
Cohesion: 0.26
Nodes (14): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+6 more)

### Community 59 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 60 - "ref_node_crypto"
Cohesion: 0.18
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 61 - "configure-stripe.mjs"
Cohesion: 0.16
Nodes (10): dir, checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys (+2 more)

### Community 62 - "welcome-config.ts"
Cohesion: 0.23
Nodes (14): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster(), WELCOME_LANGUAGES (+6 more)

### Community 63 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 64 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 65 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 66 - "subscription-billing.ts"
Cohesion: 0.19
Nodes (12): claims, InvoiceLink, invoicePaymentUrl(), mac(), signInvoiceLink(), billingGET, billingPOST, command (+4 more)

### Community 67 - "createTripJournal"
Cohesion: 0.25
Nodes (13): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+5 more)

### Community 68 - "20261019_driver_shifts.sql"
Cohesion: 0.23
Nodes (10): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_immutable_shift_event() (+2 more)

### Community 69 - "command.tsx"
Cohesion: 0.18
Nodes (13): cmdk, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup, CommandInput (+5 more)

### Community 70 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 71 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 72 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+6 more)

### Community 73 - "mail-service.ts"
Cohesion: 0.28
Nodes (10): POST(), runtime, brevoIdempotencyKey(), brevoMailEvent(), brevoProviderId(), brevoWebhookAuthorized(), mailEventKey(), MailMessage (+2 more)

### Community 74 - "activity-state.tsx"
Cohesion: 0.26
Nodes (9): Period, periodDates(), validDay(), validRange(), ActivityProvider(), Context, useStateValue(), apply() (+1 more)

### Community 75 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 76 - "framer-motion"
Cohesion: 0.17
Nodes (4): framer-motion, FeatureCardProps, ParallaxSectionProps, StatCounterProps

### Community 77 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 78 - "[token]/route.ts"
Cohesion: 0.29
Nodes (10): dynamic, GET(), headers, runtime, getVervoerbewijsArrayBuffer(), documentOrigin, receiptCapability(), receiptDocumentUrl() (+2 more)

### Community 79 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 80 - "HomepageAdSlotSection.tsx"
Cohesion: 0.27
Nodes (8): dompurify, dompurify, FloatingCard(), FloatingCardProps, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 82 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 83 - "class-variance-authority"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 84 - "secret-vault.ts"
Cohesion: 0.24
Nodes (8): jose, apply, headers, url, close(), decryptSecret(), encryptSecret(), key()

### Community 85 - "sheet.tsx"
Cohesion: 0.24
Nodes (9): @radix-ui/react-dialog, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+1 more)

### Community 86 - "mail-policy.ts"
Cohesion: 0.24
Nodes (7): resend, POST(), runtime, events, MAIL_FREE_LIMITS, mailEvent(), MailStatus

### Community 87 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 88 - "FeatureDetailCard"
Cohesion: 0.29
Nodes (7): Page(), FeatureDetailCard(), FeatureDetailCardProps, contentFr, contentNl, icons, NotificationsPage()

### Community 89 - "FeaturePageLayout"
Cohesion: 0.29
Nodes (7): Page(), FeaturePageLayout(), FeaturePageLayoutProps, contentFr, contentNl, icons, SecurityPage()

### Community 90 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 91 - "DriverGuideSection.tsx"
Cohesion: 0.27
Nodes (9): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+1 more)

### Community 92 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 93 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 94 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 95 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 96 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 99 - "rollout.mjs"
Cohesion: 0.29
Nodes (7): compose(), directory, env, [image, revision, target], lock, root, run()

### Community 100 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 101 - "InvoicesFeaturePage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, InvoicesFeaturePage(), PublicStats

### Community 102 - "ReportsPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, ReportsPage()

### Community 103 - "TripManagementPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, TripManagementPage()

### Community 104 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 105 - "driverShiftPdf"
Cohesion: 0.46
Nodes (7): driverShiftPdf(), ensure(), page(), pairs(), paragraph(), section(), table()

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

### Community 112 - "TeamManagementPage.tsx"
Cohesion: 0.38
Nodes (5): Page(), contentFr, contentNl, icons, TeamManagementPage()

### Community 113 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 114 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 115 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 116 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 117 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 118 - "start/route.ts"
Cohesion: 0.53
Nodes (4): generateTripHash(), generateTripUuid(), getRetentionDate(), POST

### Community 119 - "invoice/[token]/page.tsx"
Cohesion: 0.40
Nodes (5): Company, Invoice, InvoiceViewPage(), ShareLink, TripInfoRow()

### Community 120 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 121 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 125 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 126 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 127 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 131 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 132 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

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
- **750 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+745 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1080 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `generateAdminUserToken()` connect `createErrorResponse` to `authCrudOperations`, `company-changes.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _750 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.08115468409586056 - nodes in this community are weakly interconnected._
- **Should `Label` be split into smaller, more focused modules?**
  _Cohesion score 0.05511143410852713 - nodes in this community are weakly interconnected._
- **Should `api-utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0524790236460717 - nodes in this community are weakly interconnected._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.06433063791554358 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.0456140350877193 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 169 unresolved internal-endpoint edges and 21 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 250 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
