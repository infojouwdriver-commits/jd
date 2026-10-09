import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3001'],{env:{...process.env,NEXT_DIST_DIR:'.next-http',JWT_SECRET:'security-test-only-01234567890123456789',HASH_SALT_KEY:'security-test-only',SCHEMA_USER:'test_user',SCHEMA_ADMIN_USER:'test_admin',POSTGREST_URL:'http://127.0.0.1:9',POSTGREST_SCHEMA:'test',POSTGREST_API_KEY:'test',APP_ORIGIN:'http://127.0.0.1:3001',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
try {
 await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('Server startup timeout')),45000);
  server.stdout.on('data',data=>{if(data.toString().includes('Ready')){clearTimeout(timer);resolve();}});
  server.once('exit',code=>{clearTimeout(timer);reject(new Error(`Server exited: ${code}`));});
 });
 await import('./http-security.mjs');
} finally {server.kill('SIGTERM');}
