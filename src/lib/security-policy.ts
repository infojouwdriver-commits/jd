export function trustedOrigins(appOrigin: string, configured = ''): Set<string> {
  const values = [appOrigin, ...configured.split(',')];
  return new Set(values.filter(Boolean).map(value => {
    const url = new URL(value.trim());
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash || !['https:', 'http:', 'capacitor:'].includes(url.protocol)) throw new Error('Invalid trusted origin');
    return url.origin;
  }));
}
export function originAllowed(origin: string | null, appOrigin: string, configured = ''): boolean {
  return origin !== null && trustedOrigins(appOrigin, configured).has(origin);
}
export function isPlatformAdmin(userId: string, configured = ''): boolean {
  return configured.split(',').map(s => s.trim()).filter(Boolean).includes(String(userId));
}
export function publicEndpoint(path: string, method: string): boolean {
  return (method === 'POST' && ['/next_api/auth/login', '/next_api/auth/driver-login', '/next_api/company-portal/login', '/next_api/auth/refresh', '/next_api/auth/send-verification', '/next_api/auth/register', '/next_api/auth/reset-password', '/next_api/auth/logout'].includes(path)) ||
    (method === 'GET' && ['/next_api/gdpr/privacy-policy', '/next_api/gdpr/cookie-categories'].includes(path));
}
export function disabledEndpoint(path: string): boolean {
  return ['/next_api/ai-assistant', '/next_api/contracts/sign', '/next_api/contracts/verify-token', '/next_api/contracts/send-signature-link', '/next_api/invoices/view', '/next_api/invoices/share-link', '/next_api/auth/google-login', '/next_api/example', '/next_api/websocket', '/next_api/zoer_health', '/next_api/company-portal/register', '/next_api/company-portal/set-password'].some(prefix => path === prefix || path.startsWith(prefix + '/'));
}
export function memberEndpoint(path: string, method: string, userType: string): boolean {
  if (['/next_api/auth/user', '/next_api/auth/account', '/next_api/gdpr/consents', '/next_api/gdpr/data-subject-requests', '/next_api/gdpr/export'].includes(path)) return true;
  if (['manager', 'company', 'owner'].includes(userType)) return ['/next_api/company-portal', '/next_api/company-portal/drivers', '/next_api/company-portal/vehicles'].includes(path);
  if (userType === 'distributor') return method === 'GET' && ['/next_api/distributors/my-companies','/next_api/invoices/my-invoices'].includes(path);
  if (userType !== 'driver') return false;
  if (path === '/next_api/messages') return method === 'POST';
  if (path === '/next_api/messages/replies') return method === 'GET' || method === 'POST';
  return ['/next_api/drivers/me', '/next_api/drivers/pricing', '/next_api/drivers/vehicles', '/next_api/drivers/profile', '/next_api/driver-profile', '/next_api/trips', '/next_api/trips/start', '/next_api/trips/end', '/next_api/trips/summary', '/next_api/trips/export-pdf', '/next_api/trips/generate-invoice', '/next_api/trips/retry-sync', '/next_api/notifications/driver', '/next_api/notifications/mark-read', '/next_api/messages/driver', '/next_api/messages/mark-read'].includes(path) && !(path === '/next_api/drivers/profile' && method !== 'GET');
}
export function ownsRecord(record: {user_id?: unknown} | null, userId: string): boolean {
  return !!record && String(record.user_id) === String(userId);
}
export function calendarMonthDeadline(now: Date): Date {
  const deadline = new Date(now);
  const day = now.getUTCDate();
  deadline.setUTCDate(1);
  deadline.setUTCMonth(deadline.getUTCMonth() + 1);
  const lastDay = new Date(Date.UTC(deadline.getUTCFullYear(), deadline.getUTCMonth() + 1, 0)).getUTCDate();
  deadline.setUTCDate(Math.min(day, lastDay));
  return deadline;
}
export function safeChironUrl(input: string): string {
  if (process.env.NODE_ENV === "production" && process.env.CHIRON_TRANSMISSION_ENABLED !== "true") throw new Error("Chiron transmission disabled");
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !['mow.api.vlaanderen.be', 'mow-acc.api.vlaanderen.be'].includes(url.hostname)) throw new Error('Chiron destination not permitted');
  return url.toString();
}
export function stripSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripSecrets);
  if (!value || typeof value !== 'object') return value;
  const safe: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (/password|secret|token|authorization|raw_profile|request_payload|response_payload|sync_error_message/i.test(key)) continue;
    safe[key] = stripSecrets(item);
  }
  return safe;
}
