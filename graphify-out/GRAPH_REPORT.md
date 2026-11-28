# Graph Report - JOUW DRIVER  (2026-11-28)

## Corpus Check
- 705 files · ~298,084 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4075 nodes · 13707 edges · 213 communities (146 shown, 67 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d6e75079`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- session.tsx
- Input
- usePreferences
- createPostgrestClient
- useAuth
- preferences.tsx
- useLanguage
- Button
- ref_react
- api.ts
- api-utils.ts
- dependencies
- Card
- next
- cn
- ref_zod
- authCrudOperations
- end/route.ts
- company-changes.ts
- BackgroundGeolocation
- package.json
- dependencies
- mobile-location.ts
- app/layout.tsx
- ActiveTripMap.tsx
- sidebar.tsx
- CompanyRegistration.tsx
- 20261026_invoice_checkout.sql
- cbe-public-search.ts
- api-client.ts
- CookieBanner.tsx
- InvoicesFeaturePage.tsx
- BackgroundGeolocationService.java
- pdf-generator.ts
- import-cbe-open-data.py
- company-registrations/route.ts
- utils.ts
- company-social.ts
- use-toast.ts
- vervoerbewijs.ts
- DriverShifts.tsx
- stripe-billing.ts
- mobile/package.json
- marketing-content.ts
- 20261018_company_lifecycle.sql
- 20261018_subscription_billing.sql
- jouww-cutover.mjs
- MarketingEditorial.tsx
- 20261019_shift_activity.sql
- DriverGuideSection.tsx
- email-templates/route.ts
- ref_node_fs
- update-customer-portal.sh
- native-addresses.ts
- 20261018_contract_billing.sql
- 20261024_stripe_billing.sql
- engine.ts
- form.tsx
- public-contact.ts
- [resource]/page.tsx
- samples.ts
- invoice-email.ts
- TripPointJournal.java
- ref_node_crypto
- framer-motion
- approval-requests/page.tsx
- company-pricing.ts
- PlatformLanding.tsx
- compilerOptions
- invoice-payment-handler.ts
- renderer.ts
- welcome-config.ts
- approval-mail-scheduler.ts
- subscription-billing.ts
- municipal-test-documents.ts
- "schema".security_operations_centre
- 20261016_native_push.sql
- password/route.ts
- trip-journal.ts
- BackgroundGeolocation
- DriverSettlementCalculator.tsx
- scripts
- command.tsx
- LegalDocument.tsx
- AdminCompanyRegistration.tsx
- Override
- 20261019_driver_shifts.sql
- devDependencies
- carousel.tsx
- apply-release.mjs
- convert-database.mjs
- account-deletion/route.ts
- RouteMap.tsx
- documents/route.ts
- activity-state.tsx
- 20261012_accounts_messages.sql
- chart.tsx
- "schema".security_fleet_locations
- "schema".company_registrations
- FaqPage.tsx
- chat/route.ts
- pagination.tsx
- sheet.tsx
- configure-stripe.mjs
- recover-db-log.mjs
- 20261013_mail_delivery.sql
- "schema".company_change_requests
- 20261026_manual_invoices.sql
- navigation-menu.tsx
- toggle-group.tsx
- verify-private-owner.cjs
- 20261028_receipt_email.sql
- 20261115_account_deletion.sql
- ReportsPage.tsx
- TripManagementPage.tsx
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
- database-readiness.mjs
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- "schema".security_issue_subscription_demo
- "schema".security_email_contract
- 20261115_chiron_onboarding.sql
- "schema".road_reports
- contract-template.ts
- admin-enrollment.mjs
- run
- 20261009_security.sql
- "schema".security_create_driver_account
- "schema".security_email_contract
- invoice_bank_snapshot
- 20261104_company_tariffs.sql
- 20261114_email_templates.sql
- 20261122_company_social_registration.sql
- ModeEnum
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- 20261023_app_experience.sql
- "schema".security_save_company_email
- scroll-area.tsx
- AirportNotices
- company-portal/drivers/route.ts
- company-portal/vehicles/route.ts
- invoices/send/route.ts
- view/route.ts
- websocket/route.ts
- ModeEnum
- backup.sh
- public.security_enroll_initial_owner
- 20261010_admin_mfa.sql
- trips_user_completion_request_idx
- "schema".security_create_trip_invoice
- "schema".security_reserve_mail
- "schema".security_shift_document_profile
- preflight.mjs
- global-error.tsx
- PortalEnum
- backup-foundation.sh
- import-private-archive.sh
- 20261121_admin_company_onboarding.sql
- Package.swift
- onboarding-copy.ts

## God Nodes (most connected - your core abstractions)
1. `createErrorResponse()` - 303 edges
2. `createSuccessResponse()` - 298 edges
3. `generateAdminUserToken()` - 281 edges
4. `cn()` - 230 edges
5. `CrudOperations` - 212 edges
6. `validateRequestBody()` - 189 edges
7. `Button` - 172 edges
8. `createPostgrestClient()` - 158 edges
9. `requestMiddleware()` - 135 edges
10. `useLanguage()` - 122 edges

## Surprising Connections (you probably didn't know these)
- `locate()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `close()` --references--> `Alert`  [EXTRACTED]
  driver-app/src/experience/CompanyRegistration.tsx → src/components/ui/alert.tsx
- `publish()` --indirect_call--> `draft()`  [INFERRED]
  src/components/app-experience/AppExperiencePanel.tsx → driver-app/src/experience/CompanyRegistration.tsx
- `DriverMapView()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
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

## Communities (213 total, 67 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (122): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+114 more)

### Community 1 - "session.tsx"
Cohesion: 0.05
Nodes (77): App(), login(), logout(), styles, ActionGate, createActionGate(), apiConnectionKey(), DriverProfile (+69 more)

### Community 2 - "Input"
Cohesion: 0.06
Nodes (71): AdSlot, AdSlotsPage(), EMPTY_FORM, AppExperiencePage(), metadata, Company, EditCompanyPage(), CompanyPricingPage() (+63 more)

### Community 3 - "usePreferences"
Cohesion: 0.10
Nodes (67): Account(), AccountDeletion(), secureOptions, ActiveTrip(), invoice(), ActiveTripMap(), useActivityFilters(), ActivityFilters() (+59 more)

### Community 4 - "createPostgrestClient"
Cohesion: 0.05
Nodes (67): welcomePayload(), resend, dynamic, GET(), headers, command, GET, POST (+59 more)

### Community 5 - "useAuth"
Cohesion: 0.07
Nodes (78): Company, CompanyContractsPage(), Contract, Signature, PlatformContract, PlatformContractsPage(), Company, Distributor (+70 more)

### Community 6 - "preferences.tsx"
Cohesion: 0.04
Nodes (78): eslint, react, react-dom, @types/react, typescript, zod, main, name (+70 more)

### Community 7 - "useLanguage"
Cohesion: 0.07
Nodes (59): Page(), Page(), CompanyDashboardPage(), ContractReview, SignContractPage(), CompanyDashboard(), PortalData, DriversTab() (+51 more)

### Community 8 - "Button"
Cohesion: 0.05
Nodes (71): class-variance-authority, @hookform/resolvers, react-hook-form, ContractPrintPage(), PrintableContract, InvoicePayment(), action(), words (+63 more)

### Community 9 - "ref_react"
Cohesion: 0.04
Nodes (59): lucide-react, AdminLayout(), DashboardPage(), DriverLoginPage(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission() (+51 more)

### Community 10 - "api.ts"
Cohesion: 0.05
Nodes (59): AccountDeletionStatus, AccountInfo, ActivityPage, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), downloadPdf() (+51 more)

### Community 11 - "api-utils.ts"
Cohesion: 0.05
Nodes (55): POST, GET, POST, GET, GET, POST, GET, normalizeUrlPreview() (+47 more)

### Community 12 - "dependencies"
Cohesion: 0.03
Nodes (66): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+58 more)

### Community 13 - "Card"
Cohesion: 0.08
Nodes (47): sonner, AccountDeletionsPage(), formatDate(), Request, AdminAccountPage(), ChironSyncPage(), FailedTrip, ChironSettingsPage() (+39 more)

### Community 14 - "next"
Cohesion: 0.07
Nodes (51): nextConfig, leaflet, next, ReceiptPage(), ReceiptWorkspace(), BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl() (+43 more)

### Community 15 - "cn"
Cohesion: 0.06
Nodes (55): @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-menubar, vaul, AlertTitle, Avatar, AvatarFallback, AvatarImage (+47 more)

### Community 16 - "ref_zod"
Cohesion: 0.07
Nodes (45): available(), GET, POST, schema, POST, schema, registerSchema, command (+37 more)

### Community 17 - "authCrudOperations"
Cohesion: 0.11
Nodes (46): bcryptjs, callback(), GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField() (+38 more)

### Community 18 - "end/route.ts"
Cohesion: 0.10
Nodes (31): connection, GET, POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST, POST (+23 more)

### Community 19 - "company-changes.ts"
Cohesion: 0.09
Nodes (33): GET, resolveDistributorInfo(), resolveEffectiveUserType(), driverInput, POST, registration, POST, POST (+25 more)

### Community 20 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 21 - "package.json"
Cohesion: 0.05
Nodes (41): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+33 more)

### Community 22 - "dependencies"
Cohesion: 0.04
Nodes (43): dependencies, expo, expo-application, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking (+35 more)

### Community 23 - "mobile-location.ts"
Cohesion: 0.08
Nodes (32): copy, DriverFleetShift(), GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation() (+24 more)

### Community 24 - "app/layout.tsx"
Cohesion: 0.07
Nodes (35): next-themes, DriverLayout(), dynamic, metadata, RootLayout(), viewport, apiFetch(), buildApiUrl() (+27 more)

### Community 25 - "ActiveTripMap.tsx"
Cohesion: 0.11
Nodes (33): DriverMap(), DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), showWholeRoute(), RouteStatus (+25 more)

### Community 26 - "sidebar.tsx"
Cohesion: 0.07
Nodes (31): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup, SidebarGroupAction (+23 more)

### Community 27 - "CompanyRegistration.tsx"
Cohesion: 0.09
Nodes (28): CompanyRegistrationReceipt, CompanyRegistrationScreen(), advance(), change(), close(), draft(), field(), sendCode() (+20 more)

### Community 28 - "20261026_invoice_checkout.sql"
Cohesion: 0.08
Nodes (22): invoice_activation_begin, invoice_activation_paid, invoice_checkout_active, invoice_company_begin, invoice_payment_guard, invoice_receipt_immutable, invoice_service_guard, "schema".invoice_checkout_receipts (+14 more)

### Community 29 - "cbe-public-search.ts"
Cohesion: 0.12
Nodes (31): saxes, errors, POST, query, headers, input, POST, unavailable() (+23 more)

### Community 30 - "api-client.ts"
Cohesion: 0.09
Nodes (23): DeletionStatusPage(), kinds, AccountDeletion(), submit(), copy, Status, directoryCopy, CompanyOption (+15 more)

### Community 31 - "CookieBanner.tsx"
Cohesion: 0.10
Nodes (29): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+21 more)

### Community 32 - "InvoicesFeaturePage.tsx"
Cohesion: 0.10
Nodes (25): Page(), Page(), Page(), Page(), FeatureDetailCard(), FeatureDetailCardProps, FeaturePageLayout(), FeaturePageLayoutProps (+17 more)

### Community 33 - "BackgroundGeolocationService.java"
Cohesion: 0.09
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 34 - "pdf-generator.ts"
Cohesion: 0.09
Nodes (16): jspdf, configurePdfFonts(), accountExportPdf(), exportCopy, ExportLocale, Row, ChironTestMessage, structuredPaymentReference() (+8 more)

### Community 35 - "import-cbe-open-data.py"
Cohesion: 0.14
Nodes (10): build(), check(), fingerprint(), git(), selected_paths(), address(), build_database(), main() (+2 more)

### Community 36 - "company-registrations/route.ts"
Cohesion: 0.17
Nodes (24): unverifiedBestuurderspas, PUT, review, DELETE, document(), failed(), GET, positiveId() (+16 more)

### Community 37 - "utils.ts"
Cohesion: 0.07
Nodes (21): clsx, @radix-ui/react-accordion, @radix-ui/react-hover-card, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-slider, react-day-picker, react-resizable-panels (+13 more)

### Community 38 - "company-social.ts"
Cohesion: 0.11
Nodes (24): jose, apply, headers, url, GET(), dynamic, LoginPage(), metadata (+16 more)

### Community 39 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 40 - "vervoerbewijs.ts"
Cohesion: 0.13
Nodes (23): dynamic, GET(), headers, runtime, chironColor(), chironLabel(), fmtDateTime(), fmtGps() (+15 more)

### Community 41 - "DriverShifts.tsx"
Cohesion: 0.15
Nodes (21): ShiftPage(), DocumentQr(), DriverShifts(), downloadPdf(), statuses, shiftCopy, DriverShift, km (+13 more)

### Community 42 - "stripe-billing.ts"
Cohesion: 0.17
Nodes (24): runtime, runtime, processInvoiceCheckout(), bind(), Client, completeSetup(), assertStripeInvoice(), finiteSchedule() (+16 more)

### Community 43 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 44 - "marketing-content.ts"
Cohesion: 0.12
Nodes (16): metadata, generateMetadata(), LocalizedHome(), Props, HomePage(), metadata, homeAlternates, homepageMetadata() (+8 more)

### Community 45 - "20261018_company_lifecycle.sql"
Cohesion: 0.13
Nodes (14): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+6 more)

### Community 46 - "20261018_subscription_billing.sql"
Cohesion: 0.18
Nodes (20): "schema".security_claim_subscription_mail(), "schema".security_issue_subscription_document(), "schema".security_prepare_subscription_credit(), "schema".security_save_subscription_settings(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation() (+12 more)

### Community 47 - "jouww-cutover.mjs"
Cohesion: 0.20
Nodes (23): agreement(), app(), command(), compose(), docker(), edge(), https(), json() (+15 more)

### Community 48 - "MarketingEditorial.tsx"
Cohesion: 0.20
Nodes (20): dynamicParams, generateMetadata(), Props, SolutionsPage(), dynamicParams, generateMetadata(), Props, SolutionPage() (+12 more)

### Community 49 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (12): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+4 more)

### Community 50 - "DriverGuideSection.tsx"
Cohesion: 0.12
Nodes (19): dompurify, dompurify, DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep (+11 more)

### Community 51 - "email-templates/route.ts"
Cohesion: 0.17
Nodes (21): forbidden(), GET, invalid(), POST, PUT, serviceClient(), isEditableTemplate(), templateIds (+13 more)

### Community 52 - "ref_node_fs"
Cohesion: 0.12
Nodes (10): compose(), directory, env, [image, revision, target], lock, root, run(), mobileConfig() (+2 more)

### Community 53 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 54 - "native-addresses.ts"
Cohesion: 0.16
Nodes (18): search(), locate(), useRoadReports(), submit(), buildBelgianSearchUrl(), categories, coordinate(), createAddressSearch() (+10 more)

### Community 55 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 56 - "20261024_stripe_billing.sql"
Cohesion: 0.15
Nodes (14): "schema".security_stripe_allocate(), "schema".security_stripe_authorize(), "schema".security_stripe_begin(), "schema".security_stripe_lifecycle_guard(), "schema".security_stripe_receipt_preserved(), "schema".stripe_billing_events, "schema".stripe_enrollments, "schema".stripe_payment_receipts (+6 more)

### Community 57 - "engine.ts"
Cohesion: 0.20
Nodes (18): qrcode, gsap, three, mountCinema(), render(), resize(), optimize(), Pose (+10 more)

### Community 58 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 59 - "public-contact.ts"
Cohesion: 0.16
Nodes (15): metadata, Page(), metadata, Page(), ContactPanel(), Locale, PublicInfo(), translations (+7 more)

### Community 60 - "[resource]/page.tsx"
Cohesion: 0.16
Nodes (16): generateMetadata(), getPage(), isResource(), MarketingResource(), Props, DriverSettlementCalculator(), download(), marketingCopy (+8 more)

### Community 61 - "samples.ts"
Cohesion: 0.17
Nodes (16): contractInvitation(), copy, verificationDesign(), VerificationPurpose, contractDesign(), ContractEmailData, copy, SignatureEvidence (+8 more)

### Community 62 - "invoice-email.ts"
Cohesion: 0.21
Nodes (15): copy, invoiceDesign(), InvoiceEmailData, InvoiceMailPurpose, BankInstructions, bankPaymentPayload(), invoiceBankPayload(), InvoicePaymentState (+7 more)

### Community 64 - "ref_node_crypto"
Cohesion: 0.15
Nodes (13): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+5 more)

### Community 65 - "framer-motion"
Cohesion: 0.13
Nodes (10): framer-motion, AnimatedLogo(), AnimatedLogoProps, FeatureCardProps, LandingNav(), LandingNavProps, LANG_OPTIONS, LanguageSwitcher() (+2 more)

### Community 66 - "approval-requests/page.tsx"
Cohesion: 0.16
Nodes (16): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), CompanyRegistrationApprovals(), CompanyServiceActions() (+8 more)

### Community 67 - "company-pricing.ts"
Cohesion: 0.18
Nodes (17): Company, activeCompanyTariffs(), CompanyPricing, companyPricingPatch(), CompanyTariff, companyTariffs(), defaults, driverPricing() (+9 more)

### Community 68 - "PlatformLanding.tsx"
Cohesion: 0.19
Nodes (14): Cinema(), cinematicCopy, CinematicText, MarketingExplore(), downloadCopy, PlatformLanding(), openRegistration(), SocialRegistration (+6 more)

### Community 69 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 70 - "invoice-payment-handler.ts"
Cohesion: 0.20
Nodes (15): stripe, Checkout, Client, invoiceCheckout(), invoiceRpc(), InvoiceSource, command, invoicePaymentPOST (+7 more)

### Community 71 - "renderer.ts"
Cohesion: 0.15
Nodes (17): Draft, editableTemplateIds, emailBrand, EmailDesignId, EmailEdits, emailLanguages, emailMessageHtml(), escapeEmail() (+9 more)

### Community 73 - "welcome-config.ts"
Cohesion: 0.22
Nodes (15): DEFAULT_WELCOME, localized(), MAX_WELCOME_IMAGE_BYTES, MAX_WELCOME_JSON_BYTES, parseWelcome(), record(), sameWelcomeContent(), validWelcomePoster() (+7 more)

### Community 74 - "approval-mail-scheduler.ts"
Cohesion: 0.18
Nodes (14): POST(), result(), sites, register(), accountDeletionPage, ApprovalTab, sendPendingApprovalAlerts(), startApprovalMailScheduler() (+6 more)

### Community 75 - "subscription-billing.ts"
Cohesion: 0.18
Nodes (13): closeInvoiceCheckout(), sendInvoiceEmail(), command, manualInvoicesGET, manualInvoicesPOST, positive, billingGET, billingPOST (+5 more)

### Community 76 - "municipal-test-documents.ts"
Cohesion: 0.24
Nodes (15): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+7 more)

### Community 77 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 78 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 79 - "password/route.ts"
Cohesion: 0.24
Nodes (11): POST, PUT, GET, GET, POST, credentials, saveCompanyAccount(), accessibleMessage() (+3 more)

### Community 80 - "trip-journal.ts"
Cohesion: 0.23
Nodes (14): browserJournals, createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save() (+6 more)

### Community 82 - "DriverSettlementCalculator.tsx"
Cohesion: 0.21
Nodes (10): fields, summary, MarketingLocale, calculatorText(), calculateSettlement(), cents(), emptySettlement(), downloadSettlement() (+2 more)

### Community 83 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:convert, db:import-staging, dev, dev:debug, lint, preflight (+8 more)

### Community 84 - "command.tsx"
Cohesion: 0.17
Nodes (14): cmdk, @radix-ui/react-dialog, @radix-ui/react-popover, CompanyPicker(), Command, CommandDialog(), CommandEmpty, CommandGroup (+6 more)

### Community 85 - "LegalDocument.tsx"
Cohesion: 0.26
Nodes (11): Page(), Props, metadata, PrivacyPolicyPage(), LegalDocument(), LegalLocale, legalLocales, legalSections (+3 more)

### Community 86 - "AdminCompanyRegistration.tsx"
Cohesion: 0.14
Nodes (13): AdminCompanyRegistration(), changeOpen(), clearLookup(), submit(), CbeCompany, cbeStatus, companyFields, driverFields (+5 more)

### Community 87 - "Override"
Cohesion: 0.19
Nodes (3): OnSuccessListener<Location>, ServiceConnection, ServiceReceiver

### Community 88 - "20261019_driver_shifts.sql"
Cohesion: 0.25
Nodes (11): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_driver_shifts() (+3 more)

### Community 89 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+7 more)

### Community 90 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 91 - "apply-release.mjs"
Cohesion: 0.21
Nodes (10): files, names, values, main(), identifier(), writePrivate(), auditSql(), constraints() (+2 more)

### Community 92 - "convert-database.mjs"
Cohesion: 0.27
Nodes (12): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), parseSchema() (+4 more)

### Community 93 - "account-deletion/route.ts"
Cohesion: 0.24
Nodes (11): GET, POST, schema, POST, schema, POST, VALID_TYPES, deletionReceipt (+3 more)

### Community 94 - "RouteMap.tsx"
Cohesion: 0.22
Nodes (12): RouteCoords, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), DrivingRoute, fetchDrivingRoute() (+4 more)

### Community 95 - "documents/route.ts"
Cohesion: 0.26
Nodes (8): qrcode, GET, handler, POST, drawPdfQr(), renderTariffSheet(), TariffSheet, tariffSheetUrl()

### Community 96 - "activity-state.tsx"
Cohesion: 0.26
Nodes (9): Period, periodDates(), validDay(), validRange(), ActivityProvider(), Context, useStateValue(), apply() (+1 more)

### Community 97 - "20261012_accounts_messages.sql"
Cohesion: 0.24
Nodes (4): "schema".security_change_account(), "schema".security_driver_messages(), "schema".security_save_company_account(), "schema".security_write_message()

### Community 98 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 99 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 100 - ""schema".company_registrations"
Cohesion: 0.27
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 101 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 102 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 103 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 104 - "sheet.tsx"
Cohesion: 0.24
Nodes (9): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants (+1 more)

### Community 105 - "configure-stripe.mjs"
Cohesion: 0.31
Nodes (7): checkedStripeSetup(), enabledStripeEvents, encoded(), main(), stripeApiVersion, stripeRuntimeFiles(), stripeRuntimeKeys

### Community 106 - "recover-db-log.mjs"
Cohesion: 0.39
Nodes (7): assertOnlyLoggingChanged(), compose, digest(), docker(), planLogRecovery(), recoverDatabaseLog(), run()

### Community 107 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 108 - ""schema".company_change_requests"
Cohesion: 0.28
Nodes (3): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change()

### Community 109 - "20261026_manual_invoices.sql"
Cohesion: 0.36
Nodes (5): manual_invoice_immutable, manual_payment_immutable, "schema".manual_invoice_payments, "schema".manual_invoices, "schema".security_manual_invoice()

### Community 110 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 111 - "toggle-group.tsx"
Cohesion: 0.31
Nodes (7): @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 112 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 113 - "20261028_receipt_email.sql"
Cohesion: 0.29
Nodes (3): "schema".receipt_email_settings, "schema".receipt_mail_requests, "schema".security_reserve_mail()

### Community 114 - "20261115_account_deletion.sql"
Cohesion: 0.36
Nodes (5): clear_account_deletion_notice, "schema".account_deletion_requests, "schema".security_clear_account_deletion_notice(), "schema".security_complete_account_deletion(), "schema".security_request_account_deletion()

### Community 115 - "ReportsPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, ReportsPage()

### Community 116 - "TripManagementPage.tsx"
Cohesion: 0.32
Nodes (6): Page(), contentFr, contentNl, icons, PublicStats, TripManagementPage()

### Community 117 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 118 - "driverShiftPdf"
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

### Community 127 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 128 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 129 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 130 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 134 - ""schema".road_reports"
Cohesion: 0.60
Nodes (4): road_reports_expiry_idx, road_reports_reporter_idx, "schema".road_report_votes, "schema".road_reports

### Community 135 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 136 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 137 - "run"
Cohesion: 0.40
Nodes (5): check(), open(), run(), submit(), ownerKey()

### Community 142 - "20261104_company_tariffs.sql"
Cohesion: 0.70
Nodes (4): company_tariff_documents_history_idx, issued_tariff_document_immutable, "schema".company_tariff_documents, "schema".reject_tariff_document_mutation()

### Community 143 - "20261114_email_templates.sql"
Cohesion: 0.50
Nodes (3): "schema".email_template_audit, "schema".email_template_settings, "schema".security_reserve_mail()

### Community 145 - "ModeEnum"
Cohesion: 0.40
Nodes (5): ModeEnum, DRIVER_REGISTER, LOGIN, REGISTER, RESET

### Community 146 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 147 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 148 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 151 - "scroll-area.tsx"
Cohesion: 0.67
Nodes (3): @radix-ui/react-scroll-area, ScrollArea, ScrollBar

### Community 152 - "AirportNotices"
Cohesion: 0.83
Nodes (4): AirportNotices(), publish(), refresh(), update()

### Community 153 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 154 - "company-portal/vehicles/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 155 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 156 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 157 - "websocket/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 158 - "ModeEnum"
Cohesion: 0.50
Nodes (4): ModeEnum, LOGIN, REGISTER, RESET

### Community 168 - "PortalEnum"
Cohesion: 0.67
Nodes (3): PortalEnum, ADMIN, COMPANY

## Knowledge Gaps
- **867 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+862 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1253 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **67 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _867 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.0711954304365565 - nodes in this community are weakly interconnected._
- **Should `session.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.046476761619190406 - nodes in this community are weakly interconnected._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.06274131274131274 - nodes in this community are weakly interconnected._
- **Should `usePreferences` be split into smaller, more focused modules?**
  _Cohesion score 0.09847259658580414 - nodes in this community are weakly interconnected._
- **Should `createPostgrestClient` be split into smaller, more focused modules?**
  _Cohesion score 0.05386138613861386 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.06891089108910892 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 193 unresolved internal-endpoint edges and 23 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 299 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
