// Fixed, versioned application contract; no DDL is inferred from record values.
import fs from 'node:fs';
import {identifier} from './convert-database.mjs';
export const contract=JSON.parse(fs.readFileSync(new URL('../schema/independent-contract.json',import.meta.url),'utf8'));
export function constraints() {
 return [...contract.relations.map(([table,column,target])=>({table,name:`jd_fk_${table}_${column}`,definition:`FOREIGN KEY (${identifier(column)}) REFERENCES TARGET.${identifier(target)} (id) ON DELETE NO ACTION`})),
 ...(contract.compositeRelations||[]).map(([table,column,target,scope])=>({table,name:`jd_fk_${table}_${column}_${scope}`,definition:`FOREIGN KEY (${identifier(column)},${identifier(scope)}) REFERENCES TARGET.${identifier(target)} (id,${identifier(scope)}) ON DELETE NO ACTION`})),
 ...contract.checks.map(([table,name,expression])=>({table,name:`jd_ck_${table}_${name}`,definition:`CHECK (${expression})`})),
 {table:'trips',name:'jd_fk_trip_driver_company',definition:'FOREIGN KEY (driver_id,company_id) REFERENCES TARGET.drivers (id,company_id) ON DELETE NO ACTION'},
 {table:'trips',name:'jd_fk_trip_vehicle_company',definition:'FOREIGN KEY (vehicle_id,company_id) REFERENCES TARGET.vehicles (id,company_id) ON DELETE NO ACTION'}];
}
export function contractSql(schema,{validate=false}={}) {
 const q=identifier(schema);if(schema.startsWith('pg_')||schema==='information_schema')throw Error('Reserved schema');
 const lines=['BEGIN;','SET LOCAL lock_timeout = \'5s\';',`CREATE UNIQUE INDEX IF NOT EXISTS jd_driver_company_idx ON ${q}.drivers(id,company_id);`,`CREATE UNIQUE INDEX IF NOT EXISTS jd_vehicle_company_idx ON ${q}.vehicles(id,company_id);`,`CREATE UNIQUE INDEX IF NOT EXISTS jd_trip_company_idx ON ${q}.trips(id,company_id);`];
 for(const c of constraints()) {
  const qualified=q+'.'+identifier(c.table);
  lines.push(`DO $contract$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='${qualified}'::regclass AND conname='${c.name}') THEN ALTER TABLE ${qualified} ADD CONSTRAINT ${identifier(c.name)} ${c.definition.replaceAll('TARGET',q)} NOT VALID; END IF; END $contract$;`);
  if(validate)lines.push(`ALTER TABLE ${qualified} VALIDATE CONSTRAINT ${identifier(c.name)};`);
 }
 const names=constraints().map(c=>"'"+c.name+"'").join(',');
 lines.push(`CREATE OR REPLACE FUNCTION ${q}.independent_schema_ready() RETURNS boolean LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $ready$ SELECT count(*)=${constraints().length} AND coalesce(bool_and(convalidated),false) FROM pg_constraint WHERE connamespace='${q}'::regnamespace AND conname IN (${names}) $ready$;`,`REVOKE ALL ON FUNCTION ${q}.independent_schema_ready() FROM PUBLIC;`,'COMMIT;');
 return lines.join('\n')+'\n';
}
export function auditSql(schema) {
 const q=identifier(schema);const findings=[];
 for(const [table,column,target] of contract.relations)findings.push(`SELECT '${table}.${column} -> ${target}' AS check_name,count(*)::bigint AS invalid_rows FROM ${q}.${identifier(table)} child WHERE child.${identifier(column)} IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ${q}.${identifier(target)} parent WHERE parent.id=child.${identifier(column)})`);
 for(const [table,column,target,scope] of contract.compositeRelations||[])findings.push(`SELECT '${table}.${column}_${scope}' AS check_name,count(*)::bigint AS invalid_rows FROM ${q}.${identifier(table)} child WHERE child.${identifier(column)} IS NOT NULL AND child.${identifier(scope)} IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ${q}.${identifier(target)} parent WHERE (parent.id,parent.${identifier(scope)})=(child.${identifier(column)},child.${identifier(scope)}))`);
 for(const [table,name,expression] of contract.checks)findings.push(`SELECT '${table}.${name}' AS check_name,count(*)::bigint AS invalid_rows FROM ${q}.${identifier(table)} WHERE (${expression}) IS FALSE`);
 findings.push(`SELECT 'trips.driver_company' AS check_name,count(*)::bigint AS invalid_rows FROM ${q}.trips t WHERE t.driver_id IS NOT NULL AND t.company_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM ${q}.drivers d WHERE (d.id,d.company_id)=(t.driver_id,t.company_id))`);
 findings.push(`SELECT 'trips.vehicle_company' AS check_name,count(*)::bigint AS invalid_rows FROM ${q}.trips t WHERE t.vehicle_id IS NOT NULL AND t.company_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM ${q}.vehicles v WHERE (v.id,v.company_id)=(t.vehicle_id,t.company_id))`);
 return `SELECT jsonb_build_object('contractVersion','${contract.version}','findings',jsonb_agg(jsonb_build_object('check',check_name,'invalidRows',invalid_rows) ORDER BY check_name),'passed',bool_and(invalid_rows=0)) AS report FROM (${findings.join(' UNION ALL ')}) findings;`;
}
