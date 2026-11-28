# Graph Report - JOUW DRIVER  (2026-11-28)

## Corpus Check
- 710 files · ~299,706 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4098 nodes · 13791 edges · 221 communities (154 shown, 67 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b3dffd36`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- Label
- session.tsx
- createPostgrestClient
- ref_react
- usePreferences
- Input
- useAuth
- email-templates/route.ts
- lib/auth.ts
- ui.tsx
- LanguageContext.tsx
- api-utils.ts
- dependencies
- api-client.ts
- company-changes.ts
- cn
- end/route.ts
- BackgroundGeolocation
- Shifts.tsx
- Button
- api.ts
- package.json
- ActiveTripMap.tsx
- lucide-react
- sidebar.tsx
- marketing-content.ts
- 20261026_invoice_checkout.sql
- company-registrations/route.ts
- cbe-public-search.ts
- driver-app/package.json
- BackgroundGeolocationService.java
- driver/taximeter/page.tsx
- scripts
- mobile-location.ts
- PlatformLanding.tsx
- import-cbe-open-data.py
- dependencies
- company-social.ts
- use-toast.ts
- utils.ts
- vervoerbewijs.ts
- stripe-billing.ts
- native-addresses.ts
- mobile/package.json
- engine.ts
- DriverShifts.tsx
- FeaturePageLayout
- 20261018_company_lifecycle.sql
- CompanyRegistration.tsx
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- 20261019_shift_activity.sql
- ref_node_fs
- update-customer-portal.sh
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- approval-mail-scheduler.ts
- manual-invoices.ts
- welcome-config.ts
- form.tsx
- public-contact.ts
- DriverRegisterForm.tsx
- pdf-generator.ts
- DriverGuideSection.tsx
- municipal-test-documents.ts
- TripPointJournal.java
- ref_node_crypto
- company-pricing.ts
- samples.ts
- compilerOptions
- ResetPasswordForm.tsx
- DriverSettlementCalculator.tsx
- invoice-payment-handler.ts
- RegisterForm.tsx
- renderer.ts
- messages/route.ts
- SiteAIAgent
- "schema".security_operations_centre
- 20261016_native_push.sql
- receipt/page.tsx
- LegalDocument.tsx
- trip-journal.ts
- BackgroundGeolocation
- activity-state.tsx
- command.tsx
- RouteMap.tsx
- Override
- 20261019_driver_shifts.sql
- carousel.tsx
- apply-release.mjs
- convert-database.mjs
- [resource]/page.tsx
- settings-model.ts
- 20261012_accounts_messages.sql
- framer-motion
- chart.tsx
- documents/route.ts
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- subscription-billing.ts
- "schema".company_registrations
- class-variance-authority
- FaqPage.tsx
- chat/route.ts
- LoginModal.tsx
- pagination.tsx
- configure-stripe.mjs
- recover-db-log.mjs
- scripts
- 20261013_mail_delivery.sql
- "schema".company_change_requests
- 20261026_manual_invoices.sql
- navigation-menu.tsx
- drawer.tsx
- DirectoryToolbar.tsx
- sheet.tsx
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- 20261115_account_deletion.sql
- InvoicesFeaturePage.tsx
- ReportsPage.tsx
- TripManagementPage.tsx
- [...path]/route.ts
- configurePdfFonts
- driverShiftPdf
- configure-mail.mjs
- ref_node_path
- driver-app/tsconfig.json
- LiveMap.tsx
- "schema".company_staff_events
- 20261019_email_identity.sql
- 20261109_chiron_realtime.sql
- 20261115_contact_approval_alerts.sql
- definitions.d.ts
- database-readiness.mjs
- EmailTemplatesPanel
- contract.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- AccountDeletion
- "schema".security_issue_subscription_demo
- "schema".security_email_contract
- 20261115_chiron_onboarding.sql
- "schema".road_reports
- contract-template.ts
- admin-enrollment.mjs
- devDependencies
- 20261009_security.sql
- "schema".security_create_driver_account
- "schema".security_email_contract
- invoice_bank_snapshot
- 20261104_company_tariffs.sql
- 20261114_email_templates.sql
- 20261122_company_social_registration.sql
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- 20261023_app_experience.sql
- "schema".security_save_company_email
- AirportNotices
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
- "schema".security_shift_document_profile
- preflight.mjs
- global-error.tsx
- PortalEnum
- backup-foundation.sh
- import-private-archive.sh
- 20261121_admin_company_onboarding.sql
- Package.swift
- onboarding-copy.ts

## God Nodes (most connected - your core abstractions)
1. `createErrorResponse()` - 303 edges
2. `createSuccessResponse()` - 298 edges
3. `generateAdminUserToken()` - 281 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 212 edges
6. `validateRequestBody()` - 189 edges
7. `Button` - 172 edges
8. `createPostgrestClient()` - 158 edges
9. `requestMiddleware()` - 135 edges
10. `useLanguage()` - 122 edges

## Surprising Connections (you probably didn't know these)
- `locate()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `publish()` --indirect_call--> `draft()`  [INFERRED]
  src/components/app-experience/AppExperiencePanel.tsx → driver-app/src/experience/CompanyRegistration.tsx
- `DriverMapView()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `ActiveTrip()` --references--> `Alert`  [EXTRACTED]
  driver-app/src/experience/ActiveTrip.tsx → src/components/ui/alert.tsx
- `search()` --indirect_call--> `value()`  [INFERRED]
  driver-app/src/experience/AddressField.tsx → scripts/convert-database.mjs

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

## Communities (221 total, 67 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (120): bcryptjs, GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE (+112 more)

### Community 1 - "Label"
Cohesion: 0.06
Nodes (91): Company, CompanyContractsPage(), Contract, Signature, PlatformContract, Company, Distributor, DistributorsPage() (+83 more)

### Community 2 - "session.tsx"
Cohesion: 0.05
Nodes (79): App(), login(), logout(), styles, ActionGate, createActionGate(), apiConnectionKey(), driverApi (+71 more)

### Community 3 - "createPostgrestClient"
Cohesion: 0.06
Nodes (61): welcomePayload(), command, GET, POST, GET, PUT, GET, PUT (+53 more)

### Community 4 - "ref_react"
Cohesion: 0.07
Nodes (59): kinds, Page(), Page(), CompanyDashboardPage(), ContractPrintPage(), PrintableContract, InvoicePayment(), action() (+51 more)

### Community 5 - "usePreferences"
Cohesion: 0.12
Nodes (58): DriverMap(), Account(), ActiveTrip(), invoice(), ActiveTripMap(), useActivityFilters(), ActivityFilters(), AddressField() (+50 more)

### Community 6 - "Input"
Cohesion: 0.07
Nodes (63): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, CompaniesPage(), CompaniesPageContent(), Company (+55 more)

### Community 7 - "useAuth"
Cohesion: 0.07
Nodes (61): AccountDeletionsPage(), formatDate(), Request, AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard() (+53 more)

### Community 8 - "email-templates/route.ts"
Cohesion: 0.06
Nodes (59): dynamic, GET(), headers, available(), GET, POST, schema, POST (+51 more)

### Community 9 - "lib/auth.ts"
Cohesion: 0.10
Nodes (55): callback(), GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates() (+47 more)

### Community 10 - "ui.tsx"
Cohesion: 0.06
Nodes (50): Layout(), Navigation(), appVersionLabel(), BrandMark(), icon, FarePreview, same(), Tariff (+42 more)

### Community 11 - "LanguageContext.tsx"
Cohesion: 0.05
Nodes (54): next-themes, ReceiptEmailSettings(), DriverProfileRoute(), dynamic, metadata, RootLayout(), viewport, PrivacyCenter() (+46 more)

### Community 12 - "api-utils.ts"
Cohesion: 0.05
Nodes (54): GET, POST, schema, POST, schema, GET, POST, POST (+46 more)

### Community 13 - "dependencies"
Cohesion: 0.03
Nodes (66): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+58 more)

### Community 14 - "api-client.ts"
Cohesion: 0.06
Nodes (48): sonner, DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), glassCard (+40 more)

### Community 15 - "company-changes.ts"
Cohesion: 0.07
Nodes (39): GET, resolveDistributorInfo(), resolveEffectiveUserType(), driverInput, POST, registration, DELETE, POST (+31 more)

### Community 16 - "cn"
Cohesion: 0.06
Nodes (51): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+43 more)

### Community 17 - "end/route.ts"
Cohesion: 0.12
Nodes (30): connection, POST, POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST, POST (+22 more)

### Community 18 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 19 - "Shifts.tsx"
Cohesion: 0.07
Nodes (33): RoadArt(), useRouteMotion(), nativeShiftCopy, shiftReadingCopy, Context, useShiftState(), submit(), start() (+25 more)

### Community 20 - "Button"
Cohesion: 0.07
Nodes (29): nextConfig, next, DeletionStatusPage(), Company, EditCompanyPage(), CompanyPricingPage(), Issued, Company (+21 more)

### Community 21 - "api.ts"
Cohesion: 0.07
Nodes (36): AccountDeletionStatus, AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), downloadPdf() (+28 more)

### Community 22 - "package.json"
Cohesion: 0.04
Nodes (42): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+34 more)

### Community 23 - "ActiveTripMap.tsx"
Cohesion: 0.10
Nodes (35): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), showWholeRoute(), navigationBasemap, RouteStatus (+27 more)

### Community 24 - "lucide-react"
Cohesion: 0.08
Nodes (25): lucide-react, DriverLayout(), DriverInfo, DriverLayoutContent(), DriverLayoutShell(), TabItem(), VehicleData, DriverShiftWorkspace() (+17 more)

### Community 25 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 26 - "marketing-content.ts"
Cohesion: 0.14
Nodes (31): dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props, SolutionPage() (+23 more)

### Community 27 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 28 - "company-registrations/route.ts"
Cohesion: 0.12
Nodes (30): companyRegistrationSchema, normalizeCompanyDriverPhone(), unverifiedBestuurderspas, POST, schema, GET, POST, PUT (+22 more)

### Community 29 - "cbe-public-search.ts"
Cohesion: 0.12
Nodes (32): saxes, errors, POST, query, headers, input, POST, unavailable() (+24 more)

### Community 30 - "driver-app/package.json"
Cohesion: 0.06
Nodes (33): eslint, react, react-dom, @types/react, typescript, zod, main, name (+25 more)

### Community 31 - "BackgroundGeolocationService.java"
Cohesion: 0.09
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 32 - "driver/taximeter/page.tsx"
Cohesion: 0.11
Nodes (29): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard(), LocationPoint (+21 more)

### Community 33 - "scripts"
Cohesion: 0.06
Nodes (31): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+23 more)

### Community 34 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 35 - "PlatformLanding.tsx"
Cohesion: 0.12
Nodes (19): metadata, generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, Cinema(), homeAlternates (+11 more)

### Community 36 - "import-cbe-open-data.py"
Cohesion: 0.14
Nodes (10): build(), check(), fingerprint(), git(), selected_paths(), address(), build_database(), main() (+2 more)

### Community 37 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, expo, expo-application, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking (+21 more)

### Community 38 - "company-social.ts"
Cohesion: 0.11
Nodes (24): jose, apply, headers, url, GET(), dynamic, LoginPage(), metadata (+16 more)

### Community 39 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 40 - "utils.ts"
Cohesion: 0.07
Nodes (20): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+12 more)

### Community 41 - "vervoerbewijs.ts"
Cohesion: 0.13
Nodes (23): dynamic, GET(), headers, runtime, chironColor(), chironLabel(), fmtDateTime(), fmtGps() (+15 more)

### Community 42 - "stripe-billing.ts"
Cohesion: 0.17
Nodes (24): runtime, runtime, processInvoiceCheckout(), bind(), Client, completeSetup(), assertStripeInvoice(), finiteSchedule() (+16 more)

### Community 43 - "native-addresses.ts"
Cohesion: 0.14
Nodes (21): search(), Failure, messages, locate(), useRoadReports(), submit(), buildBelgianSearchUrl(), categories (+13 more)

### Community 44 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 45 - "engine.ts"
Cohesion: 0.16
Nodes (21): qrcode, gsap, qrcode, three, cinematicCopy, CinematicText, mountCinema(), render() (+13 more)

### Community 46 - "DriverShifts.tsx"
Cohesion: 0.15
Nodes (20): ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy, km, ShiftActivity (+12 more)

### Community 47 - "FeaturePageLayout"
Cohesion: 0.13
Nodes (19): Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps, FeaturePageLayout(), FeaturePageLayoutProps, contentFr (+11 more)

### Community 48 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 49 - "CompanyRegistration.tsx"
Cohesion: 0.13
Nodes (19): CompanyRegistrationReceipt, change(), field(), englishOffer, passwordField(), privateField(), steps, minimalRegistrationCopy (+11 more)

### Community 50 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 51 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 52 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 53 - "ref_node_fs"
Cohesion: 0.12
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 54 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 55 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 56 - "20261024_stripe_billing.sql"
Cohesion: 0.15
Nodes (14): "schema".security_stripe_allocate(), "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts (+6 more)

### Community 57 - "approval-mail-scheduler.ts"
Cohesion: 0.15
Nodes (18): POST(), result(), sites, register(), accountDeletionPage, approvalPath(), approvalReturnPath(), ApprovalTab (+10 more)

### Community 58 - "manual-invoices.ts"
Cohesion: 0.21
Nodes (16): BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState, validIban(), deliverInvoiceEmail(), sendInvoiceEmail(), command (+8 more)

### Community 59 - "welcome-config.ts"
Cohesion: 0.16
Nodes (17): APP_ORIGIN, LEGACY_APP_ORIGIN, DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record() (+9 more)

### Community 60 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 61 - "public-contact.ts"
Cohesion: 0.16
Nodes (15): metadata, Page(), metadata, Page(), ContactPanel(), Locale, PublicInfo(), translations (+7 more)

### Community 62 - "DriverRegisterForm.tsx"
Cohesion: 0.12
Nodes (21): DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data, step1Schema, Step2Data, step2Schema (+13 more)

### Community 63 - "pdf-generator.ts"
Cohesion: 0.12
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 64 - "DriverGuideSection.tsx"
Cohesion: 0.14
Nodes (17): dompurify, dompurify, DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep (+9 more)

### Community 65 - "municipal-test-documents.ts"
Cohesion: 0.22
Nodes (16): jspdf, generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page() (+8 more)

### Community 67 - "ref_node_crypto"
Cohesion: 0.15
Nodes (13): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+5 more)

### Community 68 - "company-pricing.ts"
Cohesion: 0.18
Nodes (17): Company, activeCompanyTariffs(), CompanyPricing, companyPricingPatch(), CompanyTariff, companyTariffs(), defaults, driverPricing() (+9 more)

### Community 69 - "samples.ts"
Cohesion: 0.18
Nodes (16): copy, verificationDesign(), VerificationPurpose, copy, invoiceDesign(), InvoiceEmailData, InvoiceMailPurpose, driverReportDesign() (+8 more)

### Community 70 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 71 - "ResetPasswordForm.tsx"
Cohesion: 0.14
Nodes (15): close(), @hookform/resolvers, react-hook-form, GoogleLoginButton(), LoginFormData, LoginFormProps, loginSchema, EmailFormData (+7 more)

### Community 72 - "DriverSettlementCalculator.tsx"
Cohesion: 0.19
Nodes (12): DriverSettlementCalculator(), download(), fields, summary, MarketingLocale, calculatorText(), calculateSettlement(), cents() (+4 more)

### Community 73 - "invoice-payment-handler.ts"
Cohesion: 0.20
Nodes (15): stripe, Checkout, Client, invoiceCheckout(), invoiceRpc(), InvoiceSource, command, invoicePaymentPOST (+7 more)

### Community 74 - "RegisterForm.tsx"
Cohesion: 0.22
Nodes (16): CompanyLoginForm(), LoginForm(), LoginPageContent(), CredentialsFormData, credentialsSchema, RegisterForm(), RegisterFormProps, VerificationFormData (+8 more)

### Community 75 - "renderer.ts"
Cohesion: 0.15
Nodes (17): Draft, editableTemplateIds, emailBrand, EmailDesignId, EmailEdits, emailLanguages, emailMessageHtml(), escapeEmail() (+9 more)

### Community 77 - "messages/route.ts"
Cohesion: 0.24
Nodes (12): POST, PUT, GET, POST, GET, POST, POST, saveCompanyAccount() (+4 more)

### Community 78 - "SiteAIAgent"
Cohesion: 0.19
Nodes (18): apiFetch(), buildApiUrl(), detectChangeIntent(), detectSearchIntent(), formatEntityInfo(), generateId(), SiteAIAgent(), addAssistantMessage() (+10 more)

### Community 79 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 80 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 81 - "receipt/page.tsx"
Cohesion: 0.24
Nodes (14): ReceiptPage(), ReceiptWorkspace(), ExperienceFrame(), ExperienceGauge(), experienceWords, HomeInstruments(), ReceiptPrinter(), ReferenceMeter() (+6 more)

### Community 82 - "LegalDocument.tsx"
Cohesion: 0.24
Nodes (12): Page(), Props, metadata, PrivacyPolicyPage(), LegalDocument(), legacyEnglishPrivacy, LegalLocale, legalLocales (+4 more)

### Community 83 - "trip-journal.ts"
Cohesion: 0.23
Nodes (14): browserJournals, createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save() (+6 more)

### Community 85 - "activity-state.tsx"
Cohesion: 0.18
Nodes (13): Period, periodDates(), validDay(), validRange(), ActivityProvider(), Context, useStateValue(), apply() (+5 more)

### Community 86 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 87 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 88 - "Override"
Cohesion: 0.19
Nodes (3): OnSuccessListener<Location>, ServiceConnection, ServiceReceiver

### Community 89 - "20261019_driver_shifts.sql"
Cohesion: 0.25
Nodes (11): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_driver_shifts() (+3 more)

### Community 90 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 91 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 92 - "convert-database.mjs"
Cohesion: 0.27
Nodes (12): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), parseSchema() (+4 more)

### Community 93 - "[resource]/page.tsx"
Cohesion: 0.22
Nodes (12): generateMetadata(), getPage(), isResource(), MarketingResource(), Props, calculatorCopy, calculatorDescription, chironGuide (+4 more)

### Community 94 - "settings-model.ts"
Cohesion: 0.19
Nodes (11): templateIds, emailDesignVersion, EmailSettings, EmailSettingsData, emailSettingsDataSchema, invoiceEdit, paragraph, saveEmailSettingsSchema (+3 more)

### Community 95 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 96 - "framer-motion"
Cohesion: 0.17
Nodes (4): framer-motion, FeatureCardProps, ParallaxSectionProps, StatCounterProps

### Community 97 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 98 - "documents/route.ts"
Cohesion: 0.29
Nodes (7): GET, handler, POST, drawPdfQr(), renderTariffSheet(), TariffSheet, tariffSheetUrl()

### Community 99 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 100 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 101 - "subscription-billing.ts"
Cohesion: 0.27
Nodes (8): closeInvoiceCheckout(), billingGET, billingPOST, command, date, expected, id, profile

### Community 102 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 103 - "class-variance-authority"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 104 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 105 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 106 - "LoginModal.tsx"
Cohesion: 0.22
Nodes (8): LoginModalProps, ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET, LandingLanguage, landingTranslations

### Community 107 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 108 - "configure-stripe.mjs"
Cohesion: 0.31
Nodes (7): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys

### Community 109 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 110 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 111 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 112 - ""schema".company_change_requests"
Cohesion: 0.28
Nodes (3): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change()

### Community 113 - "20261026_manual_invoices.sql"
Cohesion: 0.36
Nodes (5): manual_invoice_immutable, manual_payment_immutable, "schema".manual_invoice_payments, "schema".manual_invoices, "schema".security_manual_invoice()

### Community 114 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 115 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 116 - "DirectoryToolbar.tsx"
Cohesion: 0.31
Nodes (4): directoryCopy, CompanyOption, DirectoryKind, DirectoryResult

### Community 117 - "sheet.tsx"
Cohesion: 0.28
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 118 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 119 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 120 - "20261115_account_deletion.sql"
Cohesion: 0.36
Nodes (5): clear_account_deletion_notice, "schema".account_deletion_requests, "schema".security_clear_account_deletion_notice(), "schema".security_complete_account_deletion(), "schema".security_request_account_deletion()

### Community 121 - "InvoicesFeaturePage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, InvoicesFeaturePage(), PublicStats

### Community 122 - "ReportsPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, ReportsPage()

### Community 123 - "TripManagementPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, TripManagementPage()

### Community 124 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 125 - "configurePdfFonts"
Cohesion: 0.29
Nodes (5): configurePdfFonts(), accountExportPdf(), exportCopy, ExportLocale, Row

### Community 126 - "driverShiftPdf"
Cohesion: 0.46
Nodes (7): driverShiftPdf(), ensure(), page(), pairs(), paragraph(), section(), table()

### Community 127 - "configure-mail.mjs"
Cohesion: 0.48
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 128 - "ref_node_path"
Cohesion: 0.33
Nodes (3): dir, aad, openPushCredential()

### Community 129 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 130 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 132 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 133 - "20261109_chiron_realtime.sql"
Cohesion: 0.38
Nodes (3): record_trip_shift, trips_company_realtime_platform_ref_idx, trips_driver_realtime_active_idx

### Community 134 - "20261115_contact_approval_alerts.sql"
Cohesion: 0.33
Nodes (4): approval_mail, approval_mail_ready, "schema".approval_mail_outbox, "schema".security_reserve_mail()

### Community 135 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 136 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 137 - "EmailTemplatesPanel"
Cohesion: 0.33
Nodes (3): EmailTemplatesPage(), EmailTemplatesPanel(), isEditableTemplate()

### Community 138 - "contract.ts"
Cohesion: 0.43
Nodes (5): contractInvitation(), contractDesign(), ContractEmailData, copy, SignatureEvidence

### Community 139 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 140 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 141 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 142 - "AccountDeletion"
Cohesion: 0.53
Nodes (6): AccountDeletion(), check(), open(), run(), submit(), ownerKey()

### Community 146 - ""schema".road_reports"
Cohesion: 0.60
Nodes (4): road_reports_expiry_idx, road_reports_reporter_idx, "schema".road_report_votes, "schema".road_reports

### Community 147 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 148 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 149 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, eslint, eslint-config-expo, @types/react, typescript

### Community 154 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 155 - "20261114_email_templates.sql"
Cohesion: 0.50
Nodes (3): "schema".email_template_audit, "schema".email_template_settings, "schema".security_reserve_mail()

### Community 157 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 158 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 159 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 162 - "AirportNotices"
Cohesion: 0.83
Nodes (4): AirportNotices(), publish(), refresh(), update()

### Community 163 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 164 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 165 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 166 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

### Community 176 - "PortalEnum"
Cohesion: 0.67
Nodes (3): PortalEnum, ADMIN, COMPANY

## Knowledge Gaps
- **873 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+868 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1260 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **67 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `generateAdminUserToken()` connect `createErrorResponse` to `lib/auth.ts`, `company-changes.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _873 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07050678854684769 - nodes in this community are weakly interconnected._
- **Why does `PlatformLanding()` connect `PlatformLanding.tsx` to `marketing-content.ts`, `LanguageContext.tsx`, `ref_react`, `Input`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `Label` be split into smaller, more focused modules?**
  _Cohesion score 0.056442577030812326 - nodes in this community are weakly interconnected._
- **Should `session.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.04606692742285962 - nodes in this community are weakly interconnected._
- **Should `createPostgrestClient` be split into smaller, more focused modules?**
  _Cohesion score 0.05820446735395189 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 193 unresolved internal-endpoint edges and 23 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 300 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
