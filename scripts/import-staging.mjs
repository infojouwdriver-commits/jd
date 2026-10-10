#!/usr/bin/env node
/** Converts the source itself; never executes an arbitrary supplied SQL file. */
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { parseLossless, convertExport } from './convert-database.mjs';
async function main() {
  if (process.env.STAGING_IMPORT_ACK !== 'empty-isolated-staging') throw new Error('Set STAGING_IMPORT_ACK=empty-isolated-staging for a separate non-production database');
  const [input, schema = 'jouw_driver_staging'] = process.argv.slice(2);
  if (!input) throw new Error('Supply a JSON export and optional new schema name');
  if (process.env.NODE_ENV === 'production') throw new Error('Production import is not supported');
  if (!process.env.PGDATABASE || !/(?:staging|sandbox|test)/i.test(process.env.PGDATABASE)) throw new Error('PGDATABASE must explicitly name a staging, sandbox or test database');
  const { sql, report } = convertExport(parseLossless(await readFile(input, 'utf8')), await readFile(new URL('../schema/reconstructed-staging.sql', import.meta.url), 'utf8'), { schema });
  // libpq PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSFILE or peer authentication; no credentials in argv.
  // CREATE SCHEMA without IF NOT EXISTS is the transactional empty staging guard.
  const code = await new Promise((accept, reject) => {
    const child = spawn('psql', ['--no-psqlrc', '--set=ON_ERROR_STOP=1', '--quiet'], { stdio: ['pipe', 'ignore', 'ignore'], env: process.env });
    child.on('error', reject); child.on('exit', accept); child.stdin.on('error', () => {}); child.stdin.end(sql);
  });
  if (code !== 0) throw new Error('PostgreSQL rejected the import; transaction rolled back. Verify that the schema is new and the reconstructed types match.');
  console.log(JSON.stringify({ status: 'isolated-staging-imported', importedRows: report.importedRows, excludedRows: report.excludedRows, missingReferenceGroups: Object.keys(report.possibleMissingReferences).length }));
}
main().catch(error => { console.error(error.message.startsWith('Set STAGING_IMPORT_ACK') || error.message.startsWith('Supply a JSON') || error.message.startsWith('Production import') || error.message.startsWith('PGDATABASE must') || error.message.startsWith('PostgreSQL rejected') ? error.message : 'Staging import failed. No record values or credentials are printed.'); process.exitCode = 1; });
