#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
TOKEN_FILE="$(mktemp)"

cleanup() {
  rm -f -- "$TOKEN_FILE"
  unset CLOUDFLARE_API_TOKEN
}
trap cleanup EXIT

fail() {
  printf '\nHIBA: %s\n' "$*" >&2
  exit 1
}

for command in node npm npx python3; do
  command -v "$command" >/dev/null 2>&1 || fail "Hiányzó parancs: $command"
done

cd "$PROJECT_DIR"

printf '============================================================\n'
printf ' FormatX licenckezelő – biztonságos Cloudflare belépés\n'
printf '============================================================\n\n'

npm install --no-audit --no-fund

if ! npx wrangler whoami --json >/dev/null 2>&1; then
  printf 'Megnyílik a Cloudflare bejelentkezési oldal a böngészőben.\n'
  printf 'A belépés után térj vissza ehhez a terminálhoz.\n\n'
  npx wrangler login
fi

npx wrangler whoami
npx wrangler auth token --json > "$TOKEN_FILE"

CLOUDFLARE_API_TOKEN="$(python3 - "$TOKEN_FILE" <<'PY'
import json
import sys

with open(sys.argv[1], encoding='utf-8') as handle:
    data = json.load(handle)

token_type = data.get('type')
token = data.get('token', '')
if token_type not in {'oauth', 'api_token'} or not token:
    raise SystemExit('A Wrangler nem adott használható OAuth/API tokent.')
print(token)
PY
)"
FORMATX_CLOUDFLARE_AUTH_TYPE="$(python3 - "$TOKEN_FILE" <<'PY'
import json
import sys

with open(sys.argv[1], encoding='utf-8') as handle:
    data = json.load(handle)

print(data.get('type', ''))
PY
)"

[[ ${#CLOUDFLARE_API_TOKEN} -ge 20 ]] || fail 'A Cloudflare hitelesítés nem sikerült.'
[[ "$FORMATX_CLOUDFLARE_AUTH_TYPE" == 'oauth' || "$FORMATX_CLOUDFLARE_AUTH_TYPE" == 'api_token' ]] \
  || fail 'A Cloudflare hitelesítés típusa nem támogatott.'
export CLOUDFLARE_API_TOKEN FORMATX_CLOUDFLARE_AUTH_TYPE

bash "$SCRIPT_DIR/deploy-license-center-live.sh"
