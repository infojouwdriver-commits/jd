# Graph Report - JOUW DRIVER  (2026-11-15)

## Corpus Check
- 661 files · ~279,941 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3789 nodes · 12767 edges · 199 communities (138 shown, 61 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 246 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `60b0b3a2`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- Input
- createPostgrestClient
- lucide-react
- useLanguage
- ref_react
- lib/auth.ts
- usePreferences
- useTripController.ts
- Card
- stripe-billing.ts
- api-utils.ts
- DriverRegisterForm.tsx
- cn
- dependencies
- api.ts
- end/route.ts
- session.tsx
- BackgroundGeolocation
- ReportsPage.tsx
- package.json
- preferences.tsx
- sidebar.tsx
- renderer.ts
- 20261026_invoice_checkout.sql
- CookieBanner.tsx
- driver-app/package.json
- _layout.tsx
- driver/taximeter/page.tsx
- PlatformLanding.tsx
- validateRequestBody
- BackgroundGeolocationService.java
- mobile-location.ts
- utils.ts
- use-toast.ts
- vervoerbewijs.ts
- DriverShifts.tsx
- dependencies
- mobile/package.json
- 20261018_company_lifecycle.sql
- 20261018_subscription_billing.sql
- MarketingEditorial.tsx
- jouww-cutover.mjs
- public-contact.ts
- email-templates/route.ts
- ref_node_crypto
- 20261019_shift_activity.sql
- app/layout.tsx
- api-client.ts
- update-customer-portal.sh
- ClassicFare.tsx
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- pdf-generator.ts
- ref_node_fs
- form.tsx
- TripPointJournal.java
- engine.ts
- [resource]/page.tsx
- company-pricing.ts
- compilerOptions
- DriverSettlementCalculator.tsx
- navigation-menu.tsx
- municipal-test-documents.ts
- welcome-config.ts
- company-registrations/route.ts
- SiteAIAgent
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- contract-email-handler.ts
- trip-journal.ts
- code-map.py
- scripts
- command.tsx
- mailConfiguration
- receipt/page.tsx
- RouteMap.tsx
- 20261019_driver_shifts.sql
- devDependencies
- carousel.tsx
- apply-release.mjs
- convert-database.mjs
- receipts/[token]/route.ts
- PickupLocation.tsx
- approval-mail-scheduler.ts
- mail-service.ts
- DriverGuideSection.tsx
- 20261012_accounts_messages.sql
- chart.tsx
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- secret-vault.ts
- marketing-content.ts
- "schema".company_registrations
- EmailTemplatesPanel.tsx
- FaqPage.tsx
- chat/route.ts
- configure-stripe.mjs
- recover-db-log.mjs
- scripts
- 20261013_mail_delivery.sql
- "schema".company_change_requests
- 20261026_manual_invoices.sql
- drawer.tsx
- sheet.tsx
- Override
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- HomepageAdSlotSection.tsx
- activity/route.ts
- [...path]/route.ts
- driverShiftPdf
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
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- "schema".security_issue_subscription_demo
- "schema".security_email_contract
- 20261115_chiron_onboarding.sql
- next_api/drivers/route.ts
- contract-template.ts
- admin-enrollment.mjs
- devDependencies
- 20261009_security.sql
- "schema".security_create_driver_account
- "schema".security_email_contract
- invoice_bank_snapshot
- 20261104_company_tariffs.sql
- 20261114_email_templates.sql
- prepare-customer-runtime.sh
- save
- 20261023_app_experience.sql
- scroll-area.tsx
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

## Communities (199 total, 61 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (113): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+105 more)

### Community 1 - "Input"
Cohesion: 0.07
Nodes (92): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, EditCompanyPage(), CompaniesPage(), CompaniesPageContent() (+84 more)

### Community 2 - "createPostgrestClient"
Cohesion: 0.05
Nodes (69): welcomePayload(), zod, GET, PUT, command, POST, filters, GET (+61 more)

### Community 3 - "lucide-react"
Cohesion: 0.04
Nodes (73): framer-motion, lucide-react, ChironSyncPage(), AdminLayout(), DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification (+65 more)

### Community 4 - "useLanguage"
Cohesion: 0.06
Nodes (62): Page(), Page(), Page(), CompanyDashboardPage(), CompanyDashboard(), PortalData, DriversTab(), VehiclesTab() (+54 more)

### Community 5 - "ref_react"
Cohesion: 0.05
Nodes (59): nextConfig, next, sonner, FailedTrip, Company, CompanyContractsPage(), Contract, Signature (+51 more)

### Community 6 - "lib/auth.ts"
Cohesion: 0.07
Nodes (73): dynamic, GET(), headers, GET, PUT, available(), GET, POST (+65 more)

### Community 7 - "usePreferences"
Cohesion: 0.14
Nodes (51): Account(), ActiveTrip(), invoice(), useActivityFilters(), ActivityFilters(), AddressField(), BillingReminder(), dismissed (+43 more)

### Community 8 - "useTripController.ts"
Cohesion: 0.06
Nodes (52): login(), DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), journalBytes(), assertNativeCryptoReady() (+44 more)

### Community 9 - "Card"
Cohesion: 0.07
Nodes (64): AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), ChironSettingsPage() (+56 more)

### Community 10 - "stripe-billing.ts"
Cohesion: 0.06
Nodes (63): qrcode, qrcode, stripe, runtime, runtime, register(), copy, invoiceDesign() (+55 more)

### Community 11 - "api-utils.ts"
Cohesion: 0.05
Nodes (56): bcryptjs, POST, GET, PUT, registrationSchema, GET, POST, VALID_TYPES (+48 more)

### Community 12 - "DriverRegisterForm.tsx"
Cohesion: 0.05
Nodes (66): @hookform/resolvers, react-hook-form, CompanyLoginForm(), DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data (+58 more)

### Community 13 - "cn"
Cohesion: 0.05
Nodes (60): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+52 more)

### Community 14 - "dependencies"
Cohesion: 0.03
Nodes (65): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+57 more)

### Community 15 - "api.ts"
Cohesion: 0.07
Nodes (46): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead() (+38 more)

### Community 16 - "end/route.ts"
Cohesion: 0.10
Nodes (32): connection, POST, GET, POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST (+24 more)

### Community 17 - "session.tsx"
Cohesion: 0.08
Nodes (35): App(), logout(), styles, ActionGate, createActionGate(), apiConnectionKey(), DriverProfile, DriverTripSummary (+27 more)

### Community 18 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 19 - "ReportsPage.tsx"
Cohesion: 0.08
Nodes (32): Page(), Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps (+24 more)

### Community 20 - "package.json"
Cohesion: 0.05
Nodes (40): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+32 more)

### Community 21 - "preferences.tsx"
Cohesion: 0.09
Nodes (27): RoadArt(), BrandMark(), icon, companyCopy, copy, CopyKey, Language, JourneyMark() (+19 more)

### Community 22 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 23 - "renderer.ts"
Cohesion: 0.09
Nodes (34): Draft, contractInvitation(), copy, verificationDesign(), VerificationPurpose, contractDesign(), ContractEmailData, copy (+26 more)

### Community 24 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 25 - "CookieBanner.tsx"
Cohesion: 0.09
Nodes (30): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+22 more)

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

### Community 30 - "validateRequestBody"
Cohesion: 0.13
Nodes (22): POST, POST, POST, PUT, GET, POST, pricingHandler, GET (+14 more)

### Community 31 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 32 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 33 - "utils.ts"
Cohesion: 0.07
Nodes (21): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-slider, react-day-picker, react-resizable-panels, tailwind-merge (+13 more)

### Community 34 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 35 - "vervoerbewijs.ts"
Cohesion: 0.13
Nodes (20): jspdf, GET, handler, POST, configurePdfFonts(), chironColor(), chironLabel(), fmtDateTime() (+12 more)

### Community 36 - "DriverShifts.tsx"
Cohesion: 0.15
Nodes (21): ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy, DriverShift, km (+13 more)

### Community 37 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+19 more)

### Community 38 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

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

### Community 43 - "public-contact.ts"
Cohesion: 0.14
Nodes (17): metadata, Page(), metadata, Page(), metadata, PrivacyPolicyPage(), ContactPanel(), Locale (+9 more)

### Community 44 - "email-templates/route.ts"
Cohesion: 0.17
Nodes (22): forbidden(), GET, invalid(), POST, PUT, serviceClient(), isEditableTemplate(), templateIds (+14 more)

### Community 45 - "ref_node_crypto"
Cohesion: 0.12
Nodes (14): dir, aad, openPushCredential(), [id,output], copy, decryptPushToken(), fcmAccessToken(), fcmPayload() (+6 more)

### Community 46 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 47 - "app/layout.tsx"
Cohesion: 0.12
Nodes (17): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, DriverLayoutShell(), GlobalClientEffects() (+9 more)

### Community 48 - "api-client.ts"
Cohesion: 0.13
Nodes (20): glassCard, labelStyle, platformLogos, Summary, TranslationKeys, translations, Trip, apiRequest() (+12 more)

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

### Community 53 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 54 - "ref_node_fs"
Cohesion: 0.13
Nodes (9): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+1 more)

### Community 55 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 57 - "engine.ts"
Cohesion: 0.21
Nodes (17): gsap, three, mountCinema(), render(), resize(), optimize(), Pose, poses (+9 more)

### Community 58 - "[resource]/page.tsx"
Cohesion: 0.19
Nodes (16): generateMetadata(), getPage(), isResource(), MarketingResource(), Props, sitemap(), marketingTopics, calculatorCopy (+8 more)

### Community 60 - "company-pricing.ts"
Cohesion: 0.18
Nodes (17): Company, activeCompanyTariffs(), CompanyPricing, companyPricingPatch(), CompanyTariff, companyTariffs(), defaults, driverPricing() (+9 more)

### Community 61 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 62 - "DriverSettlementCalculator.tsx"
Cohesion: 0.19
Nodes (12): DriverSettlementCalculator(), download(), fields, summary, MarketingLocale, calculatorText(), calculateSettlement(), cents() (+4 more)

### Community 63 - "navigation-menu.tsx"
Cohesion: 0.14
Nodes (16): class-variance-authority, @radix-ui/react-navigation-menu, @radix-ui/react-toggle, @radix-ui/react-toggle-group, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList (+8 more)

### Community 64 - "municipal-test-documents.ts"
Cohesion: 0.25
Nodes (15): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+7 more)

### Community 65 - "welcome-config.ts"
Cohesion: 0.22
Nodes (15): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster() (+7 more)

### Community 66 - "company-registrations/route.ts"
Cohesion: 0.32
Nodes (15): PUT, review, DELETE, document(), failed(), GET, positiveId(), POST (+7 more)

### Community 67 - "SiteAIAgent"
Cohesion: 0.19
Nodes (18): apiFetch(), buildApiUrl(), detectChangeIntent(), detectSearchIntent(), formatEntityInfo(), generateId(), SiteAIAgent(), addAssistantMessage() (+10 more)

### Community 69 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 70 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 71 - "contract-email-handler.ts"
Cohesion: 0.18
Nodes (12): POST, POST, emailContractHandler(), review, signature, claims, ContractEmailLink, issueContractEmailLink() (+4 more)

### Community 72 - "trip-journal.ts"
Cohesion: 0.23
Nodes (14): browserJournals, createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save() (+6 more)

### Community 73 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 74 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 75 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 76 - "mailConfiguration"
Cohesion: 0.17
Nodes (12): resend, dynamic, LoginPage(), POST(), runtime, LoginPageClient(), events, MAIL_FREE_LIMITS (+4 more)

### Community 77 - "receipt/page.tsx"
Cohesion: 0.26
Nodes (13): ReceiptPage(), ReceiptWorkspace(), ExperienceFrame(), ExperienceGauge(), experienceWords, HomeInstruments(), ReceiptPrinter(), ReferenceMeter() (+5 more)

### Community 78 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

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

### Community 84 - "receipts/[token]/route.ts"
Cohesion: 0.25
Nodes (12): dynamic, GET(), headers, runtime, getVervoerbewijsArrayBuffer(), VervoerbewijsData, documentOrigin, receiptCapability() (+4 more)

### Community 85 - "PickupLocation.tsx"
Cohesion: 0.26
Nodes (12): search(), Failure, messages, locate(), coordinate(), createAddressSearch(), freshSearchPoint(), NativeAddress (+4 more)

### Community 86 - "approval-mail-scheduler.ts"
Cohesion: 0.26
Nodes (10): POST(), result(), sites, ApprovalTab, sendPendingApprovalAlerts(), startApprovalMailScheduler(), run(), ApprovalAlert (+2 more)

### Community 87 - "mail-service.ts"
Cohesion: 0.24
Nodes (10): POST(), runtime, brevoIdempotencyKey(), brevoMailEvent(), brevoProviderId(), brevoWebhookAuthorized(), MailAttachment, MailMessage (+2 more)

### Community 88 - "DriverGuideSection.tsx"
Cohesion: 0.22
Nodes (11): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+3 more)

### Community 89 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 90 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 91 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 92 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 93 - "secret-vault.ts"
Cohesion: 0.22
Nodes (9): jose, apply, headers, url, close(), send(), decryptSecret(), encryptSecret() (+1 more)

### Community 94 - "marketing-content.ts"
Cohesion: 0.22
Nodes (6): metadata, Benefit, LocaleCopy, marketingOrigin, Question, SolutionCopy

### Community 95 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 96 - "EmailTemplatesPanel.tsx"
Cohesion: 0.24
Nodes (5): EmailTemplatesPage(), EmailTemplatesPanel(), languageLabels, Preview, Template

### Community 97 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 98 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 99 - "configure-stripe.mjs"
Cohesion: 0.31
Nodes (7): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys

### Community 100 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 101 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 102 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 103 - ""schema".company_change_requests"
Cohesion: 0.28
Nodes (3): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change()

### Community 104 - "20261026_manual_invoices.sql"
Cohesion: 0.36
Nodes (5): manual_invoice_immutable, manual_payment_immutable, "schema".manual_invoice_payments, "schema".manual_invoices, "schema".security_manual_invoice()

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

### Community 110 - "HomepageAdSlotSection.tsx"
Cohesion: 0.36
Nodes (6): dompurify, dompurify, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 111 - "activity/route.ts"
Cohesion: 0.54
Nodes (6): GET, activityColumns, activityFilters(), brusselsDay(), civilDate(), summarizeActivity()

### Community 112 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 113 - "driverShiftPdf"
Cohesion: 0.46
Nodes (7): driverShiftPdf(), ensure(), page(), pairs(), paragraph(), section(), table()

### Community 115 - "configure-mail.mjs"
Cohesion: 0.48
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 116 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 117 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 119 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 120 - "20261109_chiron_realtime.sql"
Cohesion: 0.38
Nodes (3): record_trip_shift, trips_company_realtime_platform_ref_idx, trips_driver_realtime_active_idx

### Community 121 - "20261115_contact_approval_alerts.sql"
Cohesion: 0.33
Nodes (4): approval_mail, approval_mail_ready, "schema".approval_mail_outbox, "schema".security_reserve_mail()

### Community 122 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 123 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 124 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 125 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 126 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 127 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 128 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 132 - "next_api/drivers/route.ts"
Cohesion: 0.73
Nodes (5): POST, PUT, driverValidationError(), mutateDriverAccount(), parseDriverFields()

### Community 133 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 134 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 135 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, eslint, eslint-config-expo, @types/react, typescript

### Community 140 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 141 - "20261114_email_templates.sql"
Cohesion: 0.50
Nodes (3): "schema".email_template_audit, "schema".email_template_settings, "schema".security_reserve_mail()

### Community 142 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 143 - "save"
Cohesion: 0.50
Nodes (4): clearForm(), commit(), retry(), save()

### Community 145 - "scroll-area.tsx"
Cohesion: 0.67
Nodes (3): @radix-ui/react-scroll-area, ScrollArea, ScrollBar

### Community 146 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 147 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 148 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 149 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 150 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 151 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

## Knowledge Gaps
- **807 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+802 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1163 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **61 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `requestMiddleware()` connect `createPostgrestClient` to `createErrorResponse`, `api-utils.ts`, `lib/auth.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _807 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.0714622641509434 - nodes in this community are weakly interconnected._
- **Why does `DashboardClient()` connect `Card` to `lucide-react`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.06940406976744186 - nodes in this community are weakly interconnected._
- **Why does `DriverDashboard()` connect `Card` to `Input`, `lucide-react`, `useLanguage`, `ref_react`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `createPostgrestClient` be split into smaller, more focused modules?**
  _Cohesion score 0.05354462051709758 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 174 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 273 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
