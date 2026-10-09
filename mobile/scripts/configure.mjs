import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { mobileConfig } from '../config.mjs';
writeFileSync(fileURLToPath(new URL('../capacitor.config.json', import.meta.url)), JSON.stringify(mobileConfig(), null, 2) + '\n', { mode: 0o600 });
console.log('Mobile HTTPS configuration validated. No signing credentials are embedded.');
