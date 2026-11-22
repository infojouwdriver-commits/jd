# Graph Report - JOUW DRIVER  (2026-11-22)

## Corpus Check
- 692 files · ~292,704 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3983 nodes · 13460 edges · 209 communities (144 shown, 65 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9cf5e3f1`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- api-utils.ts
- lucide-react
- Button
- ref_react
- createPostgrestClient
- Input
- usePreferences
- framer-motion
- api.ts
- ref_zod
- dependencies
- cn
- ui.tsx
- end/route.ts
- api-client.ts
- TripPanel.tsx
- SiteAIAgent.tsx
- BackgroundGeolocation
- validateRequestBody
- renderer.ts
- package.json
- dependencies
- sidebar.tsx
- marketing-content.ts
- 20261026_invoice_checkout.sql
- session.tsx
- DriverMap.tsx
- CookieBanner.tsx
- CompanyRegistration.tsx
- PlatformLanding.tsx
- subscription-billing.ts
- BackgroundGeolocationService.java
- mobile-location.ts
- stripe-billing.ts
- submit/route.ts
- native-journal.ts
- Trips.tsx
- next
- use-toast.ts
- cbe-public-search.ts
- utils.ts
- driver/taximeter/page.tsx
- ref_node_crypto
- driver-app/package.json
- mobile/package.json
- DriverShifts.tsx
- 20261018_company_lifecycle.sql
- RegisterForm.tsx
- 20261018_subscription_billing.sql
- documents/route.ts
- jouww-cutover.mjs
- email-templates/route.ts
- 20261019_shift_activity.sql
- ref_node_fs
- update-customer-portal.sh
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- engine.ts
- vervoerbewijs.ts
- pdf-generator.ts
- _layout.tsx
- form.tsx
- DriverRegisterForm.tsx
- TripPointJournal.java
- company-social.ts
- compilerOptions
- DriverSettlementCalculator.tsx
- municipal-test-documents.ts
- welcome-config.ts
- approval-mail-scheduler.ts
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- invoice-payment-handler.ts
- trip-journal.ts
- code-map.py
- scripts
- command.tsx
- RouteMap.tsx
- [resource]/page.tsx
- LoginPageClient.tsx
- next_api/contracts/route.ts
- 20261019_driver_shifts.sql
- devDependencies
- carousel.tsx
- apply-release.mjs
- convert-database.mjs
- receipts/[token]/route.ts
- AdminCompanyRegistration.tsx
- settings-model.ts
- DriverFleetShift.tsx
- DriverGuideSection.tsx
- 20261012_accounts_messages.sql
- chart.tsx
- "schema".security_fleet_locations
- secret-vault.ts
- "schema".company_registrations
- class-variance-authority
- mail-policy.ts
- EmailTemplatesPanel.tsx
- FaqPage.tsx
- chat/route.ts
- LoginModal.tsx
- pagination.tsx
- sheet.tsx
- configure-stripe.mjs
- recover-db-log.mjs
- 20261013_mail_delivery.sql
- "schema".company_change_requests
- 20261026_manual_invoices.sql
- navigation-menu.tsx
- Override
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- 20261115_account_deletion.sql
- HomepageAdSlotSection.tsx
- LoginForm.tsx
- tariff-quote.ts
- [...path]/route.ts
- driverShiftPdf
- android.content.Intent
- configure-mail.mjs
- ref_node_path
- driver-app/tsconfig.json
- LiveMap.tsx
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
- contract-template.ts
- admin-enrollment.mjs
- 20261009_security.sql
- "schema".security_create_driver_account
- "schema".security_email_contract
- invoice_bank_snapshot
- 20261104_company_tariffs.sql
- 20261114_email_templates.sql
- 20261122_company_social_registration.sql
- GpsLocationButton.tsx
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- 20261023_app_experience.sql
- "schema".security_save_company_email
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
- backup-foundation.sh
- import-private-archive.sh
- 20261121_admin_company_onboarding.sql
- Package.swift
- onboarding-copy.ts

## God Nodes (most connected - your core abstractions)
1. `createErrorResponse()` - 297 edges
2. `createSuccessResponse()` - 292 edges
3. `generateAdminUserToken()` - 279 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 212 edges
6. `validateRequestBody()` - 185 edges
7. `Button` - 172 edges
8. `createPostgrestClient()` - 153 edges
9. `requestMiddleware()` - 133 edges
10. `useLanguage()` - 120 edges

## Surprising Connections (you probably didn't know these)
- `locate()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `publish()` --indirect_call--> `draft()`  [INFERRED]
  src/components/app-experience/AppExperiencePanel.tsx → driver-app/src/experience/CompanyRegistration.tsx
- `DriverMapView()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `FleetLocation()` --references--> `Location`  [EXTRACTED]
  driver-app/src/FleetLocation.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `ActiveTrip()` --references--> `Alert`  [EXTRACTED]
  driver-app/src/experience/ActiveTrip.tsx → src/components/ui/alert.tsx

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

## Communities (209 total, 65 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (113): bcryptjs, GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE (+105 more)

### Community 1 - "api-utils.ts"
Cohesion: 0.05
Nodes (98): callback(), GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates() (+90 more)

### Community 2 - "lucide-react"
Cohesion: 0.06
Nodes (85): lucide-react, sonner, Company, PlatformContract, PlatformContractsPage(), Issued, Company, Distributor (+77 more)

### Community 3 - "Button"
Cohesion: 0.06
Nodes (87): DeletionStatusPage(), AccountDeletionsPage(), formatDate(), Request, AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest (+79 more)

### Community 4 - "ref_react"
Cohesion: 0.05
Nodes (76): Page(), Page(), ReceiptPage(), ReceiptWorkspace(), InvoicePayment(), action(), words, ContractReview (+68 more)

### Community 5 - "createPostgrestClient"
Cohesion: 0.06
Nodes (66): welcomePayload(), GET, PUT, command, POST, filters, GET, GET (+58 more)

### Community 6 - "Input"
Cohesion: 0.08
Nodes (56): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, CompaniesPage(), CompaniesPageContent(), Company (+48 more)

### Community 7 - "usePreferences"
Cohesion: 0.13
Nodes (53): DriverMessage, DriverMap(), Account(), AccountDeletion(), ActiveTrip(), ActiveTripMap(), guidance, styles (+45 more)

### Community 8 - "framer-motion"
Cohesion: 0.05
Nodes (48): framer-motion, Page(), Page(), Page(), Page(), Page(), Page(), AnimatedLogo() (+40 more)

### Community 9 - "api.ts"
Cohesion: 0.06
Nodes (53): AccountDeletionStatus, AccountInfo, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead() (+45 more)

### Community 10 - "ref_zod"
Cohesion: 0.07
Nodes (48): dynamic, GET(), headers, GET, POST, schema, POST, schema (+40 more)

### Community 11 - "dependencies"
Cohesion: 0.03
Nodes (66): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+58 more)

### Community 12 - "cn"
Cohesion: 0.05
Nodes (58): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, vaul, AccordionContent, AccordionItem, AccordionTrigger (+50 more)

### Community 13 - "ui.tsx"
Cohesion: 0.07
Nodes (42): appVersionLabel(), RoadArt(), BrandMark(), icon, FarePreview, same(), Tariff, useClassicFare() (+34 more)

### Community 14 - "end/route.ts"
Cohesion: 0.10
Nodes (32): connection, POST, GET, POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST (+24 more)

### Community 15 - "api-client.ts"
Cohesion: 0.06
Nodes (43): DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), DriverTestPage(), glassCard (+35 more)

### Community 16 - "TripPanel.tsx"
Cohesion: 0.09
Nodes (38): ActionGate, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), Props, engines, nativeEngine() (+30 more)

### Community 17 - "SiteAIAgent.tsx"
Cohesion: 0.06
Nodes (45): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, apiFetch(), ApiResponse (+37 more)

### Community 18 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 19 - "validateRequestBody"
Cohesion: 0.10
Nodes (32): driverInput, POST, registration, POST, POST, POST, PUT, POST (+24 more)

### Community 20 - "renderer.ts"
Cohesion: 0.09
Nodes (39): Draft, contractInvitation(), copy, verificationDesign(), VerificationPurpose, contractDesign(), ContractEmailData, copy (+31 more)

### Community 21 - "package.json"
Cohesion: 0.05
Nodes (41): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+33 more)

### Community 22 - "dependencies"
Cohesion: 0.04
Nodes (43): dependencies, expo, expo-application, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking (+35 more)

### Community 23 - "sidebar.tsx"
Cohesion: 0.07
Nodes (31): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup, SidebarGroupAction (+23 more)

### Community 24 - "marketing-content.ts"
Cohesion: 0.14
Nodes (30): dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props, SolutionPage() (+22 more)

### Community 25 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 26 - "session.tsx"
Cohesion: 0.11
Nodes (25): App(), logout(), styles, createActionGate(), apiConnectionKey(), DriverTripSummary, clearReceiptCache(), Context (+17 more)

### Community 27 - "DriverMap.tsx"
Cohesion: 0.11
Nodes (32): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), showWholeRoute(), RouteStatus, token (+24 more)

### Community 28 - "CookieBanner.tsx"
Cohesion: 0.10
Nodes (29): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+21 more)

### Community 29 - "CompanyRegistration.tsx"
Cohesion: 0.10
Nodes (23): CompanyRegistrationReceipt, CompanyRegistrationScreen(), advance(), change(), draft(), field(), sendCode(), validate() (+15 more)

### Community 30 - "PlatformLanding.tsx"
Cohesion: 0.11
Nodes (21): metadata, generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, Cinema(), cinematicCopy (+13 more)

### Community 31 - "subscription-billing.ts"
Cohesion: 0.14
Nodes (24): BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState, validIban(), deliverInvoiceEmail(), sendInvoiceEmail(), invoicePaymentState() (+16 more)

### Community 32 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 33 - "mobile-location.ts"
Cohesion: 0.11
Nodes (22): messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch(), createNativeTripReplay() (+14 more)

### Community 34 - "stripe-billing.ts"
Cohesion: 0.16
Nodes (26): stripe, runtime, runtime, closeInvoiceCheckout(), processInvoiceCheckout(), bind(), Client, completeSetup() (+18 more)

### Community 35 - "submit/route.ts"
Cohesion: 0.11
Nodes (21): metadata, Page(), metadata, Page(), POST(), result(), sites, metadata (+13 more)

### Community 36 - "native-journal.ts"
Cohesion: 0.11
Nodes (18): login(), check(), open(), run(), submit(), journalBytes(), assertNativeCryptoReady(), keys (+10 more)

### Community 37 - "Trips.tsx"
Cohesion: 0.15
Nodes (19): Period, periodDates(), validDay(), validRange(), ActivityPage, RevenueSummary, invoice(), Context (+11 more)

### Community 38 - "next"
Cohesion: 0.08
Nodes (17): nextConfig, next, Company, Contract, Signature, Page(), ContractPrintPage(), PrintableContract (+9 more)

### Community 39 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 40 - "cbe-public-search.ts"
Cohesion: 0.15
Nodes (26): saxes, POST, headers, input, POST, unavailable(), CbeCompany, CbeConfig (+18 more)

### Community 41 - "utils.ts"
Cohesion: 0.07
Nodes (20): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+12 more)

### Community 42 - "driver/taximeter/page.tsx"
Cohesion: 0.13
Nodes (25): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard(), LocationPoint (+17 more)

### Community 43 - "ref_node_crypto"
Cohesion: 0.10
Nodes (18): base, checks, headers, now, required, copy, decryptPushToken(), fcmAccessToken() (+10 more)

### Community 44 - "driver-app/package.json"
Cohesion: 0.07
Nodes (26): eslint, react, react-dom, @types/react, typescript, zod, main, name (+18 more)

### Community 45 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 46 - "DriverShifts.tsx"
Cohesion: 0.15
Nodes (20): ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy, km, ShiftActivity (+12 more)

### Community 47 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 48 - "RegisterForm.tsx"
Cohesion: 0.14
Nodes (22): close(), PasswordInput, CredentialsFormData, credentialsSchema, RegisterForm(), RegisterFormProps, VerificationFormData, verificationSchema (+14 more)

### Community 49 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 50 - "documents/route.ts"
Cohesion: 0.15
Nodes (21): GET, handler, POST, GET, handlePricing, PUT, GET, POST (+13 more)

### Community 51 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 52 - "email-templates/route.ts"
Cohesion: 0.17
Nodes (21): forbidden(), GET, invalid(), POST, PUT, serviceClient(), POST, POST() (+13 more)

### Community 53 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 54 - "ref_node_fs"
Cohesion: 0.12
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 55 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 56 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 57 - "20261024_stripe_billing.sql"
Cohesion: 0.15
Nodes (14): "schema".security_stripe_allocate(), "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts (+6 more)

### Community 58 - "engine.ts"
Cohesion: 0.19
Nodes (19): qrcode, gsap, qrcode, three, mountCinema(), render(), resize(), optimize() (+11 more)

### Community 59 - "vervoerbewijs.ts"
Cohesion: 0.16
Nodes (16): jspdf, configurePdfFonts(), chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs() (+8 more)

### Community 60 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 61 - "_layout.tsx"
Cohesion: 0.13
Nodes (18): Layout(), Navigation(), ActivityProvider(), InboxProvider(), useInboxState(), readMessage(), readNotification(), NavigationBar() (+10 more)

### Community 62 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 63 - "DriverRegisterForm.tsx"
Cohesion: 0.12
Nodes (21): DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data, step1Schema, Step2Data, step2Schema (+13 more)

### Community 66 - "company-social.ts"
Cohesion: 0.18
Nodes (17): GET(), metadata, RegistrationPage(), appleKeys, companySocialConfig(), companySocialFlowCookie, companySocialIdentity, companySocialProofCookie (+9 more)

### Community 67 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 68 - "DriverSettlementCalculator.tsx"
Cohesion: 0.19
Nodes (12): DriverSettlementCalculator(), download(), fields, summary, MarketingLocale, calculatorText(), calculateSettlement(), cents() (+4 more)

### Community 69 - "municipal-test-documents.ts"
Cohesion: 0.25
Nodes (15): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+7 more)

### Community 70 - "welcome-config.ts"
Cohesion: 0.22
Nodes (15): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster() (+7 more)

### Community 71 - "approval-mail-scheduler.ts"
Cohesion: 0.20
Nodes (14): register(), accountDeletionPage, approvalPath(), approvalReturnPath(), ApprovalTab, approvalTabs, approvalTarget(), sendPendingApprovalAlerts() (+6 more)

### Community 73 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 74 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 75 - "invoice-payment-handler.ts"
Cohesion: 0.23
Nodes (13): Checkout, Client, invoiceCheckout(), invoiceRpc(), InvoiceSource, command, invoicePaymentPOST, claims (+5 more)

### Community 76 - "trip-journal.ts"
Cohesion: 0.23
Nodes (14): browserJournals, createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save() (+6 more)

### Community 77 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 78 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 79 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 80 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 81 - "[resource]/page.tsx"
Cohesion: 0.21
Nodes (13): generateMetadata(), getPage(), isResource(), MarketingResource(), Props, calculatorCopy, calculatorDescription, chironGuide (+5 more)

### Community 82 - "LoginPageClient.tsx"
Cohesion: 0.20
Nodes (13): dynamic, LoginPage(), CompanyLoginForm(), LoginForm(), LoginPageClient(), LoginPageContent(), PortalEnum, ADMIN (+5 more)

### Community 83 - "next_api/contracts/route.ts"
Cohesion: 0.36
Nodes (14): PUT, DELETE, document(), failed(), GET, positiveId(), POST, PUT (+6 more)

### Community 84 - "20261019_driver_shifts.sql"
Cohesion: 0.25
Nodes (11): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_driver_shifts() (+3 more)

### Community 85 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+7 more)

### Community 86 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 87 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 88 - "convert-database.mjs"
Cohesion: 0.27
Nodes (12): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), parseSchema() (+4 more)

### Community 89 - "receipts/[token]/route.ts"
Cohesion: 0.25
Nodes (12): dynamic, GET(), headers, runtime, getVervoerbewijsArrayBuffer(), VervoerbewijsData, documentOrigin, receiptCapability() (+4 more)

### Community 90 - "AdminCompanyRegistration.tsx"
Cohesion: 0.15
Nodes (12): AdminCompanyRegistration(), changeOpen(), clearLookup(), submit(), cbeStatus, companyFields, driverFields, Field (+4 more)

### Community 91 - "settings-model.ts"
Cohesion: 0.18
Nodes (12): isEditableTemplate(), templateIds, emailDesignVersion, EmailSettings, EmailSettingsData, emailSettingsDataSchema, invoiceEdit, paragraph (+4 more)

### Community 92 - "DriverFleetShift.tsx"
Cohesion: 0.26
Nodes (10): copy, DriverFleetShift(), GeolocationPoint, registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus (+2 more)

### Community 93 - "DriverGuideSection.tsx"
Cohesion: 0.22
Nodes (11): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+3 more)

### Community 94 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 95 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 96 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 97 - "secret-vault.ts"
Cohesion: 0.22
Nodes (9): jose, apply, headers, url, close(), send(), decryptSecret(), encryptSecret() (+1 more)

### Community 98 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 99 - "class-variance-authority"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 100 - "mail-policy.ts"
Cohesion: 0.24
Nodes (7): resend, POST(), runtime, events, MAIL_FREE_LIMITS, mailEvent(), MailStatus

### Community 101 - "EmailTemplatesPanel.tsx"
Cohesion: 0.24
Nodes (5): EmailTemplatesPage(), EmailTemplatesPanel(), languageLabels, Preview, Template

### Community 102 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 103 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 104 - "LoginModal.tsx"
Cohesion: 0.22
Nodes (8): LoginModalProps, ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET, LandingLanguage, landingTranslations

### Community 105 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 106 - "sheet.tsx"
Cohesion: 0.24
Nodes (9): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants (+1 more)

### Community 107 - "configure-stripe.mjs"
Cohesion: 0.31
Nodes (7): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys

### Community 108 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 109 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 110 - ""schema".company_change_requests"
Cohesion: 0.28
Nodes (3): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change()

### Community 111 - "20261026_manual_invoices.sql"
Cohesion: 0.36
Nodes (5): manual_invoice_immutable, manual_payment_immutable, "schema".manual_invoice_payments, "schema".manual_invoices, "schema".security_manual_invoice()

### Community 112 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

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

### Community 118 - "LoginForm.tsx"
Cohesion: 0.29
Nodes (6): @hookform/resolvers, react-hook-form, GoogleLoginButton(), LoginFormData, LoginFormProps, loginSchema

### Community 119 - "tariff-quote.ts"
Cohesion: 0.36
Nodes (7): Company, CompanyTariff, Quote, readTariffQuote(), signature(), signTariffQuote(), TariffSheet

### Community 120 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 121 - "driverShiftPdf"
Cohesion: 0.46
Nodes (7): driverShiftPdf(), ensure(), page(), pairs(), paragraph(), section(), table()

### Community 123 - "configure-mail.mjs"
Cohesion: 0.48
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 124 - "ref_node_path"
Cohesion: 0.33
Nodes (3): dir, aad, openPushCredential()

### Community 125 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 126 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 128 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 129 - "20261109_chiron_realtime.sql"
Cohesion: 0.38
Nodes (3): record_trip_shift, trips_company_realtime_platform_ref_idx, trips_driver_realtime_active_idx

### Community 130 - "20261115_contact_approval_alerts.sql"
Cohesion: 0.33
Nodes (4): approval_mail, approval_mail_ready, "schema".approval_mail_outbox, "schema".security_reserve_mail()

### Community 131 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 132 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 133 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 134 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 135 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 139 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 140 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 145 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 146 - "20261114_email_templates.sql"
Cohesion: 0.50
Nodes (3): "schema".email_template_audit, "schema".email_template_settings, "schema".security_reserve_mail()

### Community 148 - "GpsLocationButton.tsx"
Cohesion: 0.40
Nodes (4): GpsLocationButton(), GpsLocationButtonProps, GpsStatus, LABELS

### Community 149 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 150 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 151 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 154 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 155 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 156 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 157 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 158 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 159 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

## Knowledge Gaps
- **850 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+845 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1227 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **65 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BackgroundGeolocation` connect `BackgroundGeolocation` to `BackgroundGeolocationService.java`, `BackgroundGeolocation.java`, `android.content.Intent`, `Override`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _850 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07072981366459627 - nodes in this community are weakly interconnected._
- **Why does `useTripController()` connect `TripPanel.tsx` to `api.ts`, `native-journal.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `api-utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.049161290322580646 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.06452072354365475 - nodes in this community are weakly interconnected._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.05725680102549494 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 175 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 292 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
