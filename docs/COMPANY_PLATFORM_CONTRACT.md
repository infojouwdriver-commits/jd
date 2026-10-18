# Company operations and subscription billing — approved business contract

User authorization: 18 October 2026, Brussels. Implement the approved archive,
company workspace, directory filters, monthly subscription invoices and reminders,
statement/manual payments, credit notes, admin attention centre, staff permissions,
trial-company separation, and truthful connection/sync states. No document-expiry
management is in scope. Read AGENTS.md before editing; update the Graphify map.

## Company lifecycle

Archive removes the company and its drivers/vehicles from operational lists and
blocks operational access. It never deletes trip, invoice, contract or signed
history. Archive is one database transaction, with actor/reason/time, idempotent
retries, no active trip, and explicit review of pending Chiron deliveries. Shared
identities retain access to other companies. Restore preserves prior inactive or
pending states; revoked sessions are never revived. Administrators must review
restoration. No automatic retention purge is authorized. Retention is classified
by purpose/legal basis; a five-year blanket deletion rule is not approved.

## Subscription and money

EUR integer cents; each company's amount, VAT treatment, billing start/day, due
period and reminder interval must be explicitly configured. EUR50 was an example,
not an approved price. No existing company is opted into new billing implicitly.
Payment-provider integration will be selected with the user later; do not enable
charges or invent bank details. Manual payments are recorded by platform admins
with traceable references. Issued documents are immutable; corrections use linked
credit notes. Period issuance and external dispatch must be idempotent. Partial
payments reduce only the outstanding balance; a fully paid/credited invoice no
longer triggers reminders. Real and trial financial results remain separate.

Overdue subscription invoices NEVER suspend the company, driver login, vehicle,
trip start/completion, or any operational feature. Driver reminders expose only a
company-scoped generic message, can be dismissed, and must not interrupt a trip.
Email reminders go to the company and contain accurate outstanding information.

Belgian B2B structured invoicing must be considered before real issuance. PDF by
email alone is not evidence of compliance with the 2026 structured-invoicing
obligation. No Peppol transport acceptance or provider integration may be claimed
without actual proof. Missing issuer/tax/exchange configuration is visibly pending.
Source reviewed: https://efacture.belgium.be/fr/article/les-factures-electroniques-structurees-entre-entreprises-sont-obligatoires-depuis-2026
Retention source: https://finances.belgium.be/fr/node/1581
GDPR source: https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en

## Company roles

Platform admin: cross-company management, archive/restore, billing configuration,
manual payments, credit notes, staff access and operational oversight; existing
MFA remains mandatory. Company owner (legacy owner/portal_owner): company-scoped
workspace and fleet management, financial statements, and staff management.
Fleet manager (including legacy manager): company-scoped drivers/vehicles and
operational information, no billing/staff authority. Accountant: company financial
statements and read-only reports, no fleet mutation, role changes, payment entry
or credit issuance. No role grants platform admin. Enforce the same matrix on the
server; do not infer privilege from a company ID supplied by a client. Shared
users choose among authorized memberships; archived memberships never resolve.

## Trial and reporting

Trial designation is explicit and visible. Trip and document classification is
snapshotted when created; changing the company's classification does not rewrite
historical records. Trial records do not enter live billing/reporting by default.
Trial company and Chiron TEST/PRODUCTION are independent classifications; changing
one never switches the other. Existing Chiron acceptance gates remain in force.

## UI and reliability

Canonical web primitives: existing Button/Input/Label/Select/Dialog/AlertDialog,
Sonner feedback and LanguageContext (ar/fr/nl). Native primitives and locale
ownership remain in DESIGN.md/UX-CONTRACT.md. Search/filter/page state is bounded,
server-side, stale-safe and restorable. Company workspace links drivers, vehicles,
trips, invoices, contracts and audit history without exposing credentials.

Connectivity separates transport/offline or timeout, server errors, auth expiry,
and upstream failures. Sync distinguishes local saved, pending, server saved and
uncertain delivery. Never discard a local trip on billing notices, session errors,
or a failed refresh; never claim that a provider accepted a trip without evidence.
