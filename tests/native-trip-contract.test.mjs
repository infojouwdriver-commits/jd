import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function compile(path,imports={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:name=>imports[name],Number,Error,Object});return exports;}
const protocol=compile('../src/lib/chiron-protocol.ts');
const {assertNativeTripExpectation:check}=compile('../src/lib/native-trip-contract.ts',{'./chiron-protocol':protocol});
test('native trip pins server company, vehicle and original environment; legacy portal remains compatible',()=>{
 check({},1,2,'TEST');check({expected_company_id:1,expected_vehicle_id:2,expected_chiron_environment:'PRODUCTION'},1,2,'production');
 for(const body of [{expected_company_id:3,expected_vehicle_id:2,expected_chiron_environment:'PRODUCTION'},{expected_company_id:1,expected_vehicle_id:3,expected_chiron_environment:'PRODUCTION'},{expected_company_id:1,expected_vehicle_id:2,expected_chiron_environment:'TEST'},{expected_company_id:1},{expected_company_id:'1',expected_vehicle_id:2,expected_chiron_environment:'PRODUCTION'}]) assert.throws(()=>check(body,1,2,'production'));
});
