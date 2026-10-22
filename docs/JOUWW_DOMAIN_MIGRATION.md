# jouww.com migration preparation · Issue #96

Status: **preparation only; not deployed; DNS unchanged**. Production cutover
requires the user's final approval after the gates below pass. This supersedes
the issue's earlier assumption that the domain had not yet been purchased at OVH.

## Verified read-only inventory · 2026-10-22 UTC

| Item | Observed evidence | Consequence |
|---|---|---|
| Registrar | Authenticated Cloudflare Registrar: jouww.com registered 2026-10-22, expires 2027-10-22, locked, auto-renew enabled | Registration verified in connected account; no purchase/transfer needed |
| Zone | Cloudflare full zone active; activated 16:12 UTC; bryce.ns.cloudflare.com / fiona.ns.cloudflare.com | Public NS resolution agrees |
| DNS | Authenticated complete DNS list: **zero records**; public apex A empty; www/app NXDOMAIN | New hosts do not serve JOUW DRIVER yet |
| Cloudflare TLS | Universal edge certificate active for apex and wildcard; SSL `full`, minimum TLS 1.0, Always Use HTTPS off, DNSSEC disabled | Edge certificate is not proof of origin TLS; plan strict validation and TLS 1.2+ before proxied traffic; no settings changed |
| Rules | Managed normalization, response firewall, DDoS and managed free rulesets listed | No custom redirect/cache rules listed by this endpoint; do not assume a complete account-wide cache audit |
| OVH | Signed-in manager: `jouw-driver-prod`, active, GRA11, d2-8, Ubuntu 24.04, 8 GB / 4 vCore, local 50 GB | Existing server can remain the origin; no replacement or database move |
| OVH addresses | IPv4 162.19.70.78; IPv6 2001:41d0:304:300::41ae | Public legacy A resolves to the same IPv4. Do **not** add AAAA until IPv6 firewall/routing/TLS are tested |
| OVH recovery | Manager reports seven instance backups, latest 2026-10-21 | Not a substitute for a fresh encrypted application/database backup and isolated restore |
| GitHub baseline | main `6cd985d6a1a77c85e0c75bdd2897c16ee2a93665`; last reviewed deploy run 39763891991 succeeded | Deployment logs attest image revision `c4ffb842af9f7a8fdde6fa5dc63c391be1623924`, healthy container, preserved runtime configuration |
| Legacy public HTTPS | Read-only requests to root/login/driver-login/privacy-policy: 200, valid TLS and CSP; marketing orbital design present | Existing site remains accessible; no credentials or mutations used |
| Deployed image evidence | `ghcr.io/infojouwdriver-commits/jd@sha256:7130dc93fb728644a50addf6757f5c88676239a8acbcee623c1be93252f8aa91` | Evidence from the successful run, not an independent current SSH inspection |

No registrant contacts, credentials, tokens, private environment contents or
production records are included here. OVH instance details do not expose the
host's current Caddy configuration or firewall; these remain cutover gates.

## Target and compatibility decisions

| Host | Candidate behavior |
|---|---|
| `jouww.com`, `www.jouww.com` | Both serve marketing/public pages. Login, registration, portal and document GET/HEAD navigations go to the fixed app host, preserving path/query. No canonical www redirect is necessary for the requested structure. |
| `app.jouww.com` | Admin, company and driver portal, registration, contracts, PDFs and same-origin `/next_api` |
| `api.jouww.com` | **Deferred; no DNS record, no proxy route, no client origin switch.** Current cookies, CSP and relative fetches assume a same-origin API. |
| `jouw-driver.duckdns.org` | Retain full existing service, TLS and API/webhooks for installed applications and historical links. No blanket POST/API redirect. |

`deploy/Caddyfile.jouww.candidate` is an **inactive** file; no workflow imports
it. Public-host non-GET/HEAD requests receive 405 without forwarding; API paths
receive 404. The existing `/admin-setup` block and health mapping remain. Portal
and legacy API mutations continue to the application. DNS and runtime files are
not edited by any part of this preparation.

Web links opt in only at **build time** with
`NEXT_PUBLIC_PORTAL_ORIGIN=https://app.jouww.com` (Docker build argument added).
With no value, existing same-origin links/dialogs remain. The marketing
registration button hands off before collecting passwords or Chiron credentials;
the app host still opens its existing registration dialog. Caddy also redirects
safe direct registration navigation before rendering the page on marketing.

Native API and company-registration links now share one allowlisted origin.
`EXPO_PUBLIC_APP_ORIGIN=https://app.jouww.com` is an explicit build-time opt-in;
empty retains the legacy host. Arbitrary hosts, paths, credentials and the
separate API host are rejected. Android/iOS identifiers, scheme and signing
configuration remain unchanged. The installed 0.3.0/build 12 APK is not replaced
or altered by this PR. Changing origins requires a new signed build and device
acceptance; do not move the existing native cookie store between hosts.

## Reviewed links, sessions and integrations

| Area / source | Decision and remaining external verification |
|---|---|
| `PlatformLanding.tsx`, registration dialog | Portal links and pre-form handoff configurable; marketing root/public features remain local. Arabic, French and Dutch preserved. Registration mutations/verification remain relative on app. |
| `src/lib/api-utils.ts`, `security-policy.ts`, middleware | Auth cookies are host-only, HttpOnly, production Secure and SameSite=Lax. No `.jouww.com` cookie domain. New app host requires sign-in again using the same accounts. Existing exact-origin CSRF/CORS validation remains. |
| `APP_ORIGIN`, `TRUSTED_ORIGINS` | Future app runtime: APP_ORIGIN app.jouww.com; retain **only** the exact legacy origin in TRUSTED_ORIGINS for old native Origin headers. Do not trust marketing origins for credentialed API requests. Current runtime not changed. |
| JWT, database and vault | Keep issuer/audience `jouw-driver`, JWT/signing/encryption/rate-limit keys, private PostgREST URL, schemas and database volumes. Domain migration requires no schema/data migration. |
| Android / iOS `app-origin.ts`, `api.ts`, session | Shared reviewed API and registration destination; native fetch still uses explicit Origin, OS cookies, credentials include and redirect:error. Both platforms need login/refresh/logout, shift, trip recovery, PDF and Mapbox device tests before release. |
| Capacitor `mobile/config.mjs` | Existing MOBILE_APP_URL validation already requires a root HTTPS origin. Test new app host before a separate shell build; do not loosen validation. |
| Universal/app links | No new associated domains, Android intent filter, AASA or assetlinks claim without actual signing/team evidence and device tests. Existing scheme retained. |
| Contracts / `contract-invitation.ts` | New invitations derive from APP_ORIGIN. Keep existing legacy GET links usable; do not rewrite signed documents, stored URLs, tokens or invoice snapshots. Verify signature submission only on the app host in isolated acceptance. |
| PDF / invoices / shifts | Same relative authenticated endpoints on app; no financial or document content change. Shift statements remain separate from customer invoices. |
| Mail / `deploy/configure-mail.mjs`, verify-mail workflow | Existing provider/sender and legacy Brevo webhook remain. No MX/TXT/SPF/DKIM/DMARC/sender/provider/key change. A new mail domain is a separate verified task. No test email sent. |
| Chiron / `chiron-service.ts`, protocol | Outbound host allowlist and credentials unchanged; no browser OAuth callback found in reviewed service. No production trips or replays. Sandbox contract tests plus later controlled device acceptance required. |
| Bolt / platform-contracts route | Reviewed API supports Bolt as a platform-contract category; no standalone Bolt OAuth/webhook adapter found under src/lib or src/app/next_api. Do not invent callbacks. Confirm any external/manual integration before cutover. |
| Mapbox / route helper, native Mapbox | Keep keys private/public as currently intended. Account URL restrictions must explicitly support new browser hosts; native token must support native clients. Account-side restrictions not verified here. No token changes. |
| Push, service worker, browser preferences | Push remains in its existing paused state. New host gets separate browser storage/service worker scope; no automatic session/PII migration. |
| Historical deployment workflows | Old-domain hardcoded gates intentionally retained. Blind search/replace would disable baseline and recovery safeguards. PostgREST address is not a public website address. |

## Release and DNS plan — blocked until gates pass

1. Finish PR checks in both default and opt-in modes. The new domain workflow
   has read-only repository permission, synthetic data, no production secrets,
   no image publish, DNS writes or deployment. Validate real Caddy routing.
2. Inspect actual live runtime under `/srv/jouw-driver/foundation`: virtual hosts,
   Caddy version/pinned image, mounted file path, `.app-staging.env` key presence
   without exposing values, runtime-mode/release agreement, ports/firewall and
   certificate volume. The accepted layout uses `private-app.yaml` and
   `.app-staging.env`, **not** `/srv/jouw-driver/.env`. Do not modify runtime yet.
3. Produce an immutable **candidate** image with the opt-in public build argument
   and provenance identifying its build configuration. Existing release.yml
   does not pass this argument: it must not be treated as a jouww-enabled image.
   Add a separately reviewed release/cutover path preserving all current checks;
   avoid publishing two different variants under the same `sha-<commit>` tag.
4. Test candidate in isolated staging with no production mail/Chiron writes:
   TLS/SNI, host routing, cookies, CORS/CSRF (marketing rejected), login/MFA,
   verification/recovery, tenant isolation, registration, shifts/pause/resume,
   trip recovery, Dutch PDFs, contracts and old API/webhooks. Verify Android/iOS
   on real devices with old and candidate origins. Do not claim browser fixtures
   prove physical-device acceptance.
5. Obtain a fresh encrypted foundation backup covering the then-live release;
   verify digest, isolated restore, data/schema completeness and recovery tools.
   Preserve existing deploy protected-environment gates, baseline checks and
   pinned SSH host verification. Historic successful restore does not replace a
   fresh pre-cutover restore gate. No database restore into production.
6. Prepare a concrete cutover diff (Caddy, immutable image digest, only required
   public origin variables and DNS) and rollback artifact. **Obtain the user's
   final approval before applying any live configuration, DNS or release.**
7. After approval, issue/verify trusted origin certificates before proxied
   traffic, e.g. controlled DNS-01 issuance using a narrowly scoped credential
   without logs, or a separately approved issuance window. Do not add an
   issuance token to this repository. Edge certificate alone is insufficient.
8. Proposed DNS after approval: A apex and A app to the verified IPv4 above;
   CNAME www to jouww.com. Start with an explicitly reviewed proxy mode and TTL;
   no AAAA, API host, wildcard A, MX or TXT changes. With proxy enabled require
   Full (strict), TLS 1.2+, HTTPS and no cache of API/auth/portal/PDF/contracts.
   Validate trusted proxy/IP handling before enabling the proxy; do not trust
   spoofed forwarded headers. Origin HTTP->HTTPS redirects must never replay
   sensitive API POSTs from an insecure origin.
9. Verify the actual live image revision and all hosts, links, languages, mobile
   layout, HTTPS and authentication. Preserve the old host through the agreed
   compatibility window. Only then record the cutover as successful.

Rollback: retain the prior Caddy file, runtime environment, release metadata,
immutable image digest and certificate volumes. Remove/revert only the new DNS
records and new public routing configuration; restore previous app image/config
under the existing deployment lock and verify health/old clients. **Do not roll
back database contents, restore snapshots over live data or rotate secrets.**
Existing deploy workflows preserve configuration rather than switching domains;
this PR does not bypass that restriction or enable a production cutover action.

## Verification ledger

- Local: web TypeScript and production build pass; 195 server/database tests,
  99 native tests, 57 deployment guard tests, 16 HTTP security checks pass.
- Native TypeScript and lint pass. Default marketing UI passes all nine Arabic/French/Dutch phone/desktop cases, keyboard and reduced motion.
- Both native origin modes and invalid destination cases covered.
- Opt-in marketing browser tests and real Caddy routing run in
  isolated acceptance; see PR check results for final status. Local Caddy
  execution encountered SIGSEGV in this runtime, so it is not reported passed.
- No live DNS, Cloudflare settings, OVH settings, production data, email,
  Chiron, native release or live application changes performed.

## Continuation: candidate release preparation

PR #97 uploads the full original candidate tree, verified equal to local
commit 340ad9c039043d04e30c61da4cd2c7bc1457df16. Connector-created commit
identities differ; tree equality is the content check.

The first real-Caddy CI run verified the binary checksum and adapted the
configuration, then exposed a test-transport fault: Node fetch replaced the
supplied Host header with the loopback address. The harness now uses node:http
with an explicit Host header; only a successful rerun proves virtual-host routing.

`release-domain-candidate.yml` prepares a manual candidate-image path. It requires
both full application/database checks and isolated domain acceptance, passes the
portal build argument, labels the origin/revision/build run, and publishes under
`jouww-sha-<revision>-run-<run>-<attempt>` with a digest in its summary. It never
uses the existing `sha-<revision>` release tag and contains no deployment step.
This workflow has not been dispatched and no candidate image is claimed built.
Existing release and deployment gates remain unchanged; approving a candidate
image does not authorize a production cutover.

Runtime inventory, origin TLS, Mapbox account restrictions, isolated acceptance,
physical Android/iOS acceptance and a fresh encrypted backup/restore remain
open gates. Repository checks cannot substitute for these external observations.
