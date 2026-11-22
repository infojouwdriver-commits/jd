# Graph Report - JOUW DRIVER  (2026-11-22)

## Corpus Check
- 694 files · ~293,480 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4001 nodes · 13501 edges · 205 communities (141 shown, 64 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `11260413`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- Button
- generateAdminUserToken
- Label
- api-utils.ts
- ref_react
- TripPanel.tsx
- authCrudOperations
- Input
- usePreferences
- CompanyRegistrationDialog.tsx
- ui.tsx
- dependencies
- cn
- api.ts
- next
- end/route.ts
- InvoicesFeaturePage.tsx
- SiteAIAgent.tsx
- BackgroundGeolocation
- useAuth
- renderer.ts
- package.json
- mobile-location.ts
- operationFailure
- session.tsx
- CookieBanner.tsx
- sidebar.tsx
- driver-app/package.json
- 20261026_invoice_checkout.sql
- company-changes.ts
- DriverMap.tsx
- cbe-public-search.ts
- stripe-billing.ts
- submit/route.ts
- BackgroundGeolocationService.java
- CompanyRegistration.tsx
- api-client.ts
- mail-service.ts
- documents/route.ts
- import-cbe-open-data.py
- dependencies
- Trips.tsx
- use-toast.ts
- invoice-email.ts
- utils.ts
- pdf-generator.ts
- DriverShifts.tsx
- mobile/package.json
- marketing-content.ts
- 20261018_company_lifecycle.sql
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- company-social.ts
- MarketingEditorial.tsx
- 20261019_shift_activity.sql
- email-templates/route.ts
- ref_node_fs
- update-customer-portal.sh
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- engine.ts
- form.tsx
- DriverRegisterForm.tsx
- [resource]/page.tsx
- contract-email-handler.ts
- TripPointJournal.java
- CompanyLoginForm.tsx
- welcome-config.ts
- RegisterForm.tsx
- PlatformLanding.tsx
- compilerOptions
- "schema".security_operations_centre
- 20261016_native_push.sql
- AdminCompanyRegistration.tsx
- trip-journal.ts
- BackgroundGeolocation
- DriverSettlementCalculator.tsx
- scripts
- command.tsx
- company-portal/drivers/route.ts
- Override
- 20261019_driver_shifts.sql
- devDependencies
- carousel.tsx
- apply-release.mjs
- convert-database.mjs
- vervoerbewijs.ts
- ref_node_crypto
- receipts/[token]/route.ts
- RouteMap.tsx
- LoginPageClient.tsx
- next_api/contracts/route.ts
- messages/route.ts
- push-worker.mjs
- DriverGuideSection.tsx
- 20261012_accounts_messages.sql
- chart.tsx
- PDFGenerator
- "schema".security_fleet_locations
- "schema".company_registrations
- class-variance-authority
- EmailTemplatesPanel.tsx
- FaqPage.tsx
- chat/route.ts
- LoginModal.tsx
- pagination.tsx
- sheet.tsx
- generateAcceptanceReportPdf
- configure-stripe.mjs
- recover-db-log.mjs
- scripts
- 20261013_mail_delivery.sql
- "schema".company_change_requests
- 20261026_manual_invoices.sql
- navigation-menu.tsx
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- 20261115_account_deletion.sql
- HomepageAdSlotSection.tsx
- activity/route.ts
- [...path]/route.ts
- driverShiftPdf
- configure-mail.mjs
- ref_node_path
- driver-app/tsconfig.json
- "schema".company_staff_events
- 20261019_email_identity.sql
- 20261109_chiron_realtime.sql
- 20261115_contact_approval_alerts.sql
- definitions.d.ts
- transformSecrets
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
- 20261122_company_social_registration.sql
- container-scroll-animation.tsx
- prepare-customer-runtime.sh
- 20261023_app_experience.sql
- "schema".security_save_company_email
- gdpr/data-subject-requests/route.ts
- backup.sh
- public.security_enroll_initial_owner
- useInboxState
- 20261010_admin_mfa.sql
- trips_user_completion_request_idx
- "schema".security_create_trip_invoice
- "schema".security_reserve_mail
- preflight.mjs
- global-error.tsx
- backup-foundation.sh
- import-private-archive.sh
- 20261121_admin_company_onboarding.sql
- Package.swift
- onboarding-copy.ts

## God Nodes (most connected - your core abstractions)
1. `createErrorResponse()` - 297 edges
2. `createSuccessResponse()` - 292 edges
3. `generateAdminUserToken()` - 279 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 212 edges
6. `validateRequestBody()` - 185 edges
7. `Button` - 172 edges
8. `createPostgrestClient()` - 153 edges
9. `requestMiddleware()` - 133 edges
10. `useLanguage()` - 120 edges

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
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (205 total, 64 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.08
Nodes (114): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+106 more)

### Community 1 - "Button"
Cohesion: 0.06
Nodes (66): ChironSyncPage(), FailedTrip, Page(), Page(), CompanyDashboardPage(), ContractPrintPage(), PrintableContract, InvoicePayment() (+58 more)

### Community 2 - "generateAdminUserToken"
Cohesion: 0.06
Nodes (65): welcomePayload(), dynamic, GET(), headers, GET, PUT, GET, POST (+57 more)

### Community 3 - "Label"
Cohesion: 0.08
Nodes (76): Company, CompanyContractsPage(), Contract, Signature, PlatformContract, PlatformContractsPage(), Company, Distributor (+68 more)

### Community 4 - "api-utils.ts"
Cohesion: 0.06
Nodes (54): POST, registerSchema, registrationSchema, runtime, GET, GET, POST, GET (+46 more)

### Community 5 - "ref_react"
Cohesion: 0.04
Nodes (56): framer-motion, lucide-react, DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), glassCard (+48 more)

### Community 6 - "TripPanel.tsx"
Cohesion: 0.05
Nodes (57): login(), ActionGate, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), check(), open() (+49 more)

### Community 7 - "authCrudOperations"
Cohesion: 0.08
Nodes (64): bcryptjs, callback(), GET, PUT, available(), GET, POST, schema (+56 more)

### Community 8 - "Input"
Cohesion: 0.07
Nodes (54): sonner, DeletionStatusPage(), AccountDeletionsPage(), formatDate(), Request, AdminAccountPage(), AppExperiencePage(), metadata (+46 more)

### Community 9 - "usePreferences"
Cohesion: 0.13
Nodes (53): DriverMessage, DriverMap(), Account(), AccountDeletion(), ActiveTrip(), ActiveTripMap(), guidance, styles (+45 more)

### Community 10 - "CompanyRegistrationDialog.tsx"
Cohesion: 0.08
Nodes (50): AdSlot, AdSlotsPage(), EMPTY_FORM, CompaniesPage(), CompaniesPageContent(), Company, AdminDriversPage(), AdminDriversPageContent() (+42 more)

### Community 11 - "ui.tsx"
Cohesion: 0.06
Nodes (49): Layout(), Navigation(), ActivityProvider(), appVersionLabel(), RoadArt(), BrandMark(), icon, FarePreview (+41 more)

### Community 12 - "dependencies"
Cohesion: 0.03
Nodes (66): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+58 more)

### Community 13 - "cn"
Cohesion: 0.05
Nodes (58): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, vaul, AccordionContent, AccordionItem, AccordionTrigger (+50 more)

### Community 14 - "api.ts"
Cohesion: 0.07
Nodes (48): AccountInfo, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead(), profile() (+40 more)

### Community 15 - "next"
Cohesion: 0.07
Nodes (51): nextConfig, leaflet, next, ReceiptPage(), ReceiptWorkspace(), BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl() (+43 more)

### Community 16 - "end/route.ts"
Cohesion: 0.10
Nodes (31): connection, GET, POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST, POST (+23 more)

### Community 17 - "InvoicesFeaturePage.tsx"
Cohesion: 0.07
Nodes (37): Page(), Page(), Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps (+29 more)

### Community 18 - "SiteAIAgent.tsx"
Cohesion: 0.06
Nodes (41): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, apiFetch(), ApiResponse (+33 more)

### Community 19 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 20 - "useAuth"
Cohesion: 0.10
Nodes (36): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), GdprAdminPage(), metadata (+28 more)

### Community 21 - "renderer.ts"
Cohesion: 0.09
Nodes (37): GET, POST, Draft, contractInvitation(), copy, verificationDesign(), VerificationPurpose, contractDesign() (+29 more)

### Community 22 - "package.json"
Cohesion: 0.05
Nodes (41): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+33 more)

### Community 23 - "mobile-location.ts"
Cohesion: 0.08
Nodes (32): copy, DriverFleetShift(), GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation() (+24 more)

### Community 24 - "operationFailure"
Cohesion: 0.11
Nodes (27): changeFingerprint(), submitCompanyChange(), command, staffGET, staffPOST, sections, workspaceGET, command (+19 more)

### Community 25 - "session.tsx"
Cohesion: 0.10
Nodes (29): App(), logout(), styles, createActionGate(), apiConnectionKey(), DriverProfile, DriverTripSummary, clearReceiptCache() (+21 more)

### Community 26 - "CookieBanner.tsx"
Cohesion: 0.08
Nodes (31): ReceiptEmailSettings(), DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader() (+23 more)

### Community 27 - "sidebar.tsx"
Cohesion: 0.07
Nodes (31): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup, SidebarGroupAction (+23 more)

### Community 28 - "driver-app/package.json"
Cohesion: 0.06
Nodes (34): eslint, react, react-dom, @types/react, typescript, zod, main, name (+26 more)

### Community 29 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 30 - "company-changes.ts"
Cohesion: 0.12
Nodes (25): GET, resolveDistributorInfo(), resolveEffectiveUserType(), driverInput, POST, registration, POST, POST (+17 more)

### Community 31 - "DriverMap.tsx"
Cohesion: 0.11
Nodes (32): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), showWholeRoute(), RouteStatus, token (+24 more)

### Community 32 - "cbe-public-search.ts"
Cohesion: 0.12
Nodes (31): saxes, errors, POST, query, headers, input, POST, unavailable() (+23 more)

### Community 33 - "stripe-billing.ts"
Cohesion: 0.14
Nodes (30): stripe, runtime, runtime, Checkout, Client, closeInvoiceCheckout(), invoiceCheckout(), invoiceRpc() (+22 more)

### Community 34 - "submit/route.ts"
Cohesion: 0.10
Nodes (25): metadata, Page(), metadata, Page(), POST(), result(), sites, metadata (+17 more)

### Community 35 - "BackgroundGeolocationService.java"
Cohesion: 0.09
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 36 - "CompanyRegistration.tsx"
Cohesion: 0.10
Nodes (23): CompanyRegistrationReceipt, CompanyRegistrationScreen(), advance(), change(), draft(), field(), sendCode(), validate() (+15 more)

### Community 37 - "api-client.ts"
Cohesion: 0.12
Nodes (25): DriverLoginPage(), attemptSilentRefresh(), AuthContext, AuthProvider(), AuthProviderProps, DriverGoogleLoginButton(), DriverLoginClient(), DriverLoginContent() (+17 more)

### Community 38 - "mail-service.ts"
Cohesion: 0.11
Nodes (25): resend, POST(), runtime, POST(), runtime, sendPendingApprovalAlerts(), startApprovalMailScheduler(), run() (+17 more)

### Community 39 - "documents/route.ts"
Cohesion: 0.12
Nodes (26): GET, handler, POST, GET, handlePricing, PUT, GET, POST (+18 more)

### Community 40 - "import-cbe-open-data.py"
Cohesion: 0.14
Nodes (10): build(), check(), fingerprint(), git(), selected_paths(), address(), build_database(), main() (+2 more)

### Community 41 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, expo, expo-application, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking (+21 more)

### Community 42 - "Trips.tsx"
Cohesion: 0.15
Nodes (19): Period, periodDates(), validDay(), validRange(), ActivityPage, RevenueSummary, invoice(), Context (+11 more)

### Community 43 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 44 - "invoice-email.ts"
Cohesion: 0.13
Nodes (22): register(), copy, invoiceDesign(), InvoiceEmailData, InvoiceMailPurpose, BankInstructions, bankPaymentPayload(), invoiceBankPayload() (+14 more)

### Community 45 - "utils.ts"
Cohesion: 0.07
Nodes (20): clsx, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+12 more)

### Community 46 - "pdf-generator.ts"
Cohesion: 0.13
Nodes (19): jspdf, Company, configurePdfFonts(), AcceptanceReportData, acceptanceSummary(), AcceptanceTrip, acceptanceTrips(), ChironTestMessage (+11 more)

### Community 47 - "DriverShifts.tsx"
Cohesion: 0.15
Nodes (21): qrcode, ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy, km (+13 more)

### Community 48 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 49 - "marketing-content.ts"
Cohesion: 0.12
Nodes (16): metadata, generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, homeAlternates, homepageMetadata() (+8 more)

### Community 50 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 51 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 52 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 53 - "company-social.ts"
Cohesion: 0.13
Nodes (21): jose, apply, headers, url, GET(), metadata, RegistrationPage(), appleKeys (+13 more)

### Community 54 - "MarketingEditorial.tsx"
Cohesion: 0.20
Nodes (20): dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props, SolutionPage() (+12 more)

### Community 55 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 56 - "email-templates/route.ts"
Cohesion: 0.16
Nodes (21): forbidden(), GET, invalid(), POST, PUT, serviceClient(), emailLanguages, isEditableTemplate() (+13 more)

### Community 57 - "ref_node_fs"
Cohesion: 0.12
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 58 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 59 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 60 - "20261024_stripe_billing.sql"
Cohesion: 0.15
Nodes (14): "schema".security_stripe_allocate(), "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts (+6 more)

### Community 61 - "engine.ts"
Cohesion: 0.20
Nodes (18): qrcode, gsap, three, mountCinema(), render(), resize(), optimize(), Pose (+10 more)

### Community 62 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 63 - "DriverRegisterForm.tsx"
Cohesion: 0.12
Nodes (21): DriverRegisterForm(), DriverRegisterFormProps, FormField(), ProgressHeader(), Step1Data, step1Schema, Step2Data, step2Schema (+13 more)

### Community 64 - "[resource]/page.tsx"
Cohesion: 0.16
Nodes (16): generateMetadata(), getPage(), isResource(), MarketingResource(), Props, DriverSettlementCalculator(), download(), marketingCopy (+8 more)

### Community 65 - "contract-email-handler.ts"
Cohesion: 0.16
Nodes (15): command, POST, POST, POST, emailContractHandler(), review, signature, claims (+7 more)

### Community 67 - "CompanyLoginForm.tsx"
Cohesion: 0.16
Nodes (16): close(), @hookform/resolvers, react-hook-form, CompanyLoginForm(), CompanyLoginFormData, CompanyLoginFormProps, companyLoginSchema, GoogleLoginButton() (+8 more)

### Community 68 - "welcome-config.ts"
Cohesion: 0.19
Nodes (16): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster() (+8 more)

### Community 69 - "RegisterForm.tsx"
Cohesion: 0.17
Nodes (17): CredentialsFormData, credentialsSchema, RegisterForm(), RegisterFormProps, VerificationFormData, verificationSchema, EmailFormData, emailSchema (+9 more)

### Community 70 - "PlatformLanding.tsx"
Cohesion: 0.19
Nodes (14): Cinema(), cinematicCopy, CinematicText, MarketingExplore(), downloadCopy, PlatformLanding(), openRegistration(), SocialRegistration (+6 more)

### Community 71 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 73 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 74 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 75 - "AdminCompanyRegistration.tsx"
Cohesion: 0.14
Nodes (14): AdminCompanyRegistration(), changeOpen(), clearLookup(), submit(), CbeCompany, cbeStatus, companyFields, driverFields (+6 more)

### Community 76 - "trip-journal.ts"
Cohesion: 0.23
Nodes (14): browserJournals, createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save() (+6 more)

### Community 78 - "DriverSettlementCalculator.tsx"
Cohesion: 0.21
Nodes (10): fields, summary, MarketingLocale, calculatorText(), calculateSettlement(), cents(), emptySettlement(), downloadSettlement() (+2 more)

### Community 79 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 80 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 81 - "company-portal/drivers/route.ts"
Cohesion: 0.10
Nodes (12): DELETE, POST, PUT, DELETE, POST, PUT, GET, POST (+4 more)

### Community 82 - "Override"
Cohesion: 0.19
Nodes (3): OnSuccessListener<Location>, ServiceConnection, ServiceReceiver

### Community 83 - "20261019_driver_shifts.sql"
Cohesion: 0.25
Nodes (11): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_driver_shifts() (+3 more)

### Community 84 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+7 more)

### Community 85 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 86 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 87 - "convert-database.mjs"
Cohesion: 0.27
Nodes (12): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), parseSchema() (+4 more)

### Community 88 - "vervoerbewijs.ts"
Cohesion: 0.20
Nodes (12): chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs(), VervoerbewijsChiron, VervoerbewijsCompany (+4 more)

### Community 89 - "ref_node_crypto"
Cohesion: 0.16
Nodes (8): base, checks, headers, now, required, decodeTotpSecret(), matchingTotpStep(), totpAt()

### Community 90 - "receipts/[token]/route.ts"
Cohesion: 0.25
Nodes (11): dynamic, GET(), headers, runtime, getVervoerbewijsArrayBuffer(), VervoerbewijsData, documentOrigin, receiptCapability() (+3 more)

### Community 91 - "RouteMap.tsx"
Cohesion: 0.22
Nodes (12): RouteCoords, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), DrivingRoute, fetchDrivingRoute() (+4 more)

### Community 92 - "LoginPageClient.tsx"
Cohesion: 0.19
Nodes (12): dynamic, LoginPage(), LoginForm(), LoginPageClient(), LoginPageContent(), ModeEnum, LOGIN, REGISTER (+4 more)

### Community 93 - "next_api/contracts/route.ts"
Cohesion: 0.43
Nodes (12): DELETE, document(), failed(), GET, positiveId(), POST, PUT, generateContractHTML() (+4 more)

### Community 94 - "messages/route.ts"
Cohesion: 0.32
Nodes (9): GET, POST, GET, POST, POST, accessibleMessage(), fields, messageId() (+1 more)

### Community 95 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 96 - "DriverGuideSection.tsx"
Cohesion: 0.22
Nodes (11): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+3 more)

### Community 97 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 98 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 100 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 101 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 102 - "class-variance-authority"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 103 - "EmailTemplatesPanel.tsx"
Cohesion: 0.24
Nodes (5): EmailTemplatesPage(), EmailTemplatesPanel(), languageLabels, Preview, Template

### Community 104 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 105 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 106 - "LoginModal.tsx"
Cohesion: 0.22
Nodes (8): LoginModalProps, ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET, LandingLanguage, landingTranslations

### Community 107 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 108 - "sheet.tsx"
Cohesion: 0.24
Nodes (9): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants (+1 more)

### Community 109 - "generateAcceptanceReportPdf"
Cohesion: 0.40
Nodes (9): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), isAcceptedTestMessage() (+1 more)

### Community 110 - "configure-stripe.mjs"
Cohesion: 0.31
Nodes (7): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys

### Community 111 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 112 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 113 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 114 - ""schema".company_change_requests"
Cohesion: 0.28
Nodes (3): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change()

### Community 115 - "20261026_manual_invoices.sql"
Cohesion: 0.36
Nodes (5): manual_invoice_immutable, manual_payment_immutable, "schema".manual_invoice_payments, "schema".manual_invoices, "schema".security_manual_invoice()

### Community 116 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 117 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 118 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 119 - "20261115_account_deletion.sql"
Cohesion: 0.36
Nodes (5): clear_account_deletion_notice, "schema".account_deletion_requests, "schema".security_clear_account_deletion_notice(), "schema".security_complete_account_deletion(), "schema".security_request_account_deletion()

### Community 120 - "HomepageAdSlotSection.tsx"
Cohesion: 0.36
Nodes (6): dompurify, dompurify, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 121 - "activity/route.ts"
Cohesion: 0.54
Nodes (6): GET, activityColumns, activityFilters(), brusselsDay(), civilDate(), summarizeActivity()

### Community 122 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 123 - "driverShiftPdf"
Cohesion: 0.46
Nodes (7): driverShiftPdf(), ensure(), page(), pairs(), paragraph(), section(), table()

### Community 124 - "configure-mail.mjs"
Cohesion: 0.48
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 125 - "ref_node_path"
Cohesion: 0.33
Nodes (3): dir, aad, openPushCredential()

### Community 126 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 128 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 129 - "20261109_chiron_realtime.sql"
Cohesion: 0.38
Nodes (3): record_trip_shift, trips_company_realtime_platform_ref_idx, trips_driver_realtime_active_idx

### Community 130 - "20261115_contact_approval_alerts.sql"
Cohesion: 0.33
Nodes (4): approval_mail, approval_mail_ready, "schema".approval_mail_outbox, "schema".security_reserve_mail()

### Community 131 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 132 - "transformSecrets"
Cohesion: 0.48
Nodes (6): close(), send(), decryptSecret(), encryptSecret(), key(), transformSecrets()

### Community 133 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 134 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 135 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 136 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 140 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 141 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 142 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, eslint, eslint-config-expo, @types/react, typescript

### Community 147 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 148 - "20261114_email_templates.sql"
Cohesion: 0.50
Nodes (3): "schema".email_template_audit, "schema".email_template_settings, "schema".security_reserve_mail()

### Community 150 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 151 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 154 - "gdpr/data-subject-requests/route.ts"
Cohesion: 0.83
Nodes (3): POST, VALID_TYPES, calendarMonthDeadline()

### Community 157 - "useInboxState"
Cohesion: 0.67
Nodes (3): useInboxState(), readMessage(), readNotification()

## Knowledge Gaps
- **853 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+848 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1229 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **64 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TaximeterWorkspace()` connect `next` to `Button`, `Label`, `useAddressSearch.ts`, `DriverShifts.tsx`, `useAuth`, `mobile-location.ts`, `RouteMap.tsx`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _853 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07648365598222787 - nodes in this community are weakly interconnected._
- **Why does `BackgroundGeolocation` connect `BackgroundGeolocation` to `BackgroundGeolocation.java`, `Override`, `BackgroundGeolocationService.java`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.0649152865029507 - nodes in this community are weakly interconnected._
- **Why does `deliverInvoiceEmail()` connect `invoice-email.ts` to `operationFailure`, `stripe-billing.ts`, `mail-service.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `generateAdminUserToken` be split into smaller, more focused modules?**
  _Cohesion score 0.059393939393939395 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 193 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 292 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
