#!/usr/bin/env bash
set -euo pipefail

test "$(uname -m)" = x86_64
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
version=1.2.1
digest=7df45a6cc87d4da11cc03a539a7470c15b1041ab2b396af088fe9990f7c79d50
curl --fail --silent --show-error --location --retry 3 --max-time 45 \
  "https://github.com/FiloSottile/age/releases/download/v$version/age-v$version-linux-amd64.tar.gz" \
  --output "$work/age.tar.gz"
printf '%s  %s\n' "$digest" "$work/age.tar.gz" | sha256sum --check --status
tar -xzf "$work/age.tar.gz" -C "$work" age/age age/age-keygen
bindir="${RUNNER_TEMP:?}/jd-age-bin"
install -d "$bindir"
install -m 0755 "$work/age/age" "$work/age/age-keygen" "$bindir/"
"$bindir/age" --version
printf '%s\n' "$bindir" >> "${GITHUB_PATH:?}"
