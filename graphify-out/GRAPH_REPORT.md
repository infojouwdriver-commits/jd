# Graph Report - JOUW DRIVER  (2026-11-10)

## Corpus Check
- 631 files · ~269,338 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3610 nodes · 12185 edges · 194 communities (135 shown, 59 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 244 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `512f78b8`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- createPostgrestClient
- Button
- ref_react
- Label
- Input
- usePreferences
- stripe-billing.ts
- useAuth
- dependencies
- api-utils.ts
- api.ts
- useTripController.ts
- validateRequestBody
- cn
- end/route.ts
- lib/auth.ts
- InvoicesFeaturePage.tsx
- preferences.tsx
- BackgroundGeolocation
- receipt-email/route.ts
- session.tsx
- package.json
- sidebar.tsx
- 20261026_invoice_checkout.sql
- CookieBanner.tsx
- marketing-content.ts
- driver-app/package.json
- utils.ts
- api-client.ts
- driver/taximeter/page.tsx
- DriverDashboard.tsx
- BackgroundGeolocationService.java
- _layout.tsx
- mobile-location.ts
- ref_node_fs
- use-toast.ts
- app/layout.tsx
- vervoerbewijs.ts
- dependencies
- mobile/package.json
- companies/route.ts
- 20261018_company_lifecycle.sql
- 20261018_subscription_billing.sql
- DriverShifts.tsx
- jouww-cutover.mjs
- native-journal.ts
- 20261019_shift_activity.sql
- convert-database.mjs
- update-customer-portal.sh
- ClassicFare.tsx
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- engine.ts
- form.tsx
- DriverRegisterForm.tsx
- TripPointJournal.java
- compilerOptions
- ref_node_crypto
- PlatformLanding.tsx
- SiteAIAgent
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- receipt/page.tsx
- generateAcceptanceReportPdf
- trip-journal.ts
- code-map.py
- welcome-config.ts
- scripts
- command.tsx
- RouteMap.tsx
- next_api/contracts/route.ts
- 20261019_driver_shifts.sql
- devDependencies
- carousel.tsx
- driver-shift-pdf.ts
- PickupLocation.tsx
- LoginPageClient.tsx
- RegisterForm.tsx
- ResetPasswordForm.tsx
- push-worker.mjs
- PublicInfo.tsx
- DriverGuideSection.tsx
- 20261012_accounts_messages.sql
- chart.tsx
- [locale]/page.tsx
- LoginForm.tsx
- DriverFleetShift.tsx
- PDFGenerator
- "schema".security_fleet_locations
- secret-vault.ts
- pdf-generator.ts
- "schema".company_registrations
- class-variance-authority
- FaqPage.tsx
- chat/route.ts
- LoginModal.tsx
- pagination.tsx
- sheet.tsx
- recover-db-log.mjs
- scripts
- 20261013_mail_delivery.sql
- "schema".company_change_requests
- 20261026_manual_invoices.sql
- navigation-menu.tsx
- drawer.tsx
- next_api/drivers/route.ts
- driver-activity.ts
- Override
- rollout.mjs
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- HomepageAdSlotSection.tsx
- [...path]/route.ts
- driverShiftPdf
- android.content.Intent
- driver-app/tsconfig.json
- LiveMap.tsx
- "schema".company_staff_events
- 20261019_email_identity.sql
- 20261109_chiron_realtime.sql
- definitions.d.ts
- database-readiness.mjs
- landing/page.tsx
- brevo/route.ts
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- "schema".security_issue_subscription_demo
- "schema".security_email_contract
- apply-release.mjs
- drivers/pricing/route.ts
- contract-template.ts
- devDependencies
- 20261009_security.sql
- "schema".security_create_driver_account
- "schema".security_email_contract
- invoice_bank_snapshot
- 20261104_company_tariffs.sql
- prepare-customer-runtime.sh
- save
- 20261023_app_experience.sql
- company-portal/drivers/route.ts
- company-portal/vehicles/route.ts
- invoices/send/route.ts
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
1. `createErrorResponse()` - 273 edges
2. `createSuccessResponse()` - 271 edges
3. `generateAdminUserToken()` - 265 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 212 edges
6. `validateRequestBody()` - 164 edges
7. `Button` - 160 edges
8. `createPostgrestClient()` - 130 edges
9. `requestMiddleware()` - 123 edges
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
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (194 total, 59 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (114): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+106 more)

### Community 1 - "createPostgrestClient"
Cohesion: 0.06
Nodes (63): welcomePayload(), GET, PUT, GET, handler, POST, GET, PUT (+55 more)

### Community 2 - "Button"
Cohesion: 0.07
Nodes (63): Page(), Page(), Page(), CompanyDashboardPage(), InvoicePayment(), action(), words, ContractReview (+55 more)

### Community 3 - "ref_react"
Cohesion: 0.04
Nodes (59): nextConfig, framer-motion, lucide-react, next, AdminLayout(), DriverNotificationsPage(), glassCard, Notification (+51 more)

### Community 4 - "Label"
Cohesion: 0.08
Nodes (71): Company, CompanyContractsPage(), Contract, Signature, Company, Distributor, DistributorsPage(), GdprAdminPage() (+63 more)

### Community 5 - "Input"
Cohesion: 0.08
Nodes (62): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, CompaniesPage(), CompaniesPageContent(), Company (+54 more)

### Community 6 - "usePreferences"
Cohesion: 0.14
Nodes (51): Account(), ActiveTrip(), invoice(), useActivityFilters(), ActivityFilters(), AddressField(), BillingReminder(), dismissed (+43 more)

### Community 7 - "stripe-billing.ts"
Cohesion: 0.06
Nodes (62): stripe, runtime, runtime, register(), BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState (+54 more)

### Community 8 - "useAuth"
Cohesion: 0.09
Nodes (52): sonner, AdminAccountPage(), ChironSyncPage(), FailedTrip, ChironSettingsPage(), Company, Company, EditCompanyPage() (+44 more)

### Community 9 - "dependencies"
Cohesion: 0.03
Nodes (65): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+57 more)

### Community 10 - "api-utils.ts"
Cohesion: 0.06
Nodes (49): POST, POST, VALID_TYPES, GET, normalizeUrlPreview(), AUTH_ENABLED, authConfig, ApiParams (+41 more)

### Community 11 - "api.ts"
Cohesion: 0.07
Nodes (47): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead() (+39 more)

### Community 12 - "useTripController.ts"
Cohesion: 0.09
Nodes (41): ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), nativeJournal() (+33 more)

### Community 13 - "validateRequestBody"
Cohesion: 0.10
Nodes (37): bcryptjs, zod, dynamic, GET(), headers, GET, PUT, available() (+29 more)

### Community 14 - "cn"
Cohesion: 0.06
Nodes (51): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+43 more)

### Community 15 - "end/route.ts"
Cohesion: 0.09
Nodes (37): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError, numeric() (+29 more)

### Community 16 - "lib/auth.ts"
Cohesion: 0.11
Nodes (43): driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone(), normalizePhoneCandidates(), POST (+35 more)

### Community 17 - "InvoicesFeaturePage.tsx"
Cohesion: 0.07
Nodes (37): Page(), Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps (+29 more)

### Community 18 - "preferences.tsx"
Cohesion: 0.07
Nodes (30): APP_ORIGIN, companyRegistrationUrl(), LEGACY_APP_ORIGIN, RoadArt(), icon, companyCopy, copy, CopyKey (+22 more)

### Community 19 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 20 - "receipt-email/route.ts"
Cohesion: 0.09
Nodes (34): resend, command, POST, POST, POST, esc(), GET, POST (+26 more)

### Community 21 - "session.tsx"
Cohesion: 0.10
Nodes (32): App(), logout(), styles, createActionGate(), apiConnectionKey(), DriverTripSummary, DriverMap(), BrandMark() (+24 more)

### Community 22 - "package.json"
Cohesion: 0.05
Nodes (40): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+32 more)

### Community 23 - "sidebar.tsx"
Cohesion: 0.07
Nodes (31): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup, SidebarGroupAction (+23 more)

### Community 24 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 25 - "CookieBanner.tsx"
Cohesion: 0.09
Nodes (30): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+22 more)

### Community 26 - "marketing-content.ts"
Cohesion: 0.15
Nodes (29): dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props, SolutionPage() (+21 more)

### Community 27 - "driver-app/package.json"
Cohesion: 0.06
Nodes (30): eslint, react, react-dom, @types/react, typescript, main, name, overrides (+22 more)

### Community 28 - "utils.ts"
Cohesion: 0.06
Nodes (24): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+16 more)

### Community 29 - "api-client.ts"
Cohesion: 0.11
Nodes (22): DriverLoginPage(), DriverGoogleLoginButton(), DriverLoginClient(), DriverLoginContent(), LanguageToggle(), directoryCopy, CompanyOption, DirectoryKind (+14 more)

### Community 30 - "driver/taximeter/page.tsx"
Cohesion: 0.11
Nodes (29): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard(), LocationPoint (+21 more)

### Community 31 - "DriverDashboard.tsx"
Cohesion: 0.15
Nodes (25): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), DashboardPage(), ApprovalRequest (+17 more)

### Community 32 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 33 - "_layout.tsx"
Cohesion: 0.10
Nodes (25): Period, periodDates(), validDay(), validRange(), DriverMessage, DriverNotification, Layout(), Navigation() (+17 more)

### Community 34 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 35 - "ref_node_fs"
Cohesion: 0.11
Nodes (16): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv(), checkedStripeSetup(), enabledStripeEvents (+8 more)

### Community 36 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 37 - "app/layout.tsx"
Cohesion: 0.10
Nodes (21): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider() (+13 more)

### Community 38 - "vervoerbewijs.ts"
Cohesion: 0.13
Nodes (23): dynamic, GET(), headers, runtime, chironColor(), chironLabel(), fmtDateTime(), fmtGps() (+15 more)

### Community 39 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+19 more)

### Community 40 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 41 - "companies/route.ts"
Cohesion: 0.15
Nodes (17): POST, POST, POST, PUT, GET, POST, GET, POST (+9 more)

### Community 42 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 43 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 44 - "DriverShifts.tsx"
Cohesion: 0.13
Nodes (20): ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy, km, ShiftActivity (+12 more)

### Community 45 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 46 - "native-journal.ts"
Cohesion: 0.13
Nodes (12): login(), journalBytes(), assertNativeCryptoReady(), keys, createSqlTripStore(), open(), seal(), Database (+4 more)

### Community 47 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 48 - "convert-database.mjs"
Cohesion: 0.18
Nodes (19): main(), convertExport(), EXCLUDED, identifier(), integer(), JsonNumber, literal(), main() (+11 more)

### Community 49 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 50 - "ClassicFare.tsx"
Cohesion: 0.17
Nodes (19): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, FarePreview, same() (+11 more)

### Community 51 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 52 - "20261024_stripe_billing.sql"
Cohesion: 0.15
Nodes (14): "schema".security_stripe_allocate(), "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts (+6 more)

### Community 53 - "engine.ts"
Cohesion: 0.19
Nodes (19): qrcode, gsap, qrcode, three, mountCinema(), render(), resize(), optimize() (+11 more)

### Community 54 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 55 - "DriverRegisterForm.tsx"
Cohesion: 0.12
Nodes (21): DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data, step1Schema, Step2Data, step2Schema (+13 more)

### Community 58 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 59 - "ref_node_crypto"
Cohesion: 0.14
Nodes (9): createEnrollmentHandler(), escapeHtml(), totp(), dir, aad, openPushCredential(), decodeTotpSecret(), matchingTotpStep() (+1 more)

### Community 60 - "PlatformLanding.tsx"
Cohesion: 0.20
Nodes (12): metadata, RegistrationPage(), Cinema(), cinematicCopy, CinematicText, PlatformLanding(), openRegistration(), VehicleSelectionModalProps (+4 more)

### Community 61 - "SiteAIAgent"
Cohesion: 0.19
Nodes (18): apiFetch(), buildApiUrl(), detectChangeIntent(), detectSearchIntent(), formatEntityInfo(), generateId(), SiteAIAgent(), addAssistantMessage() (+10 more)

### Community 63 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 64 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 65 - "receipt/page.tsx"
Cohesion: 0.24
Nodes (14): ReceiptPage(), ReceiptWorkspace(), ExperienceFrame(), ExperienceGauge(), experienceWords, HomeInstruments(), ReceiptPrinter(), ReferenceMeter() (+6 more)

### Community 66 - "generateAcceptanceReportPdf"
Cohesion: 0.26
Nodes (14): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+6 more)

### Community 67 - "trip-journal.ts"
Cohesion: 0.23
Nodes (14): browserJournals, createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save() (+6 more)

### Community 68 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 69 - "welcome-config.ts"
Cohesion: 0.23
Nodes (14): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster(), WELCOME_LANGUAGES (+6 more)

### Community 70 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 71 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 72 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 73 - "next_api/contracts/route.ts"
Cohesion: 0.36
Nodes (14): PUT, DELETE, document(), failed(), GET, positiveId(), POST, PUT (+6 more)

### Community 74 - "20261019_driver_shifts.sql"
Cohesion: 0.25
Nodes (11): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_driver_shifts() (+3 more)

### Community 75 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+7 more)

### Community 76 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 77 - "driver-shift-pdf.ts"
Cohesion: 0.25
Nodes (9): jspdf, Company, configurePdfFonts(), CompanyTariff, drawPdfQr(), Quote, renderTariffSheet(), TariffSheet (+1 more)

### Community 78 - "PickupLocation.tsx"
Cohesion: 0.26
Nodes (12): search(), Failure, messages, locate(), coordinate(), createAddressSearch(), freshSearchPoint(), NativeAddress (+4 more)

### Community 79 - "LoginPageClient.tsx"
Cohesion: 0.19
Nodes (12): dynamic, LoginPage(), CompanyLoginForm(), LoginPageClient(), LoginPageContent(), ModeEnum, LOGIN, REGISTER (+4 more)

### Community 80 - "RegisterForm.tsx"
Cohesion: 0.24
Nodes (12): CredentialsFormData, credentialsSchema, RegisterForm(), RegisterFormProps, VerificationFormData, verificationSchema, ResetPasswordForm(), LoginModal() (+4 more)

### Community 81 - "ResetPasswordForm.tsx"
Cohesion: 0.18
Nodes (11): @hookform/resolvers, react-hook-form, CompanyLoginFormData, CompanyLoginFormProps, companyLoginSchema, PasswordInput, EmailFormData, emailSchema (+3 more)

### Community 82 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 83 - "PublicInfo.tsx"
Cohesion: 0.23
Nodes (9): metadata, Page(), metadata, Page(), metadata, PrivacyPolicyPage(), Locale, PublicInfo() (+1 more)

### Community 84 - "DriverGuideSection.tsx"
Cohesion: 0.22
Nodes (11): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+3 more)

### Community 85 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 86 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 87 - "[locale]/page.tsx"
Cohesion: 0.27
Nodes (8): generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, homeAlternates, homepageMetadata(), homepageSchema()

### Community 88 - "LoginForm.tsx"
Cohesion: 0.27
Nodes (9): GoogleLoginButton(), LoginForm(), LoginFormData, LoginFormProps, loginSchema, Alert, AlertDescription, AlertTitle (+1 more)

### Community 89 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 91 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 92 - "secret-vault.ts"
Cohesion: 0.22
Nodes (9): jose, apply, headers, url, close(), send(), decryptSecret(), encryptSecret() (+1 more)

### Community 93 - "pdf-generator.ts"
Cohesion: 0.22
Nodes (9): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, TestResult, TripInvoiceData (+1 more)

### Community 94 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 95 - "class-variance-authority"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 96 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 97 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 98 - "LoginModal.tsx"
Cohesion: 0.22
Nodes (8): LoginModalProps, ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET, LandingLanguage, landingTranslations

### Community 99 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 100 - "sheet.tsx"
Cohesion: 0.24
Nodes (9): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants (+1 more)

### Community 101 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 102 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 103 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 104 - ""schema".company_change_requests"
Cohesion: 0.28
Nodes (3): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change()

### Community 105 - "20261026_manual_invoices.sql"
Cohesion: 0.36
Nodes (5): manual_invoice_immutable, manual_payment_immutable, "schema".manual_invoice_payments, "schema".manual_invoices, "schema".security_manual_invoice()

### Community 106 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 107 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 108 - "next_api/drivers/route.ts"
Cohesion: 0.47
Nodes (7): POST, PUT, driverFieldsSchema, driverValidationError(), mutateDriverAccount(), optionalText, parseDriverFields()

### Community 109 - "driver-activity.ts"
Cohesion: 0.28
Nodes (7): GET, POST, unavailable, activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 111 - "rollout.mjs"
Cohesion: 0.29
Nodes (7): compose(), directory, env, [image, revision, target], lock, root, run()

### Community 112 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 113 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 114 - "HomepageAdSlotSection.tsx"
Cohesion: 0.36
Nodes (6): dompurify, dompurify, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 115 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 116 - "driverShiftPdf"
Cohesion: 0.46
Nodes (7): driverShiftPdf(), ensure(), page(), pairs(), paragraph(), section(), table()

### Community 118 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 119 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 121 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 122 - "20261109_chiron_realtime.sql"
Cohesion: 0.38
Nodes (3): record_trip_shift, trips_company_realtime_platform_ref_idx, trips_driver_realtime_active_idx

### Community 123 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 124 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 126 - "brevo/route.ts"
Cohesion: 0.52
Nodes (5): POST(), runtime, brevoMailEvent(), brevoProviderId(), brevoWebhookAuthorized()

### Community 127 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 128 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 129 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 130 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 131 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 134 - "apply-release.mjs"
Cohesion: 0.33
Nodes (3): files, names, values

### Community 135 - "drivers/pricing/route.ts"
Cohesion: 0.47
Nodes (5): GET, POST, pricingHandler, activeCompanyTariffs(), indicativeFare()

### Community 136 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 137 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, eslint, eslint-config-expo, @types/react, typescript

### Community 142 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 143 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 144 - "save"
Cohesion: 0.50
Nodes (4): clearForm(), commit(), retry(), save()

### Community 146 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 147 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 148 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 149 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

## Knowledge Gaps
- **776 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+771 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1110 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **59 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PlatformLanding()` connect `PlatformLanding.tsx` to `CookieBanner.tsx`, `marketing-content.ts`, `Button`, `Input`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _776 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.06935508005386802 - nodes in this community are weakly interconnected._
- **Why does `DriverDashboard()` connect `DriverDashboard.tsx` to `useAuth`, `Button`, `Label`, `Input`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `createPostgrestClient` be split into smaller, more focused modules?**
  _Cohesion score 0.057692307692307696 - nodes in this community are weakly interconnected._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.0662739322533137 - nodes in this community are weakly interconnected._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.03837719298245614 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 174 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 251 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
