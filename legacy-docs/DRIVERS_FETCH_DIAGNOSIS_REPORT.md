
# Backend Infrastructure Repair Report

## Summary

The fetch failures were caused by multiple backend infrastructure issues in the API and auth layer, not by the database schema.

## Root Causes

### 1. Cookies were not consistently included in frontend requests
The shared `api-client.ts` used `fetch()` without `credentials: 'include'`.

Impact:
- `auth-token` and `refresh-token` cookies were not guaranteed to be sent with browser requests.
- `/next_api/auth/user` returned `401 Unauthorized` even after a valid login.
- Any authenticated page depending on `/next_api/auth/user` failed immediately.

### 2. Cookie policy was too rigid for mixed environments
`setCookie()` always forced:

- `Secure`
- `SameSite=None`

Impact:
- this is valid on HTTPS preview deployments,
- but it is fragile outside strict HTTPS contexts and makes session debugging difficult,
- and it can break cookie persistence in environments that do not accept that combination.

The cookie policy is now environment-aware.

### 3. API middleware did not guard against invalid handler returns
`requestMiddleware()` assumed every wrapped handler always returned a valid `Response`.

Impact:
- if any handler returned `undefined` or any non-`Response` value,
- the platform produced errors similar to `Failed to convert value to Response`.

The middleware now validates the handler output and converts invalid returns into a valid `500` JSON response.

### 4. Middleware was also matching `/next_api`
`src/middleware.ts` excluded `/api`, but not `/next_api`.

Impact:
- all backend endpoints were still passing through middleware unnecessarily,
- this increased risk of interference with auth and response handling on Zoer Cloud.

The matcher now excludes `/next_api`.

### 5. Global error rendering was unsafe
`src/app/global-error.tsx` rendered `next/error` with an invalid `statusCode`.

Impact:
- this could surface broken runtime behavior when the app hit an error boundary,
- and it made backend/runtime failures harder to diagnose cleanly.

It now returns a safe client error screen.

### 6. WebSocket endpoint returned 404 with no controlled fallback
The app was producing WebSocket-related 404 errors with no server route to answer predictably.

Impact:
- noisy backend failures,
- harder production diagnosis.

A controlled `/next_api/websocket` fallback route now returns a valid JSON `426` response instead of an unhandled 404.

---

## Files Changed

### `src/lib/api-client.ts`
Changes made:
- added `buildApiUrl()` to normalize API base URLs,
- added `credentials: 'include'` to every request,
- added `cache: 'no-store'`,
- added resilient JSON parsing for empty or invalid responses,
- reused the same normalized API URL for refresh calls.

Result:
- authenticated sessions now persist across requests,
- `/next_api/auth/user` can receive session cookies correctly,
- fetch failures caused by invalid or empty API bodies are handled safely.

### `src/lib/api-utils.ts`
Changes made:
- `requestMiddleware()` now verifies that route handlers return a real `Response`,
- invalid returns are converted into a structured `500` JSON error,
- cookie generation now uses environment-aware `Secure` and `SameSite` behavior.

Result:
- fixes `Failed to convert value to Response`,
- improves cookie/session compatibility across Zoer Cloud and local environments.

### `src/middleware.ts`
Changes made:
- excluded `/next_api` from middleware matching.

Result:
- middleware no longer touches backend API routes,
- reduces risk of auth/session interference.

### `src/components/auth/AuthProvider.tsx`
Changes made:
- silent refresh now uses `credentials: 'include'`,
- redirect logic was simplified and made more stable,
- refresh flow now re-applies redirects only after a confirmed authenticated user response.

Result:
- valid sessions survive page reloads,
- `/auth/user` is retried correctly after refresh.

### `src/app/global-error.tsx`
Changes made:
- replaced unsafe `next/error` rendering with a valid client fallback screen.

Result:
- runtime failures now render safely.

### `src/app/next_api/websocket/route.ts`
Changes made:
- added a valid fallback endpoint returning structured JSON.

Result:
- WebSocket route failures now return a proper HTTP response instead of an uncontrolled 404 for that path.

---

## End-to-End Diagnosis Outcome

### Backend server
The deployment is expected to continue using Next.js server routes under `/next_api`.

### Auth session handling
Fixed in:
- `src/lib/api-client.ts`
- `src/lib/api-utils.ts`
- `src/components/auth/AuthProvider.tsx`

### API route validity
Protected centrally by:
- `src/lib/api-utils.ts`

### API base URL configuration
Normalized in:
- `src/lib/api-client.ts`

### CORS and cookie domain behavior
Improved by:
- always sending cookies with `credentials: 'include'`
- environment-aware cookie flags in `setCookie()`

### Middleware interference
Fixed in:
- `src/middleware.ts`

### Database access
No schema change was made.
No data was deleted.
No table was recreated.
The existing `CrudOperations` and PostgREST access layer remain intact.

---

## Verification Checklist After Redeploy

Run these checks on Zoer Cloud after redeploy:

1. Login successfully.
2. Open browser devtools and call:
   - `GET /next_api/auth/user`
3. Confirm:
   - status `200`
   - JSON body contains `success: true`
4. Open Drivers page.
5. Confirm:
   - no `401 Unauthorized`
   - no `TypeError: Failed to fetch`
   - existing records load from the current database
6. Confirm no route now throws:
   - `Failed to convert value to Response`

---

## Important Note

This repair does not modify:
- database schema
- database records
- existing tables
- existing business data

It only repairs the backend request, session, middleware, and response handling layer.
