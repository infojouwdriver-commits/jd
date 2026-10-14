import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const config=require('../app.config.js').expo;
const source=fs.readFileSync(new URL('../node_modules/expo-linking/src/Schemes.ts',import.meta.url),'utf8');
function linking(expoConfig,platform) {
 const exports={};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{exports,__DEV__:false,console,require:name=>name==='expo-constants'?{__esModule:true,default:{expoConfig,executionEnvironment:'standalone'},ExecutionEnvironment:{Standalone:'standalone',Bare:'bare',StoreClient:'storeClient'}}:{Platform:{select:items=>items[platform]}}});return exports;
}
test('production linking resolves both platforms and rejects the previous missing scheme',()=>{
 for(const platform of ['ios','android']) {
   assert.equal(linking(config,platform).resolveScheme({}), 'jouwdriver');
   const previous={...config};delete previous.scheme;
   assert.throws(()=>linking(previous,platform).resolveScheme({}),/no custom scheme defined/);
 }
});
