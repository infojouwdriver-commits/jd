# Graph Report - JOUW DRIVER  (2026-11-20)

## Corpus Check
- 679 files · ~287,322 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3881 nodes · 13141 edges · 203 communities (140 shown, 63 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d5735675`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- Input
- next
- ref_react
- createPostgrestClient
- Button
- usePreferences
- useTripController.ts
- lib/auth.ts
- stripe-billing.ts
- driver/taximeter/page.tsx
- ref_node_crypto
- api-utils.ts
- dependencies
- cn
- api.ts
- end/route.ts
- ui.tsx
- api-client.ts
- BackgroundGeolocation
- session.tsx
- package.json
- company-changes.ts
- sidebar.tsx
- 20261026_invoice_checkout.sql
- driver-app/package.json
- utils.ts
- BackgroundGeolocationService.java
- CompanyRegistration.tsx
- marketing-content.ts
- AppExperiencePanel.tsx
- dependencies
- _layout.tsx
- use-toast.ts
- FleetPanel.tsx
- mobile/package.json
- vervoerbewijs.ts
- 20261018_company_lifecycle.sql
- 20261018_subscription_billing.sql
- samples.ts
- jouww-cutover.mjs
- public-contact.ts
- DriverShifts.tsx
- company-registrations/route.ts
- SiteAIAgent.tsx
- welcome-config.ts
- DriverMap.tsx
- 20261019_shift_activity.sql
- app/layout.tsx
- PlatformLanding.tsx
- email-templates/route.ts
- ref_node_fs
- update-customer-portal.sh
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- engine.ts
- DriverGdprSection.tsx
- pdf-generator.ts
- form.tsx
- DriverRegisterForm.tsx
- TripPointJournal.java
- approval-mail-scheduler.ts
- company-pricing.ts
- [locale]/page.tsx
- compilerOptions
- DriverSettlementCalculator.tsx
- mobile-location.ts
- navigation-menu.tsx
- renderer.ts
- municipal-test-documents.ts
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- messages/route.ts
- DriverGuideSection.tsx
- code-map.py
- scripts
- 20261019_driver_shifts.sql
- devDependencies
- command.tsx
- carousel.tsx
- apply-release.mjs
- convert-database.mjs
- [resource]/page.tsx
- RouteMap.tsx
- LoginPageClient.tsx
- RegisterForm.tsx
- ResetPasswordForm.tsx
- driverShiftPdf
- push-worker.mjs
- LoginForm.tsx
- 20261012_accounts_messages.sql
- chart.tsx
- createTripJournal
- "schema".security_fleet_locations
- driver/trips/page.tsx
- native-addresses.ts
- "schema".company_registrations
- jspdf
- sheet.tsx
- EmailTemplatesPanel.tsx
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
- drawer.tsx
- documents/route.ts
- driver-activity.ts
- Override
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- 20261115_account_deletion.sql
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
- devDependencies
- 20261009_security.sql
- "schema".security_create_driver_account
- "schema".security_email_contract
- invoice_bank_snapshot
- 20261104_company_tariffs.sql
- 20261114_email_templates.sql
- container-scroll-animation.tsx
- prepare-customer-runtime.sh
- save
- 20261023_app_experience.sql
- "schema".security_save_company_email
- company-portal/drivers/route.ts
- invoices/send/route.ts
- view/route.ts
- websocket/route.ts
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

## Communities (203 total, 63 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (121): bcryptjs, GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE (+113 more)

### Community 1 - "Input"
Cohesion: 0.06
Nodes (116): blankRegistration(), AdSlot, AdSlotsPage(), EMPTY_FORM, Company, CompanyContractsPage(), Contract, Signature (+108 more)

### Community 2 - "next"
Cohesion: 0.03
Nodes (73): nextConfig, framer-motion, lucide-react, next, AdminLayout(), Page(), Page(), Page() (+65 more)

### Community 3 - "ref_react"
Cohesion: 0.06
Nodes (67): Page(), Page(), Page(), CompanyDashboardPage(), ContractPrintPage(), PrintableContract, InvoicePayment(), action() (+59 more)

### Community 4 - "createPostgrestClient"
Cohesion: 0.06
Nodes (62): welcomePayload(), GET, PUT, POST, schema, GET, PUT, command (+54 more)

### Community 5 - "Button"
Cohesion: 0.07
Nodes (72): sonner, DeletionStatusPage(), AccountDeletionsPage(), formatDate(), Request, AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage() (+64 more)

### Community 6 - "usePreferences"
Cohesion: 0.12
Nodes (57): DriverMap(), Account(), AccountDeletion(), ActiveTrip(), ActiveTripMap(), guidance, styles, useActivityFilters() (+49 more)

### Community 7 - "useTripController.ts"
Cohesion: 0.06
Nodes (55): login(), ActionGate, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), Props (+47 more)

### Community 8 - "lib/auth.ts"
Cohesion: 0.09
Nodes (57): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+49 more)

### Community 9 - "stripe-billing.ts"
Cohesion: 0.07
Nodes (57): stripe, runtime, runtime, InvoiceMailPurpose, BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState (+49 more)

### Community 10 - "driver/taximeter/page.tsx"
Cohesion: 0.06
Nodes (57): ReceiptPage(), ReceiptWorkspace(), BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton() (+49 more)

### Community 11 - "ref_node_crypto"
Cohesion: 0.06
Nodes (50): resend, dynamic, GET(), headers, available(), GET, POST, schema (+42 more)

### Community 12 - "api-utils.ts"
Cohesion: 0.06
Nodes (52): GET, POST, schema, POST, schema, POST, VALID_TYPES, GET (+44 more)

### Community 13 - "dependencies"
Cohesion: 0.03
Nodes (66): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+58 more)

### Community 14 - "cn"
Cohesion: 0.06
Nodes (53): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, AccordionContent, AccordionItem, AccordionTrigger, AlertTitle (+45 more)

### Community 15 - "api.ts"
Cohesion: 0.07
Nodes (46): AccountDeletionStatus, AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile() (+38 more)

### Community 16 - "end/route.ts"
Cohesion: 0.10
Nodes (31): connection, GET, POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST, POST (+23 more)

### Community 17 - "ui.tsx"
Cohesion: 0.07
Nodes (37): appVersionLabel(), RoadArt(), BrandMark(), icon, FarePreview, same(), Tariff, useClassicFare() (+29 more)

### Community 18 - "api-client.ts"
Cohesion: 0.06
Nodes (45): DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), glassCard, labelStyle (+37 more)

### Community 19 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 20 - "session.tsx"
Cohesion: 0.09
Nodes (32): App(), logout(), styles, createActionGate(), apiConnectionKey(), DriverProfile, DriverTripSummary, check() (+24 more)

### Community 21 - "package.json"
Cohesion: 0.04
Nodes (42): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+34 more)

### Community 22 - "company-changes.ts"
Cohesion: 0.11
Nodes (29): GET, resolveDistributorInfo(), resolveEffectiveUserType(), POST, POST, getAuthRoles(), changeFingerprint(), changesGET (+21 more)

### Community 23 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 24 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 25 - "driver-app/package.json"
Cohesion: 0.06
Nodes (34): eslint, react, react-dom, @types/react, typescript, zod, main, name (+26 more)

### Community 26 - "utils.ts"
Cohesion: 0.06
Nodes (24): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+16 more)

### Community 27 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 28 - "CompanyRegistration.tsx"
Cohesion: 0.11
Nodes (22): CompanyRegistrationReceipt, apply(), CompanyRegistrationScreen(), advance(), change(), draft(), field(), sendCode() (+14 more)

### Community 29 - "marketing-content.ts"
Cohesion: 0.15
Nodes (22): dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props, SolutionPage() (+14 more)

### Community 30 - "AppExperiencePanel.tsx"
Cohesion: 0.11
Nodes (21): sameWelcomeContent(), WELCOME_LANGUAGES, AppExperiencePage(), metadata, AppExperiencePanel(), publish(), languageNames, experienceCopy (+13 more)

### Community 31 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, expo, expo-application, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking (+21 more)

### Community 32 - "_layout.tsx"
Cohesion: 0.12
Nodes (22): Period, periodDates(), validDay(), validRange(), Layout(), Navigation(), ActivityProvider(), Context (+14 more)

### Community 33 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 34 - "FleetPanel.tsx"
Cohesion: 0.13
Nodes (20): leaflet, AdminFleetPage(), copy, DriverFleetShift(), FleetPanel(), formatUpdate(), statusClasses, statusLabels (+12 more)

### Community 35 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 36 - "vervoerbewijs.ts"
Cohesion: 0.13
Nodes (22): dynamic, GET(), headers, runtime, chironColor(), chironLabel(), fmtDateTime(), fmtGps() (+14 more)

### Community 37 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 38 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 39 - "samples.ts"
Cohesion: 0.15
Nodes (20): contractInvitation(), copy, verificationDesign(), VerificationPurpose, contractDesign(), ContractEmailData, copy, SignatureEvidence (+12 more)

### Community 40 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 41 - "public-contact.ts"
Cohesion: 0.14
Nodes (17): metadata, Page(), metadata, Page(), metadata, PrivacyPolicyPage(), ContactPanel(), Locale (+9 more)

### Community 42 - "DriverShifts.tsx"
Cohesion: 0.17
Nodes (19): ShiftPage(), DriverShifts(), downloadPdf(), statuses, shiftCopy, km, ShiftActivity, shiftDeclaration (+11 more)

### Community 43 - "company-registrations/route.ts"
Cohesion: 0.20
Nodes (21): PUT, review, DELETE, document(), failed(), GET, positiveId(), POST (+13 more)

### Community 44 - "SiteAIAgent.tsx"
Cohesion: 0.14
Nodes (24): apiFetch(), ApiResponse, buildApiUrl(), ChatMessage, ConversationStep, detectChangeIntent(), detectSearchIntent(), formatEntityInfo() (+16 more)

### Community 45 - "welcome-config.ts"
Cohesion: 0.15
Nodes (18): APP_ORIGIN, LEGACY_APP_ORIGIN, cachedSettings(), cacheFile(), useWelcomeSettings(), DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES (+10 more)

### Community 46 - "DriverMap.tsx"
Cohesion: 0.16
Nodes (21): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), showWholeRoute(), RouteStatus, token (+13 more)

### Community 47 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 48 - "app/layout.tsx"
Cohesion: 0.12
Nodes (17): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, DriverLayoutShell(), GlobalClientEffects() (+9 more)

### Community 49 - "PlatformLanding.tsx"
Cohesion: 0.17
Nodes (18): MarketingResource(), metadata, RegistrationPage(), Cinema(), Caution(), MarketingHub(), MarketingSiteShell(), MarketingSolution() (+10 more)

### Community 50 - "email-templates/route.ts"
Cohesion: 0.17
Nodes (21): forbidden(), GET, invalid(), POST, PUT, serviceClient(), isEditableTemplate(), templateIds (+13 more)

### Community 51 - "ref_node_fs"
Cohesion: 0.12
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 52 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 53 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 54 - "20261024_stripe_billing.sql"
Cohesion: 0.15
Nodes (14): "schema".security_stripe_allocate(), "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts (+6 more)

### Community 55 - "engine.ts"
Cohesion: 0.19
Nodes (19): qrcode, gsap, qrcode, three, mountCinema(), render(), resize(), optimize() (+11 more)

### Community 56 - "DriverGdprSection.tsx"
Cohesion: 0.15
Nodes (18): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+10 more)

### Community 57 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 58 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 59 - "DriverRegisterForm.tsx"
Cohesion: 0.12
Nodes (21): DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data, step1Schema, Step2Data, step2Schema (+13 more)

### Community 61 - "approval-mail-scheduler.ts"
Cohesion: 0.17
Nodes (16): POST(), result(), sites, register(), accountDeletionPage, approvalPath(), ApprovalTab, approvalTabs (+8 more)

### Community 63 - "company-pricing.ts"
Cohesion: 0.18
Nodes (17): Company, CompanyPricing, companyPricingPatch(), CompanyTariff, companyTariffs(), defaults, driverPricing(), normalizeCompanyPricing() (+9 more)

### Community 64 - "[locale]/page.tsx"
Cohesion: 0.15
Nodes (11): metadata, generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, cinematicCopy, CinematicText (+3 more)

### Community 65 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 66 - "DriverSettlementCalculator.tsx"
Cohesion: 0.19
Nodes (12): DriverSettlementCalculator(), download(), fields, summary, MarketingLocale, calculatorText(), calculateSettlement(), cents() (+4 more)

### Community 67 - "mobile-location.ts"
Cohesion: 0.13
Nodes (13): createNativeLocationWatch(), createNativeTripReplay(), LocationError, MobileLocationPoint, MobileWatchOptions, NativeLocation, NativeLocationPlugin, nativePlugin (+5 more)

### Community 68 - "navigation-menu.tsx"
Cohesion: 0.14
Nodes (16): class-variance-authority, @radix-ui/react-navigation-menu, @radix-ui/react-toggle, @radix-ui/react-toggle-group, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList (+8 more)

### Community 69 - "renderer.ts"
Cohesion: 0.15
Nodes (17): Draft, editableTemplateIds, emailBrand, EmailDesignId, EmailEdits, emailLanguages, emailMessageHtml(), escapeEmail() (+9 more)

### Community 70 - "municipal-test-documents.ts"
Cohesion: 0.25
Nodes (15): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+7 more)

### Community 72 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 73 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 74 - "messages/route.ts"
Cohesion: 0.24
Nodes (11): POST, PUT, GET, POST, POST, credentials, saveCompanyAccount(), accessibleMessage() (+3 more)

### Community 75 - "DriverGuideSection.tsx"
Cohesion: 0.18
Nodes (14): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+6 more)

### Community 76 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 77 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 78 - "20261019_driver_shifts.sql"
Cohesion: 0.25
Nodes (11): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_driver_shifts() (+3 more)

### Community 79 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+7 more)

### Community 80 - "command.tsx"
Cohesion: 0.18
Nodes (13): cmdk, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup, CommandInput (+5 more)

### Community 81 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 82 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 83 - "convert-database.mjs"
Cohesion: 0.27
Nodes (12): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), parseSchema() (+4 more)

### Community 84 - "[resource]/page.tsx"
Cohesion: 0.22
Nodes (12): generateMetadata(), getPage(), isResource(), Props, calculatorCopy, calculatorDescription, chironGuide, resourceCopy (+4 more)

### Community 85 - "RouteMap.tsx"
Cohesion: 0.22
Nodes (12): RouteCoords, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), DrivingRoute, fetchDrivingRoute() (+4 more)

### Community 86 - "LoginPageClient.tsx"
Cohesion: 0.19
Nodes (12): dynamic, LoginPage(), CompanyLoginForm(), LoginPageClient(), LoginPageContent(), ModeEnum, LOGIN, REGISTER (+4 more)

### Community 87 - "RegisterForm.tsx"
Cohesion: 0.24
Nodes (12): CredentialsFormData, credentialsSchema, RegisterForm(), RegisterFormProps, VerificationFormData, verificationSchema, ResetPasswordForm(), LoginModal() (+4 more)

### Community 88 - "ResetPasswordForm.tsx"
Cohesion: 0.18
Nodes (11): @hookform/resolvers, react-hook-form, CompanyLoginFormData, CompanyLoginFormProps, companyLoginSchema, PasswordInput, EmailFormData, emailSchema (+3 more)

### Community 89 - "driverShiftPdf"
Cohesion: 0.23
Nodes (11): jose, apply, headers, url, driverShiftPdf(), ensure(), page(), pairs() (+3 more)

### Community 90 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 91 - "LoginForm.tsx"
Cohesion: 0.27
Nodes (9): close(), GoogleLoginButton(), LoginForm(), LoginFormData, LoginFormProps, loginSchema, Alert, AlertDescription (+1 more)

### Community 92 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 93 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 94 - "createTripJournal"
Cohesion: 0.38
Nodes (11): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+3 more)

### Community 95 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 96 - "driver/trips/page.tsx"
Cohesion: 0.20
Nodes (9): glassCard, labelStyle, platformLogos, Summary, TranslationKeys, translations, Trip, DocumentQr() (+1 more)

### Community 97 - "native-addresses.ts"
Cohesion: 0.38
Nodes (9): search(), locate(), coordinate(), createAddressSearch(), freshSearchPoint(), parseBelgianAddresses(), reverseBelgianAddress(), searchBelgianAddresses (+1 more)

### Community 98 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 99 - "jspdf"
Cohesion: 0.36
Nodes (5): jspdf, configurePdfFonts(), drawPdfQr(), renderTariffSheet(), tariffSheetUrl()

### Community 100 - "sheet.tsx"
Cohesion: 0.24
Nodes (9): @radix-ui/react-dialog, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+1 more)

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

### Community 112 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 113 - "documents/route.ts"
Cohesion: 0.25
Nodes (7): GET, handler, POST, GET, POST, activeCompanyTariffs(), indicativeFare()

### Community 114 - "driver-activity.ts"
Cohesion: 0.28
Nodes (7): DELETE, POST, PUT, activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 116 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 117 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 118 - "20261115_account_deletion.sql"
Cohesion: 0.36
Nodes (5): clear_account_deletion_notice, "schema".account_deletion_requests, "schema".security_clear_account_deletion_notice(), "schema".security_complete_account_deletion(), "schema".security_request_account_deletion()

### Community 119 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 121 - "configure-mail.mjs"
Cohesion: 0.48
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 122 - "ref_node_path"
Cohesion: 0.33
Nodes (3): dir, aad, openPushCredential()

### Community 123 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 125 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 126 - "20261109_chiron_realtime.sql"
Cohesion: 0.38
Nodes (3): record_trip_shift, trips_company_realtime_platform_ref_idx, trips_driver_realtime_active_idx

### Community 127 - "20261115_contact_approval_alerts.sql"
Cohesion: 0.33
Nodes (4): approval_mail, approval_mail_ready, "schema".approval_mail_outbox, "schema".security_reserve_mail()

### Community 128 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 129 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 130 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 131 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 132 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 133 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 137 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 138 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 139 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, eslint, eslint-config-expo, @types/react, typescript

### Community 144 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 145 - "20261114_email_templates.sql"
Cohesion: 0.50
Nodes (3): "schema".email_template_audit, "schema".email_template_settings, "schema".security_reserve_mail()

### Community 146 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 147 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 148 - "save"
Cohesion: 0.50
Nodes (4): clearForm(), commit(), retry(), save()

### Community 151 - "company-portal/drivers/route.ts"
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

## Knowledge Gaps
- **820 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+815 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1185 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **63 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DriverLayoutContent()` connect `next` to `FleetPanel.tsx`, `ref_react`, `Button`, `driver/taximeter/page.tsx`, `api-client.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _820 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07134502923976609 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.06127395288949481 - nodes in this community are weakly interconnected._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.03306939916162087 - nodes in this community are weakly interconnected._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.05867082035306334 - nodes in this community are weakly interconnected._
- **Should `createPostgrestClient` be split into smaller, more focused modules?**
  _Cohesion score 0.057076295864880604 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 174 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 288 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
