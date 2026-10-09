#!/usr/bin/env bash
set -euo pipefail
[[ "$(uname -s)" == Darwin ]] || { echo 'iOS requires macOS and Xcode; no IPA was built.' >&2; exit 1; }
command -v xcodebuild >/dev/null || { echo 'Install the compatible Xcode toolchain first.' >&2; exit 1; }
cd "$(dirname "$0")/mobile"
npm run configure
[[ -d ios/App ]] || { echo 'Initialize first: cd mobile && npm ci && npm run ios:init' >&2; exit 1; }
node scripts/native-permissions.mjs ios
npm exec -- cap sync ios
npm exec -- cap open ios
echo 'Select your Apple team in Xcode, test a real device, then archive. No signed IPA is produced by this script.'
