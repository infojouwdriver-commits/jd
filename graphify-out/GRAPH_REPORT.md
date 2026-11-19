# Graph Report - JOUW DRIVER  (2026-11-19)

## Corpus Check
- 678 files · ~287,108 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3882 nodes · 13149 edges · 197 communities (135 shown, 62 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e48aab8d`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- ref_react
- Badge
- next
- createPostgrestClient
- Button
- email-templates/route.ts
- usePreferences
- Input
- lucide-react
- api.ts
- stripe-billing.ts
- lib/auth.ts
- useTripController.ts
- api-utils.ts
- dependencies
- SiteAIAgent.tsx
- cn
- end/route.ts
- session.tsx
- App.tsx
- AuthProvider.tsx
- BackgroundGeolocation
- package.json
- ReportsPage.tsx
- mobile-location.ts
- sidebar.tsx
- 20261026_invoice_checkout.sql
- driver-app/package.json
- dependencies
- _layout.tsx
- company-changes.ts
- DriverMap.tsx
- BackgroundGeolocationService.java
- CompanyRegistration.tsx
- scripts
- MarketingEditorial.tsx
- utils.ts
- use-toast.ts
- api-client.ts
- company-registrations/route.ts
- mobile/package.json
- 20261018_company_lifecycle.sql
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- samples.ts
- 20261019_shift_activity.sql
- vervoerbewijs.ts
- ref_node_fs
- update-customer-portal.sh
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- engine.ts
- DriverGdprSection.tsx
- driver-shifts.ts
- pdf-generator.ts
- form.tsx
- TripPointJournal.java
- PlatformLanding.tsx
- compilerOptions
- welcome-config.ts
- DriverSettlementCalculator.tsx
- renderer.ts
- municipal-test-documents.ts
- BackgroundGeolocation
- AddressField.tsx
- "schema".security_operations_centre
- 20261016_native_push.sql
- password/route.ts
- trip-journal.ts
- code-map.py
- command.tsx
- RouteMap.tsx
- company-portal/vehicles/route.ts
- 20261019_driver_shifts.sql
- carousel.tsx
- documents/route.ts
- apply-release.mjs
- convert-database.mjs
- PublicInfo.tsx
- [resource]/page.tsx
- [locale]/page.tsx
- approval-mail-scheduler.ts
- driverShiftPdf
- push-worker.mjs
- DriverGuideSection.tsx
- 20261012_accounts_messages.sql
- chart.tsx
- marketing-content.ts
- company-pricing.ts
- settings-model.ts
- "schema".security_fleet_locations
- "schema".company_registrations
- EmailTemplatesPanel.tsx
- FaqPage.tsx
- chat/route.ts
- public-contact.ts
- pagination.tsx
- configure-stripe.mjs
- recover-db-log.mjs
- 20261013_mail_delivery.sql
- "schema".company_change_requests
- 20261026_manual_invoices.sql
- navigation-menu.tsx
- drawer.tsx
- sheet.tsx
- Override
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- 20261115_account_deletion.sql
- HomepageAdSlotSection.tsx
- tariff-quote.ts
- activity/route.ts
- [...path]/route.ts
- android.content.Intent
- configure-mail.mjs
- ref_node_path
- driver-app/tsconfig.json
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
- avatar.tsx
- ModeEnum
- container-scroll-animation.tsx
- prepare-customer-runtime.sh
- 20261023_app_experience.sql
- login/page.tsx
- company-portal/drivers/route.ts
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
- `close()` --references--> `Alert`  [EXTRACTED]
  driver-app/src/experience/CompanyRegistration.tsx → src/components/ui/alert.tsx
- `publish()` --indirect_call--> `draft()`  [INFERRED]
  src/components/app-experience/AppExperiencePanel.tsx → driver-app/src/experience/CompanyRegistration.tsx
- `DriverMapView()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
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

## Communities (197 total, 62 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (125): bcryptjs, GET, GET, executeApprovedRequest(), GET, getTableName(), POST, PUT (+117 more)

### Community 1 - "ref_react"
Cohesion: 0.06
Nodes (70): class-variance-authority, Page(), Page(), Page(), CompanyDashboardPage(), PrintableContract, InvoicePayment(), action() (+62 more)

### Community 2 - "Badge"
Cohesion: 0.07
Nodes (82): Company, CompanyContractsPage(), Contract, Signature, PlatformContract, Company, Distributor, DistributorsPage() (+74 more)

### Community 3 - "next"
Cohesion: 0.03
Nodes (74): nextConfig, framer-motion, leaflet, next, ReceiptPage(), ReceiptWorkspace(), BottomSheetModal(), buildGoogleMapsUrl() (+66 more)

### Community 4 - "createPostgrestClient"
Cohesion: 0.06
Nodes (61): welcomePayload(), PUT, GET, PUT, command, POST, filters, GET (+53 more)

### Community 5 - "Button"
Cohesion: 0.07
Nodes (72): sonner, AccountDeletionsPage(), formatDate(), Request, AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest (+64 more)

### Community 6 - "email-templates/route.ts"
Cohesion: 0.05
Nodes (67): POST(), result(), sites, dynamic, GET(), headers, available(), GET (+59 more)

### Community 7 - "usePreferences"
Cohesion: 0.13
Nodes (52): DriverMap(), Account(), ActiveTrip(), ActiveTripMap(), guidance, styles, useActivityFilters(), ActivityFilters() (+44 more)

### Community 8 - "Input"
Cohesion: 0.09
Nodes (53): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, CompaniesPage(), CompaniesPageContent(), Company (+45 more)

### Community 9 - "lucide-react"
Cohesion: 0.06
Nodes (63): @hookform/resolvers, lucide-react, react-hook-form, CompanyLoginForm(), CompanyLoginFormData, CompanyLoginFormProps, companyLoginSchema, DriverRegisterForm() (+55 more)

### Community 10 - "api.ts"
Cohesion: 0.05
Nodes (57): AccountDeletionStatus, AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, CompanyRegistrationReceipt, createDriverApi() (+49 more)

### Community 11 - "stripe-billing.ts"
Cohesion: 0.07
Nodes (58): stripe, runtime, runtime, InvoiceMailPurpose, BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState (+50 more)

### Community 12 - "lib/auth.ts"
Cohesion: 0.09
Nodes (55): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+47 more)

### Community 13 - "useTripController.ts"
Cohesion: 0.08
Nodes (48): ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), Props (+40 more)

### Community 14 - "api-utils.ts"
Cohesion: 0.06
Nodes (52): GET, POST, schema, POST, schema, POST, VALID_TYPES, GET (+44 more)

### Community 15 - "dependencies"
Cohesion: 0.03
Nodes (65): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+57 more)

### Community 16 - "SiteAIAgent.tsx"
Cohesion: 0.05
Nodes (52): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, apiFetch(), ApiResponse (+44 more)

### Community 17 - "cn"
Cohesion: 0.06
Nodes (54): @radix-ui/react-accordion, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, @radix-ui/react-radio-group, react-resizable-panels, AccordionContent, AccordionItem, AccordionTrigger (+46 more)

### Community 18 - "end/route.ts"
Cohesion: 0.10
Nodes (31): connection, GET, POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST, POST (+23 more)

### Community 19 - "session.tsx"
Cohesion: 0.07
Nodes (40): AccountDeletion(), check(), open(), run(), submit(), appVersionLabel(), RoadArt(), BrandMark() (+32 more)

### Community 20 - "App.tsx"
Cohesion: 0.07
Nodes (31): App(), login(), logout(), styles, createActionGate(), apiConnectionKey(), DriverTripSummary, clearReceiptCache() (+23 more)

### Community 21 - "AuthProvider.tsx"
Cohesion: 0.07
Nodes (37): AdminLayout(), DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), glassCard (+29 more)

### Community 22 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 23 - "package.json"
Cohesion: 0.04
Nodes (42): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+34 more)

### Community 24 - "ReportsPage.tsx"
Cohesion: 0.08
Nodes (32): Page(), Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps (+24 more)

### Community 25 - "mobile-location.ts"
Cohesion: 0.08
Nodes (32): copy, DriverFleetShift(), GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation() (+24 more)

### Community 26 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 27 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 28 - "driver-app/package.json"
Cohesion: 0.06
Nodes (36): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+28 more)

### Community 29 - "dependencies"
Cohesion: 0.05
Nodes (38): dependencies, expo, expo-application, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking (+30 more)

### Community 30 - "_layout.tsx"
Cohesion: 0.09
Nodes (28): Period, periodDates(), validDay(), validRange(), Layout(), Navigation(), ActivityProvider(), Context (+20 more)

### Community 31 - "company-changes.ts"
Cohesion: 0.14
Nodes (24): POST, schema, GET, resolveDistributorInfo(), resolveEffectiveUserType(), POST, POST, getAuthRoles() (+16 more)

### Community 32 - "DriverMap.tsx"
Cohesion: 0.11
Nodes (28): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), showWholeRoute(), navigationBasemap, RouteStatus (+20 more)

### Community 33 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 34 - "CompanyRegistration.tsx"
Cohesion: 0.12
Nodes (22): CompanyRegistrationScreen(), advance(), change(), close(), draft(), field(), sendCode(), validate() (+14 more)

### Community 35 - "scripts"
Cohesion: 0.06
Nodes (31): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+23 more)

### Community 36 - "MarketingEditorial.tsx"
Cohesion: 0.17
Nodes (24): dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props, SolutionPage() (+16 more)

### Community 37 - "utils.ts"
Cohesion: 0.08
Nodes (21): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-scroll-area, @radix-ui/react-slider, @radix-ui/react-toggle, @radix-ui/react-toggle-group, react-day-picker (+13 more)

### Community 38 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 39 - "api-client.ts"
Cohesion: 0.12
Nodes (21): DeletionStatusPage(), AccountDeletion(), submit(), copy, Status, Vehicle, VehicleSelector(), VehicleSelectorProps (+13 more)

### Community 40 - "company-registrations/route.ts"
Cohesion: 0.17
Nodes (23): PUT, review, DELETE, document(), failed(), GET, positiveId(), POST (+15 more)

### Community 41 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 42 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 43 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 44 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 45 - "samples.ts"
Cohesion: 0.16
Nodes (19): copy, verificationDesign(), VerificationPurpose, contractDesign(), ContractEmailData, copy, SignatureEvidence, copy (+11 more)

### Community 46 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 47 - "vervoerbewijs.ts"
Cohesion: 0.13
Nodes (20): dynamic, GET(), headers, runtime, chironColor(), chironLabel(), fmtDateTime(), fmtGps() (+12 more)

### Community 48 - "ref_node_fs"
Cohesion: 0.12
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 49 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 50 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 51 - "20261024_stripe_billing.sql"
Cohesion: 0.15
Nodes (14): "schema".security_stripe_allocate(), "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts (+6 more)

### Community 52 - "engine.ts"
Cohesion: 0.19
Nodes (19): qrcode, gsap, qrcode, three, mountCinema(), render(), resize(), optimize() (+11 more)

### Community 53 - "DriverGdprSection.tsx"
Cohesion: 0.15
Nodes (18): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+10 more)

### Community 54 - "driver-shifts.ts"
Cohesion: 0.17
Nodes (18): ShiftPage(), failure(), GET, DriverShifts(), downloadPdf(), km, ShiftActivity, shiftDeclaration (+10 more)

### Community 55 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 56 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 59 - "PlatformLanding.tsx"
Cohesion: 0.18
Nodes (13): metadata, RegistrationPage(), Cinema(), cinematicCopy, CinematicText, downloadCopy, PlatformLanding(), openRegistration() (+5 more)

### Community 60 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 61 - "welcome-config.ts"
Cohesion: 0.20
Nodes (15): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster() (+7 more)

### Community 62 - "DriverSettlementCalculator.tsx"
Cohesion: 0.19
Nodes (12): DriverSettlementCalculator(), download(), fields, summary, MarketingLocale, calculatorText(), calculateSettlement(), cents() (+4 more)

### Community 63 - "renderer.ts"
Cohesion: 0.13
Nodes (17): Draft, editableTemplateIds, emailBrand, EmailDesignId, EmailEdits, emailLanguages, emailMessageHtml(), escapeEmail() (+9 more)

### Community 64 - "municipal-test-documents.ts"
Cohesion: 0.25
Nodes (15): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+7 more)

### Community 66 - "AddressField.tsx"
Cohesion: 0.26
Nodes (14): search(), Failure, messages, PickupLocation(), locate(), coordinate(), createAddressSearch(), freshSearchPoint() (+6 more)

### Community 67 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 68 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 69 - "password/route.ts"
Cohesion: 0.24
Nodes (11): POST, PUT, GET, GET, POST, credentials, saveCompanyAccount(), accessibleMessage() (+3 more)

### Community 70 - "trip-journal.ts"
Cohesion: 0.23
Nodes (14): browserJournals, createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save() (+6 more)

### Community 71 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 72 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 73 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 74 - "company-portal/vehicles/route.ts"
Cohesion: 0.10
Nodes (12): DELETE, POST, PUT, GET, POST, unavailable, GET, POST (+4 more)

### Community 75 - "20261019_driver_shifts.sql"
Cohesion: 0.25
Nodes (11): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_driver_shifts() (+3 more)

### Community 76 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 77 - "documents/route.ts"
Cohesion: 0.25
Nodes (9): jspdf, GET, handler, POST, configurePdfFonts(), activeCompanyTariffs(), drawPdfQr(), renderTariffSheet() (+1 more)

### Community 78 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 79 - "convert-database.mjs"
Cohesion: 0.27
Nodes (12): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), parseSchema() (+4 more)

### Community 80 - "PublicInfo.tsx"
Cohesion: 0.20
Nodes (10): metadata, Page(), metadata, Page(), metadata, PrivacyPolicyPage(), ContactPanel(), Locale (+2 more)

### Community 81 - "[resource]/page.tsx"
Cohesion: 0.22
Nodes (12): generateMetadata(), getPage(), isResource(), MarketingResource(), Props, calculatorCopy, calculatorDescription, chironGuide (+4 more)

### Community 82 - "[locale]/page.tsx"
Cohesion: 0.24
Nodes (9): generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, homeAlternates, homepageMetadata(), homepageSchema() (+1 more)

### Community 83 - "approval-mail-scheduler.ts"
Cohesion: 0.24
Nodes (11): register(), accountDeletionPage, approvalPath(), ApprovalTab, sendPendingApprovalAlerts(), startApprovalMailScheduler(), run(), accountDeletionEmailDesign() (+3 more)

### Community 84 - "driverShiftPdf"
Cohesion: 0.23
Nodes (11): jose, apply, headers, url, driverShiftPdf(), ensure(), page(), pairs() (+3 more)

### Community 85 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 86 - "DriverGuideSection.tsx"
Cohesion: 0.22
Nodes (11): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+3 more)

### Community 87 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 88 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 89 - "marketing-content.ts"
Cohesion: 0.20
Nodes (7): metadata, Benefit, LocaleCopy, marketingOrigin, MarketingTopic, Question, SolutionCopy

### Community 90 - "company-pricing.ts"
Cohesion: 0.33
Nodes (10): CompanyPricing, companyPricingPatch(), companyTariffs(), defaults, driverPricing(), normalizeCompanyPricing(), numericField(), peakPeriods() (+2 more)

### Community 91 - "settings-model.ts"
Cohesion: 0.17
Nodes (11): templateIds, emailDesignVersion, EmailSettings, EmailSettingsData, emailSettingsDataSchema, invoiceEdit, paragraph, saveEmailSettingsSchema (+3 more)

### Community 92 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 93 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 94 - "EmailTemplatesPanel.tsx"
Cohesion: 0.24
Nodes (5): EmailTemplatesPage(), EmailTemplatesPanel(), languageLabels, Preview, Template

### Community 95 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 96 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 97 - "public-contact.ts"
Cohesion: 0.36
Nodes (7): contactCopy, ContactSubmission, contactTopics, supportEmail, supportPhone, supportPhoneLabel, supportWhatsApp

### Community 98 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 99 - "configure-stripe.mjs"
Cohesion: 0.31
Nodes (7): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys

### Community 100 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 101 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 102 - ""schema".company_change_requests"
Cohesion: 0.28
Nodes (3): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change()

### Community 103 - "20261026_manual_invoices.sql"
Cohesion: 0.36
Nodes (5): manual_invoice_immutable, manual_payment_immutable, "schema".manual_invoice_payments, "schema".manual_invoices, "schema".security_manual_invoice()

### Community 104 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 105 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 106 - "sheet.tsx"
Cohesion: 0.28
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 108 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 109 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 110 - "20261115_account_deletion.sql"
Cohesion: 0.36
Nodes (5): clear_account_deletion_notice, "schema".account_deletion_requests, "schema".security_clear_account_deletion_notice(), "schema".security_complete_account_deletion(), "schema".security_request_account_deletion()

### Community 111 - "HomepageAdSlotSection.tsx"
Cohesion: 0.36
Nodes (6): dompurify, dompurify, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 112 - "tariff-quote.ts"
Cohesion: 0.36
Nodes (7): Company, CompanyTariff, Quote, readTariffQuote(), signature(), signTariffQuote(), TariffSheet

### Community 113 - "activity/route.ts"
Cohesion: 0.54
Nodes (6): GET, activityColumns, activityFilters(), brusselsDay(), civilDate(), summarizeActivity()

### Community 114 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 116 - "configure-mail.mjs"
Cohesion: 0.48
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 117 - "ref_node_path"
Cohesion: 0.33
Nodes (3): dir, aad, openPushCredential()

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

### Community 124 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

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

### Community 140 - "avatar.tsx"
Cohesion: 0.40
Nodes (4): @radix-ui/react-avatar, Avatar, AvatarFallback, AvatarImage

### Community 141 - "ModeEnum"
Cohesion: 0.40
Nodes (5): ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET

### Community 142 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 143 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 145 - "login/page.tsx"
Cohesion: 0.67
Nodes (3): dynamic, LoginPage(), LoginPageClient()

### Community 146 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 147 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

### Community 156 - "PortalEnum"
Cohesion: 0.67
Nodes (3): PortalEnum, ADMIN, COMPANY

## Knowledge Gaps
- **823 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+818 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1186 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **62 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DriverShiftWorkspace()` connect `next` to `ref_react`, `Button`, `api-client.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _823 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.06818181818181818 - nodes in this community are weakly interconnected._
- **Why does `generateAdminUserToken()` connect `createErrorResponse` to `lib/auth.ts`, `company-changes.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.055823680823680825 - nodes in this community are weakly interconnected._
- **Should `Badge` be split into smaller, more focused modules?**
  _Cohesion score 0.06839032527105922 - nodes in this community are weakly interconnected._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.03499830105334693 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 174 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 289 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
