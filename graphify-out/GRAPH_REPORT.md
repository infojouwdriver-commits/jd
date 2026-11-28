# Graph Report - JOUW DRIVER  (2026-11-28)

## Corpus Check
- 705 files · ~298,692 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4076 nodes · 13711 edges · 215 communities (148 shown, 67 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7e56b386`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- Input
- usePreferences
- createPostgrestClient
- useAuth
- useTripController.ts
- lib/auth.ts
- lucide-react
- Button
- email-templates/route.ts
- SelectContent
- session.tsx
- api.ts
- cn
- stripe-billing.ts
- dependencies
- LanguageContext.tsx
- api-utils.ts
- ref_react
- validateRequestBody
- BackgroundGeolocation
- package.json
- dependencies
- ActiveTripMap.tsx
- sidebar.tsx
- marketing-content.ts
- ref_node_crypto
- 20261026_invoice_checkout.sql
- TripManagementPage.tsx
- cbe-public-search.ts
- hashString
- BackgroundGeolocationService.java
- driver/taximeter/page.tsx
- mobile-location.ts
- PlatformLanding.tsx
- import-cbe-open-data.py
- CompanyRegistration.tsx
- use-toast.ts
- api-client.ts
- utils.ts
- DriverShifts.tsx
- driver-app/package.json
- native-addresses.ts
- mobile/package.json
- engine.ts
- company-social.ts
- vervoerbewijs.ts
- samples.ts
- 20261018_company_lifecycle.sql
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- experience/receipt.ts
- 20261019_shift_activity.sql
- ref_node_fs
- update-customer-portal.sh
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- pdf-generator.ts
- form.tsx
- DriverRegisterForm.tsx
- TripPointJournal.java
- renderer.ts
- compilerOptions
- ResetPasswordForm.tsx
- DriverSettlementCalculator.tsx
- navigation-menu.tsx
- municipal-test-documents.ts
- welcome-config.ts
- stripe-billing-core.ts
- company-pricing.ts
- SiteAIAgent
- approval-mail-scheduler.ts
- "schema".security_operations_centre
- 20261016_native_push.sql
- LegalDocument.tsx
- configurePdfFonts
- trip-journal.ts
- BackgroundGeolocation
- scripts
- command.tsx
- approval-requests/page.tsx
- receipt/page.tsx
- RouteMap.tsx
- Override
- 20261019_driver_shifts.sql
- devDependencies
- carousel.tsx
- apply-release.mjs
- convert-database.mjs
- public-contact.ts
- [resource]/page.tsx
- documents/route.ts
- settings-model.ts
- push-worker.mjs
- LoginPageClient.tsx
- DriverGuideSection.tsx
- 20261012_accounts_messages.sql
- chart.tsx
- PublicInfo.tsx
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- "schema".company_registrations
- EmailTemplatesPanel.tsx
- FaqPage.tsx
- chat/route.ts
- RegisterForm.tsx
- LoginModal.tsx
- configure-stripe.mjs
- recover-db-log.mjs
- 20261013_mail_delivery.sql
- "schema".company_change_requests
- 20261026_manual_invoices.sql
- drawer.tsx
- sheet.tsx
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- 20261115_account_deletion.sql
- HomepageAdSlotSection.tsx
- [...path]/route.ts
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
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- "schema".security_issue_subscription_demo
- "schema".security_email_contract
- 20261115_chiron_onboarding.sql
- "schema".road_reports
- contract-template.ts
- admin-enrollment.mjs
- run
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
- company-portal/drivers/route.ts
- company-portal/vehicles/route.ts
- invoices/send/route.ts
- view/route.ts
- websocket/route.ts
- ModeEnum
- totp.ts
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
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (215 total, 67 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (120): bcryptjs, GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, GET (+112 more)

### Community 1 - "Input"
Cohesion: 0.06
Nodes (89): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, CompanyContractsPage(), EditCompanyPage(), CompaniesPage() (+81 more)

### Community 2 - "usePreferences"
Cohesion: 0.10
Nodes (69): Period, periodDates(), validDay(), validRange(), Account(), AccountDeletion(), secureOptions, ActiveTrip() (+61 more)

### Community 3 - "createPostgrestClient"
Cohesion: 0.05
Nodes (66): welcomePayload(), command, GET, POST, GET, PUT, connection, POST (+58 more)

### Community 4 - "useAuth"
Cohesion: 0.06
Nodes (78): AccountDeletionsPage(), formatDate(), Request, AdminAccountPage(), ChironSyncPage(), FailedTrip, ChironSettingsPage(), connectionButton() (+70 more)

### Community 5 - "useTripController.ts"
Cohesion: 0.05
Nodes (65): App(), login(), styles, ActionGate, createActionGate(), DriverProfile, DriverVehicle, Context (+57 more)

### Community 6 - "lib/auth.ts"
Cohesion: 0.07
Nodes (66): callback(), GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates() (+58 more)

### Community 7 - "lucide-react"
Cohesion: 0.03
Nodes (61): framer-motion, lucide-react, DriverLayout(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification() (+53 more)

### Community 8 - "Button"
Cohesion: 0.08
Nodes (52): Page(), Page(), ContractPrintPage(), PrintableContract, InvoicePayment(), words, ContractReview, SignContractPage() (+44 more)

### Community 9 - "email-templates/route.ts"
Cohesion: 0.06
Nodes (60): dynamic, GET(), headers, available(), GET, POST, schema, POST (+52 more)

### Community 10 - "SelectContent"
Cohesion: 0.07
Nodes (57): sonner, PlatformContract, PlatformContractsPage(), Company, Distributor, Page(), AcceptanceTestPage(), Company (+49 more)

### Community 11 - "session.tsx"
Cohesion: 0.06
Nodes (54): DriverMessage, DriverNotification, Layout(), Navigation(), ActivityProvider(), appVersionLabel(), RoadArt(), BrandMark() (+46 more)

### Community 12 - "api.ts"
Cohesion: 0.05
Nodes (56): AccountDeletionStatus, AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), downloadPdf() (+48 more)

### Community 13 - "cn"
Cohesion: 0.05
Nodes (60): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+52 more)

### Community 14 - "stripe-billing.ts"
Cohesion: 0.07
Nodes (46): runtime, runtime, sections, workspaceGET, command, contractBillingGET, contractBillingPOST, Checkout (+38 more)

### Community 15 - "dependencies"
Cohesion: 0.03
Nodes (66): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+58 more)

### Community 16 - "LanguageContext.tsx"
Cohesion: 0.07
Nodes (43): next-themes, DriverLoginPage(), dynamic, metadata, RootLayout(), viewport, PrivacyCenter(), attemptSilentRefresh() (+35 more)

### Community 17 - "api-utils.ts"
Cohesion: 0.06
Nodes (43): GET, PUT, GET, POST, pricingHandler, GET, GET, POST (+35 more)

### Community 18 - "ref_react"
Cohesion: 0.06
Nodes (32): nextConfig, next, DeletionStatusPage(), Company, Contract, Signature, Company, Issued (+24 more)

### Community 19 - "validateRequestBody"
Cohesion: 0.09
Nodes (34): GET, POST, schema, POST, schema, command, POST, POST (+26 more)

### Community 20 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 21 - "package.json"
Cohesion: 0.04
Nodes (42): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+34 more)

### Community 22 - "dependencies"
Cohesion: 0.04
Nodes (43): dependencies, expo, expo-application, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking (+35 more)

### Community 23 - "ActiveTripMap.tsx"
Cohesion: 0.10
Nodes (35): DriverMap(), DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), showWholeRoute(), RouteStatus (+27 more)

### Community 24 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 25 - "marketing-content.ts"
Cohesion: 0.14
Nodes (31): dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props, SolutionPage() (+23 more)

### Community 26 - "ref_node_crypto"
Cohesion: 0.11
Nodes (28): POST, schema, POST, PUT, review, DELETE, document(), failed() (+20 more)

### Community 27 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 28 - "TripManagementPage.tsx"
Cohesion: 0.09
Nodes (28): Page(), Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps (+20 more)

### Community 29 - "cbe-public-search.ts"
Cohesion: 0.12
Nodes (32): saxes, errors, POST, query, headers, input, POST, unavailable() (+24 more)

### Community 30 - "hashString"
Cohesion: 0.13
Nodes (25): driverInput, POST, registration, POST, POST, PUT, POST, PUT (+17 more)

### Community 31 - "BackgroundGeolocationService.java"
Cohesion: 0.09
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 32 - "driver/taximeter/page.tsx"
Cohesion: 0.11
Nodes (29): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard(), LocationPoint (+21 more)

### Community 33 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 34 - "PlatformLanding.tsx"
Cohesion: 0.12
Nodes (19): metadata, generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, Cinema(), homeAlternates (+11 more)

### Community 35 - "import-cbe-open-data.py"
Cohesion: 0.14
Nodes (10): build(), check(), fingerprint(), git(), selected_paths(), address(), build_database(), main() (+2 more)

### Community 36 - "CompanyRegistration.tsx"
Cohesion: 0.11
Nodes (22): CompanyRegistrationReceipt, advance(), draft(), sendCode(), validate(), englishOffer, steps, minimalRegistrationCopy (+14 more)

### Community 37 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 38 - "api-client.ts"
Cohesion: 0.11
Nodes (19): kinds, dismissed, words, directoryCopy, CompanyOption, DirectoryKind, DirectoryResult, apiRequest() (+11 more)

### Community 39 - "utils.ts"
Cohesion: 0.07
Nodes (20): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+12 more)

### Community 40 - "DriverShifts.tsx"
Cohesion: 0.15
Nodes (21): ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy, DriverShift, km (+13 more)

### Community 41 - "driver-app/package.json"
Cohesion: 0.07
Nodes (26): eslint, react, react-dom, @types/react, typescript, zod, main, name (+18 more)

### Community 42 - "native-addresses.ts"
Cohesion: 0.14
Nodes (21): search(), Failure, messages, locate(), useRoadReports(), submit(), buildBelgianSearchUrl(), categories (+13 more)

### Community 43 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 44 - "engine.ts"
Cohesion: 0.16
Nodes (21): qrcode, gsap, qrcode, three, cinematicCopy, CinematicText, mountCinema(), render() (+13 more)

### Community 45 - "company-social.ts"
Cohesion: 0.13
Nodes (23): jose, apply, headers, url, GET(), metadata, RegistrationPage(), appleKeys (+15 more)

### Community 46 - "vervoerbewijs.ts"
Cohesion: 0.14
Nodes (22): dynamic, GET(), headers, runtime, chironColor(), chironLabel(), fmtDateTime(), fmtGps() (+14 more)

### Community 47 - "samples.ts"
Cohesion: 0.14
Nodes (21): contractInvitation(), copy, verificationDesign(), VerificationPurpose, contractDesign(), ContractEmailData, copy, SignatureEvidence (+13 more)

### Community 48 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 49 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 50 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 51 - "experience/receipt.ts"
Cohesion: 0.12
Nodes (19): logout(), apiConnectionKey(), invoice(), clearReceiptCache(), directory(), shareAccountExport(), shareReceipt(), shareShiftReport() (+11 more)

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

### Community 57 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 58 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 59 - "DriverRegisterForm.tsx"
Cohesion: 0.12
Nodes (21): DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data, step1Schema, Step2Data, step2Schema (+13 more)

### Community 61 - "renderer.ts"
Cohesion: 0.14
Nodes (18): Draft, editableTemplateIds, emailBrand, EmailDesignId, EmailEdits, emailLanguages, emailMessageHtml(), escapeEmail() (+10 more)

### Community 62 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 63 - "ResetPasswordForm.tsx"
Cohesion: 0.14
Nodes (15): close(), @hookform/resolvers, react-hook-form, GoogleLoginButton(), LoginFormData, LoginFormProps, loginSchema, EmailFormData (+7 more)

### Community 64 - "DriverSettlementCalculator.tsx"
Cohesion: 0.19
Nodes (12): DriverSettlementCalculator(), download(), fields, summary, MarketingLocale, calculatorText(), calculateSettlement(), cents() (+4 more)

### Community 65 - "navigation-menu.tsx"
Cohesion: 0.14
Nodes (16): class-variance-authority, @radix-ui/react-navigation-menu, @radix-ui/react-toggle, @radix-ui/react-toggle-group, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList (+8 more)

### Community 66 - "municipal-test-documents.ts"
Cohesion: 0.25
Nodes (15): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+7 more)

### Community 68 - "welcome-config.ts"
Cohesion: 0.22
Nodes (15): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster() (+7 more)

### Community 69 - "stripe-billing-core.ts"
Cohesion: 0.21
Nodes (17): stripe, processInvoiceCheckout(), bind(), completeSetup(), assertStripeInvoice(), finiteSchedule(), stripeCycleAt(), StripeEnrollment (+9 more)

### Community 70 - "company-pricing.ts"
Cohesion: 0.20
Nodes (16): Company, CompanyPricing, companyPricingPatch(), CompanyTariff, companyTariffs(), defaults, normalizeCompanyPricing(), numericField() (+8 more)

### Community 71 - "SiteAIAgent"
Cohesion: 0.19
Nodes (18): apiFetch(), buildApiUrl(), detectChangeIntent(), detectSearchIntent(), formatEntityInfo(), generateId(), SiteAIAgent(), addAssistantMessage() (+10 more)

### Community 72 - "approval-mail-scheduler.ts"
Cohesion: 0.20
Nodes (14): register(), accountDeletionPage, approvalPath(), approvalReturnPath(), ApprovalTab, approvalTabs, approvalTarget(), sendPendingApprovalAlerts() (+6 more)

### Community 73 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 74 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 75 - "LegalDocument.tsx"
Cohesion: 0.24
Nodes (12): Page(), Props, metadata, PrivacyPolicyPage(), LegalDocument(), legacyEnglishPrivacy, LegalLocale, legalLocales (+4 more)

### Community 76 - "configurePdfFonts"
Cohesion: 0.20
Nodes (12): configurePdfFonts(), accountExportPdf(), exportCopy, ExportLocale, Row, BankInstructions, bankPaymentPayload(), invoiceBankPayload() (+4 more)

### Community 77 - "trip-journal.ts"
Cohesion: 0.23
Nodes (14): browserJournals, createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save() (+6 more)

### Community 79 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 80 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 81 - "approval-requests/page.tsx"
Cohesion: 0.17
Nodes (13): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), action(), CompanyRegistrationApprovals() (+5 more)

### Community 82 - "receipt/page.tsx"
Cohesion: 0.26
Nodes (13): ReceiptPage(), ReceiptWorkspace(), ExperienceFrame(), ExperienceGauge(), experienceWords, HomeInstruments(), ReceiptPrinter(), ReferenceMeter() (+5 more)

### Community 83 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 84 - "Override"
Cohesion: 0.19
Nodes (3): OnSuccessListener<Location>, ServiceConnection, ServiceReceiver

### Community 85 - "20261019_driver_shifts.sql"
Cohesion: 0.25
Nodes (11): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_driver_shifts() (+3 more)

### Community 86 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+7 more)

### Community 87 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 88 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 89 - "convert-database.mjs"
Cohesion: 0.27
Nodes (12): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), parseSchema() (+4 more)

### Community 90 - "public-contact.ts"
Cohesion: 0.24
Nodes (11): POST(), result(), sites, contactEmailDesign(), contactCopy, ContactSubmission, contactTopics, supportEmail (+3 more)

### Community 91 - "[resource]/page.tsx"
Cohesion: 0.22
Nodes (12): generateMetadata(), getPage(), isResource(), MarketingResource(), Props, calculatorCopy, calculatorDescription, chironGuide (+4 more)

### Community 92 - "documents/route.ts"
Cohesion: 0.24
Nodes (9): jspdf, GET, handler, POST, activeCompanyTariffs(), documentOrigin, drawPdfQr(), renderTariffSheet() (+1 more)

### Community 93 - "settings-model.ts"
Cohesion: 0.18
Nodes (12): isEditableTemplate(), templateIds, emailDesignVersion, EmailSettings, EmailSettingsData, emailSettingsDataSchema, invoiceEdit, paragraph (+4 more)

### Community 94 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 95 - "LoginPageClient.tsx"
Cohesion: 0.32
Nodes (11): dynamic, LoginPage(), CompanyLoginForm(), LoginForm(), LoginPageClient(), LoginPageContent(), RegisterForm(), ResetPasswordForm() (+3 more)

### Community 96 - "DriverGuideSection.tsx"
Cohesion: 0.22
Nodes (11): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+3 more)

### Community 97 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 98 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 99 - "PublicInfo.tsx"
Cohesion: 0.24
Nodes (8): metadata, Page(), metadata, Page(), ContactPanel(), Locale, PublicInfo(), translations

### Community 100 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 101 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 102 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 103 - "EmailTemplatesPanel.tsx"
Cohesion: 0.24
Nodes (5): EmailTemplatesPage(), EmailTemplatesPanel(), languageLabels, Preview, Template

### Community 104 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 105 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 106 - "RegisterForm.tsx"
Cohesion: 0.24
Nodes (8): CredentialsFormData, credentialsSchema, RegisterFormProps, VerificationFormData, verificationSchema, InputOTP, InputOTPGroup, InputOTPSeparator

### Community 107 - "LoginModal.tsx"
Cohesion: 0.22
Nodes (8): LoginModalProps, ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET, LandingLanguage, landingTranslations

### Community 108 - "configure-stripe.mjs"
Cohesion: 0.31
Nodes (7): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys

### Community 109 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 110 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 111 - ""schema".company_change_requests"
Cohesion: 0.28
Nodes (3): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change()

### Community 112 - "20261026_manual_invoices.sql"
Cohesion: 0.36
Nodes (5): manual_invoice_immutable, manual_payment_immutable, "schema".manual_invoice_payments, "schema".manual_invoices, "schema".security_manual_invoice()

### Community 113 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 114 - "sheet.tsx"
Cohesion: 0.28
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 115 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 116 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 117 - "20261115_account_deletion.sql"
Cohesion: 0.36
Nodes (5): clear_account_deletion_notice, "schema".account_deletion_requests, "schema".security_clear_account_deletion_notice(), "schema".security_complete_account_deletion(), "schema".security_request_account_deletion()

### Community 118 - "HomepageAdSlotSection.tsx"
Cohesion: 0.36
Nodes (6): dompurify, dompurify, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 119 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 120 - "driverShiftPdf"
Cohesion: 0.46
Nodes (7): driverShiftPdf(), ensure(), page(), pairs(), paragraph(), section(), table()

### Community 121 - "configure-mail.mjs"
Cohesion: 0.48
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 122 - "ref_node_path"
Cohesion: 0.33
Nodes (3): dir, aad, openPushCredential()

### Community 123 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 124 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 126 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 127 - "20261109_chiron_realtime.sql"
Cohesion: 0.38
Nodes (3): record_trip_shift, trips_company_realtime_platform_ref_idx, trips_driver_realtime_active_idx

### Community 128 - "20261115_contact_approval_alerts.sql"
Cohesion: 0.33
Nodes (4): approval_mail, approval_mail_ready, "schema".approval_mail_outbox, "schema".security_reserve_mail()

### Community 129 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 130 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 131 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 132 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 133 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 137 - ""schema".road_reports"
Cohesion: 0.60
Nodes (4): road_reports_expiry_idx, road_reports_reporter_idx, "schema".road_report_votes, "schema".road_reports

### Community 138 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 139 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 140 - "run"
Cohesion: 0.40
Nodes (5): check(), open(), run(), submit(), ownerKey()

### Community 145 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 146 - "20261114_email_templates.sql"
Cohesion: 0.50
Nodes (3): "schema".email_template_audit, "schema".email_template_settings, "schema".security_reserve_mail()

### Community 148 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 149 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 150 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 153 - "AirportNotices"
Cohesion: 0.83
Nodes (4): AirportNotices(), publish(), refresh(), update()

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

### Community 160 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

### Community 170 - "PortalEnum"
Cohesion: 0.67
Nodes (3): PortalEnum, ADMIN, COMPANY

## Knowledge Gaps
- **867 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+862 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1253 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **67 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _867 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.06507547939616483 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.06107936507936508 - nodes in this community are weakly interconnected._
- **Should `usePreferences` be split into smaller, more focused modules?**
  _Cohesion score 0.09529077117572693 - nodes in this community are weakly interconnected._
- **Should `createPostgrestClient` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.05678346810422282 - nodes in this community are weakly interconnected._
- **Should `useTripController.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05359719645433931 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 193 unresolved internal-endpoint edges and 23 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 299 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
