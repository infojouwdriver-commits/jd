import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {exportSchema} from '../scripts/export-schema.mjs';

test('schema export enforces read-only, private files, no overwrite and failure cleanup', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'jd-schema-test-'));
  try {
    const executable = path.join(root, 'pg_dump');
    await fs.writeFile(executable, `#!/usr/bin/env node\nconst fs=require('node:fs');fs.writeFileSync(process.env.PROBE,JSON.stringify({args:process.argv.slice(2),options:process.env.PGOPTIONS}));if(process.env.FAIL==='true'){console.log('PARTIAL SECRET');process.exit(1);}console.log('-- PostgreSQL database dump\\nCREATE TABLE example(id bigint);\\n-- PostgreSQL database dump complete');`, {mode: 0o700});
    const env = {...process.env, PATH: root + path.delimiter + process.env.PATH, PGHOST: '127.0.0.1', PGUSER: 'test_reader', PGDATABASE: 'test_schema', PROBE: path.join(root, 'probe.json')};
    const directory = path.join(root, 'output');
    const report = await exportSchema({directory, schema: 'public', env});
    const probe = JSON.parse(await fs.readFile(env.PROBE));
    assert.ok(probe.args.includes('--schema-only'));
    assert.ok(probe.args.includes('--no-password'));
    assert.match(probe.options, /default_transaction_read_only=on/);
    assert.equal((await fs.stat(directory)).mode & 0o777, 0o700);
    for (const name of ['database-schema.sql', 'export-report.json']) assert.equal((await fs.stat(path.join(directory, name))).mode & 0o777, 0o600);
    assert.equal(report.schemaOnly, true);
    await assert.rejects(exportSchema({directory, schema: 'public', env}), {code: 'EEXIST'});
    const failed = path.join(root, 'failed');
    await assert.rejects(exportSchema({directory: failed, schema: 'public', env: {...env, FAIL: 'true'}}));
    await assert.rejects(fs.stat(failed), {code: 'ENOENT'});
    const incomplete = path.join(root, 'incomplete');
    await fs.writeFile(executable, '#!/usr/bin/env node\nconsole.log("-- PostgreSQL database dump");', {mode: 0o700});
    await assert.rejects(exportSchema({directory: incomplete, schema: 'public', env}), /Incomplete/);
    await assert.rejects(fs.stat(incomplete), {code: 'ENOENT'});
    await assert.rejects(exportSchema({directory: path.join(root, 'remote'), schema: 'public', env: {...env, PGHOST: 'db.example.invalid', PGSSLMODE: 'require'}}), /verify-full/);
    await assert.rejects(exportSchema({directory: path.join(root, 'invalid'), schema: 'public;DROP SCHEMA public', env}), /schema name/);
  } finally {await fs.rm(root, {recursive: true, force: true});}
});
