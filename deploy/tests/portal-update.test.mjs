import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const script=fileURLToPath(new URL('../update-customer-portal.sh',import.meta.url));
const image='ghcr.io/infojouwdriver-commits/jd@sha256:'+'a'.repeat(64),revision='b'.repeat(40);
for(const [label,args,error]of [
 ['mutable image',['ghcr.io/infojouwdriver-commits/jd:latest',revision,'1-1'],/Immutable image required/],
 ['shell characters in revision',[image,'main;touch /tmp/unsafe','1-1'],/Full revision required/],
 ['path characters in backup tag',[image,revision,'../../backup'],/Verified backup tag required/],
])test('portal deployment rejects '+label+' before server access',()=>{
 const result=spawnSync('bash',[script,...args],{encoding:'utf8'});
 assert.equal(result.status,1);assert.match(result.stderr,error);
});
