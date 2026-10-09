
# Authentication Infrastructure Repair Report

## Summary

The authentication failure was caused by broken session propagation between the browser and `Next.js` API routes, plus a refresh-token implementation bug that prevented session recovery after the first unauthorized response.

## Root Causes

### 1. Refresh token hashing was broken
In `src/app/next_api/auth/refresh/route.ts`, both `pbkdf2Hash()` and `generateRandomString()` were used without `await`.

That caused:
- lookup against `refresh_tokens.token` to fail
- refresh token rotation to store invalid values
- `/next_api/auth/refresh` to fail silently or return unauthorized
- frontend to remain logged in visually while protected API routes kept returning `401`

### 2. JWT secret fallback was incomplete
The app depended only on `JWT_SECRET`, while some deployments may provide `NEXTAUTH_SECRET`.

That caused:
- token signing/verifying mismatch risk across environments
- invalid or unreadable auth tokens on the server side

### 3. Cookie parsing on server side was too narrow
`requestMiddleware()` depended only on `request.cookies.getAll()`.

That is fragile on some preview/serverless environments because:
- cookie forwarding may still exist in the raw `cookie` header
- auth token could be present but not parsed through the primary path

### 4. `/next_api/auth/user` response shape was inconsistent
The endpoint returned `id` but not `sub`, while the auth layer is based on JWT payload `sub`.

That caused:
- inconsistent authenticated user state shape
- possible client-side auth state issues after successful login

### 5. Cookie policy needed safer session behavior
Cookies were always forced to `SameSite=None` in production if HTTPS was detected.

That is not ideal for same-origin Zoer Cloud deployments because:
- same-origin auth works more reliably with `SameSite=Lax`
- `SameSite=None` should only be used when cross-site auth is actually needed

## Files Changed

### `src/app/next_api/auth/refresh/route.ts`
Fixed:
- `await pbkdf2Hash(refreshToken)`
- `await generateRandomString()`
- `await pbkdf2Hash(newRefreshToken)`
- replaced hardcoded cookie name with `authConfig.refreshCookieName`

Effect:
- refresh token lookup works
- token rotation works
- session recovery works
- authenticated fetch calls stop failing after refresh

### `src/lib/auth.ts`
Fixed:
- added fallback from `NEXTAUTH_SECRET` to `JWT_SECRET`
- normalized and reused the resolved JWT secret during token sign/verify

Effect:
- token creation and verification stay consistent across environments
- valid sessions no longer fail because of secret mismatch

### `src/lib/api-utils.ts`
Fixed:
- added raw `cookie` header parsing fallback
- added `authorization` bearer fallback in `requestMiddleware()`
- normalized `NEXT_PUBLIC_ZOER_HOST` and `NEXT_PUBLIC_STRIPE_URL`
- copied `NEXTAUTH_SECRET` into `JWT_SECRET` during env normalization when needed
- updated cookie writer to encode values safely
- changed `SameSite` logic:
  - `Lax` for same-origin deployments
  - `None` only when cross-site cookie behavior is actually required

Effect:
- serverless API routes can read auth cookies more reliably
- valid browser sessions now propagate correctly to `/next_api/**`
- Zoer Cloud preview/session behavior is more stable

### `src/app/next_api/auth/user/route.ts`
Fixed:
- normalized missing-session response to `401`
- returned both `sub` and `id`

Effect:
- `/next_api/auth/user` correctly returns `200` for authenticated users
- client auth state remains consistent after reload and API calls

### `src/app/next_api/zoer_health/route.ts`
Added diagnostics for:
- `NEXTAUTH_SECRET`
- normalized public host values

Effect:
- easier production verification of auth environment state

## What Was Not Changed

Per requirement, no database changes were made:
- no schema changes
- no table recreation
- no mock data
- no data deletion

## Expected Result After Deployment

After redeploying with the existing valid secrets and URLs:

- `/next_api/auth/user` should return `200` for authenticated sessions
- protected API routes should stop returning `401`
- `fetch` requests should succeed across pages
- auth should persist across page reloads
- real database data should load normally

## Recommended Verification Steps

1. Login from the deployed app
2. Open browser devtools and confirm:
   - `auth-token` cookie exists
   - `refresh-token` cookie exists
3. Request:
   - `GET /next_api/auth/user`
4. Confirm response:
   - HTTP `200`
   - JSON with `success: true`
5. Load protected pages such as:
   - drivers
   - companies
   - vehicles
6. Confirm data loads from the existing database without `401`

## Notes

The backend/API layer was repaired without touching the database. The main fix was restoring correct session continuity between browser cookies, refresh-token rotation, and server-side token verification.
