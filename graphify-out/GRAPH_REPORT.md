# Graph Report - JOUW DRIVER  (2026-11-09)

## Corpus Check
- 631 files · ~269,340 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3599 nodes · 12153 edges · 178 communities (121 shown, 57 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 246 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c34d13d2`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- useLanguage
- Input
- createPostgrestClient
- usePreferences
- Button
- DriverRegisterForm.tsx
- stripe-billing.ts
- Card
- useAuth
- preferences.tsx
- api.ts
- lib/auth.ts
- dependencies
- ref_react
- useTripController.ts
- zod
- marketing-content.ts
- cn
- next
- end/route.ts
- api-utils.ts
- SiteAIAgent.tsx
- BackgroundGeolocation
- package.json
- sidebar.tsx
- driver-app/package.json
- session.tsx
- 20261026_invoice_checkout.sql
- dependencies
- company-changes.ts
- BackgroundGeolocationService.java
- api-client.ts
- mobile-location.ts
- utils.ts
- pdf-generator.ts
- use-toast.ts
- vervoerbewijs.ts
- driver-shifts.ts
- driver/taximeter/page.tsx
- DriverMap.tsx
- mobile/package.json
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- 20261024_stripe_billing.sql
- native-journal.ts
- 20261018_company_lifecycle.sql
- 20261019_shift_activity.sql
- company-pricing.ts
- update-customer-portal.sh
- 20261018_contract_billing.sql
- ref_node_fs
- form.tsx
- TripPointJournal.java
- compilerOptions
- password/route.ts
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- company-registrations/route.ts
- trip-journal.ts
- code-map.py
- ref_node_crypto
- welcome-config.ts
- scripts
- command.tsx
- RouteMap.tsx
- 20261019_driver_shifts.sql
- devDependencies
- carousel.tsx
- apply-release.mjs
- convert-database.mjs
- configure-mail.mjs
- ActivityFilters.tsx
- PDFGenerator
- PublicInfo.tsx
- receipt-email/route.ts
- DriverFleetShift.tsx
- "schema".company_registrations
- engine.ts
- chart.tsx
- documents/route.ts
- "schema".security_fleet_locations
- secret-vault.ts
- models.ts
- "schema".security_save_company_account
- "schema".company_change_requests
- chat/route.ts
- DriverGuideSection.tsx
- pagination.tsx
- sheet.tsx
- recover-db-log.mjs
- 20261013_mail_delivery.sql
- navigation-menu.tsx
- toggle-group.tsx
- drawer.tsx
- Override
- "schema".security_email_contract
- rollout.mjs
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- 20261109_chiron_realtime.sql
- [...path]/route.ts
- android.content.Intent
- driver-app/tsconfig.json
- LiveMap.tsx
- 20261019_email_identity.sql
- "schema".manual_invoices
- definitions.d.ts
- database-readiness.mjs
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- contract-template.ts
- admin-enrollment.mjs
- 20261009_security.sql
- 20261018_web_billing.sql
- invoice_bank_snapshot
- 20261104_company_tariffs.sql
- GpsLocationButton.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
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
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (178 total, 57 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (118): bcryptjs, GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE (+110 more)

### Community 1 - "useLanguage"
Cohesion: 0.03
Nodes (114): framer-motion, lucide-react, DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification() (+106 more)

### Community 2 - "Input"
Cohesion: 0.06
Nodes (91): AdSlot, EMPTY_FORM, Company, CompanyContractsPage(), Contract, Signature, EditCompanyPage(), PlatformContract (+83 more)

### Community 3 - "createPostgrestClient"
Cohesion: 0.05
Nodes (65): welcomePayload(), GET, PUT, GET, PUT, command, filters, GET (+57 more)

### Community 4 - "usePreferences"
Cohesion: 0.12
Nodes (55): ActivityPage, Account(), ActiveTrip(), AddressField(), BillingReminder(), dismissed, ClassicDisplay(), FareControls() (+47 more)

### Community 5 - "Button"
Cohesion: 0.08
Nodes (52): ChironSyncPage(), Page(), Page(), CompanyDashboardPage(), TripsPage(), CompanyDashboard(), PortalData, DriversTab() (+44 more)

### Community 6 - "DriverRegisterForm.tsx"
Cohesion: 0.05
Nodes (68): @hookform/resolvers, react-hook-form, dynamic, LoginPage(), CompanyLoginForm(), DriverRegisterForm(), DriverRegisterFormProps, FormField() (+60 more)

### Community 7 - "stripe-billing.ts"
Cohesion: 0.06
Nodes (60): stripe, runtime, POST(), runtime, runtime, register(), brevoIdempotencyKey(), brevoMailEvent() (+52 more)

### Community 8 - "Card"
Cohesion: 0.09
Nodes (51): AdSlotsPage(), AppExperiencePage(), metadata, CompaniesPage(), CompaniesPageContent(), Company, emptyNew, AdminDriversPage() (+43 more)

### Community 9 - "useAuth"
Cohesion: 0.08
Nodes (52): AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), ChironSettingsPage() (+44 more)

### Community 10 - "preferences.tsx"
Cohesion: 0.06
Nodes (49): Layout(), Navigation(), ActivityProvider(), RoadArt(), BrandMark(), icon, companyCopy, copy (+41 more)

### Community 11 - "api.ts"
Cohesion: 0.05
Nodes (55): AccountInfo, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead(), profile() (+47 more)

### Community 12 - "lib/auth.ts"
Cohesion: 0.10
Nodes (52): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+44 more)

### Community 13 - "dependencies"
Cohesion: 0.03
Nodes (65): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+57 more)

### Community 14 - "ref_react"
Cohesion: 0.06
Nodes (39): class-variance-authority, sonner, FailedTrip, Company, Issued, DriverTestPage(), glassCard, LatestReportResponse (+31 more)

### Community 15 - "useTripController.ts"
Cohesion: 0.09
Nodes (41): ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), nativeJournal() (+33 more)

### Community 16 - "zod"
Cohesion: 0.07
Nodes (42): zod, dynamic, GET(), headers, available(), GET, POST, schema (+34 more)

### Community 17 - "marketing-content.ts"
Cohesion: 0.08
Nodes (42): metadata, generateMetadata(), LocalizedHome(), Props, dynamicParams, generateMetadata(), Props, SolutionsPage() (+34 more)

### Community 18 - "cn"
Cohesion: 0.06
Nodes (51): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+43 more)

### Community 19 - "next"
Cohesion: 0.06
Nodes (39): nextConfig, next, DriverProfileRoute(), PrivacyCenter(), metadata, RegistrationPage(), DriverData, DriverProfilePage() (+31 more)

### Community 20 - "end/route.ts"
Cohesion: 0.11
Nodes (29): GET, POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST, POST, POST (+21 more)

### Community 21 - "api-utils.ts"
Cohesion: 0.07
Nodes (43): POST, VALID_TYPES, GET, normalizeUrlPreview(), ApiParams, appendCorsHeaders(), clearCookie(), extractBearerToken() (+35 more)

### Community 22 - "SiteAIAgent.tsx"
Cohesion: 0.06
Nodes (45): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, apiFetch(), ApiResponse (+37 more)

### Community 23 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 24 - "package.json"
Cohesion: 0.05
Nodes (41): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+33 more)

### Community 25 - "sidebar.tsx"
Cohesion: 0.07
Nodes (31): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup, SidebarGroupAction (+23 more)

### Community 26 - "driver-app/package.json"
Cohesion: 0.06
Nodes (37): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+29 more)

### Community 27 - "session.tsx"
Cohesion: 0.11
Nodes (26): App(), logout(), styles, createActionGate(), apiConnectionKey(), DriverTripSummary, DriverMap(), clearReceiptCache() (+18 more)

### Community 28 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (21): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+13 more)

### Community 29 - "dependencies"
Cohesion: 0.05
Nodes (36): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+28 more)

### Community 30 - "company-changes.ts"
Cohesion: 0.16
Nodes (23): GET, resolveDistributorInfo(), resolveEffectiveUserType(), POST, POST, PUT, getAuthRoles(), changeFingerprint() (+15 more)

### Community 31 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 32 - "api-client.ts"
Cohesion: 0.12
Nodes (22): dompurify, dompurify, ContractPrintPage(), PrintableContract, ContractReview, SignContractPage(), ContractDocument(), ApiError (+14 more)

### Community 33 - "mobile-location.ts"
Cohesion: 0.11
Nodes (22): messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch(), createNativeTripReplay() (+14 more)

### Community 34 - "utils.ts"
Cohesion: 0.07
Nodes (21): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-slider, react-day-picker, react-resizable-panels, tailwind-merge (+13 more)

### Community 35 - "pdf-generator.ts"
Cohesion: 0.14
Nodes (24): jspdf, configurePdfFonts(), generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line() (+16 more)

### Community 36 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 37 - "vervoerbewijs.ts"
Cohesion: 0.13
Nodes (23): dynamic, GET(), headers, runtime, chironColor(), chironLabel(), fmtDateTime(), fmtGps() (+15 more)

### Community 38 - "driver-shifts.ts"
Cohesion: 0.14
Nodes (23): ShiftPage(), DriverShifts(), downloadPdf(), driverShiftPdf(), ensure(), page(), pairs(), paragraph() (+15 more)

### Community 39 - "driver/taximeter/page.tsx"
Cohesion: 0.13
Nodes (25): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton(), GlassCard(), LocationPoint (+17 more)

### Community 40 - "DriverMap.tsx"
Cohesion: 0.15
Nodes (23): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, search(), locate() (+15 more)

### Community 41 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 42 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 43 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 44 - "20261024_stripe_billing.sql"
Cohesion: 0.12
Nodes (13): "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts, stripe_company_lifecycle_guard (+5 more)

### Community 45 - "native-journal.ts"
Cohesion: 0.13
Nodes (12): login(), journalBytes(), assertNativeCryptoReady(), keys, createSqlTripStore(), open(), seal(), Database (+4 more)

### Community 46 - "20261018_company_lifecycle.sql"
Cohesion: 0.12
Nodes (12): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+4 more)

### Community 47 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (13): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+5 more)

### Community 48 - "company-pricing.ts"
Cohesion: 0.16
Nodes (20): Company, GET, POST, pricingHandler, CompanyPricing, companyPricingPatch(), CompanyTariff, companyTariffs() (+12 more)

### Community 49 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 50 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 51 - "ref_node_fs"
Cohesion: 0.13
Nodes (10): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys, mobileConfig() (+2 more)

### Community 52 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 55 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 56 - "password/route.ts"
Cohesion: 0.23
Nodes (12): POST, PUT, GET, POST, GET, POST, credentials, saveCompanyAccount() (+4 more)

### Community 58 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 59 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 60 - "company-registrations/route.ts"
Cohesion: 0.34
Nodes (14): PUT, review, DELETE, document(), failed(), GET, positiveId(), POST (+6 more)

### Community 61 - "trip-journal.ts"
Cohesion: 0.23
Nodes (14): browserJournals, createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save() (+6 more)

### Community 62 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 63 - "ref_node_crypto"
Cohesion: 0.18
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 64 - "welcome-config.ts"
Cohesion: 0.23
Nodes (14): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster(), WELCOME_LANGUAGES (+6 more)

### Community 65 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 66 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 67 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 68 - "20261019_driver_shifts.sql"
Cohesion: 0.23
Nodes (10): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_immutable_shift_event() (+2 more)

### Community 69 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+7 more)

### Community 70 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 71 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 72 - "convert-database.mjs"
Cohesion: 0.27
Nodes (12): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), parseSchema() (+4 more)

### Community 73 - "configure-mail.mjs"
Cohesion: 0.20
Nodes (9): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv(), dir, aad (+1 more)

### Community 74 - "ActivityFilters.tsx"
Cohesion: 0.31
Nodes (10): Period, periodDates(), validDay(), validRange(), Context, useActivityFilters(), useStateValue(), ActivityFilters() (+2 more)

### Community 76 - "PublicInfo.tsx"
Cohesion: 0.23
Nodes (9): metadata, Page(), metadata, Page(), metadata, PrivacyPolicyPage(), Locale, PublicInfo() (+1 more)

### Community 77 - "receipt-email/route.ts"
Cohesion: 0.23
Nodes (11): esc(), GET, Draft, IssuedReceipt, localized, ReceiptAd, receiptAdSchema, receiptEmailHtml() (+3 more)

### Community 78 - "DriverFleetShift.tsx"
Cohesion: 0.26
Nodes (10): copy, DriverFleetShift(), GeolocationPoint, registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus (+2 more)

### Community 79 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 80 - "engine.ts"
Cohesion: 0.20
Nodes (10): qrcode, gsap, qrcode, three, mountCinema(), render(), resize(), optimize() (+2 more)

### Community 81 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 82 - "documents/route.ts"
Cohesion: 0.27
Nodes (8): GET, handler, POST, activeCompanyTariffs(), documentOrigin, renderTariffSheet(), TariffSheet, tariffSheetUrl()

### Community 83 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 84 - "secret-vault.ts"
Cohesion: 0.22
Nodes (9): jose, apply, headers, url, close(), send(), decryptSecret(), encryptSecret() (+1 more)

### Community 85 - "models.ts"
Cohesion: 0.47
Nodes (9): box(), createCar(), createPhone(), createPrinter(), mesh(), metal(), surface(), textTexture() (+1 more)

### Community 87 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 88 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 89 - "DriverGuideSection.tsx"
Cohesion: 0.27
Nodes (9): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+1 more)

### Community 90 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 91 - "sheet.tsx"
Cohesion: 0.24
Nodes (9): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants (+1 more)

### Community 92 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 93 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 94 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 95 - "toggle-group.tsx"
Cohesion: 0.31
Nodes (7): @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 96 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 99 - "rollout.mjs"
Cohesion: 0.29
Nodes (7): compose(), directory, env, [image, revision, target], lock, root, run()

### Community 100 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 101 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 102 - "20261109_chiron_realtime.sql"
Cohesion: 0.32
Nodes (4): record_trip_shift, "schema".security_finish_realtime_trip(), trips_company_realtime_platform_ref_idx, trips_driver_realtime_active_idx

### Community 103 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 105 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 106 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 107 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 108 - ""schema".manual_invoices"
Cohesion: 0.38
Nodes (3): manual_invoice_immutable, "schema".manual_invoice_payments, "schema".manual_invoices

### Community 109 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 110 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 111 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 112 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 113 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 114 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 115 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 116 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 117 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 121 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 122 - "GpsLocationButton.tsx"
Cohesion: 0.40
Nodes (4): GpsLocationButton(), GpsLocationButtonProps, GpsStatus, LABELS

### Community 123 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 124 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 128 - "scroll-area.tsx"
Cohesion: 0.67
Nodes (3): @radix-ui/react-scroll-area, ScrollArea, ScrollBar

### Community 129 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 130 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 131 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 132 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 133 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 134 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

## Knowledge Gaps
- **776 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+771 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1123 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **57 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AdminDriversPageContent()` connect `Card` to `useAuth`, `Input`, `Button`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _776 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07285429141716566 - nodes in this community are weakly interconnected._
- **Why does `generateAdminUserToken()` connect `createErrorResponse` to `lib/auth.ts`, `company-changes.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `useLanguage` be split into smaller, more focused modules?**
  _Cohesion score 0.028739750019902872 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.06028543307086614 - nodes in this community are weakly interconnected._
- **Should `createPostgrestClient` be split into smaller, more focused modules?**
  _Cohesion score 0.05330564209068882 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 174 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 266 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
