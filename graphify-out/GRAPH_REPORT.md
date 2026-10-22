# Graph Report - JOUW DRIVER  (2026-10-22)

## Corpus Check
- 541 files · ~236,632 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3076 nodes · 10437 edges · 153 communities (109 shown, 44 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6cd985d6`
- Source hashes are authoritative: run `python3 scripts/code-map.py --check`.
- Rebuild using the pinned environment: `python scripts/code-map.py` (local AST only).

## Community Hubs (Navigation)
- createErrorResponse
- Input
- lucide-react
- Button
- ref_react
- requestMiddleware
- DriverRegisterForm.tsx
- usePreferences
- api-utils.ts
- dependencies
- useTripController.ts
- lib/auth.ts
- api.ts
- cn
- server-utils.ts
- preferences.tsx
- session.tsx
- BackgroundGeolocation
- end/route.ts
- dependencies
- sidebar.tsx
- package.json
- validateRequestBody
- CookieBanner.tsx
- driver-app/package.json
- driver/taximeter/page.tsx
- DriverDashboard.tsx
- company-changes.ts
- BackgroundGeolocationService.java
- company-registrations/route.ts
- utils.ts
- scripts
- use-toast.ts
- mobile/package.json
- DriverShifts.tsx
- 20261018_subscription_billing.sql
- Trips.tsx
- DriverMap.tsx
- PlatformLanding.tsx
- SiteAIAgent.tsx
- 20261018_company_lifecycle.sql
- 20261019_shift_activity.sql
- app/layout.tsx
- 20261018_contract_billing.sql
- update-customer-portal.sh
- form.tsx
- TripPointJournal.java
- mobile-location.ts
- compilerOptions
- BackgroundGeolocation
- "schema".security_operations_centre
- 20261016_native_push.sql
- command.tsx
- generateAcceptanceReportPdf
- code-map.py
- trip-store.ts
- convert-database.mjs
- RouteMap.tsx
- createTripJournal
- 20261019_driver_shifts.sql
- carousel.tsx
- DirectoryToolbar.tsx
- vervoerbewijs.ts
- ref_node_fs
- driverShiftPdf
- pdf-generator.ts
- push-worker.mjs
- DashboardClient.tsx
- "schema".company_registrations
- chart.tsx
- company-portal/vehicles/route.ts
- DriverFleetShift.tsx
- "schema".security_fleet_locations
- HomepageAdSlotSection.tsx
- useGeolocation.ts
- subscription-scheduler.ts
- PDFGenerator
- "schema".security_save_company_account
- "schema".company_change_requests
- class-variance-authority
- FaqPage.tsx
- chat/route.ts
- DriverGuideSection.tsx
- pagination.tsx
- 20261013_mail_delivery.sql
- navigation-menu.tsx
- drawer.tsx
- audit-independent.mjs
- apiRequest
- Override
- configure-mail.mjs
- rollout.mjs
- verify-private-owner.cjs
- [...path]/route.ts
- android.content.Intent
- configure-native-push.mjs
- driver-app/tsconfig.json
- 20261019_email_identity.sql
- definitions.d.ts
- database-readiness.mjs
- useAddressSearch.ts
- company-registration.ts
- activate-chiron-production.sh
- publish-customer-runtime.sh
- update-customer-ui.sh
- apply-release.mjs
- contract-template.ts
- admin-enrollment.mjs
- 20261009_security.sql
- 20261018_web_billing.sql
- container-scroll-animation.tsx
- driver-activity.ts
- prepare-customer-runtime.sh
- "schema".security_create_driver_account
- "schema".company_staff_events
- scroll-area.tsx
- company-portal/drivers/route.ts
- invoices/send/route.ts
- view/route.ts
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
- `locate()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `search()` --indirect_call--> `value()`  [INFERRED]
  driver-app/src/experience/AddressField.tsx → scripts/convert-database.mjs
- `DriverMapView()` --references--> `Location`  [EXTRACTED]
  driver-app/src/DriverMap.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `FleetLocation()` --references--> `Location`  [EXTRACTED]
  driver-app/src/FleetLocation.tsx → mobile/plugins/background-geolocation/definitions.d.ts
- `ActiveTrip()` --references--> `Alert`  [EXTRACTED]
  driver-app/src/experience/ActiveTrip.tsx → src/components/ui/alert.tsx

## Import Cycles
- 2-file cycle: `src/lib/api-utils.ts -> src/lib/create-response.ts -> src/lib/api-utils.ts`
- 2-file cycle: `driver-app/src/experience/session.tsx -> driver-app/src/experience/shift-state.tsx -> driver-app/src/experience/session.tsx`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/api-utils.ts`
- 3-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/rate-limit.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/mail-service.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`
- 4-file cycle: `src/lib/api-utils.ts -> src/lib/security-guard.ts -> src/lib/auth.ts -> src/lib/crud-operations.ts -> src/lib/api-utils.ts`

## Communities (153 total, 44 thin omitted)

### Community 0 - "createErrorResponse"
Cohesion: 0.07
Nodes (112): GET, executeApprovedRequest(), GET, getTableName(), POST, PUT, DELETE, POST (+104 more)

### Community 1 - "Input"
Cohesion: 0.08
Nodes (102): AdSlot, AdSlotsPage(), EMPTY_FORM, CompanyContractsPage(), EditCompanyPage(), PlatformContract, PlatformContractsPage(), CompanyPricingPage() (+94 more)

### Community 2 - "lucide-react"
Cohesion: 0.03
Nodes (91): framer-motion, lucide-react, DriverLayout(), DriverNotificationsPage(), glassCard, Notification, requestNotificationPermission(), showBrowserNotification() (+83 more)

### Community 3 - "Button"
Cohesion: 0.06
Nodes (62): ApprovalRequest, ApprovalRequestsPage(), DriverRegistrationRequest, DriverRequestCard(), EmptyState(), GeneralRequestCard(), ChironSettingsPage(), Company (+54 more)

### Community 4 - "ref_react"
Cohesion: 0.06
Nodes (59): nextConfig, next, sonner, ChironSyncPage(), FailedTrip, Company, Contract, Signature (+51 more)

### Community 5 - "requestMiddleware"
Cohesion: 0.07
Nodes (51): zod, command, POST, filters, GET, GET, POST, GET (+43 more)

### Community 6 - "DriverRegisterForm.tsx"
Cohesion: 0.05
Nodes (70): @hookform/resolvers, react-hook-form, dynamic, LoginPage(), CompanyLoginForm(), DriverRegisterForm(), DriverRegisterFormProps, FormField() (+62 more)

### Community 7 - "usePreferences"
Cohesion: 0.15
Nodes (44): Account(), ActiveTrip(), AddressField(), BillingReminder(), dismissed, Home(), useInbox(), Messages() (+36 more)

### Community 8 - "api-utils.ts"
Cohesion: 0.06
Nodes (50): GET, POST, VALID_TYPES, GET, POST, GET, normalizeUrlPreview(), AuthContextType (+42 more)

### Community 9 - "dependencies"
Cohesion: 0.03
Nodes (62): dependencies, autoprefixer, bcryptjs, @capacitor/core, class-variance-authority, clsx, cmdk, date-fns (+54 more)

### Community 10 - "useTripController.ts"
Cohesion: 0.09
Nodes (43): ActionGate, DriverProfile, DriverVehicle, Context, enableBackgroundMeter(), stopBackgroundMeter(), completedBatchReceipt(), nativeJournal() (+35 more)

### Community 11 - "lib/auth.ts"
Cohesion: 0.10
Nodes (48): GET, PUT, driverLoginSchema, findCredentialByPhoneSafely(), findDriverByPhone(), findFirstByField(), getDriverEmailCandidates(), normalizePhone() (+40 more)

### Community 12 - "api.ts"
Cohesion: 0.07
Nodes (43): AccountInfo, ActivityQuery, ActivityTrip, ApiError, createDriverApi(), loadProfile(), ownerRead(), profile() (+35 more)

### Community 13 - "cn"
Cohesion: 0.06
Nodes (51): @radix-ui/react-accordion, @radix-ui/react-avatar, @radix-ui/react-context-menu, @radix-ui/react-dropdown-menu, AccordionContent, AccordionItem, AccordionTrigger, Avatar (+43 more)

### Community 14 - "server-utils.ts"
Cohesion: 0.08
Nodes (38): resend, available(), GET, POST, schema, POST, schema, POST (+30 more)

### Community 15 - "preferences.tsx"
Cohesion: 0.07
Nodes (38): DriverMessage, DriverNotification, Layout(), Navigation(), RoadArt(), companyCopy, copy, CopyKey (+30 more)

### Community 16 - "session.tsx"
Cohesion: 0.09
Nodes (33): App(), logout(), styles, createActionGate(), apiConnectionKey(), APP_ORIGIN, companyRegistrationUrl(), LEGACY_APP_ORIGIN (+25 more)

### Community 17 - "BackgroundGeolocation"
Cohesion: 0.07
Nodes (10): Capacitor, CoreLocation, CryptoKit, Foundation, BackgroundGeolocation, formatLocation(), Watcher, TripPointJournal (+2 more)

### Community 18 - "end/route.ts"
Cohesion: 0.12
Nodes (23): POST, generateTripHash(), generateTripUuid(), getRetentionDate(), POST, canonicalChironEnvironment(), chironDestination(), ChironError (+15 more)

### Community 19 - "dependencies"
Cohesion: 0.05
Nodes (41): dependencies, expo, expo-constants, expo-crypto, expo-file-system, expo-haptics, expo-linking, expo-location (+33 more)

### Community 20 - "sidebar.tsx"
Cohesion: 0.06
Nodes (32): @radix-ui/react-separator, @radix-ui/react-tooltip, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+24 more)

### Community 21 - "package.json"
Cohesion: 0.05
Nodes (37): engines, node, @capacitor/core, eslint, react, react-dom, @types/react, typescript (+29 more)

### Community 22 - "validateRequestBody"
Cohesion: 0.11
Nodes (22): bcryptjs, POST, PUT, sendInvoiceToClient(), registrationSchema, POST, GET, POST (+14 more)

### Community 23 - "CookieBanner.tsx"
Cohesion: 0.10
Nodes (29): DriverProfileRoute(), PrivacyCenter(), DriverData, DriverProfilePage(), GlassCard(), InfoRow(), SectionHeader(), StatusBadge() (+21 more)

### Community 24 - "driver-app/package.json"
Cohesion: 0.06
Nodes (33): eslint, react, react-dom, @types/react, typescript, main, name, overrides (+25 more)

### Community 25 - "driver/taximeter/page.tsx"
Cohesion: 0.10
Nodes (28): leaflet, BottomSheetModal(), buildGoogleMapsUrl(), buildWazeUrl(), calculateActualDistance(), calculateDistance(), GlassCard(), GoldButton() (+20 more)

### Community 26 - "DriverDashboard.tsx"
Cohesion: 0.14
Nodes (26): AdminAccountPage(), CompanySettingsPage(), AdminFleetPage(), AcceptanceTestPage(), Company, Driver, Vehicle, AccountSettings() (+18 more)

### Community 27 - "company-changes.ts"
Cohesion: 0.15
Nodes (23): GET, resolveDistributorInfo(), resolveEffectiveUserType(), POST, POST, PUT, getAuthRoles(), credentials (+15 more)

### Community 28 - "BackgroundGeolocationService.java"
Cohesion: 0.10
Nodes (4): BackgroundGeolocationService, LocalBinder, LocationCallback, Watcher

### Community 29 - "company-registrations/route.ts"
Cohesion: 0.15
Nodes (22): PUT, review, DELETE, document(), failed(), GET, positiveId(), POST (+14 more)

### Community 30 - "utils.ts"
Cohesion: 0.07
Nodes (21): clsx, @radix-ui/react-checkbox, @radix-ui/react-hover-card, @radix-ui/react-popover, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-slider, react-day-picker (+13 more)

### Community 31 - "scripts"
Cohesion: 0.07
Nodes (29): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, fake-indexeddb, tailwindcss, @tailwindcss/postcss (+21 more)

### Community 32 - "use-toast.ts"
Cohesion: 0.12
Nodes (25): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+17 more)

### Community 33 - "mobile/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @capacitor/android, @capacitor-community/background-geolocation, @capacitor/core, @capacitor/ios, @capacitor/local-notifications, devDependencies, @capacitor/cli (+18 more)

### Community 34 - "DriverShifts.tsx"
Cohesion: 0.15
Nodes (19): ShiftPage(), DriverShifts(), downloadPdf(), statuses, shiftCopy, ApiError, DriverShift, km (+11 more)

### Community 35 - "20261018_subscription_billing.sql"
Cohesion: 0.16
Nodes (17): "schema".security_issue_subscription_document(), "schema".security_subscription_document_balance(), "schema".security_subscription_immutable(), "schema".security_subscription_tick(), "schema".security_void_subscription_preparation(), "schema".subscription_billing_events, "schema".subscription_billing_profiles, "schema".subscription_billing_settings (+9 more)

### Community 36 - "Trips.tsx"
Cohesion: 0.17
Nodes (16): Period, periodDates(), validDay(), validRange(), ActivityPage, RevenueSummary, ActivityProvider(), Context (+8 more)

### Community 37 - "DriverMap.tsx"
Cohesion: 0.16
Nodes (21): DriverMap(), DriverMapProps, DriverMapView(), calculateRoute(), locate(), navigate(), token, search() (+13 more)

### Community 38 - "PlatformLanding.tsx"
Cohesion: 0.13
Nodes (12): metadata, RegistrationPage(), onboardingMarketingCopy, ButtonStart(), PlatformLanding(), openRegistration(), Route(), translations (+4 more)

### Community 39 - "SiteAIAgent.tsx"
Cohesion: 0.14
Nodes (24): apiFetch(), ApiResponse, buildApiUrl(), ChatMessage, ConversationStep, detectChangeIntent(), detectSearchIntent(), formatEntityInfo() (+16 more)

### Community 40 - "20261018_company_lifecycle.sql"
Cohesion: 0.12
Nodes (12): companies_archive_name, company_lifecycle_events_company, drivers_company_archive, jd_company_driver_guard, jd_company_preserve_history, jd_company_trip_start_guard, jd_company_vehicle_guard, "schema".company_lifecycle_events (+4 more)

### Community 41 - "20261019_shift_activity.sql"
Cohesion: 0.12
Nodes (13): guard_shift_work, immutable_shift_activity, link_trip_shift, "schema".driver_shift_activity, "schema".security_driver_shifts(), "schema".security_guard_shift_work(), "schema".security_record_trip_shift(), "schema".security_shift_declaration_activity() (+5 more)

### Community 42 - "app/layout.tsx"
Cohesion: 0.12
Nodes (19): next-themes, dynamic, metadata, RootLayout(), viewport, attemptSilentRefresh(), AuthProvider(), GlobalClientEffects() (+11 more)

### Community 43 - "20261018_contract_billing.sql"
Cohesion: 0.12
Nodes (12): contract_registration_request, contract_signature_request, "schema".security_activate_contract_billing(), "schema".security_contract_credit_snapshot(), "schema".security_guard_contract_profile(), "schema".security_preserve_signed_contract(), "schema".security_review_company_subscription(), "schema".security_sign_company_contract() (+4 more)

### Community 44 - "update-customer-portal.sh"
Cohesion: 0.09
Nodes (21): BILLING_MAIL_MIGRATION, BILLING_MIGRATION, COMPANY_STAFF_MIGRATION, CONTRACT_BILLING_MIGRATION, CUSTOMER_IMAGE, CUSTOMER_REVISION, EMAIL_IDENTITY_MIGRATION, FLEET_MIGRATION (+13 more)

### Community 45 - "form.tsx"
Cohesion: 0.11
Nodes (19): @radix-ui/react-label, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+11 more)

### Community 48 - "mobile-location.ts"
Cohesion: 0.15
Nodes (14): clearNativeTripPoints(), createNativeLocationWatch(), createNativeTripReplay(), isNativeMobile(), LocationError, NativeLocation, NativeLocationPlugin, nativePlugin (+6 more)

### Community 49 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 51 - ""schema".security_operations_centre"
Cohesion: 0.16
Nodes (5): invoice_test_classification, "schema".security_driver_billing_notice(), "schema".security_invoice_test_classification(), "schema".security_live_statistics(), "schema".security_operations_centre()

### Community 52 - "20261016_native_push.sql"
Cohesion: 0.19
Nodes (9): native_message_push, native_notification_push, native_push_pending, "schema".native_push_devices, "schema".native_push_jobs, "schema".security_claim_native_push(), "schema".security_enqueue_native_push(), "schema".security_push_device() (+1 more)

### Community 53 - "command.tsx"
Cohesion: 0.14
Nodes (15): cmdk, @radix-ui/react-dialog, Command, CommandDialog(), CommandGroup, CommandSeparator, CommandShortcut(), SheetContent (+7 more)

### Community 54 - "generateAcceptanceReportPdf"
Cohesion: 0.26
Nodes (14): generateAcceptanceReportPdf(), ensure(), event(), header(), heading(), line(), page(), AcceptanceReportData (+6 more)

### Community 55 - "code-map.py"
Cohesion: 0.24
Nodes (5): build(), check(), fingerprint(), git(), selected_paths()

### Community 56 - "trip-store.ts"
Cohesion: 0.17
Nodes (8): login(), createSqlTripStore(), open(), seal(), Database, identity(), JournalCipher, Row

### Community 57 - "convert-database.mjs"
Cohesion: 0.25
Nodes (13): convertExport(), EXCLUDED, integer(), JsonNumber, literal(), main(), parseLossless(), value() (+5 more)

### Community 58 - "RouteMap.tsx"
Cohesion: 0.19
Nodes (14): RouteCoords, TripData, encodePolyline(), getLabel(), RouteMap(), RouteMapProps, staticMapUrl(), Coordinate (+6 more)

### Community 59 - "createTripJournal"
Cohesion: 0.25
Nodes (13): createTripJournal(), complete(), encryptRecord(), list(), ownerKey(), remove(), save(), sync() (+5 more)

### Community 60 - "20261019_driver_shifts.sql"
Cohesion: 0.23
Nodes (10): driver_shifts_history, driver_shifts_one_driver, driver_shifts_one_vehicle, immutable_shift_event, preserve_driver_shift, "schema".driver_shift_events, "schema".driver_shifts, "schema".security_immutable_shift_event() (+2 more)

### Community 61 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 62 - "DirectoryToolbar.tsx"
Cohesion: 0.22
Nodes (9): directoryCopy, CompanyOption, CompanyPicker(), DirectoryKind, DirectoryResult, CommandEmpty, CommandInput, CommandItem (+1 more)

### Community 63 - "vervoerbewijs.ts"
Cohesion: 0.20
Nodes (12): chironColor(), chironLabel(), fmtDateTime(), fmtGps(), fmtTime(), generateVervoerbewijs(), VervoerbewijsChiron, VervoerbewijsCompany (+4 more)

### Community 64 - "ref_node_fs"
Cohesion: 0.21
Nodes (3): mobileConfig(), [id,output], repository

### Community 65 - "driverShiftPdf"
Cohesion: 0.23
Nodes (11): jose, apply, headers, url, driverShiftPdf(), ensure(), page(), pairs() (+3 more)

### Community 66 - "pdf-generator.ts"
Cohesion: 0.19
Nodes (10): jspdf, ChironTestMessage, structuredPaymentReference(), AcceptanceTestReport, CompanyInfo, CompanyInvoiceData, DriverInfo, TestResult (+2 more)

### Community 67 - "push-worker.mjs"
Cohesion: 0.23
Nodes (10): copy, decryptPushToken(), fcmAccessToken(), fcmPayload(), sendFcm(), serviceAccount(), account, jwt() (+2 more)

### Community 68 - "DashboardClient.tsx"
Cohesion: 0.31
Nodes (8): AdminLayout(), DashboardPage(), AdminAccountTab(), AdminDashboard(), AdminMenuGrid(), DashboardClient(), managementMenu, ManagementShell()

### Community 69 - ""schema".company_registrations"
Cohesion: 0.21
Nodes (4): company_registrations_status_time, "schema".company_registrations, "schema".security_review_company_registration(), "schema".security_submit_company_registration()

### Community 70 - "chart.tsx"
Cohesion: 0.24
Nodes (11): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent (+3 more)

### Community 71 - "company-portal/vehicles/route.ts"
Cohesion: 0.17
Nodes (9): DELETE, POST, PUT, GET, POST, unavailable, decodeTotpSecret(), matchingTotpStep() (+1 more)

### Community 72 - "DriverFleetShift.tsx"
Cohesion: 0.29
Nodes (9): copy, DriverFleetShift(), registerFleetSharingStopper(), distanceMetres(), FleetLocationRow, FleetPoint, FleetWorkStatus, isPublishableFleetPoint() (+1 more)

### Community 73 - ""schema".security_fleet_locations"
Cohesion: 0.29
Nodes (5): idx_driver_fleet_locations_company, "schema".driver_fleet_locations, "schema".security_driver_fleet_location(), "schema".security_fleet_locations(), "schema".security_update_driver_fleet_location()

### Community 74 - "HomepageAdSlotSection.tsx"
Cohesion: 0.27
Nodes (8): dompurify, dompurify, FloatingCard(), FloatingCardProps, DefaultPromoBlock(), HomepageAdSlot, HomepageAdSlotSection(), sanitizeHtml()

### Community 75 - "useGeolocation.ts"
Cohesion: 0.25
Nodes (9): GeolocationPoint, messages, useGeolocation(), UseGeolocationOptions, LocationPoint, useSmartGeolocation(), isFreshAccurateLocation(), MobileLocationPoint (+1 more)

### Community 76 - "subscription-scheduler.ts"
Cohesion: 0.35
Nodes (8): register(), MailMessage, euro(), SubscriptionDocument, subscriptionPdf(), escape(), startSubscriptionScheduler(), subscriptionTick()

### Community 79 - ""schema".company_change_requests"
Cohesion: 0.29
Nodes (4): company_changes_company_created, "schema".company_change_requests, "schema".security_review_company_change(), "schema".security_submit_company_change()

### Community 80 - "class-variance-authority"
Cohesion: 0.29
Nodes (8): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 81 - "FaqPage.tsx"
Cohesion: 0.27
Nodes (8): Page(), FaqAccordionItem(), FaqCategory, faqDataAr, faqDataFr, faqDataNl, FaqItem, FaqPage()

### Community 82 - "chat/route.ts"
Cohesion: 0.42
Nodes (9): getSafeActionType(), getStatusColor(), getStatusLabel(), handleExecuteAction(), handleProposeAction(), handleRejectAction(), POST, sanitizeChanges() (+1 more)

### Community 83 - "DriverGuideSection.tsx"
Cohesion: 0.27
Nodes (9): DriverGuideSection(), getDesc(), getSteps(), getTitle(), GuideLanguage, GuideStep, guideSteps, langLabels (+1 more)

### Community 84 - "pagination.tsx"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 85 - "20261013_mail_delivery.sql"
Cohesion: 0.36
Nodes (7): mail_deliveries_quota, mail_deliveries_recipient, "schema".mail_deliveries, "schema".mail_delivery_events, "schema".mail_delivery_mutex, "schema".security_complete_mail(), "schema".security_reserve_mail()

### Community 86 - "navigation-menu.tsx"
Cohesion: 0.28
Nodes (8): @radix-ui/react-navigation-menu, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 87 - "drawer.tsx"
Cohesion: 0.25
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 88 - "audit-independent.mjs"
Cohesion: 0.42
Nodes (7): main(), identifier(), writePrivate(), auditSql(), constraints(), contract, contractSql()

### Community 89 - "apiRequest"
Cohesion: 0.33
Nodes (8): apiRequest(), buildApiUrl(), getLoginPath(), parseApiResponse(), redirectToLogin(), refreshToken(), connectionFailure, connectionMessage()

### Community 91 - "configure-mail.mjs"
Cohesion: 0.39
Nodes (6): checkedBrevoSetup(), mailRuntimeFiles(), mailRuntimeKeys, main(), readBrevoSetupResponse(), readMailRuntimeEnv()

### Community 92 - "rollout.mjs"
Cohesion: 0.29
Nodes (7): compose(), directory, env, [image, revision, target], lock, root, run()

### Community 93 - "verify-private-owner.cjs"
Cohesion: 0.29
Nodes (5): assert, {createHmac}, fs, main(), otpAt()

### Community 94 - "[...path]/route.ts"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 96 - "configure-native-push.mjs"
Cohesion: 0.33
Nodes (3): dir, aad, openPushCredential()

### Community 97 - "driver-app/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, strict, exclude, extends, expo/tsconfig.base

### Community 98 - "20261019_email_identity.sql"
Cohesion: 0.33
Nodes (3): "schema".security_attempt_email_code(), "schema".security_reset_email_password(), "schema".security_submit_verified_company_subscription()

### Community 99 - "definitions.d.ts"
Cohesion: 0.29
Nodes (3): BackgroundGeolocationPlugin, CallbackError, WatcherOptions

### Community 100 - "database-readiness.mjs"
Cohesion: 0.29
Nodes (5): base, checks, headers, now, required

### Community 101 - "useAddressSearch.ts"
Cohesion: 0.52
Nodes (5): useAddressSearch(), UseAddressSearchOptions, AddressSuggestion, belgianSuggestions(), sortByDistance()

### Community 102 - "company-registration.ts"
Cohesion: 0.29
Nodes (5): chironPortals, CompanyRegistration, companyRegistrationSchema, optional, password

### Community 103 - "activate-chiron-production.sh"
Cohesion: 0.33
Nodes (4): CHIRON_ACTIVATION_PROOF, CHIRON_ACTIVATION_REVISION, activate-chiron-production.sh script, VERIFIED_BACKUP_TAG

### Community 104 - "publish-customer-runtime.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, publish-customer-runtime.sh script, VERIFIED_BACKUP_TAG

### Community 105 - "update-customer-ui.sh"
Cohesion: 0.33
Nodes (4): CUSTOMER_IMAGE, CUSTOMER_REVISION, update-customer-ui.sh script, VERIFIED_BACKUP_TAG

### Community 106 - "apply-release.mjs"
Cohesion: 0.33
Nodes (3): files, names, values

### Community 107 - "contract-template.ts"
Cohesion: 0.40
Nodes (4): CONTRACT_DOCUMENT_CSS, CONTRACT_TEMPLATE_HTML_FR, CONTRACT_TEMPLATE_HTML_NL, ContractData

### Community 108 - "admin-enrollment.mjs"
Cohesion: 0.60
Nodes (3): createEnrollmentHandler(), escapeHtml(), totp()

### Community 111 - "container-scroll-animation.tsx"
Cohesion: 0.50
Nodes (4): ContainerScroll(), ContainerScrollProps, Header(), HeaderProps

### Community 112 - "driver-activity.ts"
Cohesion: 0.70
Nodes (4): activityColumns, activityFilters(), brusselsDay(), civilDate()

### Community 113 - "prepare-customer-runtime.sh"
Cohesion: 0.50
Nodes (3): CUSTOMER_IMAGE, CUSTOMER_REVISION, prepare-customer-runtime.sh script

### Community 116 - "scroll-area.tsx"
Cohesion: 0.67
Nodes (3): @radix-ui/react-scroll-area, ScrollArea, ScrollBar

### Community 117 - "company-portal/drivers/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, POST, PUT

### Community 118 - "invoices/send/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

### Community 119 - "view/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, unavailable

## Knowledge Gaps
- **699 isolated node(s):** `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG`, `CHIRON_ACTIVATION_PROOF`, `backup-foundation.sh script` (+694 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 983 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `generateAdminUserToken()` connect `createErrorResponse` to `company-changes.ts`, `lib/auth.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `activate-chiron-production.sh script`, `CHIRON_ACTIVATION_REVISION`, `VERIFIED_BACKUP_TAG` to the rest of the system?**
  _699 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createErrorResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.07021733938380702 - nodes in this community are weakly interconnected._
- **Why does `authCrudOperations()` connect `lib/auth.ts` to `createErrorResponse`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.07838584853510226 - nodes in this community are weakly interconnected._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.03211122047244094 - nodes in this community are weakly interconnected._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.06007480130902291 - nodes in this community are weakly interconnected._
## Extraction diagnostics and limits

- Raw extraction has 162 unresolved internal-endpoint edges and 19 self-loop edges; inspect health.json.
- The simple analysis graph can collapse 221 parallel relations. graph.json preserves the original exported links.
- Source declarations in excluded baseline SQL dumps are not indexed; dynamic HTTP/RPC relationships may be absent. Do not infer nonexistence from a missing edge.
- The exported map has no dangling endpoints; Graphify may create reference nodes, which do not establish a verified definition or runtime call.
