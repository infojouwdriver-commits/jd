import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const patched = require('../vendor/decode-uri-component/index.js');
const upstream = (await import('decode-uri-component')).default;
// Load the actual legacy caller with the same alias Metro applies.
const mod = {exports: {}};
vm.runInNewContext(readFileSync(require.resolve('query-string'), 'utf8'), {
  module: mod, exports: mod.exports, require: name => name === 'decode-uri-component' ? patched : require(name),
});
test('patched decoder preserves upstream output and query-string CommonJS calls', () => {
  for (const value of ['hello','%C3%A5','%D8%A8','%FF%20ok','%FE%FF','%C2','%E0%A4%A','a%G1%20b','%F0%9F%9A%95','%C0%AF']) {
    assert.equal(patched(value), upstream(value));
    assert.equal(mod.exports.parse('address='+value).address, upstream(value));
  }
  assert.throws(() => patched(null), TypeError);
});
test('malformed deep-link bytes cannot trigger recursive stack overflow', {timeout: 2000}, () => {
  const value = '%FF'.repeat(100000);
  assert.equal(patched(value), value);
  assert.equal(mod.exports.parse('address='+value).address, value);
});
