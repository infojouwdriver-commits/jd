# Graph Report - JOUW DRIVER  (2026-11-22)

## Corpus Check
- 690 files · ~291,944 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3970 nodes · 13423 edges · 216 communities (151 shown, 65 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8afff9e3`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- createPostgrestClient
- lib/auth.ts
- Button
- admin/messages/page.tsx
- usePreferences
- useAuth
- Input
- api.ts
- ref_react
- stripe-billing.ts
- api-utils.ts
- dependencies
- end/route.ts
- useTripController.ts
- company-changes.ts
- preferences.tsx
- cn
- SiteAIAgent.tsx
- BackgroundGeolocation
- DriverMap.tsx
- package.json
- api-client.ts
- sidebar.tsx
- session.tsx
- 20261026_invoice_checkout.sql
- next
- CompanyRegistration.tsx
- driver/taximeter/page.tsx
- BackgroundGeolocationService.java
- driver-app/package.json
- scripts
- mobile-location.ts
- native-journal.ts
- dependencies
- use-toast.ts
- utils.ts
- DriverShifts.tsx
- mobile/package.json
- cbe-public-search.ts
- FeaturePageLayout
- marketing-content.ts
- samples.ts
- 20261018_company_lifecycle.sql
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- vervoerbewijs.ts
- MarketingEditorial.tsx
- DriverRegisterForm.tsx
- 20261019_shift_activity.sql
- ref_node_fs
- update-customer-portal.sh
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- DriverGdprSection.tsx
- pdf-generator.ts
- engine.ts
- form.tsx
- TripPointJournal.java
- DriverGuideSection.tsx
- [resource]/page.tsx
- welcome-config.ts
- RegisterForm.tsx
- company-social.ts
- PlatformLanding.tsx
- compilerOptions
- renderer.ts
- municipal-test-documents.ts
- CookieBanner.tsx
- company-registrations/route.ts
- approval-mail-scheduler.ts
- BackgroundGeolocation
- LoginForm.tsx
- "schema".security_operations_centre
- 20261016_native_push.sql
- trip-journal.ts
- code-map.py
- DriverSettlementCalculator.tsx
- command.tsx
- RouteMap.tsx
- 20261019_driver_shifts.sql
- carousel.tsx
- apply-release.mjs
- convert-database.mjs
- PublicInfo.tsx
- submit/route.ts
- receipts/[token]/route.ts
- account-deletion/route.ts
- AdminCompanyRegistration.tsx
- LoginPageClient.tsx
- push-worker.mjs
- messages/route.ts
- settings-model.ts
- 20261012_accounts_messages.sql
- framer-motion
- chart.tsx
- DriverFleetShift.tsx
- activity-state.tsx
- "schema".security_fleet_locations
- secret-vault.ts
- "schema".company_registrations
- class-variance-authority
- FaqPage.tsx
- chat/route.ts
- pagination.tsx
- configure-stripe.mjs
- recover-db-log.mjs
- scripts
- 20261013_mail_delivery.sql
- "schema".company_change_requests
- 20261026_manual_invoices.sql
- navigation-menu.tsx
- drawer.tsx
- DriverShiftContext.tsx
- sheet.tsx
- Override
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- 20261115_account_deletion.sql
- InvoicesFeaturePage.tsx
- ReportsPage.tsx
- TripManagementPage.tsx
- activity/route.ts
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
- database-readiness.mjs
- account/AccountDeletion.tsx
- EmailTemplatesPanel
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
- ModeEnum
- container-scroll-animation.tsx
- prepare-customer-runtime.sh
- save
- 20261023_app_experience.sql
- "schema".security_save_company_email
- company-portal/drivers/route.ts
- company-portal/vehicles/route.ts
- invoices/send/route.ts
- view/route.ts
- websocket/route.ts
- backup.sh
- public.security_enroll_initial_owner
- useInboxState
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
6. `validateRequestBody()` - 183 edges
7. `Button` - 170 edges
8. `createPostgrestClient()` - 153 edges
9. `requestMiddleware()` - 132 edges
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
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (216 total, 65 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (122): bcryptjs, GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE (+114 more)

### Community 1 - "createPostgrestClient"
Cohesion: 0.04
Nodes (95): welcomePayload(), dynamic, GET(), headers, GET, PUT, POST, schema (+87 more)

### Community 2 - "lib/auth.ts"
Cohesion: 0.06
Nodes (77): callback(), GET, PUT, available(), GET, POST, schema, driverLoginSchema (+69 more)

### Community 3 - "Button"
Cohesion: 0.06
Nodes (65): Page(), Page(), Page(), CompanyDashboardPage(), ContractPrintPage(), PrintableContract, InvoicePayment(), action() (+57 more)

### Community 4 - "admin/messages/page.tsx"
Cohesion: 0.07
Nodes (62): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, CompaniesPage(), CompaniesPageContent(), Company (+54 more)

### Community 5 - "usePreferences"
Cohesion: 0.13
Nodes (56): DriverMap(), Account(), ActiveTrip(), invoice(), ActiveTripMap(), guidance, styles, useActivityFilters() (+48 more)

### Community 6 - "useAuth"
Cohesion: 0.07
Nodes (60): AccountDeletionsPage(), formatDate(), Request, AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard() (+52 more)

### Community 7 - "Input"
Cohesion: 0.10
Nodes (65): CompanyContractsPage(), EditCompanyPage(), PlatformContract, PlatformContractsPage(), Company, Distributor, DistributorsPage(), AdminMessagesPage() (+57 more)

### Community 8 - "api.ts"
Cohesion: 0.05
Nodes (56): AccountDeletionStatus, AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile() (+48 more)

### Community 9 - "ref_react"
Cohesion: 0.06
Nodes (48): lucide-react, sonner, ChironSyncPage(), FailedTrip, Company, Contract, Signature, Company (+40 more)

### Community 10 - "stripe-billing.ts"
Cohesion: 0.07
Nodes (57): stripe, runtime, runtime, BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState, validIban() (+49 more)

### Community 11 - "api-utils.ts"
Cohesion: 0.05
Nodes (51): connection, GET, handler, POST, GET, PUT, failure(), GET (+43 more)

### Community 12 - "dependencies"
Cohesion: 0.03
Nodes (66): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+58 more)

### Community 13 - "end/route.ts"
Cohesion: 0.08
Nodes (44): GET, POST, pricingHandler, generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment() (+36 more)

### Community 14 - "useTripController.ts"
Cohesion: 0.08
Nodes (45): ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), Props (+37 more)

### Community 15 - "company-changes.ts"
Cohesion: 0.07
Nodes (39): driverInput, POST, registration, POST, PUT, GET, POST, POST (+31 more)

### Community 16 - "preferences.tsx"
Cohesion: 0.07
Nodes (39): Layout(), Navigation(), appVersionLabel(), RoadArt(), BrandMark(), icon, companyCopy, copy (+31 more)

### Community 17 - "cn"
Cohesion: 0.06
Nodes (51): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+43 more)

### Community 18 - "SiteAIAgent.tsx"
Cohesion: 0.06
Nodes (45): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, apiFetch(), ApiResponse (+37 more)

### Community 19 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 20 - "DriverMap.tsx"
Cohesion: 0.08
Nodes (39): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), showWholeRoute(), RouteStatus, token (+31 more)

### Community 21 - "package.json"
Cohesion: 0.04
Nodes (42): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+34 more)

### Community 22 - "api-client.ts"
Cohesion: 0.08
Nodes (34): DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), glassCard, labelStyle (+26 more)

### Community 23 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 24 - "session.tsx"
Cohesion: 0.10
Nodes (29): App(), logout(), styles, createActionGate(), apiConnectionKey(), DriverTripSummary, clearReceiptCache(), Context (+21 more)

### Community 25 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 26 - "next"
Cohesion: 0.10
Nodes (24): nextConfig, next, ExperienceGauge(), experienceWords, HomeInstruments(), ReceiptPrinter(), DriverInfo, DriverLayoutContent() (+16 more)

### Community 27 - "CompanyRegistration.tsx"
Cohesion: 0.10
Nodes (24): CompanyRegistrationReceipt, apply(), CompanyRegistrationScreen(), advance(), change(), draft(), field(), sendCode() (+16 more)

### Community 28 - "driver/taximeter/page.tsx"
Cohesion: 0.11
Nodes (30): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard(), LocationPoint (+22 more)

### Community 29 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 30 - "driver-app/package.json"
Cohesion: 0.06
Nodes (30): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+22 more)

### Community 31 - "scripts"
Cohesion: 0.06
Nodes (31): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+23 more)

### Community 32 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 33 - "native-journal.ts"
Cohesion: 0.11
Nodes (18): login(), AccountDeletion(), check(), open(), run(), submit(), journalBytes(), assertNativeCryptoReady() (+10 more)

### Community 34 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, expo, expo-application, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking (+21 more)

### Community 35 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 36 - "utils.ts"
Cohesion: 0.07
Nodes (20): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+12 more)

### Community 37 - "DriverShifts.tsx"
Cohesion: 0.15
Nodes (21): qrcode, ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy, km (+13 more)

### Community 38 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 39 - "cbe-public-search.ts"
Cohesion: 0.16
Nodes (24): saxes, errors, POST, query, CbeCompany, CbeConfig, CbeErrorCode, CbeSearchError (+16 more)

### Community 40 - "FeaturePageLayout"
Cohesion: 0.13
Nodes (19): Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps, FeaturePageLayout(), FeaturePageLayoutProps, contentFr (+11 more)

### Community 41 - "marketing-content.ts"
Cohesion: 0.12
Nodes (16): metadata, generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, homeAlternates, homepageMetadata() (+8 more)

### Community 42 - "samples.ts"
Cohesion: 0.14
Nodes (21): contractInvitation(), copy, verificationDesign(), VerificationPurpose, contractDesign(), ContractEmailData, copy, SignatureEvidence (+13 more)

### Community 43 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 44 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 45 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 46 - "vervoerbewijs.ts"
Cohesion: 0.14
Nodes (18): jspdf, Company, configurePdfFonts(), chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime() (+10 more)

### Community 47 - "MarketingEditorial.tsx"
Cohesion: 0.20
Nodes (20): dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props, SolutionPage() (+12 more)

### Community 48 - "DriverRegisterForm.tsx"
Cohesion: 0.11
Nodes (23): DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data, step1Schema, Step2Data, step2Schema (+15 more)

### Community 49 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 50 - "ref_node_fs"
Cohesion: 0.12
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 51 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 52 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 53 - "20261024_stripe_billing.sql"
Cohesion: 0.15
Nodes (14): "schema".security_stripe_allocate(), "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts (+6 more)

### Community 54 - "DriverGdprSection.tsx"
Cohesion: 0.15
Nodes (18): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+10 more)

### Community 55 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 56 - "engine.ts"
Cohesion: 0.20
Nodes (18): qrcode, gsap, three, mountCinema(), render(), resize(), optimize(), Pose (+10 more)

### Community 57 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 59 - "DriverGuideSection.tsx"
Cohesion: 0.14
Nodes (17): dompurify, dompurify, DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep (+9 more)

### Community 60 - "[resource]/page.tsx"
Cohesion: 0.16
Nodes (16): generateMetadata(), getPage(), isResource(), MarketingResource(), Props, DriverSettlementCalculator(), download(), marketingCopy (+8 more)

### Community 62 - "welcome-config.ts"
Cohesion: 0.19
Nodes (16): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster() (+8 more)

### Community 63 - "RegisterForm.tsx"
Cohesion: 0.16
Nodes (17): @hookform/resolvers, react-hook-form, CredentialsFormData, credentialsSchema, RegisterForm(), RegisterFormProps, VerificationFormData, verificationSchema (+9 more)

### Community 64 - "company-social.ts"
Cohesion: 0.18
Nodes (17): GET(), metadata, RegistrationPage(), appleKeys, companySocialConfig(), companySocialFlowCookie, companySocialIdentity, companySocialProofCookie (+9 more)

### Community 65 - "PlatformLanding.tsx"
Cohesion: 0.19
Nodes (14): Cinema(), cinematicCopy, CinematicText, MarketingExplore(), downloadCopy, PlatformLanding(), openRegistration(), SocialRegistration (+6 more)

### Community 66 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 67 - "renderer.ts"
Cohesion: 0.15
Nodes (17): Draft, editableTemplateIds, emailBrand, EmailDesignId, EmailEdits, emailLanguages, emailMessageHtml(), escapeEmail() (+9 more)

### Community 68 - "municipal-test-documents.ts"
Cohesion: 0.25
Nodes (15): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+7 more)

### Community 69 - "CookieBanner.tsx"
Cohesion: 0.19
Nodes (13): ReceiptEmailSettings(), CookieBanner(), CookieCategory, DEFAULT_CATEGORIES, T, Switch, COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION (+5 more)

### Community 70 - "company-registrations/route.ts"
Cohesion: 0.32
Nodes (15): PUT, review, DELETE, document(), failed(), GET, positiveId(), POST (+7 more)

### Community 71 - "approval-mail-scheduler.ts"
Cohesion: 0.20
Nodes (14): register(), accountDeletionPage, approvalPath(), approvalReturnPath(), ApprovalTab, approvalTabs, approvalTarget(), sendPendingApprovalAlerts() (+6 more)

### Community 73 - "LoginForm.tsx"
Cohesion: 0.21
Nodes (13): close(), GoogleLoginButton(), LoginForm(), LoginFormData, LoginFormProps, loginSchema, ResetPasswordForm(), LoginModal() (+5 more)

### Community 74 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 75 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 76 - "trip-journal.ts"
Cohesion: 0.23
Nodes (14): browserJournals, createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save() (+6 more)

### Community 77 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 78 - "DriverSettlementCalculator.tsx"
Cohesion: 0.21
Nodes (10): fields, summary, MarketingLocale, calculatorText(), calculateSettlement(), cents(), emptySettlement(), downloadSettlement() (+2 more)

### Community 79 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 80 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

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

### Community 85 - "PublicInfo.tsx"
Cohesion: 0.20
Nodes (10): metadata, Page(), metadata, Page(), metadata, PrivacyPolicyPage(), ContactPanel(), Locale (+2 more)

### Community 86 - "submit/route.ts"
Cohesion: 0.24
Nodes (11): POST(), result(), sites, contactEmailDesign(), contactCopy, ContactSubmission, contactTopics, supportEmail (+3 more)

### Community 87 - "receipts/[token]/route.ts"
Cohesion: 0.25
Nodes (12): dynamic, GET(), headers, runtime, getVervoerbewijsArrayBuffer(), VervoerbewijsData, documentOrigin, receiptCapability() (+4 more)

### Community 88 - "account-deletion/route.ts"
Cohesion: 0.24
Nodes (11): GET, POST, schema, POST, schema, POST, VALID_TYPES, deletionReceipt (+3 more)

### Community 89 - "AdminCompanyRegistration.tsx"
Cohesion: 0.15
Nodes (12): AdminCompanyRegistration(), changeOpen(), clearLookup(), submit(), cbeStatus, companyFields, driverFields, Field (+4 more)

### Community 90 - "LoginPageClient.tsx"
Cohesion: 0.19
Nodes (12): dynamic, LoginPage(), CompanyLoginForm(), LoginPageClient(), LoginPageContent(), ModeEnum, LOGIN, REGISTER (+4 more)

### Community 91 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 92 - "messages/route.ts"
Cohesion: 0.33
Nodes (8): GET, GET, POST, POST, accessibleMessage(), fields, messageId(), writeMessage()

### Community 93 - "settings-model.ts"
Cohesion: 0.19
Nodes (11): templateIds, emailDesignVersion, EmailSettings, EmailSettingsData, emailSettingsDataSchema, invoiceEdit, paragraph, saveEmailSettingsSchema (+3 more)

### Community 94 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 95 - "framer-motion"
Cohesion: 0.17
Nodes (4): framer-motion, FeatureCardProps, ParallaxSectionProps, StatCounterProps

### Community 96 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 97 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 98 - "activity-state.tsx"
Cohesion: 0.29
Nodes (8): Period, periodDates(), validDay(), validRange(), ActivityProvider(), Context, useStateValue(), preset()

### Community 99 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 100 - "secret-vault.ts"
Cohesion: 0.22
Nodes (9): jose, apply, headers, url, close(), send(), decryptSecret(), encryptSecret() (+1 more)

### Community 101 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 102 - "class-variance-authority"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 103 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 104 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 105 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 106 - "configure-stripe.mjs"
Cohesion: 0.31
Nodes (7): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys

### Community 107 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 108 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

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

### Community 113 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 114 - "DriverShiftContext.tsx"
Cohesion: 0.28
Nodes (8): ReceiptPage(), ReceiptWorkspace(), ExperienceFrame(), DriverReceiptContext, DriverShiftContext, useDriverReceipt(), useDriverShift(), DriverShift

### Community 115 - "sheet.tsx"
Cohesion: 0.28
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 117 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 118 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 119 - "20261115_account_deletion.sql"
Cohesion: 0.36
Nodes (5): clear_account_deletion_notice, "schema".account_deletion_requests, "schema".security_clear_account_deletion_notice(), "schema".security_complete_account_deletion(), "schema".security_request_account_deletion()

### Community 120 - "InvoicesFeaturePage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, InvoicesFeaturePage(), PublicStats

### Community 121 - "ReportsPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, ReportsPage()

### Community 122 - "TripManagementPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, TripManagementPage()

### Community 123 - "activity/route.ts"
Cohesion: 0.54
Nodes (6): GET, activityColumns, activityFilters(), brusselsDay(), civilDate(), summarizeActivity()

### Community 124 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 125 - "driverShiftPdf"
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

### Community 137 - "account/AccountDeletion.tsx"
Cohesion: 0.38
Nodes (5): DeletionStatusPage(), AccountDeletion(), submit(), copy, Status

### Community 138 - "EmailTemplatesPanel"
Cohesion: 0.33
Nodes (3): EmailTemplatesPage(), EmailTemplatesPanel(), isEditableTemplate()

### Community 139 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 140 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 141 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 142 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 146 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 147 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 152 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 153 - "20261114_email_templates.sql"
Cohesion: 0.50
Nodes (3): "schema".email_template_audit, "schema".email_template_settings, "schema".security_reserve_mail()

### Community 155 - "ModeEnum"
Cohesion: 0.40
Nodes (5): ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET

### Community 156 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 157 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 158 - "save"
Cohesion: 0.50
Nodes (4): clearForm(), commit(), retry(), save()

### Community 161 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 162 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 163 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 164 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 165 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 168 - "useInboxState"
Cohesion: 0.67
Nodes (3): useInboxState(), readMessage(), readNotification()

## Knowledge Gaps
- **846 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+841 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1220 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **65 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PlatformLanding()` connect `PlatformLanding.tsx` to `Button`, `admin/messages/page.tsx`, `DriverGdprSection.tsx`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _846 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.06876623376623377 - nodes in this community are weakly interconnected._
- **Why does `BackgroundGeolocation` connect `BackgroundGeolocation` to `BackgroundGeolocationService.java`, `Override`, `BackgroundGeolocation.java`, `android.content.Intent`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `createPostgrestClient` be split into smaller, more focused modules?**
  _Cohesion score 0.03885003885003885 - nodes in this community are weakly interconnected._
- **Should `lib/auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06415381686655244 - nodes in this community are weakly interconnected._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.060396039603960394 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 175 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 290 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
