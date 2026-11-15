import {sign} from 'node:crypto';
const {key, key_id, issuer_id} = JSON.parse(process.env.IOS_SIGNING_JSON);
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const origin = 'https://api.appstoreconnect.apple.com';
const version = process.env.JD_IOS_BUILD_NUMBER;
async function get(path, params) {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({alg:'ES256', kid:key_id, typ:'JWT'});
  const payload = encode({iss:issuer_id, iat:now, exp:now+120, aud:'appstoreconnect-v1'});
  const message = header + '.' + payload;
  const signature = sign('sha256', Buffer.from(message), {key, dsaEncoding:'ieee-p1363'}).toString('base64url');
  const url = new URL(path, origin);
  url.search = new URLSearchParams(params).toString();
  const response = await fetch(url, {
    headers:{Authorization:'Bearer ' + message + '.' + signature},
    redirect:'error',
    signal:AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('App Store Connect returned HTTP ' + response.status + ' for ' + path);
  return (await response.json()).data;
}
async function main() {
  const apps = await get('/v1/apps', {'filter[bundleId]':'be.jouwdriver.driver'});
  if (apps.length !== 1) throw new Error('Expected one JOUW DRIVER app');
  for (let attempt = 0; attempt < 20; attempt++) {
    const builds = await get('/v1/builds', {'filter[app]':apps[0].id, 'filter[version]':version});
    const build = builds.find(item => item.attributes.version === version);
    const state = build?.attributes.processingState ?? 'NOT_LISTED';
    console.log('Build ' + version + ' processing: ' + state);
    if (state === 'VALID') {
      const [detail, groups] = await Promise.allSettled([
        get('/v1/builds/' + build.id + '/buildBetaDetail'),
        get('/v1/builds/' + build.id + '/betaGroups', {'fields[betaGroups]':'isInternalGroup,hasAccessToAllBuilds'}),
      ]);
      console.log('Internal TestFlight state: ' + (detail.status === 'fulfilled' ? detail.value.attributes.internalBuildState : 'UNAVAILABLE'));
      console.log('Assigned internal groups: ' + (groups.status === 'fulfilled' ? groups.value.filter(group => group.attributes.isInternalGroup).length : 'UNAVAILABLE'));
      return;
    }
    if (state === 'FAILED' || state === 'INVALID') throw new Error('Apple processing failed');
    await new Promise(resolve => setTimeout(resolve, 25000));
  }
  console.log('::warning::Apple has accepted the upload and is still processing it.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
