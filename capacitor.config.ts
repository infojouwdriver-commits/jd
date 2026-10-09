// The Next.js server requires SSR and API routes; it cannot be exported to `out`.
// The isolated, locked mobile toolchain lives in mobile/.
// Run MOBILE_APP_URL=https://<your-real-domain> npm --prefix mobile run configure.
throw new Error('Use the validated configuration in mobile/; see mobile/README_AR.md');
export {};
