# Graph Report - JOUW DRIVER  (2026-11-18)

## Corpus Check
- 677 files · ~286,736 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3876 nodes · 13138 edges · 199 communities (138 shown, 61 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f9901ec9`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- createPostgrestClient
- api-utils.ts
- Button
- lucide-react
- usePreferences
- Input
- useAuth
- next
- authCrudOperations
- stripe-billing.ts
- driver/taximeter/page.tsx
- cn
- dependencies
- useTripController.ts
- ui.tsx
- end/route.ts
- api.ts
- validateRequestBody
- SiteAIAgent.tsx
- BackgroundGeolocation
- ref_react
- package.json
- driver-app/package.json
- dependencies
- mobile-location.ts
- sidebar.tsx
- session.tsx
- 20261026_invoice_checkout.sql
- PlatformLanding.tsx
- CookieBanner.tsx
- marketing-content.ts
- mail-service.ts
- experience/AccountDeletion.tsx
- ref_node_fs
- CompanyRegistration.tsx
- BackgroundGeolocationService.java
- convert-database.mjs
- companies/route.ts
- utils.ts
- use-toast.ts
- _layout.tsx
- mobile/package.json
- DriverShifts.tsx
- FeaturePageLayout
- samples.ts
- 20261018_company_lifecycle.sql
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- public-contact.ts
- email-templates/route.ts
- DriverMap.tsx
- 20261019_shift_activity.sql
- pdf-generator.ts
- update-customer-portal.sh
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- engine.ts
- form.tsx
- DriverRegisterForm.tsx
- TripPointJournal.java
- DriverGuideSection.tsx
- ref_node_crypto
- compilerOptions
- DriverSettlementCalculator.tsx
- navigation-menu.tsx
- [resource]/page.tsx
- renderer.ts
- municipal-test-documents.ts
- AddressField.tsx
- welcome-config.ts
- jspdf
- BackgroundGeolocation
- CompanyLoginForm.tsx
- "schema".security_operations_centre
- 20261016_native_push.sql
- RegisterForm.tsx
- code-map.py
- scripts
- command.tsx
- next_api/contracts/route.ts
- 20261019_driver_shifts.sql
- devDependencies
- carousel.tsx
- api-client.ts
- RouteMap.tsx
- driverShiftPdf
- push-worker.mjs
- LoginPageClient.tsx
- vervoerbewijs.ts
- 20261012_accounts_messages.sql
- framer-motion
- chart.tsx
- submit/route.ts
- createTripJournal
- "schema".security_fleet_locations
- "schema".company_registrations
- receipts/[token]/route.ts
- FaqPage.tsx
- chat/route.ts
- LoginModal.tsx
- recover-db-log.mjs
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
- InvoicesFeaturePage.tsx
- ReportsPage.tsx
- TripManagementPage.tsx
- [...path]/route.ts
- android.content.Intent
- driver-app/tsconfig.json
- "schema".company_staff_events
- 20261019_email_identity.sql
- 20261109_chiron_realtime.sql
- 20261115_contact_approval_alerts.sql
- definitions.d.ts
- brevo/route.ts
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
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- 20261023_app_experience.sql
- scroll-area.tsx
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

## Communities (199 total, 61 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.08
Nodes (119): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, GET, resolveDistributorInfo() (+111 more)

### Community 1 - "createPostgrestClient"
Cohesion: 0.05
Nodes (71): welcomePayload(), GET, PUT, command, POST, filters, GET, POST (+63 more)

### Community 2 - "api-utils.ts"
Cohesion: 0.06
Nodes (59): POST, POST, registrationSchema, runtime, GET, GET, POST, GET (+51 more)

### Community 3 - "Button"
Cohesion: 0.06
Nodes (68): DriverRequestCard(), Page(), Page(), Page(), CompanyDashboardPage(), ContractPrintPage(), PrintableContract, InvoicePayment() (+60 more)

### Community 4 - "lucide-react"
Cohesion: 0.08
Nodes (75): lucide-react, ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, EmptyState(), GeneralRequestCard(), Company, CompanyContractsPage() (+67 more)

### Community 5 - "usePreferences"
Cohesion: 0.13
Nodes (52): Account(), ActiveTrip(), ActiveTripMap(), useActivityFilters(), ActivityFilters(), BillingReminder(), dismissed, ClassicDisplay() (+44 more)

### Community 6 - "Input"
Cohesion: 0.08
Nodes (57): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, CompaniesPage(), CompaniesPageContent(), Company (+49 more)

### Community 7 - "useAuth"
Cohesion: 0.07
Nodes (60): sonner, AccountDeletionsPage(), formatDate(), Request, AdminAccountPage(), ChironSyncPage(), FailedTrip, ChironSettingsPage() (+52 more)

### Community 8 - "next"
Cohesion: 0.05
Nodes (61): nextConfig, next, AdminLayout(), DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission() (+53 more)

### Community 9 - "authCrudOperations"
Cohesion: 0.08
Nodes (62): bcryptjs, GET, PUT, available(), GET, POST, schema, driverLoginSchema (+54 more)

### Community 10 - "stripe-billing.ts"
Cohesion: 0.07
Nodes (59): qrcode, stripe, runtime, runtime, register(), BankInstructions, bankPaymentPayload(), invoiceBankPayload() (+51 more)

### Community 11 - "driver/taximeter/page.tsx"
Cohesion: 0.06
Nodes (55): leaflet, ReceiptPage(), ReceiptWorkspace(), BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance() (+47 more)

### Community 12 - "cn"
Cohesion: 0.05
Nodes (60): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+52 more)

### Community 13 - "dependencies"
Cohesion: 0.03
Nodes (65): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+57 more)

### Community 14 - "useTripController.ts"
Cohesion: 0.09
Nodes (42): ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), Props (+34 more)

### Community 15 - "ui.tsx"
Cohesion: 0.07
Nodes (39): guidance, styles, appVersionLabel(), RoadArt(), BrandMark(), icon, FarePreview, same() (+31 more)

### Community 16 - "end/route.ts"
Cohesion: 0.10
Nodes (32): connection, POST, GET, POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST (+24 more)

### Community 17 - "api.ts"
Cohesion: 0.06
Nodes (44): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead() (+36 more)

### Community 18 - "validateRequestBody"
Cohesion: 0.08
Nodes (39): dynamic, GET(), headers, GET, POST, schema, POST, schema (+31 more)

### Community 19 - "SiteAIAgent.tsx"
Cohesion: 0.06
Nodes (41): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, apiFetch(), ApiResponse (+33 more)

### Community 20 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 21 - "ref_react"
Cohesion: 0.06
Nodes (20): DeletionStatusPage(), Company, CompanyPricingPage(), Issued, EmailTemplatesPage(), ReceiptEmailSettings(), AccountDeletion(), submit() (+12 more)

### Community 22 - "package.json"
Cohesion: 0.04
Nodes (42): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+34 more)

### Community 23 - "driver-app/package.json"
Cohesion: 0.05
Nodes (39): eslint, react, react-dom, @types/react, typescript, zod, main, name (+31 more)

### Community 24 - "dependencies"
Cohesion: 0.04
Nodes (43): dependencies, expo, expo-application, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking (+35 more)

### Community 25 - "mobile-location.ts"
Cohesion: 0.08
Nodes (32): copy, DriverFleetShift(), GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation() (+24 more)

### Community 26 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 27 - "session.tsx"
Cohesion: 0.11
Nodes (28): App(), logout(), styles, createActionGate(), apiConnectionKey(), driverApi, DriverMap(), clearReceiptCache() (+20 more)

### Community 28 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 29 - "PlatformLanding.tsx"
Cohesion: 0.10
Nodes (23): metadata, generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, metadata, RegistrationPage() (+15 more)

### Community 30 - "CookieBanner.tsx"
Cohesion: 0.10
Nodes (29): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+21 more)

### Community 31 - "marketing-content.ts"
Cohesion: 0.15
Nodes (27): dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props, SolutionPage() (+19 more)

### Community 32 - "mail-service.ts"
Cohesion: 0.10
Nodes (27): command, POST, command, POST, POST(), runtime, sendPendingApprovalAlerts(), startApprovalMailScheduler() (+19 more)

### Community 33 - "experience/AccountDeletion.tsx"
Cohesion: 0.09
Nodes (21): login(), AccountDeletionStatus, AccountDeletion(), check(), open(), run(), submit(), secureOptions (+13 more)

### Community 34 - "ref_node_fs"
Cohesion: 0.10
Nodes (16): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv(), checkedStripeSetup(), enabledStripeEvents (+8 more)

### Community 35 - "CompanyRegistration.tsx"
Cohesion: 0.11
Nodes (23): CompanyRegistrationReceipt, apply(), CompanyRegistrationScreen(), advance(), change(), draft(), field(), sendCode() (+15 more)

### Community 36 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 37 - "convert-database.mjs"
Cohesion: 0.13
Nodes (22): files, names, values, main(), convertExport(), EXCLUDED, identifier(), integer() (+14 more)

### Community 38 - "companies/route.ts"
Cohesion: 0.13
Nodes (23): GET, handler, POST, GET, PUT, POST, GET, POST (+15 more)

### Community 39 - "utils.ts"
Cohesion: 0.07
Nodes (21): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-slider, react-day-picker, react-resizable-panels, tailwind-merge (+13 more)

### Community 40 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 41 - "_layout.tsx"
Cohesion: 0.11
Nodes (22): Period, periodDates(), validDay(), validRange(), Layout(), Navigation(), ActivityProvider(), Context (+14 more)

### Community 42 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 43 - "DriverShifts.tsx"
Cohesion: 0.15
Nodes (20): ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy, km, ShiftActivity (+12 more)

### Community 44 - "FeaturePageLayout"
Cohesion: 0.13
Nodes (19): Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps, FeaturePageLayout(), FeaturePageLayoutProps, contentFr (+11 more)

### Community 45 - "samples.ts"
Cohesion: 0.14
Nodes (21): contractInvitation(), copy, verificationDesign(), VerificationPurpose, contractDesign(), ContractEmailData, copy, SignatureEvidence (+13 more)

### Community 46 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 47 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 48 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 49 - "public-contact.ts"
Cohesion: 0.14
Nodes (17): metadata, Page(), metadata, Page(), metadata, PrivacyPolicyPage(), ContactPanel(), Locale (+9 more)

### Community 50 - "email-templates/route.ts"
Cohesion: 0.16
Nodes (22): forbidden(), GET, invalid(), POST, PUT, serviceClient(), emailLanguages, isEditableTemplate() (+14 more)

### Community 51 - "DriverMap.tsx"
Cohesion: 0.16
Nodes (21): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), showWholeRoute(), RouteStatus, token (+13 more)

### Community 52 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 53 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (11): configurePdfFonts(), ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator (+3 more)

### Community 54 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 55 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 56 - "20261024_stripe_billing.sql"
Cohesion: 0.15
Nodes (14): "schema".security_stripe_allocate(), "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts (+6 more)

### Community 57 - "engine.ts"
Cohesion: 0.20
Nodes (18): qrcode, gsap, three, mountCinema(), render(), resize(), optimize(), Pose (+10 more)

### Community 58 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 59 - "DriverRegisterForm.tsx"
Cohesion: 0.12
Nodes (21): DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data, step1Schema, Step2Data, step2Schema (+13 more)

### Community 61 - "DriverGuideSection.tsx"
Cohesion: 0.14
Nodes (17): dompurify, dompurify, DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep (+9 more)

### Community 63 - "ref_node_crypto"
Cohesion: 0.12
Nodes (11): dir, aad, openPushCredential(), base, checks, headers, now, required (+3 more)

### Community 64 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 65 - "DriverSettlementCalculator.tsx"
Cohesion: 0.19
Nodes (12): DriverSettlementCalculator(), download(), fields, summary, MarketingLocale, calculatorText(), calculateSettlement(), cents() (+4 more)

### Community 66 - "navigation-menu.tsx"
Cohesion: 0.14
Nodes (16): class-variance-authority, @radix-ui/react-navigation-menu, @radix-ui/react-toggle, @radix-ui/react-toggle-group, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList (+8 more)

### Community 67 - "[resource]/page.tsx"
Cohesion: 0.20
Nodes (15): generateMetadata(), getPage(), isResource(), MarketingResource(), Props, sitemap(), calculatorCopy, calculatorDescription (+7 more)

### Community 68 - "renderer.ts"
Cohesion: 0.15
Nodes (17): Draft, editableTemplateIds, emailBrand, EmailDesignId, EmailEdits, emailMessageHtml(), escapeEmail(), labels (+9 more)

### Community 69 - "municipal-test-documents.ts"
Cohesion: 0.25
Nodes (15): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+7 more)

### Community 70 - "AddressField.tsx"
Cohesion: 0.27
Nodes (15): AddressField(), search(), Failure, messages, PickupLocation(), locate(), coordinate(), createAddressSearch() (+7 more)

### Community 71 - "welcome-config.ts"
Cohesion: 0.22
Nodes (15): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster() (+7 more)

### Community 72 - "jspdf"
Cohesion: 0.17
Nodes (12): jspdf, Company, CompanyTariff, documentOrigin, drawPdfQr(), Quote, readTariffQuote(), signature() (+4 more)

### Community 74 - "CompanyLoginForm.tsx"
Cohesion: 0.16
Nodes (13): close(), @hookform/resolvers, react-hook-form, CompanyLoginFormData, CompanyLoginFormProps, companyLoginSchema, GoogleLoginButton(), LoginFormData (+5 more)

### Community 75 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 76 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 77 - "RegisterForm.tsx"
Cohesion: 0.16
Nodes (14): CredentialsFormData, credentialsSchema, RegisterFormProps, VerificationFormData, verificationSchema, EmailFormData, emailSchema, ResetPasswordFormData (+6 more)

### Community 78 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 79 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 80 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

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

### Community 85 - "api-client.ts"
Cohesion: 0.27
Nodes (12): apiRequest(), ApiResponse, buildApiUrl(), getLoginPath(), getServerApiBaseUrl(), normalizeBaseUrl(), parseApiResponse(), redirectToLogin() (+4 more)

### Community 86 - "RouteMap.tsx"
Cohesion: 0.22
Nodes (12): RouteCoords, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), DrivingRoute, fetchDrivingRoute() (+4 more)

### Community 87 - "driverShiftPdf"
Cohesion: 0.23
Nodes (11): jose, apply, headers, url, driverShiftPdf(), ensure(), page(), pairs() (+3 more)

### Community 88 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 89 - "LoginPageClient.tsx"
Cohesion: 0.32
Nodes (11): dynamic, LoginPage(), CompanyLoginForm(), LoginForm(), LoginPageClient(), LoginPageContent(), PasswordInput, RegisterForm() (+3 more)

### Community 90 - "vervoerbewijs.ts"
Cohesion: 0.22
Nodes (11): chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs(), VervoerbewijsChiron, VervoerbewijsCompany (+3 more)

### Community 91 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 92 - "framer-motion"
Cohesion: 0.17
Nodes (4): framer-motion, FeatureCardProps, ParallaxSectionProps, StatCounterProps

### Community 93 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 94 - "submit/route.ts"
Cohesion: 0.24
Nodes (10): POST(), result(), sites, accountDeletionPage, approvalPath(), ApprovalTab, ApprovalAlert, approvalEmailDesign() (+2 more)

### Community 95 - "createTripJournal"
Cohesion: 0.38
Nodes (11): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+3 more)

### Community 96 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 97 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 98 - "receipts/[token]/route.ts"
Cohesion: 0.36
Nodes (8): dynamic, GET(), headers, runtime, receiptCapability(), receiptDocumentUrl(), signature(), verifyReceiptCapability()

### Community 99 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 100 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 101 - "LoginModal.tsx"
Cohesion: 0.22
Nodes (8): LoginModalProps, ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET, LandingLanguage, landingTranslations

### Community 102 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 103 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 104 - ""schema".company_change_requests"
Cohesion: 0.28
Nodes (3): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change()

### Community 105 - "20261026_manual_invoices.sql"
Cohesion: 0.36
Nodes (5): manual_invoice_immutable, manual_payment_immutable, "schema".manual_invoice_payments, "schema".manual_invoices, "schema".security_manual_invoice()

### Community 106 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 107 - "sheet.tsx"
Cohesion: 0.28
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 109 - "rollout.mjs"
Cohesion: 0.29
Nodes (7): compose(), directory, env, [image, revision, target], lock, root, run()

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

### Community 118 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

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

### Community 124 - "brevo/route.ts"
Cohesion: 0.52
Nodes (5): POST(), runtime, brevoMailEvent(), brevoProviderId(), brevoWebhookAuthorized()

### Community 125 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 126 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 127 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 128 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 132 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 133 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 138 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 139 - "20261114_email_templates.sql"
Cohesion: 0.50
Nodes (3): "schema".email_template_audit, "schema".email_template_settings, "schema".security_reserve_mail()

### Community 140 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 141 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 142 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 144 - "scroll-area.tsx"
Cohesion: 0.67
Nodes (3): @radix-ui/react-scroll-area, ScrollArea, ScrollBar

### Community 145 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 146 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 147 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 148 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 149 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 150 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

### Community 159 - "PortalEnum"
Cohesion: 0.67
Nodes (3): PortalEnum, ADMIN, COMPANY

## Knowledge Gaps
- **820 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+815 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1181 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **61 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PlatformLanding()` connect `PlatformLanding.tsx` to `[resource]/page.tsx`, `Button`, `CookieBanner.tsx`, `Input`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _820 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07623362552940018 - nodes in this community are weakly interconnected._
- **Why does `Cinema()` connect `PlatformLanding.tsx` to `engine.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `createPostgrestClient` be split into smaller, more focused modules?**
  _Cohesion score 0.050997425997425995 - nodes in this community are weakly interconnected._
- **Why does `useTripController()` connect `useTripController.ts` to `api.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `api-utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05691471287801563 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 174 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 288 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
