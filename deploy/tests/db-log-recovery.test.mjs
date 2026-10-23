import test from 'node:test';
import assert from 'node:assert/strict';
import {planLogRecovery,assertOnlyLoggingChanged,recoverDatabaseLog} from '../recover-db-log.mjs';
const id='a'.repeat(64),revision='b'.repeat(40);
const fixture=()=>({expected:revision,state:{mode:'public',revision,image:'immutable-app'},release:{revision,image:'immutable-app'},imageId:'sha256:database',raw:'services:\n  db:\n    image: postgres:16.15-bookworm\n',config:{services:{db:{image:'postgres:16.15-bookworm',volumes:['database_data:/var/lib/postgresql/data']}}},container:{Id:id,Image:'sha256:database',State:{Running:true},Config:{Image:'postgres:16.15-bookworm',Labels:{'com.docker.compose.project':'jouw-driver','com.docker.compose.service':'db'}},HostConfig:{LogConfig:{Type:'json-file'}},LogPath:'/var/lib/docker/containers/'+id+'/'+id+'-json.log',Mounts:[{Destination:'/var/lib/postgresql/data',Type:'volume',Name:'jouw-driver_database_data'}]}});
test('recovery identifies only exact DB diagnostic file and refuses mismatched live identity, mounts and logging',()=>{
 const x=fixture(),p=planLogRecovery(x);assert.equal(p.log,x.container.LogPath);assert.equal(p.volume,'jouw-driver_database_data');assert.match(p.next,/max-size: "10m"/);
 for(const alter of [x=>x.state.revision='c'.repeat(40),x=>x.release.image='other',x=>x.container.Config.Labels['com.docker.compose.service']='app',x=>x.container.LogPath='/var/lib/postgresql/data/data',x=>x.container.Mounts[0].Name='other',x=>x.container.Image='other',x=>x.config.services.db.logging={},x=>x.raw+='  db:\n']){const bad=fixture();alter(bad);assert.throws(()=>planLogRecovery(bad));}
 assert.throws(()=>recoverDatabaseLog(revision,'not-approved'),/approval required/);
});
test('resolved config may change only DB diagnostic logging, never volume, image, networking or another service',()=>{
 const before=fixture().config,after=structuredClone(before);after.services.db.logging={driver:'json-file',options:{'max-size':'10m','max-file':'3'}};
 assertOnlyLoggingChanged(before,after);
 for(const alter of [x=>x.services.db.volumes=['other'],x=>x.services.db.image='other',x=>x.services.db.networks=['public'],x=>x.services.edge={image:'other'},x=>x.services.db.logging.options['max-size']='1g']){const bad=structuredClone(after);alter(bad);assert.throws(()=>assertOnlyLoggingChanged(before,bad));}
});
