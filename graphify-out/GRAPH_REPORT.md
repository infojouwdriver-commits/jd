# Graph Report - JOUW DRIVER  (2026-11-12)

## Corpus Check
- 636 files · ~273,216 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3650 nodes · 12290 edges · 187 communities (130 shown, 57 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 245 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `06a8ee5a`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- createPostgrestClient
- Button
- ref_react
- Input
- SelectContent
- usePreferences
- useAuth
- DriverRegisterForm.tsx
- useTripController.ts
- cn
- session.tsx
- dependencies
- lib/auth.ts
- zod
- api-utils.ts
- stripe-billing.ts
- api.ts
- SiteAIAgent.tsx
- App.tsx
- InvoicesFeaturePage.tsx
- BackgroundGeolocation
- package.json
- driver-app/package.json
- company-changes.ts
- sidebar.tsx
- 20261026_invoice_checkout.sql
- end/route.ts
- CookieBanner.tsx
- DriverShifts.tsx
- driver/taximeter/page.tsx
- BackgroundGeolocationService.java
- scripts
- mobile-location.ts
- PlatformLanding.tsx
- use-toast.ts
- dependencies
- utils.ts
- vervoerbewijs.ts
- mobile/package.json
- 20261018_company_lifecycle.sql
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- MarketingEditorial.tsx
- api-client.ts
- 20261019_shift_activity.sql
- convert-database.mjs
- receipt/page.tsx
- update-customer-portal.sh
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- pdf-generator.ts
- configure-mail.mjs
- ClassicFare.tsx
- form.tsx
- [resource]/page.tsx
- TripPointJournal.java
- compilerOptions
- DriverSettlementCalculator.tsx
- company-registrations/route.ts
- ref_node_fs
- password/route.ts
- BackgroundGeolocation
- AddressField.tsx
- "schema".security_operations_centre
- 20261016_native_push.sql
- generateAcceptanceReportPdf
- trip-journal.ts
- code-map.py
- ref_node_crypto
- welcome-config.ts
- command.tsx
- documents/route.ts
- RouteMap.tsx
- rollout.mjs
- 20261019_driver_shifts.sql
- carousel.tsx
- PublicInfo.tsx
- marketing-content.ts
- DriverGuideSection.tsx
- activity-state.tsx
- 20261012_accounts_messages.sql
- engine.ts
- chart.tsx
- DriverFleetShift.tsx
- company-pricing.ts
- "schema".security_fleet_locations
- HomepageAdSlotSection.tsx
- secret-vault.ts
- models.ts
- "schema".company_registrations
- class-variance-authority
- FaqPage.tsx
- chat/route.ts
- pagination.tsx
- sheet.tsx
- recover-db-log.mjs
- scripts
- 20261013_mail_delivery.sql
- "schema".company_change_requests
- 20261026_manual_invoices.sql
- navigation-menu.tsx
- start/route.ts
- Override
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- tariff-quote.ts
- [...path]/route.ts
- android.content.Intent
- driver-app/tsconfig.json
- LiveMap.tsx
- "schema".company_staff_events
- 20261019_email_identity.sql
- 20261109_chiron_realtime.sql
- definitions.d.ts
- database-readiness.mjs
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- "schema".security_issue_subscription_demo
- "schema".security_email_contract
- contract-template.ts
- devDependencies
- overrides
- 20261009_security.sql
- "schema".security_create_driver_account
- "schema".security_email_contract
- invoice_bank_snapshot
- 20261104_company_tariffs.sql
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- save
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

## Communities (187 total, 57 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (119): bcryptjs, GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE (+111 more)

### Community 1 - "createPostgrestClient"
Cohesion: 0.05
Nodes (71): welcomePayload(), dynamic, GET(), headers, GET, PUT, POST, schema (+63 more)

### Community 2 - "Button"
Cohesion: 0.06
Nodes (70): Page(), Page(), Page(), CompanyDashboardPage(), ContractPrintPage(), PrintableContract, InvoicePayment(), action() (+62 more)

### Community 3 - "ref_react"
Cohesion: 0.04
Nodes (67): nextConfig, framer-motion, lucide-react, next, FailedTrip, Company, AdminLayout(), DriverLoginPage() (+59 more)

### Community 4 - "Input"
Cohesion: 0.08
Nodes (63): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, CompanyPricingPage(), Issued, CompaniesPage() (+55 more)

### Community 5 - "SelectContent"
Cohesion: 0.08
Nodes (71): Company, CompanyContractsPage(), Contract, Signature, PlatformContract, PlatformContractsPage(), Company, Distributor (+63 more)

### Community 6 - "usePreferences"
Cohesion: 0.14
Nodes (49): Account(), ActiveTrip(), useActivityFilters(), ActivityFilters(), RoadArt(), BillingReminder(), dismissed, ClassicDisplay() (+41 more)

### Community 7 - "useAuth"
Cohesion: 0.08
Nodes (62): sonner, AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard() (+54 more)

### Community 8 - "DriverRegisterForm.tsx"
Cohesion: 0.05
Nodes (67): @hookform/resolvers, react-hook-form, dynamic, LoginPage(), CompanyLoginForm(), DriverRegisterForm(), DriverRegisterFormProps, FormField() (+59 more)

### Community 9 - "useTripController.ts"
Cohesion: 0.08
Nodes (46): ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), FleetLocation() (+38 more)

### Community 10 - "cn"
Cohesion: 0.05
Nodes (58): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, vaul, AccordionContent, AccordionItem, AccordionTrigger (+50 more)

### Community 11 - "session.tsx"
Cohesion: 0.06
Nodes (47): Layout(), Navigation(), APP_ORIGIN, companyRegistrationUrl(), LEGACY_APP_ORIGIN, BrandMark(), icon, companyCopy (+39 more)

### Community 12 - "dependencies"
Cohesion: 0.03
Nodes (65): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+57 more)

### Community 13 - "lib/auth.ts"
Cohesion: 0.10
Nodes (50): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+42 more)

### Community 14 - "zod"
Cohesion: 0.07
Nodes (48): zod, available(), GET, POST, schema, POST, schema, registerSchema (+40 more)

### Community 15 - "api-utils.ts"
Cohesion: 0.06
Nodes (47): GET, POST, POST, VALID_TYPES, POST, GET, normalizeUrlPreview(), ApiParams (+39 more)

### Community 16 - "stripe-billing.ts"
Cohesion: 0.08
Nodes (50): stripe, runtime, runtime, register(), BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState (+42 more)

### Community 17 - "api.ts"
Cohesion: 0.07
Nodes (46): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead() (+38 more)

### Community 18 - "SiteAIAgent.tsx"
Cohesion: 0.06
Nodes (45): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, apiFetch(), ApiResponse (+37 more)

### Community 19 - "App.tsx"
Cohesion: 0.07
Nodes (32): App(), login(), logout(), styles, createActionGate(), apiConnectionKey(), DriverTripSummary, DriverMap() (+24 more)

### Community 20 - "InvoicesFeaturePage.tsx"
Cohesion: 0.07
Nodes (36): Page(), Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps (+28 more)

### Community 21 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 22 - "package.json"
Cohesion: 0.05
Nodes (41): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+33 more)

### Community 23 - "driver-app/package.json"
Cohesion: 0.05
Nodes (37): eslint, react, react-dom, @types/react, typescript, main, name, private (+29 more)

### Community 24 - "company-changes.ts"
Cohesion: 0.12
Nodes (27): GET, resolveDistributorInfo(), resolveEffectiveUserType(), POST, POST, PUT, getAuthRoles(), changeFingerprint() (+19 more)

### Community 25 - "sidebar.tsx"
Cohesion: 0.07
Nodes (31): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup, SidebarGroupAction (+23 more)

### Community 26 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 27 - "end/route.ts"
Cohesion: 0.14
Nodes (22): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError, numeric() (+14 more)

### Community 28 - "CookieBanner.tsx"
Cohesion: 0.10
Nodes (29): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+21 more)

### Community 29 - "DriverShifts.tsx"
Cohesion: 0.11
Nodes (27): ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy, driverShiftPdf(), ensure() (+19 more)

### Community 30 - "driver/taximeter/page.tsx"
Cohesion: 0.11
Nodes (29): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard(), LocationPoint (+21 more)

### Community 31 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 32 - "scripts"
Cohesion: 0.06
Nodes (31): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+23 more)

### Community 33 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 34 - "PlatformLanding.tsx"
Cohesion: 0.13
Nodes (20): generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, metadata, RegistrationPage(), Cinema() (+12 more)

### Community 35 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 36 - "dependencies"
Cohesion: 0.07
Nodes (28): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-font, expo-haptics, expo-linking (+20 more)

### Community 37 - "utils.ts"
Cohesion: 0.07
Nodes (20): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+12 more)

### Community 38 - "vervoerbewijs.ts"
Cohesion: 0.13
Nodes (23): dynamic, GET(), headers, runtime, chironColor(), chironLabel(), fmtDateTime(), fmtGps() (+15 more)

### Community 39 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 40 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 41 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 42 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 43 - "MarketingEditorial.tsx"
Cohesion: 0.20
Nodes (20): dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props, SolutionPage() (+12 more)

### Community 44 - "api-client.ts"
Cohesion: 0.15
Nodes (17): directoryCopy, CompanyOption, DirectoryKind, DirectoryResult, api, apiRequest(), ApiResponse, buildApiUrl() (+9 more)

### Community 45 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 46 - "convert-database.mjs"
Cohesion: 0.18
Nodes (19): main(), convertExport(), EXCLUDED, identifier(), integer(), JsonNumber, literal(), main() (+11 more)

### Community 47 - "receipt/page.tsx"
Cohesion: 0.15
Nodes (20): ReceiptPage(), ReceiptWorkspace(), ExperienceFrame(), ExperienceGauge(), experienceWords, HomeInstruments(), ReceiptPrinter(), ReferenceMeter() (+12 more)

### Community 48 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 49 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 50 - "20261024_stripe_billing.sql"
Cohesion: 0.15
Nodes (14): "schema".security_stripe_allocate(), "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts (+6 more)

### Community 51 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 52 - "configure-mail.mjs"
Cohesion: 0.14
Nodes (14): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv(), checkedStripeSetup(), enabledStripeEvents (+6 more)

### Community 53 - "ClassicFare.tsx"
Cohesion: 0.18
Nodes (18): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, FarePreview, same() (+10 more)

### Community 54 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 55 - "[resource]/page.tsx"
Cohesion: 0.18
Nodes (17): generateMetadata(), getPage(), isResource(), MarketingResource(), Props, MarketingExplore(), marketingLocales, marketingTopics (+9 more)

### Community 58 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 59 - "DriverSettlementCalculator.tsx"
Cohesion: 0.19
Nodes (12): DriverSettlementCalculator(), download(), fields, summary, MarketingLocale, calculatorText(), calculateSettlement(), cents() (+4 more)

### Community 60 - "company-registrations/route.ts"
Cohesion: 0.29
Nodes (16): GET, PUT, review, DELETE, document(), failed(), GET, positiveId() (+8 more)

### Community 61 - "ref_node_fs"
Cohesion: 0.13
Nodes (8): createEnrollmentHandler(), escapeHtml(), totp(), mobileConfig(), files, names, values, [id,output]

### Community 62 - "password/route.ts"
Cohesion: 0.23
Nodes (12): POST, PUT, GET, POST, GET, POST, credentials, saveCompanyAccount() (+4 more)

### Community 64 - "AddressField.tsx"
Cohesion: 0.29
Nodes (14): AddressField(), search(), Failure, messages, PickupLocation(), locate(), coordinate(), createAddressSearch() (+6 more)

### Community 65 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 66 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 67 - "generateAcceptanceReportPdf"
Cohesion: 0.26
Nodes (14): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+6 more)

### Community 68 - "trip-journal.ts"
Cohesion: 0.23
Nodes (14): browserJournals, createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save() (+6 more)

### Community 69 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 70 - "ref_node_crypto"
Cohesion: 0.18
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 71 - "welcome-config.ts"
Cohesion: 0.23
Nodes (14): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster(), WELCOME_LANGUAGES (+6 more)

### Community 72 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 73 - "documents/route.ts"
Cohesion: 0.26
Nodes (9): jspdf, GET, handler, POST, configurePdfFonts(), activeCompanyTariffs(), drawPdfQr(), renderTariffSheet() (+1 more)

### Community 74 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 75 - "rollout.mjs"
Cohesion: 0.15
Nodes (10): dir, aad, openPushCredential(), compose(), directory, env, [image, revision, target], lock (+2 more)

### Community 76 - "20261019_driver_shifts.sql"
Cohesion: 0.25
Nodes (11): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_driver_shifts() (+3 more)

### Community 77 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 78 - "PublicInfo.tsx"
Cohesion: 0.23
Nodes (9): metadata, Page(), metadata, Page(), metadata, PrivacyPolicyPage(), Locale, PublicInfo() (+1 more)

### Community 79 - "marketing-content.ts"
Cohesion: 0.18
Nodes (7): metadata, Benefit, LocaleCopy, marketingOrigin, MarketingTopic, Question, SolutionCopy

### Community 80 - "DriverGuideSection.tsx"
Cohesion: 0.22
Nodes (11): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+3 more)

### Community 81 - "activity-state.tsx"
Cohesion: 0.26
Nodes (9): Period, periodDates(), validDay(), validRange(), ActivityProvider(), Context, useStateValue(), apply() (+1 more)

### Community 82 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 83 - "engine.ts"
Cohesion: 0.20
Nodes (10): qrcode, gsap, qrcode, three, mountCinema(), render(), resize(), optimize() (+2 more)

### Community 84 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 85 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 86 - "company-pricing.ts"
Cohesion: 0.33
Nodes (10): CompanyPricing, companyPricingPatch(), companyTariffs(), defaults, driverPricing(), normalizeCompanyPricing(), numericField(), peakPeriods() (+2 more)

### Community 87 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 88 - "HomepageAdSlotSection.tsx"
Cohesion: 0.25
Nodes (8): dompurify, dompurify, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml(), LandingLanguage, landingTranslations

### Community 89 - "secret-vault.ts"
Cohesion: 0.22
Nodes (9): jose, apply, headers, url, close(), send(), decryptSecret(), encryptSecret() (+1 more)

### Community 90 - "models.ts"
Cohesion: 0.47
Nodes (9): box(), createCar(), createPhone(), createPrinter(), mesh(), metal(), surface(), textTexture() (+1 more)

### Community 91 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 92 - "class-variance-authority"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 93 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 94 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 95 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 96 - "sheet.tsx"
Cohesion: 0.24
Nodes (9): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants (+1 more)

### Community 97 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 98 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 99 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 100 - ""schema".company_change_requests"
Cohesion: 0.28
Nodes (3): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change()

### Community 101 - "20261026_manual_invoices.sql"
Cohesion: 0.36
Nodes (5): manual_invoice_immutable, manual_payment_immutable, "schema".manual_invoice_payments, "schema".manual_invoices, "schema".security_manual_invoice()

### Community 102 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 103 - "start/route.ts"
Cohesion: 0.36
Nodes (5): POST, POST, retryPendingTripEvents(), syncTripDeparture(), departureTime()

### Community 105 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 106 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 107 - "tariff-quote.ts"
Cohesion: 0.36
Nodes (7): Company, CompanyTariff, Quote, readTariffQuote(), signature(), signTariffQuote(), TariffSheet

### Community 108 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 110 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 111 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

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

### Community 118 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 119 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 120 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 121 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 124 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 125 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, eslint, eslint-config-expo, @types/react, typescript

### Community 126 - "overrides"
Cohesion: 0.40
Nodes (5): minimatch, overrides, @expo/fingerprint, @typescript-eslint/typescript-estree, minimatch

### Community 131 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 132 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 133 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 134 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 135 - "save"
Cohesion: 0.50
Nodes (4): clearForm(), commit(), retry(), save()

### Community 137 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 138 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 139 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 140 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 141 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 142 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

## Knowledge Gaps
- **783 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+778 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1122 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **57 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `OperationForm()` connect `Button` to `Input`, `SelectContent`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _783 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.0714826281389749 - nodes in this community are weakly interconnected._
- **Should `createPostgrestClient` be split into smaller, more focused modules?**
  _Cohesion score 0.048594938674118925 - nodes in this community are weakly interconnected._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.0585487906588824 - nodes in this community are weakly interconnected._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.037030506083583145 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.07595515900251659 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 174 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 256 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
