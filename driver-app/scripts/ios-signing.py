"""Prepare a temporary macOS keychain; never write credentials in the checkout."""
import base64
import json
import os
from pathlib import Path
import plistlib
import secrets
import subprocess
import sys

root = Path(os.environ['RUNNER_TEMP']) / 'jd-ios-signing'
keychain = root / 'signing.keychain-db'
state = root / 'state.json'

def run(*args):
    return subprocess.run(args, check=True, capture_output=True).stdout

if sys.argv[1] == 'cleanup':
    if state.exists():
        saved = json.loads(state.read_text())
        run('security', 'list-keychains', '-d', 'user', '-s', *saved['keychains'])
        Path(saved['profile']).unlink(missing_ok=True)
    if keychain.exists():
        run('security', 'delete-keychain', str(keychain))
    import shutil
    shutil.rmtree(root, ignore_errors=True)
    raise SystemExit(0)

data = json.loads(os.environ['IOS_SIGNING_JSON'])
os.umask(0o077)
root.mkdir(mode=0o700, exist_ok=True)
for key, filename in [('p12', 'distribution.p12'), ('profile', 'distribution.mobileprovision')]:
    (root / filename).write_bytes(base64.b64decode(data[key], validate=True))
profile = plistlib.loads(run('security', 'cms', '-D', '-i', str(root / 'distribution.mobileprovision')))
entitlements = profile['Entitlements']
assert profile['TeamIdentifier'] == [data['team_id']], 'Unexpected signing team'
assert entitlements['application-identifier'] == data['team_id'] + '.be.jouwdriver.driver', 'Unexpected app identifier'
assert entitlements.get('aps-environment') == 'production', 'Distribution profile must include production notifications'
assert not entitlements.get('get-task-allow'), 'Development profile cannot upload to TestFlight'
assert 'ProvisionedDevices' not in profile, 'Device-only profile cannot upload to TestFlight'
assert profile['Name'] == data['profile_name'], 'Unexpected provisioning profile name'
profiles = Path.home() / 'Library/MobileDevice/Provisioning Profiles'
profiles.mkdir(parents=True, exist_ok=True)
profile_path = profiles / (profile['UUID'] + '.mobileprovision')
previous = run('security', 'list-keychains', '-d', 'user').decode().splitlines()
previous = [line.strip().strip('"') for line in previous if line.strip()]
state.write_text(json.dumps({'keychains': previous, 'profile': str(profile_path)}))
profile_path.write_bytes((root / 'distribution.mobileprovision').read_bytes())
password = secrets.token_urlsafe(32)
print('::add-mask::' + password)
print('::add-mask::' + data['password'])
run('security', 'create-keychain', '-p', password, str(keychain))
run('security', 'set-keychain-settings', '-lut', '21600', str(keychain))
run('security', 'unlock-keychain', '-p', password, str(keychain))
run('security', 'import', str(root / 'distribution.p12'), '-P', data['password'], '-T', '/usr/bin/codesign', '-t', 'cert', '-f', 'pkcs12', '-k', str(keychain))
run('security', 'set-key-partition-list', '-S', 'apple-tool:,apple:,codesign:', '-s', '-k', password, str(keychain))
run('security', 'list-keychains', '-d', 'user', '-s', str(keychain), *previous)
key_path = root / ('AuthKey_' + data['key_id'] + '.p8')
key_path.write_text(data['key'])
options = {'method': 'app-store-connect', 'destination': 'export', 'signingStyle': 'manual',
           'teamID': data['team_id'], 'signingCertificate': 'Apple Distribution',
           'provisioningProfiles': {'be.jouwdriver.driver': data['profile_name']},
           'manageAppVersionAndBuildNumber': False, 'uploadSymbols': True}
(root / 'ExportOptions.plist').write_bytes(plistlib.dumps(options))
with Path(os.environ['GITHUB_ENV']).open('a') as env:
    for key, value in {'JD_IOS_TEAM': data['team_id'], 'JD_IOS_PROFILE': data['profile_name'],
                       'JD_ASC_KEY_ID': data['key_id'], 'JD_ASC_ISSUER': data['issuer_id'],
                       'API_PRIVATE_KEYS_DIR': str(root), 'JD_IOS_SIGNING_DIR': str(root)}.items():
        env.write(key + '=' + value + '\n')
print('Distribution credentials and production entitlements verified.')
