# Graph Report - JOUW DRIVER  (2026-11-19)

## Corpus Check
- 680 files · ~287,454 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3890 nodes · 13183 edges · 205 communities (143 shown, 62 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `302f5121`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- ref_react
- createPostgrestClient
- admin/messages/page.tsx
- useTripController.ts
- usePreferences
- Input
- ref_zod
- session.tsx
- useAuth
- lib/auth.ts
- api.ts
- LanguageContext.tsx
- cn
- dependencies
- api-client.ts
- next
- end/route.ts
- stripe-billing.ts
- api-utils.ts
- package.json
- Shifts.tsx
- BackgroundGeolocation
- DriverMap.tsx
- preferences.tsx
- company-changes.ts
- dependencies
- sidebar.tsx
- 20261026_invoice_checkout.sql
- utils.ts
- BackgroundGeolocationService.java
- mobile-location.ts
- MarketingEditorial.tsx
- use-toast.ts
- driver/taximeter/page.tsx
- vervoerbewijs.ts
- DriverShifts.tsx
- mobile/package.json
- FeaturePageLayout
- 20261018_company_lifecycle.sql
- 20261018_subscription_billing.sql
- samples.ts
- jouww-cutover.mjs
- command.tsx
- DriverRegisterForm.tsx
- 20261019_shift_activity.sql
- ref_node_fs
- update-customer-portal.sh
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- engine.ts
- pdf-generator.ts
- form.tsx
- TripPointJournal.java
- DriverGuideSection.tsx
- renderer.ts
- driverShiftPdf
- company-pricing.ts
- PlatformLanding.tsx
- compilerOptions
- DriverSettlementCalculator.tsx
- municipal-test-documents.ts
- company-registrations/route.ts
- SiteAIAgent
- approval-mail-scheduler.ts
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- password/route.ts
- RegisterForm.tsx
- trip-journal.ts
- code-map.py
- welcome-config.ts
- scripts
- receipt/page.tsx
- RouteMap.tsx
- 20261019_driver_shifts.sql
- devDependencies
- carousel.tsx
- apply-release.mjs
- convert-database.mjs
- PublicInfo.tsx
- submit/route.ts
- [resource]/page.tsx
- [locale]/page.tsx
- LoginPageClient.tsx
- LoginForm.tsx
- push-worker.mjs
- settings-model.ts
- activity-state.tsx
- 20261012_accounts_messages.sql
- framer-motion
- chart.tsx
- marketing-content.ts
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- "schema".company_registrations
- jspdf
- EmailTemplatesPanel.tsx
- FaqPage.tsx
- chat/route.ts
- pagination.tsx
- configure-stripe.mjs
- recover-db-log.mjs
- 20261013_mail_delivery.sql
- "schema".company_change_requests
- 20261026_manual_invoices.sql
- drawer.tsx
- Override
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- 20261115_account_deletion.sql
- InvoicesFeaturePage.tsx
- ReportsPage.tsx
- TripManagementPage.tsx
- [...path]/route.ts
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
- useAddressSearch.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- AccountDeletion
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
- ModeEnum
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- 20261023_app_experience.sql
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
- preflight.mjs
- global-error.tsx
- PortalEnum
- backup-foundation.sh
- import-private-archive.sh
- Package.swift
- onboarding-copy.ts

## God Nodes (most connected - your core abstractions)
1. `createErrorResponse()` - 293 edges
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

## Communities (205 total, 62 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (122): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+114 more)

### Community 1 - "ref_react"
Cohesion: 0.05
Nodes (76): DriverRequestCard(), ChironSyncPage(), FailedTrip, Page(), Page(), Page(), CompanyDashboardPage(), ContractPrintPage() (+68 more)

### Community 2 - "createPostgrestClient"
Cohesion: 0.05
Nodes (74): welcomePayload(), GET, PUT, GET, handler, POST, GET, PUT (+66 more)

### Community 3 - "admin/messages/page.tsx"
Cohesion: 0.07
Nodes (83): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, EmptyState(), GeneralRequestCard(), CompanyContractsPage(), Company, Distributor (+75 more)

### Community 4 - "useTripController.ts"
Cohesion: 0.06
Nodes (62): App(), login(), styles, ActionGate, createActionGate(), DriverProfile, DriverVehicle, Context (+54 more)

### Community 5 - "usePreferences"
Cohesion: 0.13
Nodes (56): DriverMap(), Account(), ActiveTrip(), ActiveTripMap(), guidance, styles, useActivityFilters(), ActivityFilters() (+48 more)

### Community 6 - "Input"
Cohesion: 0.08
Nodes (59): sameWelcomeContent(), WELCOME_LANGUAGES, AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, CompaniesPage() (+51 more)

### Community 7 - "ref_zod"
Cohesion: 0.05
Nodes (64): dynamic, GET(), headers, GET, POST, schema, POST, schema (+56 more)

### Community 8 - "session.tsx"
Cohesion: 0.05
Nodes (64): logout(), eslint, react, react-dom, @types/react, typescript, zod, main (+56 more)

### Community 9 - "useAuth"
Cohesion: 0.08
Nodes (55): sonner, DeletionStatusPage(), AccountDeletionsPage(), formatDate(), Request, AdminAccountPage(), ChironSettingsPage(), connectionButton() (+47 more)

### Community 10 - "lib/auth.ts"
Cohesion: 0.09
Nodes (57): bcryptjs, GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates() (+49 more)

### Community 11 - "api.ts"
Cohesion: 0.05
Nodes (49): AccountDeletionStatus, AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, CompanyRegistrationReceipt, createDriverApi() (+41 more)

### Community 12 - "LanguageContext.tsx"
Cohesion: 0.05
Nodes (52): next-themes, DriverProfileRoute(), dynamic, metadata, RootLayout(), viewport, PrivacyCenter(), ApiResponse (+44 more)

### Community 13 - "cn"
Cohesion: 0.05
Nodes (58): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, @radix-ui/react-menubar, @radix-ui/react-radio-group, react-resizable-panels, AccordionContent (+50 more)

### Community 14 - "dependencies"
Cohesion: 0.03
Nodes (65): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+57 more)

### Community 15 - "api-client.ts"
Cohesion: 0.06
Nodes (48): DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), glassCard, labelStyle (+40 more)

### Community 16 - "next"
Cohesion: 0.06
Nodes (38): nextConfig, lucide-react, next, AdminLayout(), DashboardPage(), DriverLayout(), Company, Invoice (+30 more)

### Community 17 - "end/route.ts"
Cohesion: 0.10
Nodes (31): connection, POST, POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST, POST (+23 more)

### Community 18 - "stripe-billing.ts"
Cohesion: 0.08
Nodes (49): stripe, runtime, runtime, InvoiceMailPurpose, BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState (+41 more)

### Community 19 - "api-utils.ts"
Cohesion: 0.07
Nodes (43): POST, VALID_TYPES, GET, normalizeUrlPreview(), ApiParams, appendCorsHeaders(), clearCookie(), extractBearerToken() (+35 more)

### Community 20 - "package.json"
Cohesion: 0.04
Nodes (48): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+40 more)

### Community 21 - "Shifts.tsx"
Cohesion: 0.08
Nodes (35): driverApi, nativeShiftCopy, shiftReadingCopy, Context, ShiftProvider(), useShiftState(), submit(), start() (+27 more)

### Community 22 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 23 - "DriverMap.tsx"
Cohesion: 0.08
Nodes (41): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), showWholeRoute(), navigationBasemap, RouteStatus (+33 more)

### Community 24 - "preferences.tsx"
Cohesion: 0.07
Nodes (34): DriverMessage, DriverNotification, Layout(), Navigation(), companyCopy, copy, CopyKey, Language (+26 more)

### Community 25 - "company-changes.ts"
Cohesion: 0.10
Nodes (28): POST, schema, POST, POST, PUT, changeFingerprint(), changesGET, changesPUT (+20 more)

### Community 26 - "dependencies"
Cohesion: 0.04
Nodes (43): dependencies, expo, expo-application, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking (+35 more)

### Community 27 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 28 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 29 - "utils.ts"
Cohesion: 0.08
Nodes (26): class-variance-authority, clsx, @radix-ui/react-navigation-menu, @radix-ui/react-progress, @radix-ui/react-scroll-area, @radix-ui/react-toggle, @radix-ui/react-toggle-group, tailwind-merge (+18 more)

### Community 30 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 31 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 32 - "MarketingEditorial.tsx"
Cohesion: 0.17
Nodes (24): dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props, SolutionPage() (+16 more)

### Community 33 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 34 - "driver/taximeter/page.tsx"
Cohesion: 0.13
Nodes (26): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard(), LocationPoint (+18 more)

### Community 35 - "vervoerbewijs.ts"
Cohesion: 0.13
Nodes (23): dynamic, GET(), headers, runtime, chironColor(), chironLabel(), fmtDateTime(), fmtGps() (+15 more)

### Community 36 - "DriverShifts.tsx"
Cohesion: 0.15
Nodes (21): ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy, DriverShift, km (+13 more)

### Community 37 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 38 - "FeaturePageLayout"
Cohesion: 0.13
Nodes (19): Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps, FeaturePageLayout(), FeaturePageLayoutProps, contentFr (+11 more)

### Community 39 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 40 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 41 - "samples.ts"
Cohesion: 0.15
Nodes (20): contractInvitation(), copy, verificationDesign(), VerificationPurpose, contractDesign(), ContractEmailData, copy, SignatureEvidence (+12 more)

### Community 42 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 43 - "command.tsx"
Cohesion: 0.10
Nodes (22): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+14 more)

### Community 44 - "DriverRegisterForm.tsx"
Cohesion: 0.11
Nodes (23): DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data, step1Schema, Step2Data, step2Schema (+15 more)

### Community 45 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 46 - "ref_node_fs"
Cohesion: 0.12
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 47 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 48 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 49 - "20261024_stripe_billing.sql"
Cohesion: 0.15
Nodes (14): "schema".security_stripe_allocate(), "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts (+6 more)

### Community 50 - "engine.ts"
Cohesion: 0.19
Nodes (19): qrcode, gsap, qrcode, three, mountCinema(), render(), resize(), optimize() (+11 more)

### Community 51 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 52 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 54 - "DriverGuideSection.tsx"
Cohesion: 0.14
Nodes (17): dompurify, dompurify, DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep (+9 more)

### Community 55 - "renderer.ts"
Cohesion: 0.14
Nodes (19): Draft, editableTemplateIds, emailBrand, EmailDesignId, EmailEdits, emailLanguages, emailMessageHtml(), escapeEmail() (+11 more)

### Community 57 - "driverShiftPdf"
Cohesion: 0.16
Nodes (17): jose, apply, headers, url, close(), send(), driverShiftPdf(), ensure() (+9 more)

### Community 58 - "company-pricing.ts"
Cohesion: 0.18
Nodes (17): Company, CompanyPricing, companyPricingPatch(), CompanyTariff, companyTariffs(), defaults, driverPricing(), normalizeCompanyPricing() (+9 more)

### Community 59 - "PlatformLanding.tsx"
Cohesion: 0.18
Nodes (13): metadata, RegistrationPage(), Cinema(), cinematicCopy, CinematicText, downloadCopy, PlatformLanding(), openRegistration() (+5 more)

### Community 60 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 61 - "DriverSettlementCalculator.tsx"
Cohesion: 0.19
Nodes (12): DriverSettlementCalculator(), download(), fields, summary, MarketingLocale, calculatorText(), calculateSettlement(), cents() (+4 more)

### Community 62 - "municipal-test-documents.ts"
Cohesion: 0.25
Nodes (15): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+7 more)

### Community 63 - "company-registrations/route.ts"
Cohesion: 0.32
Nodes (15): PUT, review, DELETE, document(), failed(), GET, positiveId(), POST (+7 more)

### Community 64 - "SiteAIAgent"
Cohesion: 0.19
Nodes (18): apiFetch(), buildApiUrl(), detectChangeIntent(), detectSearchIntent(), formatEntityInfo(), generateId(), SiteAIAgent(), addAssistantMessage() (+10 more)

### Community 65 - "approval-mail-scheduler.ts"
Cohesion: 0.20
Nodes (14): register(), accountDeletionPage, approvalPath(), approvalReturnPath(), ApprovalTab, approvalTabs, approvalTarget(), sendPendingApprovalAlerts() (+6 more)

### Community 67 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 68 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 69 - "password/route.ts"
Cohesion: 0.24
Nodes (11): POST, PUT, GET, GET, POST, credentials, saveCompanyAccount(), accessibleMessage() (+3 more)

### Community 70 - "RegisterForm.tsx"
Cohesion: 0.16
Nodes (14): CredentialsFormData, credentialsSchema, RegisterFormProps, VerificationFormData, verificationSchema, EmailFormData, emailSchema, ResetPasswordFormData (+6 more)

### Community 71 - "trip-journal.ts"
Cohesion: 0.23
Nodes (14): browserJournals, createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save() (+6 more)

### Community 72 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 73 - "welcome-config.ts"
Cohesion: 0.24
Nodes (12): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), validWelcomePoster(), WelcomeLanguage (+4 more)

### Community 74 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 75 - "receipt/page.tsx"
Cohesion: 0.26
Nodes (13): ReceiptPage(), ReceiptWorkspace(), ExperienceFrame(), ExperienceGauge(), experienceWords, HomeInstruments(), ReceiptPrinter(), ReferenceMeter() (+5 more)

### Community 76 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 77 - "20261019_driver_shifts.sql"
Cohesion: 0.25
Nodes (11): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_driver_shifts() (+3 more)

### Community 78 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+7 more)

### Community 79 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 80 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 81 - "convert-database.mjs"
Cohesion: 0.27
Nodes (12): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), parseSchema() (+4 more)

### Community 82 - "PublicInfo.tsx"
Cohesion: 0.20
Nodes (10): metadata, Page(), metadata, Page(), metadata, PrivacyPolicyPage(), ContactPanel(), Locale (+2 more)

### Community 83 - "submit/route.ts"
Cohesion: 0.24
Nodes (11): POST(), result(), sites, contactEmailDesign(), contactCopy, ContactSubmission, contactTopics, supportEmail (+3 more)

### Community 84 - "[resource]/page.tsx"
Cohesion: 0.22
Nodes (12): generateMetadata(), getPage(), isResource(), MarketingResource(), Props, calculatorCopy, calculatorDescription, chironGuide (+4 more)

### Community 85 - "[locale]/page.tsx"
Cohesion: 0.24
Nodes (9): generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, homeAlternates, homepageMetadata(), homepageSchema() (+1 more)

### Community 86 - "LoginPageClient.tsx"
Cohesion: 0.31
Nodes (11): dynamic, LoginPage(), CompanyLoginForm(), LoginForm(), LoginPageClient(), LoginPageContent(), RegisterForm(), ResetPasswordForm() (+3 more)

### Community 87 - "LoginForm.tsx"
Cohesion: 0.19
Nodes (10): close(), @hookform/resolvers, react-hook-form, GoogleLoginButton(), LoginFormData, LoginFormProps, loginSchema, Alert (+2 more)

### Community 88 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 89 - "settings-model.ts"
Cohesion: 0.19
Nodes (11): templateIds, emailDesignVersion, EmailSettings, EmailSettingsData, emailSettingsDataSchema, invoiceEdit, paragraph, saveEmailSettingsSchema (+3 more)

### Community 90 - "activity-state.tsx"
Cohesion: 0.26
Nodes (9): Period, periodDates(), validDay(), validRange(), ActivityProvider(), Context, useStateValue(), apply() (+1 more)

### Community 91 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 92 - "framer-motion"
Cohesion: 0.17
Nodes (4): framer-motion, FeatureCardProps, ParallaxSectionProps, StatCounterProps

### Community 93 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 94 - "marketing-content.ts"
Cohesion: 0.20
Nodes (7): metadata, Benefit, LocaleCopy, marketingOrigin, MarketingTopic, Question, SolutionCopy

### Community 95 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 96 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 97 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 98 - "jspdf"
Cohesion: 0.36
Nodes (5): jspdf, configurePdfFonts(), drawPdfQr(), renderTariffSheet(), tariffSheetUrl()

### Community 99 - "EmailTemplatesPanel.tsx"
Cohesion: 0.24
Nodes (5): EmailTemplatesPage(), EmailTemplatesPanel(), languageLabels, Preview, Template

### Community 100 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 101 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 102 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 103 - "configure-stripe.mjs"
Cohesion: 0.31
Nodes (7): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys

### Community 104 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 105 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 106 - ""schema".company_change_requests"
Cohesion: 0.28
Nodes (3): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change()

### Community 107 - "20261026_manual_invoices.sql"
Cohesion: 0.36
Nodes (5): manual_invoice_immutable, manual_payment_immutable, "schema".manual_invoice_payments, "schema".manual_invoices, "schema".security_manual_invoice()

### Community 108 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 110 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 111 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 112 - "20261115_account_deletion.sql"
Cohesion: 0.36
Nodes (5): clear_account_deletion_notice, "schema".account_deletion_requests, "schema".security_clear_account_deletion_notice(), "schema".security_complete_account_deletion(), "schema".security_request_account_deletion()

### Community 113 - "InvoicesFeaturePage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, InvoicesFeaturePage(), PublicStats

### Community 114 - "ReportsPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, ReportsPage()

### Community 115 - "TripManagementPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, TripManagementPage()

### Community 116 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 118 - "configure-mail.mjs"
Cohesion: 0.48
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 119 - "ref_node_path"
Cohesion: 0.33
Nodes (3): dir, aad, openPushCredential()

### Community 120 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 121 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

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

### Community 127 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 128 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 129 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 130 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 131 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 132 - "AccountDeletion"
Cohesion: 0.53
Nodes (6): AccountDeletion(), check(), open(), run(), submit(), ownerKey()

### Community 136 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 137 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 142 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 143 - "20261114_email_templates.sql"
Cohesion: 0.50
Nodes (3): "schema".email_template_audit, "schema".email_template_settings, "schema".security_reserve_mail()

### Community 144 - "ModeEnum"
Cohesion: 0.40
Nodes (5): ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET

### Community 145 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 146 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 147 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 149 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 150 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 151 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 152 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 153 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 154 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

### Community 155 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

### Community 164 - "PortalEnum"
Cohesion: 0.67
Nodes (3): PortalEnum, ADMIN, COMPANY

## Knowledge Gaps
- **824 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+819 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1187 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **62 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sendPendingApprovalAlerts()` connect `approval-mail-scheduler.ts` to `createErrorResponse`, `createPostgrestClient`, `ref_zod`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _824 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07085543315653475 - nodes in this community are weakly interconnected._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.053978408636545384 - nodes in this community are weakly interconnected._
- **Should `createPostgrestClient` be split into smaller, more focused modules?**
  _Cohesion score 0.04715590922487474 - nodes in this community are weakly interconnected._
- **Should `admin/messages/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06645898234683281 - nodes in this community are weakly interconnected._
- **Should `useTripController.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.055482456140350876 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 174 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 289 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
