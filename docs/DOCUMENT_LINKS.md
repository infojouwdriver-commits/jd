# On-demand receipt and shift documents

Customer receipts are issued only by the authenticated trip-owner invoice
endpoint. `format=link` returns a permanent HTTPS capability URL. This is a
bearer document link: anyone receiving it can read that receipt, never account,
trip APIs, other invoices or shift records. Web explains this before sharing.
No session cookie, JWT or personal detail is encoded in the QR.

The public route checks an HMAC-SHA256 capability with constant-time comparison,
rate limits before database access, fetches only the persisted receipt_snapshot
by invoice ID through the existing server credential and generates PDF in memory.
Responses prohibit storage and indexing and suppress referrers. Invalid links and
missing snapshots return a generic 404. Database/service failure returns 503.
It never reconstructs old snapshots from mutable current driver/company data.
No public receipt table grants or legacy invoice-sharing endpoints are enabled.

`DOCUMENT_LINK_SECRET`, when supplied, must be 32 random bytes in hexadecimal.
Without it, a domain-separated HMAC derives signatures from the existing stable
DATA_ENCRYPTION_KEY. Persist and back up the chosen secret: changing it revokes
all existing receipt links. There is no per-link expiry or per-link revocation
in this version; a dedicated registry would be required for that policy.
Do not log capability URLs or send them to analytics/third-party QR services.

Shift links are ordinary authenticated `/driver/shifts?id=<uuid>` deep links.
The existing user-scoped RPC remains authoritative. The DS reference is a
lossless grouped base36 ID, not a legal numbering sequence or invoice number.
Open shifts render as provisional; closed shifts retain existing saved profile,
events and payment summaries. Rendering a report does not modify the ledger.

Old invoices without receipt_snapshot remain on their existing private export
path; publishing them returns 409 instead of fabricating a snapshot. Existing
signed contracts and customer records are not migrated or overwritten.
