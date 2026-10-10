#!/usr/bin/env node
/** Offline converter. Never log row values, authentication material or SQL. */
import { readFile, open, chmod, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

class JsonNumber { constructor(raw) { this.raw = raw; } }
export function parseLossless(source) {
  let i = 0;
  const fail = () => { throw new Error('Invalid JSON export'); };
  const ws = () => { while (/\s/.test(source[i] || '') && i < source.length) i++; };
  function value() {
    ws(); const c = source[i];
    if (c === '"') {
      const start = i++;
      while (i < source.length) { if (source[i] === '\\') { i += 2; continue; } if (source[i++] === '"') return JSON.parse(source.slice(start, i)); }
      fail();
    }
    if (c === '{') {
      i++; ws(); const out = Object.create(null);
      if (source[i] === '}') { i++; return out; }
      while (true) {
        ws(); if (source[i] !== '"') fail(); const key = value(); ws(); if (source[i++] !== ':') fail();
        if (Object.hasOwn(out, key)) throw new Error('Duplicate JSON property');
        out[key] = value(); ws(); const sep = source[i++]; if (sep === '}') return out; if (sep !== ',') fail();
      }
    }
    if (c === '[') {
      i++; ws(); const out = []; if (source[i] === ']') { i++; return out; }
      while (true) { out.push(value()); ws(); const sep = source[i++]; if (sep === ']') return out; if (sep !== ',') fail(); }
    }
    for (const [token, result] of [['true', true], ['false', false], ['null', null]]) {
      if (source.slice(i, i + token.length) === token) { i += token.length; return result; }
    }
    const match = source.slice(i).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (!match) fail(); i += match[0].length; return new JsonNumber(match[0]);
  }
  const result = value(); ws(); if (i !== source.length) fail(); return result;
}
function stringifyLossless(value) {
  if (value instanceof JsonNumber) return value.raw;
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stringifyLossless).join(',') + ']';
  return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stringifyLossless(value[k])).join(',') + '}';
}
export function identifier(name) {
  if (typeof name !== 'string' || !/^[a-z][a-z0-9_]{0,62}$/.test(name)) throw new Error('Unsafe SQL identifier');
  return '"' + name + '"';
}
function splitColumns(body) {
  const parts = []; let depth = 0, quoted = false, start = 0;
  for (let i = 0; i < body.length; i++) {
    if (body[i] === "'") { if (quoted && body[i + 1] === "'") { i++; continue; } quoted = !quoted; }
    if (quoted) continue;
    if (body[i] === '(') depth++; if (body[i] === ')') depth--;
    if (body[i] === ',' && depth === 0) { parts.push(body.slice(start, i)); start = i + 1; }
  }
  parts.push(body.slice(start)); return parts;
}
export function parseSchema(sql) {
  const tables = new Map();
  const regex = /CREATE TABLE\s+(?:"([a-z][a-z0-9_]*)"|([a-z][a-z0-9_]*))\s*\(([\s\S]*?)\);/g;
  let match, consumed = '';
  while ((match = regex.exec(sql))) {
    const name = match[1] || match[2]; identifier(name); if (tables.has(name)) throw new Error('Duplicate schema table');
    const columns = new Map();
    for (const part of splitColumns(match[3])) {
      const column = part.trim().match(/^(?:"([a-z][a-z0-9_]*)"|([a-z][a-z0-9_]*))\s+(TIMESTAMP WITH TIME ZONE|TIMESTAMPTZ|BIGSERIAL|BIGINT|INTEGER|NUMERIC|BOOLEAN|JSONB|TEXT|DATE|VARCHAR\(\d+\))(.*)$/);
      if (!column) throw new Error('Unsupported reconstructed schema declaration');
      const key = column[1] || column[2]; identifier(key);
      if (columns.has(key)) throw new Error('Duplicate schema column');
      // Only the exact limited constraints/defaults in this reconstructed schema are accepted.
      if (!/^(?:\s+(?:PRIMARY KEY|NOT NULL|UNIQUE|DEFAULT (?:CURRENT_TIMESTAMP|false|true|'[^']*'(?:\:\:jsonb)?)))*$/.test(column[4])) throw new Error('Unsupported schema constraint');
      columns.set(key, { type: column[3], suffix: column[4] });
    }
    tables.set(name, columns); consumed += match[0];
  }
  const remainder = sql.replace(regex, '').replace(/--[^\n]*/g, '').trim();
  if (!tables.size || remainder) throw new Error('Schema must contain only supported CREATE TABLE statements');
  return tables;
}
const EXCLUDED = new Set(['sessions', 'refresh_tokens', 'distributor_sessions', 'chiron_tokens', 'user_oauth_providers', 'user_passcode', 'chiron_settings', 'chiron_api_config', 'chiron_oauth_log']);
const SECRET_COLUMNS = /(?:^|_)(?:access_token|refresh_token|session_token|client_secret|password|password_hash|passcode|pass_object|private_key|api_key|token)$/;
function literal(text) {
  if (text.includes('\u0000')) throw new Error('NUL bytes are not valid PostgreSQL text');
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(++i);
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new Error('Unpaired Unicode surrogate in export');
    } else if (code >= 0xdc00 && code <= 0xdfff) throw new Error('Unpaired Unicode surrogate in export');
  }
  return "'" + text.replaceAll("'", "''") + "'";
}
function integer(raw, type) {
  if (!/^-?\d+$/.test(raw)) throw new Error('Invalid integer in export');
  const n = BigInt(raw), max = type === 'INTEGER' ? 2147483647n : 9223372036854775807n;
  if (n > max || n < -max - 1n) throw new Error('Integer outside PostgreSQL range'); return raw;
}
function sqlValue(value, type) {
  if (value === null) return 'NULL';
  if (type === 'JSONB') return literal(stringifyLossless(value)) + '::jsonb';
  if (['BIGSERIAL', 'BIGINT', 'INTEGER'].includes(type)) {
    const raw = value instanceof JsonNumber ? value.raw : typeof value === 'string' ? value : '';
    return integer(raw, type);
  }
  if (type === 'NUMERIC') {
    const raw = value instanceof JsonNumber ? value.raw : typeof value === 'string' ? value : '';
    if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(raw)) throw new Error('Invalid numeric in export'); return raw;
  }
  if (type === 'BOOLEAN') { if (typeof value !== 'boolean') throw new Error('Invalid boolean in export'); return value ? 'TRUE' : 'FALSE'; }
  if (typeof value !== 'string') throw new Error('Unexpected value type in export');
  if (/TIMESTAMP|TIMESTAMPTZ/.test(type) && !/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}(?::?\d{2})?)$/.test(value)) throw new Error('Timestamp must include a timezone');
  if (type === 'DATE' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Invalid date in export');
  const varchar = type.match(/^VARCHAR\((\d+)\)$/); if (varchar && [...value].length > Number(varchar[1])) throw new Error('Value exceeds reconstructed column length');
  return literal(value);
}
export function convertExport(data, schemaSql, { schema = 'jouw_driver_staging' } = {}) {
  identifier(schema); if (schema === 'public' || schema.startsWith('pg_') || schema === 'information_schema') throw new Error('Choose a dedicated staging schema');
  const tables = parseSchema(schemaSql), input = data.tables;
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Export must contain a tables object');
  const counts = {}, excluded = {}, clearedColumns = {}, lines = ['-- PRIVATE: contains personal business records. Do not commit or publish.', '-- Inferred schema: this is an isolated staging import, not a production migration.', 'BEGIN;', 'SET LOCAL standard_conforming_strings = on;', 'SET LOCAL timezone = \'UTC\';', 'CREATE SCHEMA ' + identifier(schema) + ';', 'SET LOCAL search_path = ' + identifier(schema) + ', pg_catalog;'];
  for (const table of Object.keys(input)) { identifier(table); if (!tables.has(table)) throw new Error('Unknown export table'); if (!Array.isArray(input[table])) throw new Error('Table records must be arrays'); }
  for (const [table, columns] of [...tables].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push('CREATE TABLE ' + identifier(table) + ' (' + [...columns].map(([name, col]) => identifier(name) + ' ' + col.type + col.suffix).join(', ') + ');');
    const rows = input[table] || []; counts[table] = 0;
    for (const row of rows) {
      if (!row || typeof row !== 'object' || row instanceof JsonNumber || Array.isArray(row)) throw new Error('Table row must be an object');
      for (const name of Object.keys(row)) { identifier(name); if (!columns.has(name)) throw new Error('Unknown export column'); }
    }
    if (EXCLUDED.has(table)) { excluded[table] = rows.length; continue; }
    const ids = new Set();
    for (const row of rows) {
      const names = Object.keys(row).sort(); if (!names.length) throw new Error('Empty table row');
      if (columns.has('id')) {
        if (!Object.hasOwn(row, 'id') || row.id === null) throw new Error('Missing stable record ID');
        const id = sqlValue(row.id, columns.get('id').type); if (ids.has(id)) throw new Error('Duplicate record ID'); ids.add(id);
      }
      const values = names.map(name => {
        if (SECRET_COLUMNS.test(name)) {
          if (row[name] !== null) { const key = table + '.' + name; clearedColumns[key] = (clearedColumns[key] || 0) + 1; }
          return columns.get(name).suffix.includes('NOT NULL') ? "''" : 'NULL';
        }
        return sqlValue(row[name], columns.get(name).type);
      });
      lines.push('INSERT INTO ' + identifier(table) + ' (' + names.map(identifier).join(', ') + ') VALUES (' + values.join(', ') + ');'); counts[table]++;
    }
    for (const [name, col] of columns) if (col.type === 'BIGSERIAL') {
      const qualified = identifier(schema) + '.' + identifier(table);
      lines.push('SELECT setval(pg_get_serial_sequence(' + literal(qualified) + ', ' + literal(name) + '), GREATEST(COALESCE((SELECT MAX(' + identifier(name) + ') FROM ' + identifier(table) + '), 1), 1), EXISTS (SELECT 1 FROM ' + identifier(table) + ' WHERE ' + identifier(name) + ' >= 1));');
    }
  }
  const relationCounts = {};
  const targets = { user_id: 'users', company_id: 'companies', driver_id: 'drivers', vehicle_id: 'vehicles', distributor_id: 'distributors', trip_id: 'trips' };
  const key = v => v instanceof JsonNumber ? v.raw : String(v);
  const targetSets = Object.fromEntries(Object.values(targets).map(t => [t, new Set((input[t] || []).map(r => key(r.id)))]));
  for (const [table, rows] of Object.entries(input)) {
    if (EXCLUDED.has(table)) continue;
    for (const [column, target] of Object.entries(targets)) {
      if (!tables.get(table).has(column) || !tables.has(target)) continue;
      const missing = rows.filter(r => Object.hasOwn(r, column) && r[column] !== null && !targetSets[target].has(key(r[column]))).length;
      if (missing) relationCounts[table + '.' + column + ' -> ' + target] = missing;
    }
  }
  lines.push('COMMIT;', '');
  return { sql: lines.join('\n'), report: { schemaStatus: 'inferred-staging-only', stagingSchema: schema, tableCount: tables.size, sourceRows: Object.values(input).reduce((n, r) => n + r.length, 0), importedRows: Object.values(counts).reduce((n, c) => n + c, 0), excludedRows: Object.values(excluded).reduce((n, c) => n + c, 0), counts, excludedTables: excluded, clearedCredentialColumns: clearedColumns, possibleMissingReferences: relationCounts, note: 'Reference checks are inferred by column name; no records were deleted or repaired. Passwords and integration secrets are cleared. Account recovery/re-enrollment is required.' } };
}
export async function writePrivate(path, contents) {
  const handle = await open(path, 'wx', 0o600);
  try { await handle.writeFile(contents, 'utf8'); await chmod(path, 0o600); } catch (error) { await handle.close(); await rm(path, { force: true }); throw error; } finally { await handle.close().catch(() => {}); }
}
async function main() {
  const [input, output, schema = 'jouw_driver_staging'] = process.argv.slice(2);
  if (!input || !output) throw new Error('Usage: node scripts/convert-database.mjs INPUT.json PRIVATE_OUTPUT.sql [staging_schema]');
  const schemaPath = new URL('../schema/reconstructed-staging.sql', import.meta.url);
  const converted = convertExport(parseLossless(await readFile(input, 'utf8')), await readFile(schemaPath, 'utf8'), { schema });
  await writePrivate(output, converted.sql);
  try { await writePrivate(output + '.report.json', JSON.stringify(converted.report, null, 2) + '\n'); } catch (error) { await rm(output, { force: true }); throw error; }
  console.log(JSON.stringify({ sourceRows: converted.report.sourceRows, importedRows: converted.report.importedRows, excludedRows: converted.report.excludedRows, status: 'private-staging-files-created' }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch(() => { console.error('Conversion failed. Check the export shape, schema types, identifiers and output permissions. Row values are intentionally omitted.'); process.exitCode = 1; });
