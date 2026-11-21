# Graph Report - JOUW DRIVER  (2026-11-21)

## Corpus Check
- 684 files · ~290,248 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3934 nodes · 13296 edges · 203 communities (139 shown, 64 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3e191c53`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- api-utils.ts
- useLanguage
- ref_react
- Button
- useTripController.ts
- usePreferences
- cn
- lib/auth.ts
- DriverRegisterForm.tsx
- CompanyDashboard.tsx
- package.json
- dependencies
- preferences.tsx
- api.ts
- end/route.ts
- FleetPanel.tsx
- SelectContent
- ref_zod
- driver/taximeter/page.tsx
- email-templates/route.ts
- SiteAIAgent.tsx
- BackgroundGeolocation
- sidebar.tsx
- cbe-public-search.ts
- marketing-content.ts
- getAuthRoles
- 20261026_invoice_checkout.sql
- DriverDashboard.tsx
- driver-app/package.json
- api-client.ts
- PlatformLanding.tsx
- BackgroundGeolocationService.java
- CompanyRegistration.tsx
- DriverMap.tsx
- dependencies
- use-toast.ts
- stripe-billing.ts
- vervoerbewijs.ts
- mobile/package.json
- samples.ts
- 20261018_company_lifecycle.sql
- 20261018_subscription_billing.sql
- driver-shifts.ts
- jouww-cutover.mjs
- 20261019_shift_activity.sql
- validateRequestBody
- ref_node_fs
- update-customer-portal.sh
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- engine.ts
- DirectoryToolbar.tsx
- pdf-generator.ts
- TripPointJournal.java
- welcome-config.ts
- documents/route.ts
- session.tsx
- ApiError
- compilerOptions
- DriverSettlementCalculator.tsx
- renderer.ts
- municipal-test-documents.ts
- AddressField.tsx
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- invoice-email.ts
- trip-journal.ts
- code-map.py
- ref_node_crypto
- scripts
- ManagementShell.tsx
- RouteMap.tsx
- [resource]/page.tsx
- invoice-payment-handler.ts
- 20261019_driver_shifts.sql
- carousel.tsx
- apply-release.mjs
- convert-database.mjs
- PublicInfo.tsx
- submit/route.ts
- next_api/contracts/route.ts
- form.tsx
- driverShiftPdf
- subscription-billing.ts
- CookieBanner.tsx
- DriverGuideSection.tsx
- approval-mail-scheduler.ts
- settings-model.ts
- 20261012_accounts_messages.sql
- chart.tsx
- activity-state.tsx
- "schema".security_fleet_locations
- "schema".company_registrations
- FaqPage.tsx
- chat/route.ts
- configure-stripe.mjs
- recover-db-log.mjs
- scripts
- 20261013_mail_delivery.sql
- "schema".company_change_requests
- 20261026_manual_invoices.sql
- navigation-menu.tsx
- toggle-group.tsx
- Override
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- 20261115_account_deletion.sql
- HomepageAdSlotSection.tsx
- tariff-quote.ts
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
- EmailTemplatesPanel
- brevo/route.ts
- useAddressSearch.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- "schema".security_issue_subscription_demo
- "schema".security_email_contract
- 20261115_chiron_onboarding.sql
- contract-template.ts
- admin-enrollment.mjs
- run
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
- "schema".security_save_company_email
- company-portal/drivers/route.ts
- company-portal/vehicles/route.ts
- invoices/send/route.ts
- view/route.ts
- websocket/route.ts
- ModeEnum
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
- 20261121_admin_company_onboarding.sql
- Package.swift
- onboarding-copy.ts

## God Nodes (most connected - your core abstractions)
1. `createErrorResponse()` - 297 edges
2. `createSuccessResponse()` - 292 edges
3. `generateAdminUserToken()` - 277 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 212 edges
6. `validateRequestBody()` - 183 edges
7. `Button` - 170 edges
8. `createPostgrestClient()` - 151 edges
9. `requestMiddleware()` - 132 edges
10. `useLanguage()` - 118 edges

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
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (203 total, 64 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (116): bcryptjs, GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE (+108 more)

### Community 1 - "api-utils.ts"
Cohesion: 0.04
Nodes (88): welcomePayload(), GET, PUT, GET, PUT, command, POST, filters (+80 more)

### Community 2 - "useLanguage"
Cohesion: 0.03
Nodes (96): framer-motion, DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification(), DriverProfileRoute() (+88 more)

### Community 3 - "ref_react"
Cohesion: 0.05
Nodes (76): nextConfig, class-variance-authority, lucide-react, next, sonner, ApprovalRequest, DriverRegistrationRequest, EmptyState() (+68 more)

### Community 4 - "Button"
Cohesion: 0.08
Nodes (91): sameWelcomeContent(), WELCOME_LANGUAGES, AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, ApprovalRequestsPage() (+83 more)

### Community 5 - "useTripController.ts"
Cohesion: 0.06
Nodes (62): login(), styles, ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter() (+54 more)

### Community 6 - "usePreferences"
Cohesion: 0.13
Nodes (52): DriverMap(), Account(), AccountDeletion(), secureOptions, ActiveTrip(), ActiveTripMap(), useActivityFilters(), ActivityFilters() (+44 more)

### Community 7 - "cn"
Cohesion: 0.04
Nodes (78): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, @radix-ui/react-slot, react-resizable-panels, vaul, AccordionContent (+70 more)

### Community 8 - "lib/auth.ts"
Cohesion: 0.07
Nodes (61): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+53 more)

### Community 9 - "DriverRegisterForm.tsx"
Cohesion: 0.05
Nodes (64): close(), @hookform/resolvers, @radix-ui/react-separator, dynamic, LoginPage(), CompanyLoginForm(), DriverRegisterForm(), DriverRegisterFormProps (+56 more)

### Community 10 - "CompanyDashboard.tsx"
Cohesion: 0.07
Nodes (50): Page(), Page(), CompanyDashboardPage(), DashboardPage(), CompanyDashboard(), PortalData, DriversTab(), VehiclesTab() (+42 more)

### Community 11 - "package.json"
Cohesion: 0.03
Nodes (63): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+55 more)

### Community 12 - "dependencies"
Cohesion: 0.03
Nodes (66): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+58 more)

### Community 13 - "preferences.tsx"
Cohesion: 0.07
Nodes (42): Layout(), Navigation(), guidance, styles, ActivityProvider(), appVersionLabel(), RoadArt(), BrandMark() (+34 more)

### Community 14 - "api.ts"
Cohesion: 0.05
Nodes (49): AccountDeletionStatus, AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, driverApi, DriverDetails, DriverMessage (+41 more)

### Community 15 - "end/route.ts"
Cohesion: 0.10
Nodes (32): connection, POST, GET, POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST (+24 more)

### Community 16 - "FleetPanel.tsx"
Cohesion: 0.06
Nodes (43): leaflet, AdminFleetPage(), copy, DriverFleetShift(), FleetPanel(), formatUpdate(), statusClasses, statusLabels (+35 more)

### Community 17 - "SelectContent"
Cohesion: 0.07
Nodes (46): GdprAdminPage(), metadata, Page(), glassCard, labelStyle, PeriodType, StatCard(), SummaryData (+38 more)

### Community 18 - "ref_zod"
Cohesion: 0.09
Nodes (41): dynamic, GET(), headers, GET, POST, schema, POST, schema (+33 more)

### Community 19 - "driver/taximeter/page.tsx"
Cohesion: 0.09
Nodes (44): ReceiptPage(), ReceiptWorkspace(), BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), DriverActionButton() (+36 more)

### Community 20 - "email-templates/route.ts"
Cohesion: 0.07
Nodes (39): resend, command, POST, POST, POST, forbidden(), GET, invalid() (+31 more)

### Community 21 - "SiteAIAgent.tsx"
Cohesion: 0.06
Nodes (41): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, apiFetch(), ApiResponse (+33 more)

### Community 22 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 23 - "sidebar.tsx"
Cohesion: 0.06
Nodes (38): @radix-ui/react-dialog, @radix-ui/react-tooltip, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay (+30 more)

### Community 24 - "cbe-public-search.ts"
Cohesion: 0.08
Nodes (39): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+31 more)

### Community 25 - "marketing-content.ts"
Cohesion: 0.14
Nodes (30): dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props, SolutionPage() (+22 more)

### Community 26 - "getAuthRoles"
Cohesion: 0.09
Nodes (32): GET, resolveDistributorInfo(), resolveEffectiveUserType(), driverInput, POST, registration, POST, PUT (+24 more)

### Community 27 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 28 - "DriverDashboard.tsx"
Cohesion: 0.11
Nodes (28): DeletionStatusPage(), AccountDeletionsPage(), formatDate(), Request, AdminAccountPage(), ChironSettingsPage(), connectionButton(), testConnection() (+20 more)

### Community 29 - "driver-app/package.json"
Cohesion: 0.06
Nodes (35): devDependencies, eslint, eslint-config-expo, @types/react, typescript, eslint, react, react-dom (+27 more)

### Community 30 - "api-client.ts"
Cohesion: 0.10
Nodes (27): ContractPrintPage(), PrintableContract, ContractReview, SignContractPage(), ContractDocument(), submit(), cbeStatus, companyFields (+19 more)

### Community 31 - "PlatformLanding.tsx"
Cohesion: 0.11
Nodes (20): metadata, generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, metadata, RegistrationPage() (+12 more)

### Community 32 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 33 - "CompanyRegistration.tsx"
Cohesion: 0.12
Nodes (22): CompanyRegistrationReceipt, CompanyRegistrationScreen(), advance(), change(), draft(), field(), sendCode(), validate() (+14 more)

### Community 34 - "DriverMap.tsx"
Cohesion: 0.12
Nodes (26): DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), showWholeRoute(), RouteStatus, token (+18 more)

### Community 35 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, expo, expo-application, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking (+21 more)

### Community 36 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 37 - "stripe-billing.ts"
Cohesion: 0.17
Nodes (25): stripe, runtime, runtime, processInvoiceCheckout(), bind(), Client, completeSetup(), assertStripeInvoice() (+17 more)

### Community 38 - "vervoerbewijs.ts"
Cohesion: 0.13
Nodes (23): dynamic, GET(), headers, runtime, chironColor(), chironLabel(), fmtDateTime(), fmtGps() (+15 more)

### Community 39 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 40 - "samples.ts"
Cohesion: 0.14
Nodes (21): contractInvitation(), copy, verificationDesign(), VerificationPurpose, contractDesign(), ContractEmailData, copy, SignatureEvidence (+13 more)

### Community 41 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 42 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 43 - "driver-shifts.ts"
Cohesion: 0.14
Nodes (19): jspdf, ShiftPage(), DriverShifts(), downloadPdf(), configurePdfFonts(), km, ShiftActivity, shiftDeclaration (+11 more)

### Community 44 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 45 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 46 - "validateRequestBody"
Cohesion: 0.18
Nodes (17): POST, PUT, GET, POST, POST, VALID_TYPES, POST, GET (+9 more)

### Community 47 - "ref_node_fs"
Cohesion: 0.12
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 48 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 49 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 50 - "20261024_stripe_billing.sql"
Cohesion: 0.15
Nodes (14): "schema".security_stripe_allocate(), "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts (+6 more)

### Community 51 - "engine.ts"
Cohesion: 0.19
Nodes (19): qrcode, gsap, qrcode, three, mountCinema(), render(), resize(), optimize() (+11 more)

### Community 52 - "DirectoryToolbar.tsx"
Cohesion: 0.14
Nodes (17): cmdk, @radix-ui/react-popover, directoryCopy, CompanyOption, CompanyPicker(), DirectoryKind, DirectoryResult, Command (+9 more)

### Community 53 - "pdf-generator.ts"
Cohesion: 0.11
Nodes (10): ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, PDFGenerator, TestResult (+2 more)

### Community 55 - "welcome-config.ts"
Cohesion: 0.17
Nodes (15): APP_ORIGIN, LEGACY_APP_ORIGIN, DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record() (+7 more)

### Community 56 - "documents/route.ts"
Cohesion: 0.18
Nodes (16): GET, handler, POST, activeCompanyTariffs(), CompanyPricing, companyPricingPatch(), companyTariffs(), defaults (+8 more)

### Community 58 - "session.tsx"
Cohesion: 0.19
Nodes (14): App(), logout(), createActionGate(), apiConnectionKey(), clearReceiptCache(), Context, TripContext, useSessionState() (+6 more)

### Community 59 - "ApiError"
Cohesion: 0.17
Nodes (18): ApiError, createDriverApi(), loadProfile(), ownerRead(), profile(), request(), requestOnce(), startTrip() (+10 more)

### Community 60 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 61 - "DriverSettlementCalculator.tsx"
Cohesion: 0.19
Nodes (12): DriverSettlementCalculator(), download(), fields, summary, MarketingLocale, calculatorText(), calculateSettlement(), cents() (+4 more)

### Community 62 - "renderer.ts"
Cohesion: 0.15
Nodes (17): Draft, editableTemplateIds, emailBrand, EmailDesignId, EmailEdits, emailLanguages, emailMessageHtml(), escapeEmail() (+9 more)

### Community 63 - "municipal-test-documents.ts"
Cohesion: 0.25
Nodes (15): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+7 more)

### Community 64 - "AddressField.tsx"
Cohesion: 0.27
Nodes (15): AddressField(), search(), Failure, messages, PickupLocation(), locate(), coordinate(), createAddressSearch() (+7 more)

### Community 66 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 67 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 68 - "invoice-email.ts"
Cohesion: 0.29
Nodes (12): BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState, validIban(), deliverInvoiceEmail(), invoicePaymentState(), euro() (+4 more)

### Community 69 - "trip-journal.ts"
Cohesion: 0.23
Nodes (14): browserJournals, createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save() (+6 more)

### Community 70 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 71 - "ref_node_crypto"
Cohesion: 0.18
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 72 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 73 - "ManagementShell.tsx"
Cohesion: 0.19
Nodes (12): AdminLayout(), attemptSilentRefresh(), AuthProvider(), managementMenu, ManagementShell(), approvalPage, approvalPath(), approvalReturnPath() (+4 more)

### Community 74 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 75 - "[resource]/page.tsx"
Cohesion: 0.21
Nodes (13): generateMetadata(), getPage(), isResource(), MarketingResource(), Props, calculatorCopy, calculatorDescription, chironGuide (+5 more)

### Community 76 - "invoice-payment-handler.ts"
Cohesion: 0.24
Nodes (12): Checkout, Client, invoiceCheckout(), invoiceRpc(), InvoiceSource, command, invoicePaymentPOST, claims (+4 more)

### Community 77 - "20261019_driver_shifts.sql"
Cohesion: 0.25
Nodes (11): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_driver_shifts() (+3 more)

### Community 78 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 79 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 80 - "convert-database.mjs"
Cohesion: 0.27
Nodes (12): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), parseSchema() (+4 more)

### Community 81 - "PublicInfo.tsx"
Cohesion: 0.20
Nodes (10): metadata, Page(), metadata, Page(), metadata, PrivacyPolicyPage(), ContactPanel(), Locale (+2 more)

### Community 82 - "submit/route.ts"
Cohesion: 0.24
Nodes (11): POST(), result(), sites, contactEmailDesign(), contactCopy, ContactSubmission, contactTopics, supportEmail (+3 more)

### Community 83 - "next_api/contracts/route.ts"
Cohesion: 0.39
Nodes (13): PUT, DELETE, document(), failed(), GET, positiveId(), POST, PUT (+5 more)

### Community 84 - "form.tsx"
Cohesion: 0.19
Nodes (12): @radix-ui/react-label, react-hook-form, FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext (+4 more)

### Community 85 - "driverShiftPdf"
Cohesion: 0.23
Nodes (11): jose, apply, headers, url, driverShiftPdf(), ensure(), page(), pairs() (+3 more)

### Community 86 - "subscription-billing.ts"
Cohesion: 0.24
Nodes (10): closeInvoiceCheckout(), sendInvoiceEmail(), invoicePaymentUrl(), billingGET, billingPOST, command, date, expected (+2 more)

### Community 87 - "CookieBanner.tsx"
Cohesion: 0.26
Nodes (11): CookieBanner(), CookieCategory, DEFAULT_CATEGORIES, T, COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION, COOKIE_PREFERENCES_EVENT, CookieConsent (+3 more)

### Community 88 - "DriverGuideSection.tsx"
Cohesion: 0.22
Nodes (11): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+3 more)

### Community 89 - "approval-mail-scheduler.ts"
Cohesion: 0.26
Nodes (10): register(), accountDeletionPage, ApprovalTab, sendPendingApprovalAlerts(), startApprovalMailScheduler(), run(), accountDeletionEmailDesign(), ApprovalAlert (+2 more)

### Community 90 - "settings-model.ts"
Cohesion: 0.19
Nodes (11): templateIds, emailDesignVersion, EmailSettings, EmailSettingsData, emailSettingsDataSchema, invoiceEdit, paragraph, saveEmailSettingsSchema (+3 more)

### Community 91 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 92 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 93 - "activity-state.tsx"
Cohesion: 0.27
Nodes (8): Period, periodDates(), validDay(), validRange(), Context, useStateValue(), apply(), preset()

### Community 94 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 95 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 96 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 97 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 98 - "configure-stripe.mjs"
Cohesion: 0.31
Nodes (7): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys

### Community 99 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 100 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, ios, lint, prebuild, start, test, typecheck (+1 more)

### Community 101 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 102 - ""schema".company_change_requests"
Cohesion: 0.28
Nodes (3): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change()

### Community 103 - "20261026_manual_invoices.sql"
Cohesion: 0.36
Nodes (5): manual_invoice_immutable, manual_payment_immutable, "schema".manual_invoice_payments, "schema".manual_invoices, "schema".security_manual_invoice()

### Community 104 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 105 - "toggle-group.tsx"
Cohesion: 0.31
Nodes (7): @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 107 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 108 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 109 - "20261115_account_deletion.sql"
Cohesion: 0.36
Nodes (5): clear_account_deletion_notice, "schema".account_deletion_requests, "schema".security_clear_account_deletion_notice(), "schema".security_complete_account_deletion(), "schema".security_request_account_deletion()

### Community 110 - "HomepageAdSlotSection.tsx"
Cohesion: 0.36
Nodes (6): dompurify, dompurify, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 111 - "tariff-quote.ts"
Cohesion: 0.36
Nodes (7): Company, CompanyTariff, Quote, readTariffQuote(), signature(), signTariffQuote(), TariffSheet

### Community 112 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 114 - "configure-mail.mjs"
Cohesion: 0.48
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 115 - "ref_node_path"
Cohesion: 0.33
Nodes (3): dir, aad, openPushCredential()

### Community 116 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 118 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 119 - "20261109_chiron_realtime.sql"
Cohesion: 0.38
Nodes (3): record_trip_shift, trips_company_realtime_platform_ref_idx, trips_driver_realtime_active_idx

### Community 120 - "20261115_contact_approval_alerts.sql"
Cohesion: 0.33
Nodes (4): approval_mail, approval_mail_ready, "schema".approval_mail_outbox, "schema".security_reserve_mail()

### Community 121 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 122 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 123 - "EmailTemplatesPanel"
Cohesion: 0.33
Nodes (3): EmailTemplatesPage(), EmailTemplatesPanel(), isEditableTemplate()

### Community 124 - "brevo/route.ts"
Cohesion: 0.52
Nodes (5): POST(), runtime, brevoMailEvent(), brevoProviderId(), brevoWebhookAuthorized()

### Community 125 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 126 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 127 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 128 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 132 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 133 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 134 - "run"
Cohesion: 0.40
Nodes (5): check(), open(), run(), submit(), ownerKey()

### Community 139 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 140 - "20261114_email_templates.sql"
Cohesion: 0.50
Nodes (3): "schema".email_template_audit, "schema".email_template_settings, "schema".security_reserve_mail()

### Community 141 - "ModeEnum"
Cohesion: 0.40
Nodes (5): ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET

### Community 142 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 143 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 144 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 147 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 148 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 149 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 150 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 151 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 152 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

### Community 153 - "totp.ts"
Cohesion: 0.83
Nodes (3): decodeTotpSecret(), matchingTotpStep(), totpAt()

## Knowledge Gaps
- **837 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+832 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1208 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **64 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `requestMiddleware()` connect `api-utils.ts` to `lib/auth.ts`, `createErrorResponse`, `getAuthRoles`, `ref_zod`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _837 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.06866223207686623 - nodes in this community are weakly interconnected._
- **Why does `useTripController()` connect `useTripController.ts` to `api.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `api-utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.04450154162384378 - nodes in this community are weakly interconnected._
- **Should `useLanguage` be split into smaller, more focused modules?**
  _Cohesion score 0.030860733924363146 - nodes in this community are weakly interconnected._
- **Should `ref_react` be split into smaller, more focused modules?**
  _Cohesion score 0.04830053667262969 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 175 unresolved internal-endpoint edges and 22 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 289 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
