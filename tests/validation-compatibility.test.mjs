import test from 'node:test';
import assert from 'node:assert/strict';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

test('patched validation bounds oversized invalid collections before collecting per-item errors',()=>{
 const parsed=z.array(z.string()).max(5).safeParse(Array(1000).fill(7));
 assert.equal(parsed.success,false);
 assert.ok(parsed.error.issues.length<=2);
});

test('form adapter returns field errors instead of rejecting the submit promise',async()=>{
 const result=await zodResolver(z.object({email:z.string().email()}))({email:'invalid'},undefined,{fields:{},shouldUseNativeValidation:false});
 assert.ok(result.errors.email?.message);
 assert.deepEqual(result.values,{});
});
