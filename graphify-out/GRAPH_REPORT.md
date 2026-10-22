# Graph Report - JOUW DRIVER  (2026-10-22)

## Corpus Check
- 539 files · ~236,409 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3068 nodes · 10417 edges · 165 communities (120 shown, 45 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d8b60ecb`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- createPostgrestClient
- api-utils.ts
- admin/drivers/page.tsx
- ref_react
- lucide-react
- Button
- authCrudOperations
- Input
- dependencies
- cn
- usePreferences
- InvoicesFeaturePage.tsx
- BackgroundGeolocation
- end/route.ts
- preferences.tsx
- package.json
- sidebar.tsx
- CookieBanner.tsx
- Shifts.tsx
- useAuth
- api.ts
- validateRequestBody
- App.tsx
- BackgroundGeolocationService.java
- driver-app/package.json
- mobile-location.ts
- Trips.tsx
- scripts
- use-toast.ts
- utils.ts
- dependencies
- mobile/package.json
- DriverShifts.tsx
- 20261018_subscription_billing.sql
- driver/taximeter/page.tsx
- native-journal.ts
- 20261018_company_lifecycle.sql
- 20261019_shift_activity.sql
- 20261018_contract_billing.sql
- update-customer-portal.sh
- session.tsx
- useTripController.ts
- DriverMap.tsx
- form.tsx
- send-signature-link/route.ts
- DriverRegisterForm.tsx
- TripPointJournal.java
- ref_node_fs
- PlatformLanding.tsx
- compilerOptions
- SiteAIAgent
- BackgroundGeolocation
- trip-engine.ts
- "schema".security_operations_centre
- 20261016_native_push.sql
- app/layout.tsx
- createTripJournal
- code-map.py
- convert-database.mjs
- RouteMap.tsx
- next_api/contracts/route.ts
- generateAcceptanceReportPdf
- TripPanel.tsx
- 20261019_driver_shifts.sql
- command.tsx
- carousel.tsx
- apply-release.mjs
- ResetPasswordForm.tsx
- LoginPageClient.tsx
- RegisterForm.tsx
- vervoerbewijs.ts
- driverShiftPdf
- pdf-generator.ts
- push-worker.mjs
- PDFGenerator
- "schema".company_registrations
- chart.tsx
- LoginForm.tsx
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- HomepageAdSlotSection.tsx
- sheet.tsx
- subscription-scheduler.ts
- ref_node_crypto
- "schema".security_save_company_account
- "schema".company_change_requests
- class-variance-authority
- FaqPage.tsx
- chat/route.ts
- DriverGuideSection.tsx
- LoginModal.tsx
- pagination.tsx
- scripts
- 20261013_mail_delivery.sql
- navigation-menu.tsx
- drawer.tsx
- apiRequest
- Override
- configure-mail.mjs
- verify-private-owner.cjs
- [...path]/route.ts
- android.content.Intent
- driver-app/tsconfig.json
- LiveMap.tsx
- 20261019_email_identity.sql
- definitions.d.ts
- database-readiness.mjs
- brevo/route.ts
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- contract-template.ts
- admin-enrollment.mjs
- 20261009_security.sql
- 20261018_web_billing.sql
- company-lifecycle/route.ts
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
- user/route.ts
- company-portal/drivers/route.ts
- company-portal/vehicles/route.ts
- invoices/send/route.ts
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
- privacy-policy/page.tsx
- backup-foundation.sh
- import-private-archive.sh
- Package.swift

## God Nodes (most connected - your core abstractions)
1. `createErrorResponse()` - 258 edges
2. `createSuccessResponse()` - 253 edges
3. `generateAdminUserToken()` - 244 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 218 edges
6. `validateRequestBody()` - 148 edges
7. `Button` - 146 edges
8. `requestMiddleware()` - 115 edges
9. `lucide-react` - 96 edges
10. `parseQueryParams()` - 93 edges

## Surprising Connections (you probably didn't know these)
- `search()` --indirect_call--> `value()`  [INFERRED]
  driver-app/src/experience/AddressField.tsx → scripts/convert-database.mjs
- `locate()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `FleetLocation()` --references--> `Location`  [EXTRACTED]
  driver-app/src/FleetLocation.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `currentPoint()` --references--> `Location`  [EXTRACTED]
  driver-app/src/TripPanel.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `TripPanel()` --references--> `Location`  [EXTRACTED]
  driver-app/src/TripPanel.tsx → mobile/plugins/background-geolocation/definitions.d.ts

## Import Cycles
- 2-file cycle: `src/lib/api-utils.ts -> src/lib/create-response.ts -> src/lib/api-utils.ts`
- 2-file cycle: `driver-app/src/experience/session.tsx -> driver-app/src/experience/shift-state.tsx -> driver-app/src/experience/session.tsx`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (165 total, 45 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.08
Nodes (116): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+108 more)

### Community 1 - "createPostgrestClient"
Cohesion: 0.05
Nodes (82): zod, available(), GET, POST, schema, POST, schema, POST (+74 more)

### Community 2 - "api-utils.ts"
Cohesion: 0.06
Nodes (49): bcryptjs, registrationSchema, runtime, GET, GET, POST, GET, POST (+41 more)

### Community 3 - "admin/drivers/page.tsx"
Cohesion: 0.06
Nodes (74): Company, CompanyContractsPage(), Contract, Signature, PlatformContract, Company, Distributor, DistributorsPage() (+66 more)

### Community 4 - "ref_react"
Cohesion: 0.06
Nodes (62): FailedTrip, Page(), Company, AdminFleetPage(), CompanyDashboardPage(), ContractPrintPage(), PrintableContract, TripData (+54 more)

### Community 5 - "lucide-react"
Cohesion: 0.04
Nodes (52): nextConfig, framer-motion, lucide-react, next, AdminLayout(), DashboardPage(), DriverLayout(), ApiResponse (+44 more)

### Community 6 - "Button"
Cohesion: 0.08
Nodes (59): sonner, AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard() (+51 more)

### Community 7 - "authCrudOperations"
Cohesion: 0.07
Nodes (58): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+50 more)

### Community 8 - "Input"
Cohesion: 0.12
Nodes (47): AdSlot, AdSlotsPage(), EMPTY_FORM, Company, EditCompanyPage(), CompanyPricingPage(), CompaniesPage(), CompaniesPageContent() (+39 more)

### Community 9 - "dependencies"
Cohesion: 0.03
Nodes (62): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+54 more)

### Community 10 - "cn"
Cohesion: 0.06
Nodes (51): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-dropdown-menu, @radix-ui/react-menubar, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+43 more)

### Community 11 - "usePreferences"
Cohesion: 0.18
Nodes (34): Account(), ActiveTrip(), AddressField(), search(), BillingReminder(), dismissed, Home(), useInbox() (+26 more)

### Community 12 - "InvoicesFeaturePage.tsx"
Cohesion: 0.07
Nodes (37): Page(), Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps (+29 more)

### Community 13 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 14 - "end/route.ts"
Cohesion: 0.12
Nodes (23): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError, numeric() (+15 more)

### Community 15 - "preferences.tsx"
Cohesion: 0.08
Nodes (31): Layout(), Navigation(), ActivityProvider(), companyCopy, copy, CopyKey, Language, InboxProvider() (+23 more)

### Community 16 - "package.json"
Cohesion: 0.05
Nodes (37): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+29 more)

### Community 17 - "sidebar.tsx"
Cohesion: 0.07
Nodes (31): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup, SidebarGroupAction (+23 more)

### Community 18 - "CookieBanner.tsx"
Cohesion: 0.09
Nodes (31): @radix-ui/react-switch, DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader() (+23 more)

### Community 19 - "Shifts.tsx"
Cohesion: 0.10
Nodes (27): directory(), shareShiftReport(), nativeShiftCopy, start(), shiftDate(), Shifts(), clearForm(), commit() (+19 more)

### Community 20 - "useAuth"
Cohesion: 0.08
Nodes (30): ChironSyncPage(), DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), glassCard (+22 more)

### Community 21 - "api.ts"
Cohesion: 0.10
Nodes (29): AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, API_ORIGIN, ApiError, createDriverApi(), loadProfile() (+21 more)

### Community 22 - "validateRequestBody"
Cohesion: 0.12
Nodes (23): POST, PUT, failure(), GET, POST, actorId(), GET, POST (+15 more)

### Community 23 - "App.tsx"
Cohesion: 0.12
Nodes (25): App(), logout(), styles, ActionGate, createActionGate(), DriverProfile, DriverTripSummary, DriverMap() (+17 more)

### Community 24 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 25 - "driver-app/package.json"
Cohesion: 0.06
Nodes (30): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+22 more)

### Community 26 - "mobile-location.ts"
Cohesion: 0.11
Nodes (23): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), clearNativeTripPoints(), createNativeLocationWatch() (+15 more)

### Community 27 - "Trips.tsx"
Cohesion: 0.15
Nodes (20): Period, periodDates(), validDay(), validRange(), invoice(), Context, useActivityFilters(), useStateValue() (+12 more)

### Community 28 - "scripts"
Cohesion: 0.07
Nodes (29): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+21 more)

### Community 29 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 30 - "utils.ts"
Cohesion: 0.07
Nodes (20): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+12 more)

### Community 31 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+19 more)

### Community 32 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 33 - "DriverShifts.tsx"
Cohesion: 0.15
Nodes (19): ShiftPage(), DriverShifts(), downloadPdf(), statuses, shiftCopy, ApiError, DriverShift, km (+11 more)

### Community 34 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 35 - "driver/taximeter/page.tsx"
Cohesion: 0.13
Nodes (23): BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), GlassCard(), GoldButton(), LocationPoint (+15 more)

### Community 36 - "native-journal.ts"
Cohesion: 0.13
Nodes (13): login(), journalBytes(), assertNativeCryptoReady(), keys, nativeJournal(), createSqlTripStore(), open(), seal() (+5 more)

### Community 37 - "20261018_company_lifecycle.sql"
Cohesion: 0.12
Nodes (12): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+4 more)

### Community 38 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (13): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+5 more)

### Community 39 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 40 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 41 - "session.tsx"
Cohesion: 0.19
Nodes (16): apiConnectionKey(), RoadArt(), JourneyLoading(), JourneyMark(), WelcomeHeader(), Entrance(), useRouteMotion(), Context (+8 more)

### Community 42 - "useTripController.ts"
Cohesion: 0.19
Nodes (18): Context, enableBackgroundMeter(), completedBatchReceipt(), engines, nativeEngine(), hasShiftIntent(), publishNativeTripStatus(), NativeTrip (+10 more)

### Community 43 - "DriverMap.tsx"
Cohesion: 0.18
Nodes (19): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, coordinate(), createAddressSearch() (+11 more)

### Community 44 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 45 - "send-signature-link/route.ts"
Cohesion: 0.13
Nodes (15): resend, command, POST, sendInvoiceToClient(), POST(), runtime, brevoIdempotencyKey(), contractInvitation() (+7 more)

### Community 46 - "DriverRegisterForm.tsx"
Cohesion: 0.12
Nodes (21): DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data, step1Schema, Step2Data, step2Schema (+13 more)

### Community 48 - "ref_node_fs"
Cohesion: 0.13
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 49 - "PlatformLanding.tsx"
Cohesion: 0.13
Nodes (8): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), Route(), translations, registrationCopy

### Community 51 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 52 - "SiteAIAgent"
Cohesion: 0.19
Nodes (18): apiFetch(), buildApiUrl(), detectChangeIntent(), detectSearchIntent(), formatEntityInfo(), generateId(), SiteAIAgent(), addAssistantMessage() (+10 more)

### Community 54 - "trip-engine.ts"
Cohesion: 0.21
Nodes (8): address(), createTripEngine(), tripDurationSeconds(), TripStore, addMeterPoint(), distanceKm(), emptyMeter(), MeterState

### Community 55 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 56 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 57 - "app/layout.tsx"
Cohesion: 0.17
Nodes (13): next-themes, dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider(), GlobalClientEffects() (+5 more)

### Community 58 - "createTripJournal"
Cohesion: 0.24
Nodes (14): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+6 more)

### Community 59 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 60 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 61 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 62 - "next_api/contracts/route.ts"
Cohesion: 0.36
Nodes (14): PUT, DELETE, document(), failed(), GET, positiveId(), POST, PUT (+6 more)

### Community 63 - "generateAcceptanceReportPdf"
Cohesion: 0.24
Nodes (14): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+6 more)

### Community 64 - "TripPanel.tsx"
Cohesion: 0.25
Nodes (12): DriverVehicle, stopBackgroundMeter(), messages, tripError(), currentPoint(), pointOf(), styles, TripPanel() (+4 more)

### Community 65 - "20261019_driver_shifts.sql"
Cohesion: 0.23
Nodes (10): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_immutable_shift_event() (+2 more)

### Community 66 - "command.tsx"
Cohesion: 0.18
Nodes (13): cmdk, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup, CommandInput (+5 more)

### Community 67 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 68 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 69 - "ResetPasswordForm.tsx"
Cohesion: 0.19
Nodes (11): @hookform/resolvers, react-hook-form, CompanyLoginFormData, CompanyLoginFormProps, companyLoginSchema, PasswordInput, EmailFormData, emailSchema (+3 more)

### Community 70 - "LoginPageClient.tsx"
Cohesion: 0.19
Nodes (12): dynamic, LoginPage(), CompanyLoginForm(), LoginPageClient(), LoginPageContent(), ModeEnum, LOGIN, REGISTER (+4 more)

### Community 71 - "RegisterForm.tsx"
Cohesion: 0.24
Nodes (12): CredentialsFormData, credentialsSchema, RegisterForm(), RegisterFormProps, VerificationFormData, verificationSchema, ResetPasswordForm(), LoginModal() (+4 more)

### Community 72 - "vervoerbewijs.ts"
Cohesion: 0.20
Nodes (12): chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs(), VervoerbewijsChiron, VervoerbewijsCompany (+4 more)

### Community 73 - "driverShiftPdf"
Cohesion: 0.23
Nodes (11): jose, apply, headers, url, driverShiftPdf(), ensure(), page(), pairs() (+3 more)

### Community 74 - "pdf-generator.ts"
Cohesion: 0.24
Nodes (10): jspdf, configurePdfFonts(), ChironTestMessage, AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, TestResult (+2 more)

### Community 75 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 77 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 78 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 79 - "LoginForm.tsx"
Cohesion: 0.27
Nodes (9): GoogleLoginButton(), LoginForm(), LoginFormData, LoginFormProps, loginSchema, Alert, AlertDescription, AlertTitle (+1 more)

### Community 80 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 81 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 82 - "HomepageAdSlotSection.tsx"
Cohesion: 0.27
Nodes (8): dompurify, dompurify, FloatingCard(), FloatingCardProps, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 83 - "sheet.tsx"
Cohesion: 0.22
Nodes (10): @radix-ui/react-dialog, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+2 more)

### Community 84 - "subscription-scheduler.ts"
Cohesion: 0.35
Nodes (8): register(), MailMessage, euro(), SubscriptionDocument, subscriptionPdf(), escape(), startSubscriptionScheduler(), subscriptionTick()

### Community 85 - "ref_node_crypto"
Cohesion: 0.24
Nodes (3): dir, aad, openPushCredential()

### Community 87 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 88 - "class-variance-authority"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 89 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 90 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 91 - "DriverGuideSection.tsx"
Cohesion: 0.27
Nodes (9): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+1 more)

### Community 92 - "LoginModal.tsx"
Cohesion: 0.22
Nodes (8): LoginModalProps, ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET, LandingLanguage, landingTranslations

### Community 93 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 94 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 95 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 96 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 97 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 98 - "apiRequest"
Cohesion: 0.33
Nodes (8): apiRequest(), buildApiUrl(), getLoginPath(), parseApiResponse(), redirectToLogin(), refreshToken(), connectionFailure, connectionMessage()

### Community 100 - "configure-mail.mjs"
Cohesion: 0.39
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 101 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 102 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 104 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 105 - "LiveMap.tsx"
Cohesion: 0.33
Nodes (5): leaflet, LiveMap(), LiveMapPoint, Props, words

### Community 106 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 107 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 108 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 109 - "brevo/route.ts"
Cohesion: 0.52
Nodes (5): POST(), runtime, brevoMailEvent(), brevoProviderId(), brevoWebhookAuthorized()

### Community 110 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 111 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 112 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 113 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 114 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 115 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 116 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 119 - "company-lifecycle/route.ts"
Cohesion: 0.70
Nodes (3): POST, changeCompanyLifecycle(), companyLifecycleCommand

### Community 120 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 121 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 122 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 126 - "user/route.ts"
Cohesion: 0.83
Nodes (3): GET, resolveDistributorInfo(), resolveEffectiveUserType()

### Community 127 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 128 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 129 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 130 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 131 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

## Knowledge Gaps
- **699 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+694 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 983 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **45 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `generateAdminUserToken()` connect `createErrorResponse` to `createPostgrestClient`, `authCrudOperations`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _699 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.08082090341690469 - nodes in this community are weakly interconnected._
- **Why does `PlatformLanding()` connect `PlatformLanding.tsx` to `Input`, `CookieBanner.tsx`, `ref_react`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `createPostgrestClient` be split into smaller, more focused modules?**
  _Cohesion score 0.05037984806077569 - nodes in this community are weakly interconnected._
- **Should `api-utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05863316200266514 - nodes in this community are weakly interconnected._
- **Should `admin/drivers/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06495049504950495 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 162 unresolved internal-endpoint edges and 19 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 218 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
