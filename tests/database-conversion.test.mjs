import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, stat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { convertExport, parseLossless, parseSchema, writePrivate } from '../scripts/convert-database.mjs';
const schema = 'CREATE TABLE "users" ("id" BIGSERIAL PRIMARY KEY, "password" TEXT, "email" TEXT);\nCREATE TABLE "trips" ("id" BIGSERIAL PRIMARY KEY, "user_id" BIGINT, "price" NUMERIC, "metadata" JSONB, "start_time" TIMESTAMPTZ);\nCREATE TABLE "sessions" ("id" BIGSERIAL PRIMARY KEY, "user_id" BIGINT);';
const make = text => convertExport(parseLossless(text), schema);
test('keeps bigint, numeric and JSON numbers without JavaScript rounding', () => {
  const result = make('{"tables":{"trips":[{"id":9007199254740993,"user_id":null,"price":123456789012345.123456789,"metadata":{"n":9007199254740995},"start_time":"2026-10-09T22:01:00Z"}]}}');
  assert.match(result.sql, /9007199254740993/); assert.match(result.sql, /123456789012345\.123456789/); assert.match(result.sql, /9007199254740995/);
  assert.match(result.sql, /BEGIN;/); assert.match(result.sql, /COMMIT;/); assert.equal(result.report.importedRows, 1);
});
test('escapes text and SQL-looking payload as values only', () => {
  const result = make(JSON.stringify({tables:{users:[{id:1,email:"O'Brien\\'; DROP TABLE users; --", password:'old-secret'}]}}));
  assert.match(result.sql, /standard_conforming_strings = on/); assert.match(result.sql, /O''Brien\\''/); assert.ok(!result.sql.includes('old-secret'));
  assert.equal(result.report.clearedCredentialColumns['users.password'], 1);
});
test('rejects unknown tables and columns, unsafe identifiers and duplicate JSON keys', () => {
  assert.throws(() => make('{"tables":{"other":[]}}'));
  assert.throws(() => make('{"tables":{"users":[{"id":1,"unexpected":"x"}]}}'));
  assert.throws(() => convertExport(parseLossless('{"tables":{}}'), schema, {schema:'public'}));
  assert.throws(() => convertExport(parseLossless('{"tables":{}}'), schema, {schema:'x";DROP'}));
  assert.throws(() => parseLossless('{"tables":{},"tables":{}}'));
});
test('rejects malformed or overflowing typed values and duplicate IDs', () => {
  for (const id of ['9223372036854775808','1.5']) assert.throws(() => make('{"tables":{"users":[{"id":'+id+'}]}}'));
  assert.throws(() => make('{"tables":{"users":[{"id":1},{"id":1}]}}'));
  assert.throws(() => make('{"tables":{"users":[{"email":"missing id"}]}}'));
  assert.throws(() => make('{"tables":{"trips":[{"id":1,"start_time":"2026-10-09T22:00:00"}]}}'));
  assert.throws(() => make('{"tables":{"users":[{"id":1,"email":"\\u0000"}]}}'));
  assert.throws(() => make('{"tables":{"users":[{"id":1,"email":"\\ud800"}]}}'));
});
test('legacy sessions are empty; reference report contains counts without record identifiers', () => {
  const result = make('{"tables":{"users":[{"id":1}],"trips":[{"id":99,"user_id":2}],"sessions":[{"id":10,"user_id":1}]}}');
  assert.equal(result.report.excludedRows, 1); assert.equal(result.report.counts.sessions, 0);
  assert.equal(result.report.possibleMissingReferences['trips.user_id -> users'], 1);
  assert.ok(!result.sql.includes('INSERT INTO "sessions"')); assert.match(result.sql, /CREATE SCHEMA "jouw_driver_staging";/);
  assert.ok(!result.sql.includes('IF NOT EXISTS'));
});
test('schema accepts only known column syntax rather than executing appended SQL', () => {
  assert.equal(parseSchema(schema).size, 3); assert.throws(() => parseSchema(schema + '\nDROP TABLE users;'));
  assert.throws(() => parseSchema('CREATE TABLE users (id BIGINT DEFAULT malicious());'));
});
test('private output is created exclusively with mode0600', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'jd-convert-'));
  try { const path = join(directory,'private.sql'); await writePrivate(path,'private'); assert.equal((await stat(path)).mode & 0o777,0o600); assert.equal(await readFile(path,'utf8'),'private'); await assert.rejects(writePrivate(path,'overwrite')); }
  finally { await rm(directory,{recursive:true,force:true}); }
});
test('PostgreSQL engine imports exact values, preserves sequences, and refuses schema reuse', {skip:!process.env.PGLITE_MODULE_PATH}, async () => {
  const {PGlite} = await import(process.env.PGLITE_MODULE_PATH);
  const db = new PGlite();
  try {
    const malicious = "O'Brien\\'; DROP TABLE users; --";
    const text = '{"tables":{"users":[{"id":9007199254740993,"email":'+JSON.stringify(malicious)+'}],"trips":[{"id":1,"price":123.123456789123,"metadata":{"n":9007199254740995}}]}}';
    const result = make(text); await db.exec(result.sql);
    const rows = (await db.query('SELECT id::text AS id,email FROM jouw_driver_staging.users')).rows;
    assert.equal(rows[0].id,'9007199254740993'); assert.equal(rows[0].email,malicious);
    const money = (await db.query('SELECT price::text AS price, metadata->>\'n\' AS number FROM jouw_driver_staging.trips')).rows[0];
    assert.equal(money.price,'123.123456789123'); assert.equal(money.number,'9007199254740995');
    const generated = (await db.query('INSERT INTO jouw_driver_staging.users (email) VALUES ($1) RETURNING id::text AS id',['new'])).rows[0];
    assert.equal(generated.id,'9007199254740994');
    await assert.rejects(db.exec(result.sql)); await db.exec('ROLLBACK');
    assert.equal((await db.query('SELECT count(*)::int AS n FROM jouw_driver_staging.users')).rows[0].n,2);
  } finally { await db.close(); }
});
