#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/mobile"
BUILD_TYPE=${1:-debug}
case "$BUILD_TYPE" in debug|release|aab) ;; *) echo 'Usage: bash capacitor-build.sh [debug|release|aab]' >&2; exit 1;; esac
npm run configure
[[ -f android/gradlew ]] || { echo 'Initialize first: cd mobile && npm ci && npm run android:init' >&2; exit 1; }
npm exec -- cap sync android
node scripts/native-permissions.mjs android
cd android
case "$BUILD_TYPE" in
  debug) ./gradlew assembleDebug;;
  release) ./gradlew assembleRelease;;
  aab) ./gradlew bundleRelease;;
esac
echo 'Build task finished. Release outputs require verified signing before distribution.'
