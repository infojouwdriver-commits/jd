# Graph Report - JOUW DRIVER  (2026-11-15)

## Corpus Check
- 661 files · ~279,844 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3788 nodes · 12764 edges · 205 communities (144 shown, 61 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 246 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0cd40ba8`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- api-utils.ts
- Input
- Button
- next
- email-templates/route.ts
- lib/auth.ts
- usePreferences
- useTripController.ts
- ref_react
- cn
- dependencies
- useAuth
- api.ts
- end/route.ts
- session.tsx
- BackgroundGeolocation
- company-changes.ts
- ReportsPage.tsx
- package.json
- GdprAdminClient.tsx
- preferences.tsx
- sidebar.tsx
- 20261026_invoice_checkout.sql
- api-client.ts
- CookieBanner.tsx
- driver-app/package.json
- _layout.tsx
- driver/taximeter/page.tsx
- PlatformLanding.tsx
- BackgroundGeolocationService.java
- mobile-location.ts
- utils.ts
- use-toast.ts
- RegisterForm.tsx
- dependencies
- mobile/package.json
- stripe-billing.ts
- DriverShifts.tsx
- 20261018_company_lifecycle.sql
- 20261018_subscription_billing.sql
- MarketingEditorial.tsx
- jouww-cutover.mjs
- documents/route.ts
- ref_node_crypto
- 20261019_shift_activity.sql
- invoice-email.ts
- app/layout.tsx
- update-customer-portal.sh
- ClassicFare.tsx
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- pdf-generator.ts
- ref_node_fs
- form.tsx
- submit/route.ts
- DriverRegisterForm.tsx
- TripPointJournal.java
- engine.ts
- [resource]/page.tsx
- vervoerbewijs.ts
- renderer.ts
- compilerOptions
- DriverSettlementCalculator.tsx
- navigation-menu.tsx
- driverShiftPdf
- municipal-test-documents.ts
- welcome-config.ts
- LoginModal.tsx
- SiteAIAgent
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- trip-journal.ts
- code-map.py
- scripts
- command.tsx
- receipt/page.tsx
- RouteMap.tsx
- password/route.ts
- next_api/contracts/route.ts
- 20261019_driver_shifts.sql
- devDependencies
- carousel.tsx
- apply-release.mjs
- convert-database.mjs
- PublicInfo.tsx
- receipts/[token]/route.ts
- scripts
- PickupLocation.tsx
- samples.ts
- DriverGuideSection.tsx
- settings-model.ts
- 20261012_accounts_messages.sql
- chart.tsx
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- marketing-content.ts
- "schema".company_registrations
- FaqPage.tsx
- chat/route.ts
- configure-stripe.mjs
- recover-db-log.mjs
- 20261013_mail_delivery.sql
- "schema".company_change_requests
- 20261026_manual_invoices.sql
- drawer.tsx
- sheet.tsx
- stripe-billing-core.ts
- Override
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- LoginForm.tsx
- [...path]/route.ts
- android.content.Intent
- configure-mail.mjs
- driver-app/tsconfig.json
- LiveMap.tsx
- "schema".company_staff_events
- 20261019_email_identity.sql
- 20261109_chiron_realtime.sql
- 20261115_contact_approval_alerts.sql
- definitions.d.ts
- database-readiness.mjs
- EmailTemplatesPanel
- useAddressSearch.ts
- company-registration.ts
- contract.ts
- invoice-payment-link.ts
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
- driver-activity.ts
- prepare-customer-runtime.sh
- save
- 20261023_app_experience.sql
- scroll-area.tsx
- login/page.tsx
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
1. `createErrorResponse()` - 284 edges
2. `createSuccessResponse()` - 282 edges
3. `generateAdminUserToken()` - 275 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 212 edges
6. `validateRequestBody()` - 173 edges
7. `Button` - 164 edges
8. `createPostgrestClient()` - 141 edges
9. `requestMiddleware()` - 127 edges
10. `useLanguage()` - 114 edges

## Surprising Connections (you probably didn't know these)
- `locate()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `DriverMapView()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `FleetLocation()` --references--> `Location`  [EXTRACTED]
  driver-app/src/FleetLocation.tsx → mobile/plugins/background-geolocation/definitions.d.ts
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

## Communities (205 total, 61 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.06
Nodes (128): bcryptjs, GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE (+120 more)

### Community 1 - "api-utils.ts"
Cohesion: 0.05
Nodes (86): welcomePayload(), zod, GET, PUT, connection, GET, PUT, command (+78 more)

### Community 2 - "Input"
Cohesion: 0.09
Nodes (83): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, CompanyContractsPage(), PlatformContractsPage(), CompaniesPage() (+75 more)

### Community 3 - "Button"
Cohesion: 0.06
Nodes (67): Page(), Page(), Page(), CompanyDashboardPage(), InvoicePayment(), words, ApiResponse, ChatMessage (+59 more)

### Community 4 - "next"
Cohesion: 0.03
Nodes (69): nextConfig, framer-motion, next, AdminLayout(), DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification (+61 more)

### Community 5 - "email-templates/route.ts"
Cohesion: 0.05
Nodes (73): resend, dynamic, GET(), headers, available(), GET, POST, schema (+65 more)

### Community 6 - "lib/auth.ts"
Cohesion: 0.07
Nodes (67): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+59 more)

### Community 7 - "usePreferences"
Cohesion: 0.14
Nodes (51): Account(), ActiveTrip(), invoice(), useActivityFilters(), ActivityFilters(), AddressField(), BillingReminder(), dismissed (+43 more)

### Community 8 - "useTripController.ts"
Cohesion: 0.06
Nodes (52): login(), DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), journalBytes(), assertNativeCryptoReady() (+44 more)

### Community 9 - "ref_react"
Cohesion: 0.06
Nodes (45): lucide-react, Company, PlatformContract, Issued, Company, Distributor, ReceiptEmailSettings(), Trip (+37 more)

### Community 10 - "cn"
Cohesion: 0.05
Nodes (60): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+52 more)

### Community 11 - "dependencies"
Cohesion: 0.03
Nodes (65): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+57 more)

### Community 12 - "useAuth"
Cohesion: 0.09
Nodes (49): sonner, AdminAccountPage(), ChironSyncPage(), FailedTrip, ChironSettingsPage(), connectionButton(), testConnection(), Company (+41 more)

### Community 13 - "api.ts"
Cohesion: 0.07
Nodes (46): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead() (+38 more)

### Community 14 - "end/route.ts"
Cohesion: 0.11
Nodes (30): POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST, POST, canonicalChironEnvironment(), chironDestination() (+22 more)

### Community 15 - "session.tsx"
Cohesion: 0.08
Nodes (35): App(), logout(), styles, ActionGate, createActionGate(), apiConnectionKey(), DriverProfile, DriverTripSummary (+27 more)

### Community 16 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 17 - "company-changes.ts"
Cohesion: 0.09
Nodes (30): POST, PUT, changeFingerprint(), changesGET, changesPUT, fleetChange(), submitCompanyChange(), vehicleFields (+22 more)

### Community 18 - "ReportsPage.tsx"
Cohesion: 0.08
Nodes (32): Page(), Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps (+24 more)

### Community 19 - "package.json"
Cohesion: 0.05
Nodes (40): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+32 more)

### Community 20 - "GdprAdminClient.tsx"
Cohesion: 0.09
Nodes (34): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), GdprAdminPage(), metadata (+26 more)

### Community 21 - "preferences.tsx"
Cohesion: 0.09
Nodes (27): RoadArt(), BrandMark(), icon, companyCopy, copy, CopyKey, Language, JourneyMark() (+19 more)

### Community 22 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 23 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 24 - "api-client.ts"
Cohesion: 0.10
Nodes (27): Company, Contract, Signature, ContractPrintPage(), PrintableContract, ContractReview, SignContractPage(), ContractDocument() (+19 more)

### Community 25 - "CookieBanner.tsx"
Cohesion: 0.10
Nodes (29): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+21 more)

### Community 26 - "driver-app/package.json"
Cohesion: 0.06
Nodes (30): eslint, react, react-dom, @types/react, typescript, main, name, overrides (+22 more)

### Community 27 - "_layout.tsx"
Cohesion: 0.09
Nodes (26): Period, periodDates(), validDay(), validRange(), DriverMessage, DriverNotification, Layout(), Navigation() (+18 more)

### Community 28 - "driver/taximeter/page.tsx"
Cohesion: 0.11
Nodes (29): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard(), LocationPoint (+21 more)

### Community 29 - "PlatformLanding.tsx"
Cohesion: 0.12
Nodes (21): generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, metadata, RegistrationPage(), Cinema() (+13 more)

### Community 30 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 31 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 32 - "utils.ts"
Cohesion: 0.07
Nodes (21): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-slider, react-day-picker, react-resizable-panels, tailwind-merge (+13 more)

### Community 33 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 34 - "RegisterForm.tsx"
Cohesion: 0.16
Nodes (24): CompanyLoginForm(), LoginForm(), LoginPageContent(), CredentialsFormData, credentialsSchema, RegisterForm(), RegisterFormProps, VerificationFormData (+16 more)

### Community 35 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+19 more)

### Community 36 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 37 - "stripe-billing.ts"
Cohesion: 0.17
Nodes (23): stripe, runtime, runtime, Checkout, Client, closeInvoiceCheckout(), invoiceCheckout(), invoiceRpc() (+15 more)

### Community 38 - "DriverShifts.tsx"
Cohesion: 0.13
Nodes (21): ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy, DriverShift, km (+13 more)

### Community 39 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 40 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 41 - "MarketingEditorial.tsx"
Cohesion: 0.19
Nodes (21): dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props, SolutionPage() (+13 more)

### Community 42 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 43 - "documents/route.ts"
Cohesion: 0.14
Nodes (20): Company, GET, handler, POST, activeCompanyTariffs(), CompanyPricing, companyPricingPatch(), CompanyTariff (+12 more)

### Community 44 - "ref_node_crypto"
Cohesion: 0.12
Nodes (14): dir, aad, openPushCredential(), [id,output], copy, decryptPushToken(), fcmAccessToken(), fcmPayload() (+6 more)

### Community 45 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 46 - "invoice-email.ts"
Cohesion: 0.17
Nodes (18): qrcode, qrcode, register(), copy, invoiceDesign(), InvoiceEmailData, InvoiceMailPurpose, BankInstructions (+10 more)

### Community 47 - "app/layout.tsx"
Cohesion: 0.12
Nodes (17): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, DriverLayoutShell(), GlobalClientEffects() (+9 more)

### Community 48 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 49 - "ClassicFare.tsx"
Cohesion: 0.17
Nodes (19): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, FarePreview, same() (+11 more)

### Community 50 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 51 - "20261024_stripe_billing.sql"
Cohesion: 0.15
Nodes (14): "schema".security_stripe_allocate(), "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts (+6 more)

### Community 52 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 53 - "ref_node_fs"
Cohesion: 0.13
Nodes (9): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+1 more)

### Community 54 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 55 - "submit/route.ts"
Cohesion: 0.17
Nodes (16): POST(), result(), sites, approvalPath(), ApprovalTab, approvalTabs, ApprovalAlert, approvalEmailDesign() (+8 more)

### Community 56 - "DriverRegisterForm.tsx"
Cohesion: 0.12
Nodes (21): DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data, step1Schema, Step2Data, step2Schema (+13 more)

### Community 58 - "engine.ts"
Cohesion: 0.21
Nodes (17): gsap, three, mountCinema(), render(), resize(), optimize(), Pose, poses (+9 more)

### Community 59 - "[resource]/page.tsx"
Cohesion: 0.19
Nodes (16): generateMetadata(), getPage(), isResource(), MarketingResource(), Props, sitemap(), marketingTopics, calculatorCopy (+8 more)

### Community 61 - "vervoerbewijs.ts"
Cohesion: 0.20
Nodes (14): jspdf, configurePdfFonts(), chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs() (+6 more)

### Community 62 - "renderer.ts"
Cohesion: 0.14
Nodes (18): Draft, editableTemplateIds, emailBrand, EmailDesignId, EmailEdits, emailLanguages, emailMessageHtml(), escapeEmail() (+10 more)

### Community 63 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 64 - "DriverSettlementCalculator.tsx"
Cohesion: 0.19
Nodes (12): DriverSettlementCalculator(), download(), fields, summary, MarketingLocale, calculatorText(), calculateSettlement(), cents() (+4 more)

### Community 65 - "navigation-menu.tsx"
Cohesion: 0.14
Nodes (16): class-variance-authority, @radix-ui/react-navigation-menu, @radix-ui/react-toggle, @radix-ui/react-toggle-group, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList (+8 more)

### Community 66 - "driverShiftPdf"
Cohesion: 0.15
Nodes (16): jose, apply, headers, url, close(), send(), driverShiftPdf(), ensure() (+8 more)

### Community 67 - "municipal-test-documents.ts"
Cohesion: 0.25
Nodes (15): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+7 more)

### Community 68 - "welcome-config.ts"
Cohesion: 0.22
Nodes (15): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster() (+7 more)

### Community 69 - "LoginModal.tsx"
Cohesion: 0.14
Nodes (14): dompurify, dompurify, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), LoginModalProps, ModeEnum, DRIVER_REGISTER (+6 more)

### Community 70 - "SiteAIAgent"
Cohesion: 0.19
Nodes (18): apiFetch(), buildApiUrl(), detectChangeIntent(), detectSearchIntent(), formatEntityInfo(), generateId(), SiteAIAgent(), addAssistantMessage() (+10 more)

### Community 72 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 73 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 74 - "trip-journal.ts"
Cohesion: 0.23
Nodes (14): browserJournals, createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save() (+6 more)

### Community 75 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 76 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 77 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 78 - "receipt/page.tsx"
Cohesion: 0.26
Nodes (13): ReceiptPage(), ReceiptWorkspace(), ExperienceFrame(), ExperienceGauge(), experienceWords, HomeInstruments(), ReceiptPrinter(), ReferenceMeter() (+5 more)

### Community 79 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 80 - "password/route.ts"
Cohesion: 0.26
Nodes (11): POST, PUT, POST, GET, POST, credentials, saveCompanyAccount(), accessibleMessage() (+3 more)

### Community 81 - "next_api/contracts/route.ts"
Cohesion: 0.36
Nodes (14): PUT, DELETE, document(), failed(), GET, positiveId(), POST, PUT (+6 more)

### Community 82 - "20261019_driver_shifts.sql"
Cohesion: 0.25
Nodes (11): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_driver_shifts() (+3 more)

### Community 83 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+7 more)

### Community 84 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 85 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 86 - "convert-database.mjs"
Cohesion: 0.27
Nodes (12): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), parseSchema() (+4 more)

### Community 87 - "PublicInfo.tsx"
Cohesion: 0.20
Nodes (10): metadata, Page(), metadata, Page(), metadata, PrivacyPolicyPage(), ContactPanel(), Locale (+2 more)

### Community 88 - "receipts/[token]/route.ts"
Cohesion: 0.25
Nodes (12): dynamic, GET(), headers, runtime, getVervoerbewijsArrayBuffer(), VervoerbewijsData, documentOrigin, receiptCapability() (+4 more)

### Community 89 - "scripts"
Cohesion: 0.13
Nodes (14): devDependencies, eslint, eslint-config-expo, @types/react, typescript, scripts, android, ios (+6 more)

### Community 90 - "PickupLocation.tsx"
Cohesion: 0.26
Nodes (12): search(), Failure, messages, locate(), coordinate(), createAddressSearch(), freshSearchPoint(), NativeAddress (+4 more)

### Community 91 - "samples.ts"
Cohesion: 0.25
Nodes (11): copy, verificationDesign(), VerificationPurpose, driverReportDesign(), reports, tripReceiptDesign(), EmailDesign, EmailLanguage (+3 more)

### Community 92 - "DriverGuideSection.tsx"
Cohesion: 0.22
Nodes (11): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+3 more)

### Community 93 - "settings-model.ts"
Cohesion: 0.19
Nodes (11): templateIds, emailDesignVersion, EmailSettings, EmailSettingsData, emailSettingsDataSchema, invoiceEdit, paragraph, saveEmailSettingsSchema (+3 more)

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

### Community 98 - "marketing-content.ts"
Cohesion: 0.22
Nodes (6): metadata, Benefit, LocaleCopy, marketingOrigin, Question, SolutionCopy

### Community 99 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 100 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 101 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 102 - "configure-stripe.mjs"
Cohesion: 0.31
Nodes (7): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys

### Community 103 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 104 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 105 - ""schema".company_change_requests"
Cohesion: 0.28
Nodes (3): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change()

### Community 106 - "20261026_manual_invoices.sql"
Cohesion: 0.36
Nodes (5): manual_invoice_immutable, manual_payment_immutable, "schema".manual_invoice_payments, "schema".manual_invoices, "schema".security_manual_invoice()

### Community 107 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 108 - "sheet.tsx"
Cohesion: 0.28
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 109 - "stripe-billing-core.ts"
Cohesion: 0.36
Nodes (8): assertStripeInvoice(), finiteSchedule(), stripeCycleAt(), StripeEnrollment, stripeEvents, stripePaymentRequest(), StripePaymentReview, verifiedStripeReceipt()

### Community 111 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 112 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 113 - "LoginForm.tsx"
Cohesion: 0.29
Nodes (6): @hookform/resolvers, react-hook-form, GoogleLoginButton(), LoginFormData, LoginFormProps, loginSchema

### Community 114 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 116 - "configure-mail.mjs"
Cohesion: 0.48
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 117 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 118 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 120 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 121 - "20261109_chiron_realtime.sql"
Cohesion: 0.38
Nodes (3): record_trip_shift, trips_company_realtime_platform_ref_idx, trips_driver_realtime_active_idx

### Community 122 - "20261115_contact_approval_alerts.sql"
Cohesion: 0.33
Nodes (4): approval_mail, approval_mail_ready, "schema".approval_mail_outbox, "schema".security_reserve_mail()

### Community 123 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 124 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 125 - "EmailTemplatesPanel"
Cohesion: 0.33
Nodes (3): EmailTemplatesPage(), EmailTemplatesPanel(), isEditableTemplate()

### Community 126 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 127 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 128 - "contract.ts"
Cohesion: 0.43
Nodes (5): contractInvitation(), contractDesign(), ContractEmailData, copy, SignatureEvidence

### Community 129 - "invoice-payment-link.ts"
Cohesion: 0.43
Nodes (6): claims, InvoiceLink, invoicePaymentUrl(), mac(), readInvoiceLink(), signInvoiceLink()

### Community 130 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 131 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 132 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

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

### Community 144 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 145 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 146 - "save"
Cohesion: 0.50
Nodes (4): clearForm(), commit(), retry(), save()

### Community 148 - "scroll-area.tsx"
Cohesion: 0.67
Nodes (3): @radix-ui/react-scroll-area, ScrollArea, ScrollBar

### Community 149 - "login/page.tsx"
Cohesion: 0.67
Nodes (3): dynamic, LoginPage(), LoginPageClient()

### Community 150 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 151 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 152 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 153 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 154 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 155 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

### Community 156 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

### Community 165 - "PortalEnum"
Cohesion: 0.67
Nodes (3): PortalEnum, ADMIN, COMPANY

## Knowledge Gaps
- **807 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+802 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1163 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **61 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DashboardClient()` connect `GdprAdminClient.tsx` to `useAuth`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _807 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.06485317960727797 - nodes in this community are weakly interconnected._
- **Why does `DriverDashboard()` connect `useAuth` to `api-client.ts`, `Input`, `Button`, `GdprAdminClient.tsx`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `api-utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.04580152671755725 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.0873258579680598 - nodes in this community are weakly interconnected._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.06067961165048544 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 174 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 273 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
