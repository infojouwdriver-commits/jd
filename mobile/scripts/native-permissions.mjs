import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const platform = process.argv[2];
if (platform === 'android') {
  const path = fileURLToPath(new URL('../android/app/src/main/AndroidManifest.xml', import.meta.url));
  let xml = readFileSync(path, 'utf8');
  for (const permission of ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'FOREGROUND_SERVICE', 'FOREGROUND_SERVICE_LOCATION', 'POST_NOTIFICATIONS']) {
    if (!xml.includes(`android.permission.${permission}"`)) xml = xml.replace('</manifest>', `    <uses-permission android:name="android.permission.${permission}" />\n</manifest>`);
  }
  writeFileSync(path, xml);
} else if (platform === 'ios') {
  const path = fileURLToPath(new URL('../ios/App/App/Info.plist', import.meta.url));
  const result = spawnSync('python3', ['-c', `import plistlib,sys\np=sys.argv[1]\nwith open(p,'rb') as f: d=plistlib.load(f)\nd['NSLocationWhenInUseUsageDescription']='Jouw Driver uses precise location to calculate distance during your active taxi trip.'\nd['NSLocationAlwaysAndWhenInUseUsageDescription']='Location continues while an active trip is running and the screen is locked. End the trip to stop tracking.'\nd['UIBackgroundModes']=list(dict.fromkeys(d.get('UIBackgroundModes',[])+['location']))\nwith open(p,'wb') as f: plistlib.dump(d,f)`, path], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('Cannot apply iOS location permission descriptions. Install Python 3 or edit Info.plist according to the mobile guide.');
} else throw new Error('Specify android or ios');
console.log('Native location declarations updated; runtime consent and device tests remain required.');
