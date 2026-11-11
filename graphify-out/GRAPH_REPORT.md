# Graph Report - JOUW DRIVER  (2026-11-11)

## Corpus Check
- 636 files · ~273,093 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3645 nodes · 12285 edges · 185 communities (128 shown, 57 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 245 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cec8ce4a`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- useLanguage
- ref_react
- Input
- createPostgrestClient
- lib/auth.ts
- useAuth
- admin/messages/page.tsx
- usePreferences
- DriverRegisterForm.tsx
- useTripController.ts
- api.ts
- next
- receipt-email/route.ts
- dependencies
- api-utils.ts
- cn
- stripe-billing.ts
- BackgroundGeolocation
- DriverShifts.tsx
- package.json
- company-changes.ts
- sidebar.tsx
- driver-app/package.json
- 20261026_invoice_checkout.sql
- _layout.tsx
- preferences.tsx
- MarketingEditorial.tsx
- BackgroundGeolocationService.java
- WelcomeScreen.tsx
- mobile-location.ts
- use-toast.ts
- documents/route.ts
- dependencies
- mobile/package.json
- engine.ts
- utils.ts
- 20261018_company_lifecycle.sql
- 20261018_subscription_billing.sql
- end/route.ts
- jouww-cutover.mjs
- SiteAIAgent.tsx
- native-journal.ts
- 20261019_shift_activity.sql
- update-customer-portal.sh
- ClassicFare.tsx
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- DirectoryToolbar.tsx
- pdf-generator.ts
- ref_node_fs
- form.tsx
- TripPointJournal.java
- session.tsx
- DriverGdprSection.tsx
- chiron-service.ts
- sheet.tsx
- compilerOptions
- DriverSettlementCalculator.tsx
- app/layout.tsx
- password/route.ts
- BackgroundGeolocation
- AddressField.tsx
- "schema".security_operations_centre
- 20261016_native_push.sql
- generateAcceptanceReportPdf
- code-map.py
- ref_node_crypto
- scripts
- 20261019_driver_shifts.sql
- devDependencies
- carousel.tsx
- apply-release.mjs
- convert-database.mjs
- [locale]/page.tsx
- next_api/contracts/route.ts
- configure-mail.mjs
- RouteMap.tsx
- [resource]/page.tsx
- PlatformLanding.tsx
- PublicInfo.tsx
- CookieBanner.tsx
- DriverGuideSection.tsx
- 20261012_accounts_messages.sql
- chart.tsx
- marketing-content.ts
- DriverFleetShift.tsx
- company-pricing.ts
- createTripJournal
- "schema".security_fleet_locations
- LanguageProvider
- "schema".company_registrations
- FaqPage.tsx
- chat/route.ts
- pagination.tsx
- recover-db-log.mjs
- scripts
- 20261013_mail_delivery.sql
- "schema".company_change_requests
- 20261026_manual_invoices.sql
- navigation-menu.tsx
- drawer.tsx
- Override
- rollout.mjs
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- HomepageAdSlotSection.tsx
- tariff-quote.ts
- [...path]/route.ts
- android.content.Intent
- driver-app/tsconfig.json
- "schema".company_staff_events
- 20261019_email_identity.sql
- 20261109_chiron_realtime.sql
- definitions.d.ts
- database-readiness.mjs
- useAddressSearch.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- "schema".security_issue_subscription_demo
- "schema".security_email_contract
- contract-template.ts
- admin-enrollment.mjs
- 20261009_security.sql
- "schema".security_create_driver_account
- "schema".security_email_contract
- invoice_bank_snapshot
- 20261104_company_tariffs.sql
- container-scroll-animation.tsx
- document-links.ts
- driver-activity.ts
- prepare-customer-runtime.sh
- 20261023_app_experience.sql
- company-portal/drivers/route.ts
- company-portal/vehicles/route.ts
- invoices/send/route.ts
- view/route.ts
- websocket/route.ts
- totp.ts
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
- `ActiveTrip()` --references--> `Alert`  [EXTRACTED]
  driver-app/src/experience/ActiveTrip.tsx → src/components/ui/alert.tsx
- `search()` --indirect_call--> `value()`  [INFERRED]
  driver-app/src/experience/AddressField.tsx → scripts/convert-database.mjs
- `locate()` --references--> `Location`  [EXTRACTED]
  driver-app/src/experience/PickupLocation.tsx → mobile/plugins/background-geolocation/definitions.d.ts

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

## Communities (185 total, 57 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (119): bcryptjs, GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE (+111 more)

### Community 1 - "useLanguage"
Cohesion: 0.03
Nodes (111): framer-motion, leaflet, lucide-react, DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification() (+103 more)

### Community 2 - "ref_react"
Cohesion: 0.05
Nodes (72): ChironSyncPage(), FailedTrip, Page(), Page(), Page(), ContractPrintPage(), PrintableContract, InvoicePayment() (+64 more)

### Community 3 - "Input"
Cohesion: 0.08
Nodes (82): Company, CompanyContractsPage(), Contract, Signature, Company, EditCompanyPage(), PlatformContract, PlatformContractsPage() (+74 more)

### Community 4 - "createPostgrestClient"
Cohesion: 0.06
Nodes (59): welcomePayload(), GET, PUT, GET, PUT, command, filters, GET (+51 more)

### Community 5 - "lib/auth.ts"
Cohesion: 0.07
Nodes (70): zod, GET, PUT, available(), GET, POST, schema, driverLoginSchema (+62 more)

### Community 6 - "useAuth"
Cohesion: 0.07
Nodes (67): sonner, AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard() (+59 more)

### Community 7 - "admin/messages/page.tsx"
Cohesion: 0.06
Nodes (63): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, CompaniesPage(), CompaniesPageContent(), Company (+55 more)

### Community 8 - "usePreferences"
Cohesion: 0.15
Nodes (47): DriverMap(), Account(), ActiveTrip(), useActivityFilters(), ActivityFilters(), BillingReminder(), dismissed, ClassicDisplay() (+39 more)

### Community 9 - "DriverRegisterForm.tsx"
Cohesion: 0.05
Nodes (70): @hookform/resolvers, react-hook-form, dynamic, LoginPage(), CompanyLoginForm(), DriverRegisterForm(), DriverRegisterFormProps, FormField() (+62 more)

### Community 10 - "useTripController.ts"
Cohesion: 0.08
Nodes (50): App(), styles, ActionGate, createActionGate(), DriverProfile, DriverVehicle, Context, enableBackgroundMeter() (+42 more)

### Community 11 - "api.ts"
Cohesion: 0.05
Nodes (56): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead() (+48 more)

### Community 12 - "next"
Cohesion: 0.05
Nodes (50): nextConfig, next, CompanyPricingPage(), Issued, DriverLoginPage(), glassCard, labelStyle, PeriodType (+42 more)

### Community 13 - "receipt-email/route.ts"
Cohesion: 0.06
Nodes (50): resend, dynamic, GET(), headers, runtime, dynamic, GET(), headers (+42 more)

### Community 14 - "dependencies"
Cohesion: 0.03
Nodes (65): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+57 more)

### Community 15 - "api-utils.ts"
Cohesion: 0.06
Nodes (48): GET, POST, POST, VALID_TYPES, GET, normalizeUrlPreview(), AUTH_ENABLED, authConfig (+40 more)

### Community 16 - "cn"
Cohesion: 0.06
Nodes (54): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, react-resizable-panels, AccordionContent, AccordionItem, AccordionTrigger (+46 more)

### Community 17 - "stripe-billing.ts"
Cohesion: 0.08
Nodes (50): stripe, runtime, runtime, register(), BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState (+42 more)

### Community 18 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 19 - "DriverShifts.tsx"
Cohesion: 0.08
Nodes (37): jose, apply, headers, url, ShiftPage(), close(), DocumentQr(), DriverShifts() (+29 more)

### Community 20 - "package.json"
Cohesion: 0.05
Nodes (39): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+31 more)

### Community 21 - "company-changes.ts"
Cohesion: 0.11
Nodes (27): GET, resolveDistributorInfo(), resolveEffectiveUserType(), POST, PUT, getAuthRoles(), changeFingerprint(), changesGET (+19 more)

### Community 22 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 23 - "driver-app/package.json"
Cohesion: 0.06
Nodes (37): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+29 more)

### Community 24 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 25 - "_layout.tsx"
Cohesion: 0.09
Nodes (28): Period, periodDates(), validDay(), validRange(), Layout(), Navigation(), ActivityProvider(), Context (+20 more)

### Community 26 - "preferences.tsx"
Cohesion: 0.11
Nodes (19): RoadArt(), icon, companyCopy, copy, CopyKey, Language, JourneyMark(), WelcomeHeader() (+11 more)

### Community 27 - "MarketingEditorial.tsx"
Cohesion: 0.17
Nodes (25): dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props, SolutionPage() (+17 more)

### Community 28 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 29 - "WelcomeScreen.tsx"
Cohesion: 0.13
Nodes (24): APP_ORIGIN, companyRegistrationUrl(), LEGACY_APP_ORIGIN, cachedSettings(), cacheFile(), poster, useWelcomeSettings(), DEFAULT_WELCOME (+16 more)

### Community 30 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 31 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 32 - "documents/route.ts"
Cohesion: 0.13
Nodes (20): jspdf, GET, handler, POST, configurePdfFonts(), chironColor(), chironLabel(), fmtDateTime() (+12 more)

### Community 33 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+19 more)

### Community 34 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 35 - "engine.ts"
Cohesion: 0.16
Nodes (21): qrcode, gsap, qrcode, three, cinematicCopy, CinematicText, mountCinema(), render() (+13 more)

### Community 36 - "utils.ts"
Cohesion: 0.08
Nodes (19): clsx, @radix-ui/react-checkbox, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker (+11 more)

### Community 37 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 38 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 39 - "end/route.ts"
Cohesion: 0.18
Nodes (19): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, POST, canAttempt(), publicTrip(), retryable (+11 more)

### Community 40 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 41 - "SiteAIAgent.tsx"
Cohesion: 0.14
Nodes (24): apiFetch(), ApiResponse, buildApiUrl(), ChatMessage, ConversationStep, detectChangeIntent(), detectSearchIntent(), formatEntityInfo() (+16 more)

### Community 42 - "native-journal.ts"
Cohesion: 0.13
Nodes (12): login(), journalBytes(), assertNativeCryptoReady(), keys, createSqlTripStore(), open(), seal(), Database (+4 more)

### Community 43 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 44 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 45 - "ClassicFare.tsx"
Cohesion: 0.17
Nodes (19): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, FarePreview, same() (+11 more)

### Community 46 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 47 - "20261024_stripe_billing.sql"
Cohesion: 0.15
Nodes (14): "schema".security_stripe_allocate(), "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts (+6 more)

### Community 48 - "DirectoryToolbar.tsx"
Cohesion: 0.14
Nodes (17): cmdk, @radix-ui/react-popover, directoryCopy, CompanyOption, CompanyPicker(), DirectoryKind, DirectoryResult, Command (+9 more)

### Community 49 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 50 - "ref_node_fs"
Cohesion: 0.13
Nodes (10): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys, mobileConfig() (+2 more)

### Community 51 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 53 - "session.tsx"
Cohesion: 0.18
Nodes (16): logout(), apiConnectionKey(), BrandMark(), JourneyLoading(), clearReceiptCache(), Context, SessionProvider(), TripContext (+8 more)

### Community 54 - "DriverGdprSection.tsx"
Cohesion: 0.16
Nodes (17): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+9 more)

### Community 55 - "chiron-service.ts"
Cohesion: 0.27
Nodes (8): POST, canonicalChironEnvironment(), chironDestination(), ChironError, numeric(), rideMessage(), timestamp(), ChironService

### Community 57 - "sheet.tsx"
Cohesion: 0.13
Nodes (17): class-variance-authority, @radix-ui/react-dialog, @radix-ui/react-toggle, @radix-ui/react-toggle-group, SheetContent, SheetContentProps, SheetDescription, SheetFooter() (+9 more)

### Community 58 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 59 - "DriverSettlementCalculator.tsx"
Cohesion: 0.19
Nodes (12): DriverSettlementCalculator(), download(), fields, summary, MarketingLocale, calculatorText(), calculateSettlement(), cents() (+4 more)

### Community 60 - "app/layout.tsx"
Cohesion: 0.16
Nodes (13): next-themes, dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider(), GlobalClientEffects() (+5 more)

### Community 61 - "password/route.ts"
Cohesion: 0.23
Nodes (12): POST, PUT, GET, POST, GET, POST, credentials, saveCompanyAccount() (+4 more)

### Community 63 - "AddressField.tsx"
Cohesion: 0.29
Nodes (14): AddressField(), search(), Failure, messages, PickupLocation(), locate(), coordinate(), createAddressSearch() (+6 more)

### Community 64 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 65 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 66 - "generateAcceptanceReportPdf"
Cohesion: 0.26
Nodes (14): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+6 more)

### Community 67 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 68 - "ref_node_crypto"
Cohesion: 0.18
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 69 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 70 - "20261019_driver_shifts.sql"
Cohesion: 0.25
Nodes (11): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_driver_shifts() (+3 more)

### Community 71 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+7 more)

### Community 72 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 73 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 74 - "convert-database.mjs"
Cohesion: 0.27
Nodes (12): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), parseSchema() (+4 more)

### Community 75 - "[locale]/page.tsx"
Cohesion: 0.22
Nodes (11): generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, homeAlternates, homepageMetadata(), homepageSchema() (+3 more)

### Community 76 - "next_api/contracts/route.ts"
Cohesion: 0.39
Nodes (13): PUT, DELETE, document(), failed(), GET, positiveId(), POST, PUT (+5 more)

### Community 77 - "configure-mail.mjs"
Cohesion: 0.20
Nodes (9): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv(), dir, aad (+1 more)

### Community 78 - "RouteMap.tsx"
Cohesion: 0.22
Nodes (12): RouteCoords, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), DrivingRoute, fetchDrivingRoute() (+4 more)

### Community 79 - "[resource]/page.tsx"
Cohesion: 0.23
Nodes (11): generateMetadata(), getPage(), isResource(), MarketingResource(), Props, calculatorCopy, calculatorDescription, chironGuide (+3 more)

### Community 80 - "PlatformLanding.tsx"
Cohesion: 0.26
Nodes (8): metadata, RegistrationPage(), Cinema(), PlatformLanding(), openRegistration(), portalHref(), portalOrigin(), registrationHandoff()

### Community 81 - "PublicInfo.tsx"
Cohesion: 0.23
Nodes (9): metadata, Page(), metadata, Page(), metadata, PrivacyPolicyPage(), Locale, PublicInfo() (+1 more)

### Community 82 - "CookieBanner.tsx"
Cohesion: 0.26
Nodes (11): CookieBanner(), CookieCategory, DEFAULT_CATEGORIES, T, COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION, COOKIE_PREFERENCES_EVENT, CookieConsent (+3 more)

### Community 83 - "DriverGuideSection.tsx"
Cohesion: 0.22
Nodes (11): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+3 more)

### Community 84 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 85 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 86 - "marketing-content.ts"
Cohesion: 0.20
Nodes (7): metadata, Benefit, LocaleCopy, marketingOrigin, MarketingTopic, Question, SolutionCopy

### Community 87 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 88 - "company-pricing.ts"
Cohesion: 0.33
Nodes (10): CompanyPricing, companyPricingPatch(), companyTariffs(), defaults, driverPricing(), normalizeCompanyPricing(), numericField(), peakPeriods() (+2 more)

### Community 89 - "createTripJournal"
Cohesion: 0.38
Nodes (11): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+3 more)

### Community 90 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 91 - "LanguageProvider"
Cohesion: 0.24
Nodes (8): DriverLayout(), DriverLayoutShell(), detectBrowserLanguage(), LanguageProvider(), normalizeLanguage(), readCookieLanguage(), setDocumentDirection(), setLanguageCookie()

### Community 92 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 93 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 94 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 95 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 96 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 97 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 98 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 99 - ""schema".company_change_requests"
Cohesion: 0.28
Nodes (3): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change()

### Community 100 - "20261026_manual_invoices.sql"
Cohesion: 0.36
Nodes (5): manual_invoice_immutable, manual_payment_immutable, "schema".manual_invoice_payments, "schema".manual_invoices, "schema".security_manual_invoice()

### Community 101 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 102 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 104 - "rollout.mjs"
Cohesion: 0.29
Nodes (7): compose(), directory, env, [image, revision, target], lock, root, run()

### Community 105 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 106 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 107 - "HomepageAdSlotSection.tsx"
Cohesion: 0.36
Nodes (6): dompurify, dompurify, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 108 - "tariff-quote.ts"
Cohesion: 0.36
Nodes (7): Company, CompanyTariff, Quote, readTariffQuote(), signature(), signTariffQuote(), TariffSheet

### Community 109 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 111 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 113 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 114 - "20261109_chiron_realtime.sql"
Cohesion: 0.38
Nodes (3): record_trip_shift, trips_company_realtime_platform_ref_idx, trips_driver_realtime_active_idx

### Community 115 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 116 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 117 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 118 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 119 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 120 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 123 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 124 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 129 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 130 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 131 - "document-links.ts"
Cohesion: 0.60
Nodes (4): documentOrigin, receiptCapability(), signature(), verifyReceiptCapability()

### Community 132 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 133 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 135 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 136 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 137 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 138 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 139 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 140 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

## Knowledge Gaps
- **780 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+775 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1119 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **57 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PlatformLanding()` connect `PlatformLanding.tsx` to `useLanguage`, `MarketingEditorial.tsx`, `useAuth`, `admin/messages/page.tsx`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _780 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07065143478852169 - nodes in this community are weakly interconnected._
- **Why does `CompanyDashboard()` connect `useAuth` to `useLanguage`, `ref_react`, `Input`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `useLanguage` be split into smaller, more focused modules?**
  _Cohesion score 0.029841761265909872 - nodes in this community are weakly interconnected._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.05438165438165438 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.07639699749791493 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 174 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 256 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
