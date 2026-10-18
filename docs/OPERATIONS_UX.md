# Company operations UX contract

Business authority: [COMPANY_PLATFORM_CONTRACT.md](COMPANY_PLATFORM_CONTRACT.md), approved 2026-10-18. Runtime permission and ledger invariants live in company-membership.ts and the 20261018 migrations. The native driver contract remains in UX-CONTRACT.md; this web extension does not replace it.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Form | operations/OperationForm.tsx, ui/Input, ui/Label, ui/Checkbox | Strict server commands and financial ledger | Pessimistic financial commands; ISO civil dates | Operations browser and HTTP permission tests |
| Select/Listbox | ui/select.tsx; DirectoryToolbar Popover and Command | Committed directory URL state and explicit form values | Authored Radix popup; server company search | Keyboard, RTL, narrow viewport, popup bounds |
| Scrollbar | app/globals.css global operational baseline | Existing web CSS variables and scrollbar tokens | Natural document scroll; horizontal history tables; bounded modal body | Short/narrow browser checks |
| Toast | sonner; persistent inline role=alert for critical failures | Caller request state | No success before server acknowledgement | Failure/retry browser checks |
| CRUD | operations/CompanyLifecycleAction, BillingPanel and StaffPanel | Server/RPC access, immutable ledger and audit | Archive/restore; append payments/credits; company-scoped staff | SQL, HTTP and browser acceptance |
| Date | OperationForm Input and server date schema | Gregorian YYYY-MM-DD; Europe/Brussels business dates | Typed civil date; no native calendar popup | Invalid dates and month-end tests |

## Observable behavior

Directories restore filters, search, sort and page from URLs, reset paging on filter changes and clamp removed pages. Company workspace tabs and history pages use URL state. Company portal filters and billing/staff paging intentionally remain session state: no personal or financial values enter a shareable URL; switching company resets the view. Queries carry only authorized company, scope and bounded paging identifiers.

Archive confirmation names the company, shows affected driver/vehicle counts, requires a reason, initially focuses Cancel, preserves a frozen request on retry and offers restoration. History stays readable by the platform admin. Restore retains previous inactive accounts, requires fresh sign-in/vehicle choice, and **does not resume billing**: explicitly configure the next billable period to avoid charging archived months.

Billing settings have no implicit amount, tax, due period or reminder interval. Existing customers stay opted out. Prepared documents are excluded from posted balances. Issuance requires external structured exchange evidence; no provider connection or PDF delivery is claimed from preparation. Manual payments and linked credits append immutable entries. The ledger never suspends a company for debt. Payment instructions remain separately configured with the owner later.

Financial commands keep the request identifier and payload across ambiguous retries, including closing and reopening the same command in the current page session. Client validation precedes dispatch; a rejected validation request can be corrected. Pending commands are not written to disk. Server UUID replay and original-invoice locks prevent duplicate posting and over-crediting. Profile/settings updates require the loaded revision; conflicts require refresh.

Owners manage company staff. Fleet managers see operational data; accountants see company billing. Controls reflect server capabilities, but every handler verifies capability and selected active membership independently. Disabled membership/role changes revoke existing sessions. Last active owner and existing-account identity protection are enforced transactionally.

Driver billing notices contain no invoice amounts or payment records. They are dismissible, suppressed while a trip is active, and dismissed in session memory for the server-defined reminder interval. Notice failures never fail login, trip start/completion or push state. A new session can show the reminder again; it is informational only.

Arabic/French/Dutch use the existing language provider and semantic theme tokens. Date text includes explicit ISO guidance; money uses EUR and locale number formatting. Existing legacy create/edit forms retain their established terminology; this change does not claim a full translation rewrite of every old admin screen. Native Android also supports English.

## Verification and static-audit limits

premium-operations.json scopes the strict web audit to the new shared operations implementation. premium-ui.json continues to describe native screens. The generic HTML auditor misreads native Button/onPress components as HTML buttons without onClick; those false positives are recorded, not hidden by fake web event props. Native lint/typecheck/unit and rendered review remain the applicable runtime evidence. Do not claim the entire pre-existing application is free of UX debt from this scoped audit.
