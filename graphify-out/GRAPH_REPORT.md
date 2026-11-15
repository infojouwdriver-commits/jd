# Graph Report - JOUW DRIVER  (2026-11-15)

## Corpus Check
- 677 files · ~285,900 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3874 nodes · 13135 edges · 201 communities (139 shown, 62 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `06cc73cf`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- Input
- preferences.tsx
- createPostgrestClient
- usePreferences
- Button
- next
- lib/auth.ts
- api-utils.ts
- useAuth
- useLanguage
- admin/drivers/page.tsx
- end/route.ts
- useTripController.ts
- dependencies
- api.ts
- cn
- ref_react
- renderer.ts
- BackgroundGeolocation
- receipt-email/route.ts
- stripe-billing.ts
- session.tsx
- package.json
- InvoicesFeaturePage.tsx
- sidebar.tsx
- company-changes.ts
- 20261026_invoice_checkout.sql
- CookieBanner.tsx
- marketing-content.ts
- DriverMap.tsx
- utils.ts
- Trips.tsx
- BackgroundGeolocationService.java
- CompanyRegistration.tsx
- scripts
- validateRequestBody
- api-client.ts
- dependencies
- use-toast.ts
- subscription-billing.ts
- company-registrations/route.ts
- native-journal.ts
- engine.ts
- mobile/package.json
- DriverShifts.tsx
- 20261018_company_lifecycle.sql
- ref_node_crypto
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- public-contact.ts
- DriverRegisterForm.tsx
- 20261019_shift_activity.sql
- email-templates/route.ts
- ref_node_fs
- update-customer-portal.sh
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- vervoerbewijs.ts
- [resource]/page.tsx
- pdf-generator.ts
- form.tsx
- TripPointJournal.java
- mobile-location.ts
- compilerOptions
- DriverSettlementCalculator.tsx
- navigation-menu.tsx
- crud-operations.ts
- municipal-test-documents.ts
- welcome-config.ts
- SiteAIAgent
- approval-mail-scheduler.ts
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- app/layout.tsx
- RegisterForm.tsx
- trip-journal.ts
- code-map.py
- command.tsx
- 20261019_driver_shifts.sql
- carousel.tsx
- apply-release.mjs
- convert-database.mjs
- receipts/[token]/route.ts
- RouteMap.tsx
- LoginPageClient.tsx
- LoginForm.tsx
- driverShiftPdf
- push-worker.mjs
- [locale]/page.tsx
- PlatformLanding.tsx
- DriverGuideSection.tsx
- 20261012_accounts_messages.sql
- chart.tsx
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- LanguageProvider
- useGeolocation.ts
- "schema".company_registrations
- FaqPage.tsx
- chat/route.ts
- pagination.tsx
- configure-stripe.mjs
- recover-db-log.mjs
- scripts
- 20261013_mail_delivery.sql
- "schema".company_change_requests
- 20261026_manual_invoices.sql
- drawer.tsx
- sheet.tsx
- Override
- rollout.mjs
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- 20261115_account_deletion.sql
- HomepageAdSlotSection.tsx
- activity/route.ts
- [...path]/route.ts
- android.content.Intent
- driver-app/tsconfig.json
- "schema".company_staff_events
- 20261019_email_identity.sql
- 20261109_chiron_realtime.sql
- 20261115_contact_approval_alerts.sql
- definitions.d.ts
- useAddressSearch.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- "schema".security_issue_subscription_demo
- "schema".security_email_contract
- 20261115_chiron_onboarding.sql
- EmailTemplatesPanel
- contract-template.ts
- admin-enrollment.mjs
- 20261009_security.sql
- "schema".security_create_driver_account
- "schema".security_email_contract
- invoice_bank_snapshot
- 20261104_company_tariffs.sql
- 20261114_email_templates.sql
- resend/route.ts
- ModeEnum
- container-scroll-animation.tsx
- prepare-customer-runtime.sh
- 20261023_app_experience.sql
- company-portal/drivers/route.ts
- invoices/send/route.ts
- view/route.ts
- ModeEnum
- backup.sh
- public.security_enroll_initial_owner
- useInboxState
- 20261010_admin_mfa.sql
- trips_user_completion_request_idx
- "schema".security_create_trip_invoice
- "schema".security_reserve_mail
- preflight.mjs
- global-error.tsx
- PortalEnum
- backup-foundation.sh
- import-private-archive.sh
- Package.swift
- onboarding-copy.ts

## God Nodes (most connected - your core abstractions)
1. `createErrorResponse()` - 292 edges
2. `createSuccessResponse()` - 290 edges
3. `generateAdminUserToken()` - 277 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 212 edges
6. `validateRequestBody()` - 179 edges
7. `Button` - 168 edges
8. `createPostgrestClient()` - 149 edges
9. `requestMiddleware()` - 130 edges
10. `useLanguage()` - 116 edges

## Surprising Connections (you probably didn't know these)
- `locate()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `search()` --indirect_call--> `value()`  [INFERRED]
  driver-app/src/experience/AddressField.tsx → scripts/convert-database.mjs
- `publish()` --indirect_call--> `draft()`  [INFERRED]
  src/components/app-experience/AppExperiencePanel.tsx → driver-app/src/experience/CompanyRegistration.tsx
- `DriverMapView()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `FleetLocation()` --references--> `Location`  [EXTRACTED]
  driver-app/src/FleetLocation.tsx → mobile/plugins/background-geolocation/definitions.d.ts

## Import Cycles
- 2-file cycle: `src/lib/api-utils.ts -> src/lib/create-response.ts -> src/lib/api-utils.ts`
- 2-file cycle: `driver-app/src/experience/session.tsx -> driver-app/src/experience/shift-state.tsx -> driver-app/src/experience/session.tsx`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (201 total, 62 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (110): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+102 more)

### Community 1 - "Input"
Cohesion: 0.08
Nodes (84): Company, CompanyContractsPage(), Contract, Signature, EditCompanyPage(), PlatformContract, PlatformContractsPage(), CompanyPricingPage() (+76 more)

### Community 2 - "preferences.tsx"
Cohesion: 0.04
Nodes (74): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+66 more)

### Community 3 - "createPostgrestClient"
Cohesion: 0.06
Nodes (59): welcomePayload(), GET, PUT, GET, POST, schema, POST, schema (+51 more)

### Community 4 - "usePreferences"
Cohesion: 0.12
Nodes (56): DriverMap(), Account(), AccountDeletion(), secureOptions, ActiveTrip(), ActiveTripMap(), guidance, styles (+48 more)

### Community 5 - "Button"
Cohesion: 0.07
Nodes (58): ChironSyncPage(), FailedTrip, Page(), Page(), Page(), ContractPrintPage(), ContractReview, SignContractPage() (+50 more)

### Community 6 - "next"
Cohesion: 0.04
Nodes (55): nextConfig, framer-motion, lucide-react, next, DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission() (+47 more)

### Community 7 - "lib/auth.ts"
Cohesion: 0.08
Nodes (61): GET, PUT, available(), GET, POST, schema, driverLoginSchema, findCredentialByPhoneSafely() (+53 more)

### Community 8 - "api-utils.ts"
Cohesion: 0.05
Nodes (58): bcryptjs, POST, GET, PUT, registrationSchema, GET, POST, VALID_TYPES (+50 more)

### Community 9 - "useAuth"
Cohesion: 0.07
Nodes (56): sonner, AccountDeletionsPage(), formatDate(), AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard() (+48 more)

### Community 10 - "useLanguage"
Cohesion: 0.06
Nodes (60): leaflet, ReceiptPage(), ReceiptWorkspace(), BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance() (+52 more)

### Community 11 - "admin/drivers/page.tsx"
Cohesion: 0.09
Nodes (46): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, CompaniesPage(), CompaniesPageContent(), Company (+38 more)

### Community 12 - "end/route.ts"
Cohesion: 0.08
Nodes (45): Company, POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST, POST, canonicalChironEnvironment() (+37 more)

### Community 13 - "useTripController.ts"
Cohesion: 0.08
Nodes (46): ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), Props (+38 more)

### Community 14 - "dependencies"
Cohesion: 0.03
Nodes (65): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+57 more)

### Community 15 - "api.ts"
Cohesion: 0.05
Nodes (50): AccountDeletionStatus, AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, CompanyRegistrationReceipt, createDriverApi() (+42 more)

### Community 16 - "cn"
Cohesion: 0.06
Nodes (51): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+43 more)

### Community 17 - "ref_react"
Cohesion: 0.07
Nodes (30): DeletionStatusPage(), Request, Company, Issued, PrintableContract, AccountDeletion(), submit(), copy (+22 more)

### Community 18 - "renderer.ts"
Cohesion: 0.08
Nodes (43): Draft, languageLabels, Preview, Template, contractInvitation(), copy, verificationDesign(), VerificationPurpose (+35 more)

### Community 19 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 20 - "receipt-email/route.ts"
Cohesion: 0.08
Nodes (34): POST(), result(), sites, dynamic, GET(), headers, POST, POST (+26 more)

### Community 21 - "stripe-billing.ts"
Cohesion: 0.11
Nodes (38): stripe, runtime, runtime, Checkout, Client, closeInvoiceCheckout(), invoiceCheckout(), invoiceRpc() (+30 more)

### Community 22 - "session.tsx"
Cohesion: 0.09
Nodes (33): App(), logout(), styles, createActionGate(), apiConnectionKey(), DriverTripSummary, clearReceiptCache(), directory() (+25 more)

### Community 23 - "package.json"
Cohesion: 0.05
Nodes (41): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+33 more)

### Community 24 - "InvoicesFeaturePage.tsx"
Cohesion: 0.08
Nodes (32): Page(), Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps (+24 more)

### Community 25 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 26 - "company-changes.ts"
Cohesion: 0.11
Nodes (26): DELETE, POST, PUT, POST, PUT, changeFingerprint(), changesGET, changesPUT (+18 more)

### Community 27 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 28 - "CookieBanner.tsx"
Cohesion: 0.10
Nodes (29): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+21 more)

### Community 29 - "marketing-content.ts"
Cohesion: 0.13
Nodes (24): metadata, dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props (+16 more)

### Community 30 - "DriverMap.tsx"
Cohesion: 0.12
Nodes (29): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), showWholeRoute(), RouteStatus, token (+21 more)

### Community 31 - "utils.ts"
Cohesion: 0.06
Nodes (24): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+16 more)

### Community 32 - "Trips.tsx"
Cohesion: 0.16
Nodes (21): Period, periodDates(), validDay(), validRange(), invoice(), ActivityProvider(), Context, useActivityFilters() (+13 more)

### Community 33 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 34 - "CompanyRegistration.tsx"
Cohesion: 0.12
Nodes (22): apply(), CompanyRegistrationScreen(), advance(), change(), draft(), field(), sendCode(), validate() (+14 more)

### Community 35 - "scripts"
Cohesion: 0.06
Nodes (31): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+23 more)

### Community 36 - "validateRequestBody"
Cohesion: 0.13
Nodes (22): connection, POST, GET, handler, POST, POST, PUT, GET (+14 more)

### Community 37 - "api-client.ts"
Cohesion: 0.13
Nodes (22): DriverLoginPage(), Invoice, Trip, AuthContext, AuthProviderProps, DriverGoogleLoginButton(), DriverLoginClient(), DriverLoginContent() (+14 more)

### Community 38 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, expo, expo-application, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking (+21 more)

### Community 39 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 40 - "subscription-billing.ts"
Cohesion: 0.17
Nodes (21): BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState, validIban(), deliverInvoiceEmail(), sendInvoiceEmail(), invoicePaymentUrl() (+13 more)

### Community 41 - "company-registrations/route.ts"
Cohesion: 0.17
Nodes (24): POST, PUT, review, DELETE, document(), failed(), GET, positiveId() (+16 more)

### Community 42 - "native-journal.ts"
Cohesion: 0.11
Nodes (17): login(), check(), open(), run(), submit(), journalBytes(), assertNativeCryptoReady(), keys (+9 more)

### Community 43 - "engine.ts"
Cohesion: 0.15
Nodes (22): qrcode, gsap, qrcode, three, Cinema(), cinematicCopy, CinematicText, mountCinema() (+14 more)

### Community 44 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 45 - "DriverShifts.tsx"
Cohesion: 0.15
Nodes (20): ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy, km, ShiftActivity (+12 more)

### Community 46 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 47 - "ref_node_crypto"
Cohesion: 0.10
Nodes (16): dir, aad, openPushCredential(), base, checks, headers, now, required (+8 more)

### Community 48 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 49 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 50 - "public-contact.ts"
Cohesion: 0.14
Nodes (17): metadata, Page(), metadata, Page(), metadata, PrivacyPolicyPage(), ContactPanel(), Locale (+9 more)

### Community 51 - "DriverRegisterForm.tsx"
Cohesion: 0.11
Nodes (23): DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data, step1Schema, Step2Data, step2Schema (+15 more)

### Community 52 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 53 - "email-templates/route.ts"
Cohesion: 0.17
Nodes (21): forbidden(), GET, invalid(), POST, PUT, serviceClient(), isEditableTemplate(), templateIds (+13 more)

### Community 54 - "ref_node_fs"
Cohesion: 0.13
Nodes (9): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv(), mobileConfig(), [id,output] (+1 more)

### Community 55 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 56 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 57 - "20261024_stripe_billing.sql"
Cohesion: 0.15
Nodes (14): "schema".security_stripe_allocate(), "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts (+6 more)

### Community 58 - "vervoerbewijs.ts"
Cohesion: 0.16
Nodes (16): jspdf, configurePdfFonts(), chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs() (+8 more)

### Community 59 - "[resource]/page.tsx"
Cohesion: 0.19
Nodes (19): generateMetadata(), getPage(), isResource(), MarketingResource(), Props, Caution(), MarketingHub(), MarketingSiteShell() (+11 more)

### Community 60 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 61 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 64 - "mobile-location.ts"
Cohesion: 0.13
Nodes (14): clearNativeTripPoints(), createNativeLocationWatch(), createNativeTripReplay(), LocationError, MobileLocationPoint, MobileWatchOptions, NativeLocation, NativeLocationPlugin (+6 more)

### Community 65 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 66 - "DriverSettlementCalculator.tsx"
Cohesion: 0.19
Nodes (12): DriverSettlementCalculator(), download(), fields, summary, MarketingLocale, calculatorText(), calculateSettlement(), cents() (+4 more)

### Community 67 - "navigation-menu.tsx"
Cohesion: 0.14
Nodes (16): class-variance-authority, @radix-ui/react-navigation-menu, @radix-ui/react-toggle, @radix-ui/react-toggle-group, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList (+8 more)

### Community 68 - "crud-operations.ts"
Cohesion: 0.18
Nodes (12): GET, resolveDistributorInfo(), resolveEffectiveUserType(), POST, GET, normalizeUrlPreview(), validateEnv(), getAuthRoles() (+4 more)

### Community 69 - "municipal-test-documents.ts"
Cohesion: 0.25
Nodes (15): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+7 more)

### Community 70 - "welcome-config.ts"
Cohesion: 0.22
Nodes (15): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster() (+7 more)

### Community 71 - "SiteAIAgent"
Cohesion: 0.19
Nodes (18): apiFetch(), buildApiUrl(), detectChangeIntent(), detectSearchIntent(), formatEntityInfo(), generateId(), SiteAIAgent(), addAssistantMessage() (+10 more)

### Community 72 - "approval-mail-scheduler.ts"
Cohesion: 0.20
Nodes (14): register(), accountDeletionPage, approvalPath(), approvalReturnPath(), ApprovalTab, approvalTabs, approvalTarget(), sendPendingApprovalAlerts() (+6 more)

### Community 74 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 75 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 76 - "app/layout.tsx"
Cohesion: 0.17
Nodes (13): next-themes, dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider(), GlobalClientEffects() (+5 more)

### Community 77 - "RegisterForm.tsx"
Cohesion: 0.16
Nodes (14): CredentialsFormData, credentialsSchema, RegisterFormProps, VerificationFormData, verificationSchema, EmailFormData, emailSchema, ResetPasswordFormData (+6 more)

### Community 78 - "trip-journal.ts"
Cohesion: 0.23
Nodes (14): browserJournals, createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save() (+6 more)

### Community 79 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 80 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 81 - "20261019_driver_shifts.sql"
Cohesion: 0.25
Nodes (11): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_driver_shifts() (+3 more)

### Community 82 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 83 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 84 - "convert-database.mjs"
Cohesion: 0.27
Nodes (12): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), parseSchema() (+4 more)

### Community 85 - "receipts/[token]/route.ts"
Cohesion: 0.25
Nodes (12): dynamic, GET(), headers, runtime, getVervoerbewijsArrayBuffer(), VervoerbewijsData, documentOrigin, receiptCapability() (+4 more)

### Community 86 - "RouteMap.tsx"
Cohesion: 0.22
Nodes (12): RouteCoords, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), DrivingRoute, fetchDrivingRoute() (+4 more)

### Community 87 - "LoginPageClient.tsx"
Cohesion: 0.31
Nodes (11): dynamic, LoginPage(), CompanyLoginForm(), LoginForm(), LoginPageClient(), LoginPageContent(), RegisterForm(), ResetPasswordForm() (+3 more)

### Community 88 - "LoginForm.tsx"
Cohesion: 0.19
Nodes (10): close(), @hookform/resolvers, react-hook-form, GoogleLoginButton(), LoginFormData, LoginFormProps, loginSchema, Alert (+2 more)

### Community 89 - "driverShiftPdf"
Cohesion: 0.23
Nodes (11): jose, apply, headers, url, driverShiftPdf(), ensure(), page(), pairs() (+3 more)

### Community 90 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 91 - "[locale]/page.tsx"
Cohesion: 0.24
Nodes (8): generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, homeAlternates, homepageMetadata(), homepageSchema()

### Community 92 - "PlatformLanding.tsx"
Cohesion: 0.29
Nodes (8): metadata, RegistrationPage(), MarketingExplore(), PlatformLanding(), openRegistration(), portalHref(), portalOrigin(), registrationHandoff()

### Community 93 - "DriverGuideSection.tsx"
Cohesion: 0.22
Nodes (11): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+3 more)

### Community 94 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 95 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 96 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 97 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 98 - "LanguageProvider"
Cohesion: 0.24
Nodes (8): DriverLayout(), DriverLayoutShell(), detectBrowserLanguage(), LanguageProvider(), normalizeLanguage(), readCookieLanguage(), setDocumentDirection(), setLanguageCookie()

### Community 99 - "useGeolocation.ts"
Cohesion: 0.31
Nodes (9): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), isFreshAccurateLocation(), isNativeMobile() (+1 more)

### Community 100 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 101 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 102 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 103 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 104 - "configure-stripe.mjs"
Cohesion: 0.31
Nodes (7): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys

### Community 105 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 106 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 107 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 108 - ""schema".company_change_requests"
Cohesion: 0.28
Nodes (3): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change()

### Community 109 - "20261026_manual_invoices.sql"
Cohesion: 0.36
Nodes (5): manual_invoice_immutable, manual_payment_immutable, "schema".manual_invoice_payments, "schema".manual_invoices, "schema".security_manual_invoice()

### Community 110 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 111 - "sheet.tsx"
Cohesion: 0.28
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 113 - "rollout.mjs"
Cohesion: 0.29
Nodes (7): compose(), directory, env, [image, revision, target], lock, root, run()

### Community 114 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 115 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 116 - "20261115_account_deletion.sql"
Cohesion: 0.36
Nodes (5): clear_account_deletion_notice, "schema".account_deletion_requests, "schema".security_clear_account_deletion_notice(), "schema".security_complete_account_deletion(), "schema".security_request_account_deletion()

### Community 117 - "HomepageAdSlotSection.tsx"
Cohesion: 0.36
Nodes (6): dompurify, dompurify, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 118 - "activity/route.ts"
Cohesion: 0.54
Nodes (6): GET, activityColumns, activityFilters(), brusselsDay(), civilDate(), summarizeActivity()

### Community 119 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 121 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 123 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 124 - "20261109_chiron_realtime.sql"
Cohesion: 0.38
Nodes (3): record_trip_shift, trips_company_realtime_platform_ref_idx, trips_driver_realtime_active_idx

### Community 125 - "20261115_contact_approval_alerts.sql"
Cohesion: 0.33
Nodes (4): approval_mail, approval_mail_ready, "schema".approval_mail_outbox, "schema".security_reserve_mail()

### Community 126 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 127 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 128 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 129 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 130 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 135 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 136 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 141 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 142 - "20261114_email_templates.sql"
Cohesion: 0.50
Nodes (3): "schema".email_template_audit, "schema".email_template_settings, "schema".security_reserve_mail()

### Community 143 - "resend/route.ts"
Cohesion: 0.50
Nodes (4): resend, POST(), runtime, mailEvent()

### Community 144 - "ModeEnum"
Cohesion: 0.40
Nodes (5): ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET

### Community 145 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 146 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 148 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 149 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 150 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 151 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

### Community 154 - "useInboxState"
Cohesion: 0.67
Nodes (3): useInboxState(), readMessage(), readNotification()

### Community 161 - "PortalEnum"
Cohesion: 0.67
Nodes (3): PortalEnum, ADMIN, COMPANY

## Knowledge Gaps
- **819 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+814 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1179 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **62 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PlatformLanding()` connect `PlatformLanding.tsx` to `useLanguage`, `admin/drivers/page.tsx`, `engine.ts`, `[resource]/page.tsx`, `CookieBanner.tsx`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _819 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07197318810222036 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.0780650542118432 - nodes in this community are weakly interconnected._
- **Should `preferences.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0374020156774916 - nodes in this community are weakly interconnected._
- **Should `createPostgrestClient` be split into smaller, more focused modules?**
  _Cohesion score 0.06056166056166056 - nodes in this community are weakly interconnected._
- **Should `usePreferences` be split into smaller, more focused modules?**
  _Cohesion score 0.1198501872659176 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 174 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 286 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
