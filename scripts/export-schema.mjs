#!/usr/bin/env node
// Export live PostgreSQL DDL only. No SQL source file is executed.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';

const repository = fileURLToPath(new URL('../', import.meta.url));
export async function exportSchema({directory, schema, env = process.env}) {
  if (!directory || !/^[a-z_][a-z0-9_]{0,62}$/.test(schema || '')) throw new Error('Supply a private output directory and a simple PostgreSQL schema name');
  for (const key of ['PGHOST', 'PGDATABASE', 'PGUSER']) if (!env[key]) throw new Error(`Missing ${key}`);
  const local = env.PGHOST.startsWith('/') || ['localhost', '127.0.0.1', '::1'].includes(env.PGHOST);
  if (!local && env.PGSSLMODE !== 'verify-full') throw new Error('Remote export requires PGSSLMODE=verify-full and a trusted certificate');
  const output = path.resolve(directory);
  const parent = await fs.realpath(path.dirname(output));
  const realOutput = path.join(parent, path.basename(output));
  if (realOutput === repository.slice(0, -1) || realOutput.startsWith(repository)) throw new Error('Save private schema exports outside the repository');
  // Exclusive directory creation prevents overwriting an earlier export.
  await fs.mkdir(realOutput, {mode: 0o700});
  let handle;
  try {
    handle = await fs.open(path.join(realOutput, 'database-schema.sql'), 'wx', 0o600);
    await new Promise((resolve, reject) => {
      const child = spawn('pg_dump', ['--no-password', '--format=plain', '--schema-only', '--strict-names', '--schema=' + schema], {
        env: {...env, PGCONNECT_TIMEOUT: '10', PGOPTIONS: (env.PGOPTIONS || '') + ' -c default_transaction_read_only=on -c statement_timeout=60000 -c lock_timeout=5000'},
        stdio: ['ignore', handle.fd, 'ignore'],
      });
      const timer = setTimeout(() => child.kill('SIGKILL'), 120000);
      child.once('error', () => {clearTimeout(timer); reject(new Error('pg_dump could not start; install official PostgreSQL client tools'));});
      child.once('close', code => {clearTimeout(timer); code === 0 ? resolve() : reject(new Error('Schema export failed; verify the connection, read permissions, schema name and matching pg_dump version privately'));});
    });
    await handle.close(); handle = undefined;
    const ddl = await fs.readFile(path.join(realOutput, 'database-schema.sql'));
    if (!ddl.includes(Buffer.from('PostgreSQL database dump')) || !ddl.includes(Buffer.from('PostgreSQL database dump complete'))) throw new Error('Incomplete schema dump; no accepted export was saved');
    const report = {exportedAt: new Date().toISOString(), source: 'live PostgreSQL pg_dump', schema, schemaOnly: true, readOnlyConnection: true, sha256: createHash('sha256').update(ddl).digest('hex'), bytes: ddl.length, limits: ['Only the named schema is exported; review dependencies on other schemas and extensions.', 'DDL can contain sensitive literals in defaults or function bodies; keep the export private.', 'This export does not validate application compatibility, deployment readiness or GDPR compliance.']};
    await fs.writeFile(path.join(realOutput, 'export-report.json'), JSON.stringify(report, null, 2) + '\n', {flag: 'wx', mode: 0o600});
    return report;
  } catch (error) {
    await handle?.close().catch(() => {});
    await fs.rm(realOutput, {recursive: true, force: true});
    throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  exportSchema({directory: process.argv[2], schema: process.argv[3] || process.env.POSTGREST_SCHEMA})
    .then(report => console.log(JSON.stringify({status: 'private-schema-exported', schema: report.schema, bytes: report.bytes, sha256: report.sha256})))
    .catch(() => {console.error('Schema export failed. No partial export is retained. Check required PG settings, TLS, a new private directory outside Git, and PostgreSQL client tools. Credentials and database diagnostics are not printed.'); process.exitCode = 1;});
}
