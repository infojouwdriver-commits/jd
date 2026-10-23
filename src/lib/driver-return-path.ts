// A QR may lead through login. Keep only reviewed driver routes and a validated
// shift identity; never accept absolute URLs, credentials or arbitrary queries.
export function driverReturnPath(value: string | null | undefined): string {
  if (!value || !/^\/driver\/[a-z-]+(?:\?[^#]*)?$/.test(value)) return '/driver/taximeter';
  const url = new URL(value, 'https://app.jouww.com');
  if(url.pathname==='/driver/shifts') {
    const id=url.searchParams.get('id');
    return id&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)?`/driver/shifts?id=${id}`:url.pathname;
  }
  return url.pathname;
}
