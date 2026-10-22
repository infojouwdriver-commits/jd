# jouww.com migration preparation · Issue #96

Status: **candidate built and exact-image acceptance passed; not deployed; DNS unchanged**.
The user authorized tested publication and domain linking. A specific automatic
approval refusal currently blocks adding the new app origin to the existing
Mapbox token allowlist. Obtain explicit approval for that change; do not bypass
the refusal or replace the token to work around it.

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

## Verified continuation · 2026-10-22, after PR #97

- Main was confirmed at `f3cde10dfbe20a774265fed3cd2041eb55cd6d31`.
- Candidate run `39826612875` passed domain, web, native database and publish.
  Its actual digest was `sha256:f246a6f55934d91b9b4a31b2d5455e55db33b820504c505770af93470e87ce8e`.
  **Do not deploy this image:** subsequent audit rejected its DOMPurify 3.4.16.
- Native run `39825433711`: Android and visual review succeeded; iOS skipped.
- Runtime inspection `39826512310` succeeded, retaining live revision
  `c4ffb842af9f7a8fdde6fa5dc63c391be1623924` and the previous documented digest.
  Disk was 98% full (1.3 GiB free), and only legacy origin TLS passed.
- Cloudflare authenticated re-read: zone active, zero DNS records, SSL full,
  minimum TLS 1.0 and Always Use HTTPS off. No changes made.
- Correct verified origin IPv4 is **162.19.70.78**; the abbreviated address in
  the handoff was invalid. No AAAA planned.
- Mapbox account inspection: `JOUW DRIVER Driver Portal` public token currently
  restricts URLs to `https://jouw-driver.duckdns.org`. New app origin is absent.
  No token, scope or URL changes made. Confirm the exact token used by the next
  candidate build before adjusting its URL allowlist.
- New CI audit fails on GHSA-cg2g-xh64-v4q7, GHSA-mrv2-3pqr-j5jr and
  GHSA-c6gr-qvv4-5v3f. Direct and transitive DOMPurify now resolve to 3.4.17;
  locked local production audit reports no known vulnerabilities. Rebuild required.
- PR #98 adds metadata-only Caddy/disk inspection and an isolated immutable
  image acceptance workflow. The latter verifies image provenance and runs
  actual PostgreSQL/PostgREST/auth, tenant, trip and PDF tests with synthetic
  data, app origin plus exact legacy trust, host-only cookies and marketing
  origin denial. It does not expose production credentials or send mail/Chiron.
- The user has explicitly authorized routine fixes, merge, tested publication
  and domain linking in this continuation. Earlier approval wording is historical;
  all technical readiness gates and automatic/production protections still apply.
- No live release, DNS, cleanup or production data modification has occurred.
  TLS, capacity, candidate image acceptance and a reviewed cutover/rollback path
  remain prerequisites. No physical iOS acceptance is claimed.


## Protected transition path · continuation after PR #98

PR #98 merged as `d2d7d5ec1c582221336425a92e450d360ac0fbf7` after all five
current checks passed. Patched candidate build `39839710966` was dispatched
from this main source; follow that run rather than starting another build.
Read-only runtime inventory `39839589679` succeeded:

- Actual Caddy is `v2.11.7`, image/digest
  `sha256:f2a1290d0463aad60660d4ec134943f183ee2a5f6c3eb7bf32dd984f2f020772`.
  Ports 80/tcp and 443/tcp are published; certificate storage is writable.
- Foundation release/image/Caddy remain the established baseline.
- Docker directory uses about 43.27 GB while Docker image accounting reports
  only about 2.99 GB. More granular metadata inspection is needed before
  deciding what can be reclaimed. Backups use about 84 MB; do not delete them.

The new manual `jouww-cutover.yml` requires main source, a merged patched
candidate release, successful exact-image acceptance and a recent verified
backup/restore. It preserves the existing protected production environment,
SSH host pinning and deployment concurrency. Its default phase is verification.

`prepare-tls` preserves the old application and virtual host, retains private
rollback files on the origin, and adds maintenance hosts so automatic ACME can
issue certificates after reviewed DNS-only records point to the verified origin.
Use DNS-only records initially: no Cloudflare forwarded header trust is needed;
Caddy overwrites the client IP headers. Do not enable Cloudflare proxy without
separate exact trusted-proxy/IP handling acceptance. Certificate renewal uses the
existing persistent Caddy storage and reachable standard ACME ports.

`activate` requires trusted origin HTTPS on all three new maintenance hosts,
reviewed disk headroom, the exact accepted image identity and the unchanged live
baseline. It changes only the application image and two origin variables:
APP_ORIGIN becomes app.jouww.com and TRUSTED_ORIGINS is the exact legacy origin.
It validates the application and database readiness without applying migrations,
then activates reviewed routing and verifies both origin trust boundaries.
HTTP mutations receive 405 instead of a redirect that could replay credentials.

The previous image/configuration/metadata remain in the private transition
snapshot; failure invokes configuration rollback, with no database restore.
Manual rollback is not blocked by fresh-release artifact/backup expiration.
Successful publication requires independent public DNS/HTTPS checks and image
identity checks, not only a workflow success or merge. No cutover has run yet.

Local orchestration acceptance includes disposable files and simulated commands:
prepare -> activate -> verify -> rollback, plus failure while replacing the app.
These tests verify configuration preservation/recovery; they do not prove real
TLS, DNS or Docker rollout. CI additionally tests routing and the HTTP mutation
policy against the observed Caddy image binary.


## Latest continuation · 2026-10-22

- #98, #99 and #100 are merged. Corrected candidate release **39839710966,
  attempt 2**, completed successfully. Its image is
  `ghcr.io/infojouwdriver-commits/jd@sha256:a078a3694a7259db839fd3e3e32917b29c11fd4ee46eff9f2c5d3de24c2b6ace`,
  source `d2d7d5ec1c582221336425a92e450d360ac0fbf7`.
- Exact-image acceptance **39844006439** completed successfully: all **45 named
  check groups**, including app/legacy origin trust, marketing denial, host-only
  cookies, tenant isolation, MFA, immutable records, PDFs and encrypted restore.
  Only synthetic records/credentials were used. The initial acceptance runner
  omitted age-keygen; #100 fixed setup and the same image was accepted again.
- The new cutover gate's guessed numeric threshold must be replaced by checking
  every observed acceptance property, unique checks, consistent total and the
  exact digest. Negative tests reject missing/substituted checks and forged proof.
- Controlled cleanup **39841225076** preserved live/rollback and container
  images, backups and volumes; available disk rose from about 1.3 to 2.6 GiB.
  The large PostgreSQL diagnostic log remains unchanged. Recheck space before
  pulling; review longer-term log rotation separately.
- Mapbox compiled-token identity matched the existing Driver Portal token.
  Proposed change: append **only** `https://app.jouww.com` to its saved
  `https://jouw-driver.duckdns.org` allowlist, preserving the key and scopes.
  The form was prepared, but automatic approval review **rejected Save changes**
  because compatibility-check authorization was not accepted as specific approval
  to expand the allowed origins. Nothing was saved; no workaround was attempted.
- Obtain that explicit approval before retrying the exact Mapbox save. Then
  verify the two saved origins and proceed through protected prepare-tls,
  reviewed DNS-only records, trusted origin TLS, activation and independent
  public verification. Use the accepted image/source above, release_run
  **39839710966**, acceptance_run **39844006439** and backup_run **39824041698**
  while the backup remains fresh and covers the unchanged live release.
- No TLS preparation, DNS change, live application publication, production
  data restore, mail/Chiron change or native device release has occurred.
  The legacy domain remains available. Do not mark the migration complete.
