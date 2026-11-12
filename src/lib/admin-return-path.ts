export function adminReturnPath(value: string | null): string | null {
  if (!value || !/^\/admin(?:\/|\?|$)/.test(value) || /[\\\s\x00-\x1f\x7f]/.test(value)) return null;
  const url = new URL(value, 'https://app.jouww.com');
  if (!/^\/admin(?:\/|$)/.test(url.pathname)) return null;
  url.searchParams.delete('_rsc');
  return url.pathname + url.search;
}
