# Graph Report - JOUW DRIVER  (2026-11-19)

## Corpus Check
- 682 files · ~287,678 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3895 nodes · 13210 edges · 200 communities (138 shown, 62 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1f54eb5a`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- Badge
- ref_react
- api-utils.ts
- generateAdminUserToken
- usePreferences
- cn
- Input
- useTripController.ts
- next
- package.json
- DriverRegisterForm.tsx
- authCrudOperations
- useAuth
- driver/taximeter/page.tsx
- preferences.tsx
- dependencies
- api.ts
- end/route.ts
- validateRequestBody
- InvoicesFeaturePage.tsx
- BackgroundGeolocation
- session.tsx
- 20261026_invoice_checkout.sql
- CookieBanner.tsx
- stripe-billing.ts
- company-changes.ts
- contract-email-handler.ts
- renderer.ts
- api-client.ts
- BackgroundGeolocationService.java
- CompanyRegistration.tsx
- ActiveTripMap.tsx
- submit/route.ts
- dependencies
- use-toast.ts
- subscription-billing.ts
- ref_node_crypto
- driver-app/package.json
- mobile/package.json
- vervoerbewijs.ts
- 20261018_company_lifecycle.sql
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- DriverShifts.tsx
- [slug]/page.tsx
- email-templates/route.ts
- 20261019_shift_activity.sql
- subscription-document.ts
- mail-service.ts
- ref_node_fs
- update-customer-portal.sh
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- [resource]/page.tsx
- pdf-generator.ts
- TripPointJournal.java
- engine.ts
- mobile-location.ts
- compilerOptions
- navigation-menu.tsx
- municipal-test-documents.ts
- DriverSettlementCalculator.tsx
- company-registrations/route.ts
- PlatformLanding.tsx
- SiteAIAgent
- approval-mail-scheduler.ts
- BackgroundGeolocation
- AddressField.tsx
- "schema".security_operations_centre
- 20261016_native_push.sql
- app/layout.tsx
- trip-journal.ts
- code-map.py
- scripts
- command.tsx
- security-policy.ts
- welcome-config.ts
- 20261019_driver_shifts.sql
- devDependencies
- carousel.tsx
- apply-release.mjs
- convert-database.mjs
- RouteMap.tsx
- form.tsx
- marketing-content.ts
- DriverGuideSection.tsx
- activity-state.tsx
- 20261012_accounts_messages.sql
- chart.tsx
- [locale]/page.tsx
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- secret-vault.ts
- LanguageProvider
- useGeolocation.ts
- "schema".company_registrations
- EmailTemplatesPanel.tsx
- FaqPage.tsx
- chat/route.ts
- documents/route.ts
- pagination.tsx
- configure-stripe.mjs
- recover-db-log.mjs
- scripts
- createDriverApi
- 20261013_mail_delivery.sql
- "schema".company_change_requests
- 20261026_manual_invoices.sql
- drawer.tsx
- Override
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- 20261115_account_deletion.sql
- HomepageAdSlotSection.tsx
- [...path]/route.ts
- driverShiftPdf
- android.content.Intent
- configure-mail.mjs
- ref_node_path
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
- AccountDeletion
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
- ModeEnum
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- 20261023_app_experience.sql
- company-portal/vehicles/route.ts
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

## Communities (200 total, 62 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (109): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+101 more)

### Community 1 - "Badge"
Cohesion: 0.06
Nodes (92): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), Company, CompanyContractsPage() (+84 more)

### Community 2 - "ref_react"
Cohesion: 0.06
Nodes (71): Page(), Page(), Page(), CompanyDashboardPage(), ContractPrintPage(), PrintableContract, InvoicePayment(), action() (+63 more)

### Community 3 - "api-utils.ts"
Cohesion: 0.05
Nodes (58): connection, GET, PUT, registrationSchema, GET, GET, GET, POST (+50 more)

### Community 4 - "generateAdminUserToken"
Cohesion: 0.06
Nodes (67): welcomePayload(), dynamic, GET(), headers, GET, PUT, POST, schema (+59 more)

### Community 5 - "usePreferences"
Cohesion: 0.11
Nodes (65): DriverMap(), Account(), ActiveTrip(), invoice(), ActiveTripMap(), useActivityFilters(), ActivityFilters(), BillingReminder() (+57 more)

### Community 6 - "cn"
Cohesion: 0.04
Nodes (89): @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, @radix-ui/react-slot, @radix-ui/react-tooltip, AlertTitle, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem (+81 more)

### Community 7 - "Input"
Cohesion: 0.06
Nodes (67): sameWelcomeContent(), WELCOME_LANGUAGES, sonner, DeletionStatusPage(), AccountDeletionsPage(), formatDate(), Request, AdminAccountPage() (+59 more)

### Community 8 - "useTripController.ts"
Cohesion: 0.06
Nodes (60): App(), login(), styles, ActionGate, createActionGate(), DriverProfile, DriverVehicle, Context (+52 more)

### Community 9 - "next"
Cohesion: 0.04
Nodes (59): nextConfig, framer-motion, lucide-react, next, AdminLayout(), DashboardPage(), DriverNotificationsPage(), glassCard (+51 more)

### Community 10 - "package.json"
Cohesion: 0.03
Nodes (69): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+61 more)

### Community 11 - "DriverRegisterForm.tsx"
Cohesion: 0.06
Nodes (64): close(), @hookform/resolvers, @radix-ui/react-separator, react-hook-form, CompanyLoginForm(), CompanyLoginFormData, CompanyLoginFormProps, companyLoginSchema (+56 more)

### Community 12 - "authCrudOperations"
Cohesion: 0.08
Nodes (59): bcryptjs, GET, PUT, available(), GET, POST, schema, driverLoginSchema (+51 more)

### Community 13 - "useAuth"
Cohesion: 0.10
Nodes (46): AdSlot, AdSlotsPage(), EMPTY_FORM, CompaniesPage(), CompaniesPageContent(), Company, emptyNew, AdminDriversPage() (+38 more)

### Community 14 - "driver/taximeter/page.tsx"
Cohesion: 0.07
Nodes (53): leaflet, ReceiptPage(), ReceiptWorkspace(), BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance() (+45 more)

### Community 15 - "preferences.tsx"
Cohesion: 0.06
Nodes (46): Layout(), Navigation(), RoadArt(), BrandMark(), icon, companyCopy, copy, CopyKey (+38 more)

### Community 16 - "dependencies"
Cohesion: 0.03
Nodes (65): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+57 more)

### Community 17 - "api.ts"
Cohesion: 0.05
Nodes (47): AccountDeletionStatus, AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, DriverDetails, DriverMessage, DriverNotification (+39 more)

### Community 18 - "end/route.ts"
Cohesion: 0.08
Nodes (42): Company, generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError (+34 more)

### Community 19 - "validateRequestBody"
Cohesion: 0.09
Nodes (34): GET, POST, schema, POST, schema, POST, POST, POST (+26 more)

### Community 20 - "InvoicesFeaturePage.tsx"
Cohesion: 0.07
Nodes (36): Page(), Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps (+28 more)

### Community 21 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 22 - "session.tsx"
Cohesion: 0.10
Nodes (30): logout(), apiConnectionKey(), ApiError, driverApi, appVersionLabel(), JourneyLoading(), clearReceiptCache(), directory() (+22 more)

### Community 23 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 24 - "CookieBanner.tsx"
Cohesion: 0.10
Nodes (29): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+21 more)

### Community 25 - "stripe-billing.ts"
Cohesion: 0.14
Nodes (30): stripe, runtime, runtime, Checkout, Client, closeInvoiceCheckout(), invoiceCheckout(), invoiceRpc() (+22 more)

### Community 26 - "company-changes.ts"
Cohesion: 0.13
Nodes (24): GET, resolveDistributorInfo(), resolveEffectiveUserType(), DELETE, POST, PUT, POST, POST (+16 more)

### Community 27 - "contract-email-handler.ts"
Cohesion: 0.11
Nodes (24): dynamic, LoginPage(), command, POST, POST, POST, LoginPageClient(), emailContractHandler() (+16 more)

### Community 28 - "renderer.ts"
Cohesion: 0.11
Nodes (28): Draft, copy, verificationDesign(), VerificationPurpose, driverReportDesign(), reports, tripReceiptDesign(), editableTemplateIds (+20 more)

### Community 29 - "api-client.ts"
Cohesion: 0.12
Nodes (24): DriverLoginPage(), Invoice, Trip, TripsPage(), AuthContext, AuthContextType, AuthProviderProps, DriverGoogleLoginButton() (+16 more)

### Community 30 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 31 - "CompanyRegistration.tsx"
Cohesion: 0.12
Nodes (22): CompanyRegistrationReceipt, CompanyRegistrationScreen(), advance(), change(), draft(), field(), sendCode(), validate() (+14 more)

### Community 32 - "ActiveTripMap.tsx"
Cohesion: 0.13
Nodes (26): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), showWholeRoute(), navigationBasemap, RouteStatus (+18 more)

### Community 33 - "submit/route.ts"
Cohesion: 0.11
Nodes (21): metadata, Page(), metadata, Page(), POST(), result(), sites, metadata (+13 more)

### Community 34 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, expo, expo-application, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking (+21 more)

### Community 35 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 36 - "subscription-billing.ts"
Cohesion: 0.12
Nodes (21): copy, invoiceDesign(), InvoiceEmailData, InvoiceMailPurpose, InvoiceSource, deliverInvoiceEmail(), sendInvoiceEmail(), claims (+13 more)

### Community 37 - "ref_node_crypto"
Cohesion: 0.10
Nodes (18): base, checks, headers, now, required, copy, decryptPushToken(), fcmAccessToken() (+10 more)

### Community 38 - "driver-app/package.json"
Cohesion: 0.08
Nodes (25): eslint, react, react-dom, @types/react, typescript, zod, main, name (+17 more)

### Community 39 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 40 - "vervoerbewijs.ts"
Cohesion: 0.14
Nodes (22): dynamic, GET(), headers, runtime, chironColor(), chironLabel(), fmtDateTime(), fmtGps() (+14 more)

### Community 41 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 42 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 43 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 44 - "DriverShifts.tsx"
Cohesion: 0.17
Nodes (19): ShiftPage(), DriverShifts(), downloadPdf(), statuses, shiftCopy, km, ShiftActivity, shiftDeclaration (+11 more)

### Community 45 - "[slug]/page.tsx"
Cohesion: 0.18
Nodes (21): dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props, SolutionPage() (+13 more)

### Community 46 - "email-templates/route.ts"
Cohesion: 0.17
Nodes (22): forbidden(), GET, invalid(), POST, PUT, serviceClient(), isEditableTemplate(), templateIds (+14 more)

### Community 47 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 48 - "subscription-document.ts"
Cohesion: 0.15
Nodes (16): qrcode, jspdf, qrcode, DocumentQr(), configurePdfFonts(), documentOrigin, BankInstructions, bankPaymentPayload() (+8 more)

### Community 49 - "mail-service.ts"
Cohesion: 0.12
Nodes (18): resend, POST(), runtime, POST(), runtime, brevoIdempotencyKey(), brevoMailEvent(), brevoProviderId() (+10 more)

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

### Community 54 - "[resource]/page.tsx"
Cohesion: 0.19
Nodes (17): generateMetadata(), getPage(), isResource(), MarketingResource(), Props, marketingCopy, MarketingLocale, marketingTopics (+9 more)

### Community 55 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 57 - "engine.ts"
Cohesion: 0.21
Nodes (17): gsap, three, mountCinema(), render(), resize(), optimize(), Pose, poses (+9 more)

### Community 59 - "mobile-location.ts"
Cohesion: 0.13
Nodes (14): clearNativeTripPoints(), createNativeLocationWatch(), createNativeTripReplay(), LocationError, MobileLocationPoint, MobileWatchOptions, NativeLocation, NativeLocationPlugin (+6 more)

### Community 60 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 61 - "navigation-menu.tsx"
Cohesion: 0.14
Nodes (16): class-variance-authority, @radix-ui/react-navigation-menu, @radix-ui/react-toggle, @radix-ui/react-toggle-group, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList (+8 more)

### Community 62 - "municipal-test-documents.ts"
Cohesion: 0.25
Nodes (15): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+7 more)

### Community 63 - "DriverSettlementCalculator.tsx"
Cohesion: 0.20
Nodes (11): DriverSettlementCalculator(), download(), fields, summary, calculatorText(), calculateSettlement(), cents(), emptySettlement() (+3 more)

### Community 64 - "company-registrations/route.ts"
Cohesion: 0.32
Nodes (15): PUT, review, DELETE, document(), failed(), GET, positiveId(), POST (+7 more)

### Community 65 - "PlatformLanding.tsx"
Cohesion: 0.21
Nodes (11): metadata, RegistrationPage(), Cinema(), cinematicCopy, CinematicText, downloadCopy, PlatformLanding(), openRegistration() (+3 more)

### Community 66 - "SiteAIAgent"
Cohesion: 0.19
Nodes (18): apiFetch(), buildApiUrl(), detectChangeIntent(), detectSearchIntent(), formatEntityInfo(), generateId(), SiteAIAgent(), addAssistantMessage() (+10 more)

### Community 67 - "approval-mail-scheduler.ts"
Cohesion: 0.20
Nodes (14): register(), accountDeletionPage, approvalPath(), approvalReturnPath(), ApprovalTab, approvalTabs, approvalTarget(), sendPendingApprovalAlerts() (+6 more)

### Community 69 - "AddressField.tsx"
Cohesion: 0.29
Nodes (14): AddressField(), search(), Failure, messages, PickupLocation(), locate(), coordinate(), createAddressSearch() (+6 more)

### Community 70 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 71 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 72 - "app/layout.tsx"
Cohesion: 0.17
Nodes (13): next-themes, dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider(), GlobalClientEffects() (+5 more)

### Community 73 - "trip-journal.ts"
Cohesion: 0.23
Nodes (14): browserJournals, createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save() (+6 more)

### Community 74 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 75 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 76 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 77 - "security-policy.ts"
Cohesion: 0.21
Nodes (11): POST, VALID_TYPES, authorizeEndpoint(), calendarMonthDeadline(), memberEndpoint(), originAllowed(), ownsRecord(), stripSecrets() (+3 more)

### Community 78 - "welcome-config.ts"
Cohesion: 0.26
Nodes (12): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), validWelcomePoster(), WelcomeLanguage (+4 more)

### Community 79 - "20261019_driver_shifts.sql"
Cohesion: 0.25
Nodes (11): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_driver_shifts() (+3 more)

### Community 80 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+7 more)

### Community 81 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 82 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 83 - "convert-database.mjs"
Cohesion: 0.27
Nodes (12): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), parseSchema() (+4 more)

### Community 84 - "RouteMap.tsx"
Cohesion: 0.22
Nodes (12): RouteCoords, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), DrivingRoute, fetchDrivingRoute() (+4 more)

### Community 85 - "form.tsx"
Cohesion: 0.21
Nodes (11): @radix-ui/react-label, FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue (+3 more)

### Community 86 - "marketing-content.ts"
Cohesion: 0.18
Nodes (7): metadata, Benefit, LocaleCopy, marketingOrigin, MarketingTopic, Question, SolutionCopy

### Community 87 - "DriverGuideSection.tsx"
Cohesion: 0.22
Nodes (11): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+3 more)

### Community 88 - "activity-state.tsx"
Cohesion: 0.26
Nodes (9): Period, periodDates(), validDay(), validRange(), ActivityProvider(), Context, useStateValue(), apply() (+1 more)

### Community 89 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 90 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 91 - "[locale]/page.tsx"
Cohesion: 0.27
Nodes (8): generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, homeAlternates, homepageMetadata(), homepageSchema()

### Community 92 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 93 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 94 - "secret-vault.ts"
Cohesion: 0.22
Nodes (9): jose, apply, headers, url, close(), send(), decryptSecret(), encryptSecret() (+1 more)

### Community 95 - "LanguageProvider"
Cohesion: 0.24
Nodes (8): DriverLayout(), DriverLayoutShell(), detectBrowserLanguage(), LanguageProvider(), normalizeLanguage(), readCookieLanguage(), setDocumentDirection(), setLanguageCookie()

### Community 96 - "useGeolocation.ts"
Cohesion: 0.31
Nodes (9): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), isFreshAccurateLocation(), isNativeMobile() (+1 more)

### Community 97 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 98 - "EmailTemplatesPanel.tsx"
Cohesion: 0.24
Nodes (5): EmailTemplatesPage(), EmailTemplatesPanel(), languageLabels, Preview, Template

### Community 99 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 100 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 101 - "documents/route.ts"
Cohesion: 0.24
Nodes (8): GET, handler, POST, GET, POST, activeCompanyTariffs(), indicativeFare(), tariffSheetUrl()

### Community 102 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 103 - "configure-stripe.mjs"
Cohesion: 0.31
Nodes (7): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys

### Community 104 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 105 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 106 - "createDriverApi"
Cohesion: 0.44
Nodes (9): createDriverApi(), loadProfile(), ownerRead(), profile(), request(), requestOnce(), startTrip(), tripAssignmentBody() (+1 more)

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

### Community 112 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 113 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 114 - "20261115_account_deletion.sql"
Cohesion: 0.36
Nodes (5): clear_account_deletion_notice, "schema".account_deletion_requests, "schema".security_clear_account_deletion_notice(), "schema".security_complete_account_deletion(), "schema".security_request_account_deletion()

### Community 115 - "HomepageAdSlotSection.tsx"
Cohesion: 0.36
Nodes (6): dompurify, dompurify, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 116 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 117 - "driverShiftPdf"
Cohesion: 0.46
Nodes (7): driverShiftPdf(), ensure(), page(), pairs(), paragraph(), section(), table()

### Community 119 - "configure-mail.mjs"
Cohesion: 0.48
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 120 - "ref_node_path"
Cohesion: 0.33
Nodes (3): dir, aad, openPushCredential()

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

### Community 131 - "AccountDeletion"
Cohesion: 0.53
Nodes (6): AccountDeletion(), check(), open(), run(), submit(), ownerKey()

### Community 135 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 136 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 137 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, eslint, eslint-config-expo, @types/react, typescript

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

### Community 149 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 150 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 151 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

## Knowledge Gaps
- **825 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+820 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1188 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **62 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `authCrudOperations()` connect `authCrudOperations` to `createErrorResponse`, `generateAdminUserToken`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _825 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.0748322923895443 - nodes in this community are weakly interconnected._
- **Should `Badge` be split into smaller, more focused modules?**
  _Cohesion score 0.06260504201680672 - nodes in this community are weakly interconnected._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.05847665847665848 - nodes in this community are weakly interconnected._
- **Should `api-utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.052440290758047764 - nodes in this community are weakly interconnected._
- **Should `generateAdminUserToken` be split into smaller, more focused modules?**
  _Cohesion score 0.05893980233602875 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 174 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 289 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
