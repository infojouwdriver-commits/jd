# Graph Report - JOUW DRIVER  (2026-10-23)

## Corpus Check
- 549 files · ~238,173 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3128 nodes · 10624 edges · 159 communities (115 shown, 44 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b5bf0fab`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- ref_react
- createPostgrestClient
- Input
- Button
- useAuth
- api-utils.ts
- usePreferences
- useTripController.ts
- api.ts
- admin/messages/page.tsx
- lib/auth.ts
- dependencies
- cn
- BackgroundGeolocation
- preferences.tsx
- mobile-location.ts
- package.json
- driver/taximeter/page.tsx
- sidebar.tsx
- driver-app/package.json
- dependencies
- validateRequestBody
- ChironError
- DriverShifts.tsx
- BackgroundGeolocationService.java
- scripts
- session.tsx
- pdf-generator.ts
- use-toast.ts
- mobile/package.json
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- native-journal.ts
- DriverMap.tsx
- PlatformLanding.tsx
- SiteAIAgent.tsx
- 20261018_company_lifecycle.sql
- 20261019_shift_activity.sql
- utils.ts
- subscription-scheduler.ts
- 20261018_contract_billing.sql
- update-customer-portal.sh
- form.tsx
- DriverGdprSection.tsx
- DriverRegisterForm.tsx
- TripPointJournal.java
- ref_node_fs
- compilerOptions
- app/layout.tsx
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- CookieBanner.tsx
- api-client.ts
- code-map.py
- ref_node_crypto
- command.tsx
- apply-release.mjs
- convert-database.mjs
- RouteMap.tsx
- next_api/contracts/route.ts
- vervoerbewijs.ts
- createTripJournal
- 20261019_driver_shifts.sql
- carousel.tsx
- ActivityFilters.tsx
- end/route.ts
- ResetPasswordForm.tsx
- LoginPageClient.tsx
- RegisterForm.tsx
- driverShiftPdf
- push-worker.mjs
- PDFGenerator
- "schema".company_registrations
- chart.tsx
- LoginForm.tsx
- "schema".security_fleet_locations
- HomepageAdSlotSection.tsx
- "schema".security_save_company_account
- "schema".company_change_requests
- class-variance-authority
- generate-invoice/route.ts
- FaqPage.tsx
- chat/route.ts
- DriverGuideSection.tsx
- LoginModal.tsx
- pagination.tsx
- 20261013_mail_delivery.sql
- navigation-menu.tsx
- sign/route.ts
- drawer.tsx
- LanguageProvider
- devices/route.ts
- sheet.tsx
- Override
- rollout.mjs
- verify-private-owner.cjs
- [...path]/route.ts
- android.content.Intent
- driver-app/tsconfig.json
- 20261019_email_identity.sql
- definitions.d.ts
- database-readiness.mjs
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- invoice/[token]/page.tsx
- contract-template.ts
- 20261009_security.sql
- 20261018_web_billing.sql
- container-scroll-animation.tsx
- document-links.ts
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
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
- privacy-policy/page.tsx
- backup-foundation.sh
- import-private-archive.sh
- Package.swift

## God Nodes (most connected - your core abstractions)
1. `createErrorResponse()` - 258 edges
2. `createSuccessResponse()` - 253 edges
3. `generateAdminUserToken()` - 246 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 218 edges
6. `validateRequestBody()` - 148 edges
7. `Button` - 146 edges
8. `requestMiddleware()` - 115 edges
9. `lucide-react` - 96 edges
10. `parseQueryParams()` - 93 edges

## Surprising Connections (you probably didn't know these)
- `locate()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `search()` --indirect_call--> `value()`  [INFERRED]
  driver-app/src/experience/AddressField.tsx → scripts/convert-database.mjs
- `DriverMapView()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `ActiveTrip()` --references--> `Alert`  [EXTRACTED]
  driver-app/src/experience/ActiveTrip.tsx → src/components/ui/alert.tsx
- `commit()` --references--> `Alert`  [EXTRACTED]
  driver-app/src/experience/Shifts.tsx → src/components/ui/alert.tsx

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

## Communities (159 total, 44 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (114): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+106 more)

### Community 1 - "ref_react"
Cohesion: 0.03
Nodes (98): nextConfig, framer-motion, lucide-react, next, AdminLayout(), DriverLoginPage(), DriverNotificationsPage(), glassCard (+90 more)

### Community 2 - "createPostgrestClient"
Cohesion: 0.05
Nodes (78): zod, available(), GET, POST, schema, POST, schema, POST (+70 more)

### Community 3 - "Input"
Cohesion: 0.07
Nodes (80): Company, CompanyContractsPage(), Contract, Signature, PlatformContract, PlatformContractsPage(), Company, Distributor (+72 more)

### Community 4 - "Button"
Cohesion: 0.07
Nodes (53): Page(), Page(), CompanyDashboardPage(), ContractPrintPage(), PrintableContract, ContractData, SignatureInfo, SignContractPage() (+45 more)

### Community 5 - "useAuth"
Cohesion: 0.08
Nodes (60): sonner, AdminAccountPage(), ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard() (+52 more)

### Community 6 - "api-utils.ts"
Cohesion: 0.05
Nodes (58): bcryptjs, GET, resolveDistributorInfo(), resolveEffectiveUserType(), registrationSchema, GET, GET, runtime (+50 more)

### Community 7 - "usePreferences"
Cohesion: 0.15
Nodes (44): ActivityPage, Account(), ActiveTrip(), AddressField(), BillingReminder(), dismissed, Home(), useInbox() (+36 more)

### Community 8 - "useTripController.ts"
Cohesion: 0.08
Nodes (50): App(), styles, ActionGate, createActionGate(), driverApi, DriverProfile, DriverVehicle, Context (+42 more)

### Community 9 - "api.ts"
Cohesion: 0.05
Nodes (54): AccountInfo, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead(), profile() (+46 more)

### Community 10 - "admin/messages/page.tsx"
Cohesion: 0.10
Nodes (45): AdSlot, AdSlotsPage(), EMPTY_FORM, CompaniesPage(), CompaniesPageContent(), Company, emptyNew, AdminMessagesPage() (+37 more)

### Community 11 - "lib/auth.ts"
Cohesion: 0.10
Nodes (49): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+41 more)

### Community 12 - "dependencies"
Cohesion: 0.03
Nodes (62): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+54 more)

### Community 13 - "cn"
Cohesion: 0.06
Nodes (51): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+43 more)

### Community 14 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 15 - "preferences.tsx"
Cohesion: 0.07
Nodes (34): DriverMessage, DriverNotification, Layout(), Navigation(), ActivityProvider(), RoadArt(), companyCopy, copy (+26 more)

### Community 16 - "mobile-location.ts"
Cohesion: 0.08
Nodes (32): copy, DriverFleetShift(), GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation() (+24 more)

### Community 17 - "package.json"
Cohesion: 0.05
Nodes (39): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+31 more)

### Community 18 - "driver/taximeter/page.tsx"
Cohesion: 0.08
Nodes (34): leaflet, AdminFleetPage(), BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton() (+26 more)

### Community 19 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 20 - "driver-app/package.json"
Cohesion: 0.05
Nodes (37): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+29 more)

### Community 21 - "dependencies"
Cohesion: 0.05
Nodes (36): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+28 more)

### Community 22 - "validateRequestBody"
Cohesion: 0.12
Nodes (23): POST, POST, POST, PUT, failure(), POST, actorId(), GET (+15 more)

### Community 23 - "ChironError"
Cohesion: 0.14
Nodes (18): canonicalChironEnvironment(), chironDestination(), ChironError, numeric(), rideMessage(), timestamp(), retryChironTrip(), ChironService (+10 more)

### Community 24 - "DriverShifts.tsx"
Cohesion: 0.13
Nodes (24): qrcode, qrcode, ShiftPage(), GET, DocumentQr(), DriverShifts(), downloadPdf(), statuses (+16 more)

### Community 25 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 26 - "scripts"
Cohesion: 0.06
Nodes (30): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+22 more)

### Community 27 - "session.tsx"
Cohesion: 0.12
Nodes (22): logout(), apiConnectionKey(), invoice(), JourneyLoading(), JourneyMark(), WelcomeHeader(), clearReceiptCache(), directory() (+14 more)

### Community 28 - "pdf-generator.ts"
Cohesion: 0.14
Nodes (24): jspdf, configurePdfFonts(), generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line() (+16 more)

### Community 29 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 30 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 31 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 32 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 33 - "native-journal.ts"
Cohesion: 0.13
Nodes (13): login(), journalBytes(), assertNativeCryptoReady(), keys, nativeJournal(), createSqlTripStore(), open(), seal() (+5 more)

### Community 34 - "DriverMap.tsx"
Cohesion: 0.16
Nodes (21): DriverMap(), DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, search() (+13 more)

### Community 35 - "PlatformLanding.tsx"
Cohesion: 0.13
Nodes (12): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), openRegistration(), Route(), translations (+4 more)

### Community 36 - "SiteAIAgent.tsx"
Cohesion: 0.14
Nodes (24): apiFetch(), ApiResponse, buildApiUrl(), ChatMessage, ConversationStep, detectChangeIntent(), detectSearchIntent(), formatEntityInfo() (+16 more)

### Community 37 - "20261018_company_lifecycle.sql"
Cohesion: 0.12
Nodes (12): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+4 more)

### Community 38 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (13): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+5 more)

### Community 39 - "utils.ts"
Cohesion: 0.09
Nodes (17): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-resizable-panels, tailwind-merge (+9 more)

### Community 40 - "subscription-scheduler.ts"
Cohesion: 0.15
Nodes (17): register(), brevoIdempotencyKey(), brevoMailEvent(), brevoProviderId(), events, MAIL_FREE_LIMITS, mailEventKey(), MailStatus (+9 more)

### Community 41 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 42 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 43 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 44 - "DriverGdprSection.tsx"
Cohesion: 0.16
Nodes (18): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+10 more)

### Community 45 - "DriverRegisterForm.tsx"
Cohesion: 0.12
Nodes (21): DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data, step1Schema, Step2Data, step2Schema (+13 more)

### Community 48 - "ref_node_fs"
Cohesion: 0.16
Nodes (8): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv(), mobileConfig(), repository

### Community 49 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 50 - "app/layout.tsx"
Cohesion: 0.16
Nodes (13): next-themes, dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider(), GlobalClientEffects() (+5 more)

### Community 52 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 53 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 54 - "CookieBanner.tsx"
Cohesion: 0.20
Nodes (13): @radix-ui/react-switch, CookieBanner(), CookieCategory, DEFAULT_CATEGORIES, T, Switch, COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION (+5 more)

### Community 55 - "api-client.ts"
Cohesion: 0.23
Nodes (13): ApiError, apiRequest(), ApiResponse, buildApiUrl(), getLoginPath(), getServerApiBaseUrl(), normalizeBaseUrl(), parseApiResponse() (+5 more)

### Community 56 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 57 - "ref_node_crypto"
Cohesion: 0.16
Nodes (7): createEnrollmentHandler(), escapeHtml(), totp(), dir, aad, openPushCredential(), [id,output]

### Community 58 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 59 - "apply-release.mjs"
Cohesion: 0.20
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 60 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 61 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 62 - "next_api/contracts/route.ts"
Cohesion: 0.36
Nodes (14): PUT, DELETE, document(), failed(), GET, positiveId(), POST, PUT (+6 more)

### Community 63 - "vervoerbewijs.ts"
Cohesion: 0.18
Nodes (13): chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs(), VervoerbewijsChiron, VervoerbewijsCompany (+5 more)

### Community 64 - "createTripJournal"
Cohesion: 0.25
Nodes (13): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+5 more)

### Community 65 - "20261019_driver_shifts.sql"
Cohesion: 0.23
Nodes (10): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_immutable_shift_event() (+2 more)

### Community 66 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 67 - "ActivityFilters.tsx"
Cohesion: 0.31
Nodes (10): Period, periodDates(), validDay(), validRange(), Context, useActivityFilters(), useStateValue(), ActivityFilters() (+2 more)

### Community 68 - "end/route.ts"
Cohesion: 0.23
Nodes (9): generateTripHash(), generateTripUuid(), getRetentionDate(), POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST (+1 more)

### Community 69 - "ResetPasswordForm.tsx"
Cohesion: 0.19
Nodes (11): @hookform/resolvers, react-hook-form, CompanyLoginFormData, CompanyLoginFormProps, companyLoginSchema, PasswordInput, EmailFormData, emailSchema (+3 more)

### Community 70 - "LoginPageClient.tsx"
Cohesion: 0.19
Nodes (12): dynamic, LoginPage(), CompanyLoginForm(), LoginPageClient(), LoginPageContent(), ModeEnum, LOGIN, REGISTER (+4 more)

### Community 71 - "RegisterForm.tsx"
Cohesion: 0.24
Nodes (12): CredentialsFormData, credentialsSchema, RegisterForm(), RegisterFormProps, VerificationFormData, verificationSchema, ResetPasswordForm(), LoginModal() (+4 more)

### Community 72 - "driverShiftPdf"
Cohesion: 0.23
Nodes (11): jose, apply, headers, url, driverShiftPdf(), ensure(), page(), pairs() (+3 more)

### Community 73 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 75 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 76 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 77 - "LoginForm.tsx"
Cohesion: 0.27
Nodes (9): GoogleLoginButton(), LoginForm(), LoginFormData, LoginFormProps, loginSchema, Alert, AlertDescription, AlertTitle (+1 more)

### Community 78 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 79 - "HomepageAdSlotSection.tsx"
Cohesion: 0.27
Nodes (8): dompurify, dompurify, FloatingCard(), FloatingCardProps, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 81 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 82 - "class-variance-authority"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 83 - "generate-invoice/route.ts"
Cohesion: 0.33
Nodes (8): dynamic, GET(), headers, runtime, POST, getVervoerbewijsArrayBuffer(), receiptDocumentUrl(), rateLimit()

### Community 84 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 85 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 86 - "DriverGuideSection.tsx"
Cohesion: 0.27
Nodes (9): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+1 more)

### Community 87 - "LoginModal.tsx"
Cohesion: 0.22
Nodes (8): LoginModalProps, ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET, LandingLanguage, landingTranslations

### Community 88 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 89 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 90 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 91 - "sign/route.ts"
Cohesion: 0.25
Nodes (5): resend, sendInvoiceToClient(), POST(), runtime, mailEvent()

### Community 92 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 93 - "LanguageProvider"
Cohesion: 0.31
Nodes (8): DriverLayout(), DriverLayoutShell(), detectBrowserLanguage(), LanguageProvider(), normalizeLanguage(), readCookieLanguage(), setDocumentDirection(), setLanguageCookie()

### Community 94 - "devices/route.ts"
Cohesion: 0.39
Nodes (7): POST, registration, close(), decryptSecret(), encryptSecret(), key(), transformSecrets()

### Community 95 - "sheet.tsx"
Cohesion: 0.28
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 97 - "rollout.mjs"
Cohesion: 0.29
Nodes (7): compose(), directory, env, [image, revision, target], lock, root, run()

### Community 98 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 99 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 101 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 102 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 103 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 104 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 105 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 106 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 107 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 108 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 109 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 110 - "invoice/[token]/page.tsx"
Cohesion: 0.40
Nodes (5): Company, Invoice, InvoiceViewPage(), ShareLink, TripInfoRow()

### Community 111 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 114 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 115 - "document-links.ts"
Cohesion: 0.60
Nodes (4): documentOrigin, receiptCapability(), signature(), verifyReceiptCapability()

### Community 116 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 117 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 120 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 121 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 122 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 123 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 124 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 125 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

## Knowledge Gaps
- **709 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+704 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 995 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `generateAdminUserToken()` connect `createErrorResponse` to `createPostgrestClient`, `lib/auth.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _709 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.06925907221701176 - nodes in this community are weakly interconnected._
- **Why does `getAuthRoles()` connect `createPostgrestClient` to `api-utils.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.03121796663871028 - nodes in this community are weakly interconnected._
- **Should `createPostgrestClient` be split into smaller, more focused modules?**
  _Cohesion score 0.0512396694214876 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 163 unresolved internal-endpoint edges and 19 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 222 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
