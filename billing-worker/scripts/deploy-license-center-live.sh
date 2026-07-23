#!/usr/bin/env bash
set -Eeuo pipefail

ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-ffd7d28ea7c6a510549dc9363619c8c5}"
ADMIN_EMAIL="${FORMATX_ADMIN_EMAIL:-hutoczky@gmail.com}"
DB_NAME="formatx-license-db"
ADMIN_PATH="/fx-owner-license/*"
ADMIN_URL="https://www.formatxsuite.com/fx-owner-license/"
HEALTH_URL="https://www.formatxsuite.com/api/license/health"
ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_CONFIG="$ROOT_DIR/.wrangler-license-live.jsonc"
LOGIN_FILE="$HOME/FormatX-licenc-admin-belepes.txt"
RESET_PASSWORD="${FORMATX_RESET_ADMIN_PASSWORD:-0}"
PERSIST_CONFIG="${FORMATX_PERSIST_WRANGLER_CONFIG:-0}"

cleanup(){ rm -f -- "$TMP_CONFIG" /tmp/formatx-license-health.json; unset CLOUDFLARE_API_TOKEN; }
trap cleanup EXIT
fail(){ printf '\nHIBA: %s\n' "$*" >&2; exit 1; }
need(){ command -v "$1" >/dev/null 2>&1 || fail "Hiányzó parancs: $1"; }
for cmd in node npm npx python3 curl openssl; do need "$cmd"; done
cd "$ROOT_DIR"

printf '============================================================\n'
printf ' FormatX élő licenckezelő telepítése\n'
printf ' Admin: %s\n' "$ADMIN_URL"
printf ' Admin e-mail: %s\n' "$ADMIN_EMAIL"
printf '============================================================\n\n'

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  printf 'A token kizárólag ebben a terminálfolyamatban lesz használva; nem kerül GitHubra vagy fájlba.\n'
  printf 'Szükséges jogosultságok: Workers Scripts Edit, D1 Edit, Access Apps and Policies Write,\n'
  printf 'Access Organizations/Identity Providers/Groups Write, Zone Read és Workers Routes Edit.\n\n'
  read -r -s -p 'Cloudflare API-token: ' CLOUDFLARE_API_TOKEN
  printf '\n'
fi
[[ ${#CLOUDFLARE_API_TOKEN} -ge 20 ]] || fail 'A Cloudflare API-token hiányzik vagy túl rövid.'
export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"

api(){
  local method="$1" endpoint="$2" body="${3:-}"
  local args=(-fsS -X "$method" "https://api.cloudflare.com/client/v4$endpoint" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H 'Content-Type: application/json')
  [[ -n "$body" ]] && args+=(--data "$body")
  curl "${args[@]}"
}
check_success(){ python3 -c 'import json,sys; o=json.load(sys.stdin); assert o.get("success") is True, o.get("errors")'; }
json_result_value(){ local expression="$1"; python3 -c "import json,sys; o=json.load(sys.stdin); r=o.get('result') or {}; $expression"; }

printf '1/10 – Cloudflare-token ellenőrzése…\n'
VERIFY="$(curl -fsS https://api.cloudflare.com/client/v4/user/tokens/verify -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN")"
printf '%s' "$VERIFY" | check_success || fail 'A Cloudflare API-token érvénytelen.'

printf '2/10 – Függőségek és tesztek…\n'
npm install --no-audit --no-fund
npm run test:license
bash -n scripts/deploy-license-center-live.sh

printf '3/10 – D1 adatbázis létrehozása vagy megkeresése…\n'
DB_LIST="$(api GET "/accounts/$ACCOUNT_ID/d1/database?per_page=100")"
printf '%s' "$DB_LIST" | check_success || fail 'A D1 adatbázisok nem kérhetők le.'
DB_ID="$(printf '%s' "$DB_LIST" | python3 -c 'import json,sys; name=sys.argv[1]; data=json.load(sys.stdin); print(next((x.get("uuid") or x.get("id") or "" for x in data.get("result",[]) if x.get("name")==name),""))' "$DB_NAME")"
if [[ -z "$DB_ID" ]]; then
  DB_CREATE="$(api POST "/accounts/$ACCOUNT_ID/d1/database" "{\"name\":\"$DB_NAME\"}")"
  printf '%s' "$DB_CREATE" | check_success || fail 'A D1 adatbázis nem hozható létre.'
  DB_ID="$(printf '%s' "$DB_CREATE" | json_result_value 'print(r.get("uuid") or r.get("id") or "")')"
fi
[[ -n "$DB_ID" ]] || fail 'A D1 adatbázis azonosítója hiányzik.'

printf '4/10 – Zero Trust szervezet és OTP bejelentkezés…\n'
ORG="$(api GET "/accounts/$ACCOUNT_ID/access/organizations" || true)"
AUTH_DOMAIN="$(printf '%s' "$ORG" | python3 -c 'import json,sys; o=json.load(sys.stdin); r=o.get("result") or {}; print(r.get("auth_domain") or "")' 2>/dev/null || true)"
if [[ -z "$AUTH_DOMAIN" ]]; then
  AUTH_DOMAIN="formatx-${ACCOUNT_ID: -8}.cloudflareaccess.com"
  ORG_BODY="$(python3 -c 'import json,sys; print(json.dumps({"name":"FormatX","auth_domain":sys.argv[1],"auto_redirect_to_identity":False,"deny_unmatched_requests":False,"session_duration":"24h","warp_auth_session_duration":"24h","user_seat_expiration_inactive_time":"730h"}))' "$AUTH_DOMAIN")"
  ORG_CREATE="$(api POST "/accounts/$ACCOUNT_ID/access/organizations" "$ORG_BODY")"
  printf '%s' "$ORG_CREATE" | check_success || fail 'A Zero Trust szervezet nem hozható létre.'
fi

IDPS="$(api GET "/accounts/$ACCOUNT_ID/access/identity_providers")"
printf '%s' "$IDPS" | check_success || fail 'Az Access bejelentkezési módok nem kérhetők le.'
OTP_ID="$(printf '%s' "$IDPS" | python3 -c 'import json,sys; data=json.load(sys.stdin); print(next((x.get("id","") for x in data.get("result",[]) if x.get("type")=="onetimepin"),""))')"
if [[ -z "$OTP_ID" ]]; then
  OTP_CREATE="$(api POST "/accounts/$ACCOUNT_ID/access/identity_providers" '{"name":"FormatX egyszer használatos e-mail-kód","type":"onetimepin","config":{}}')"
  printf '%s' "$OTP_CREATE" | check_success || fail 'Az egyszer használatos e-mail-kódos belépés nem hozható létre.'
  OTP_ID="$(printf '%s' "$OTP_CREATE" | json_result_value 'print(r.get("id") or "")')"
fi
[[ -n "$OTP_ID" ]] || fail 'Az OTP identity provider azonosítója hiányzik.'

printf '5/10 – Cloudflare Access alkalmazás és tulajdonosi szabály…\n'
APPS="$(api GET "/accounts/$ACCOUNT_ID/access/apps?per_page=100")"
printf '%s' "$APPS" | check_success || fail 'Az Access alkalmazások nem kérhetők le.'
APP_ID="$(printf '%s' "$APPS" | python3 -c 'import json,sys; suffix=sys.argv[1]; data=json.load(sys.stdin); found="";
for app in data.get("result",[]):
 uris=[d.get("uri","") for d in app.get("destinations",[]) if isinstance(d,dict)]
 if any(uri.endswith(suffix) for uri in uris) or str(app.get("domain","")).endswith(suffix): found=app.get("id",""); break
print(found)' "$ADMIN_PATH")"
APP_BODY="$(python3 -c 'import json,sys; otp=sys.argv[1]; print(json.dumps({"name":"FormatX tulajdonosi licenckezelő","type":"self_hosted","domain":"www.formatxsuite.com/fx-owner-license/*","destinations":[{"type":"public","uri":"www.formatxsuite.com/fx-owner-license/*"},{"type":"public","uri":"formatxsuite.com/fx-owner-license/*"}],"session_duration":"8h","app_launcher_visible":False,"auto_redirect_to_identity":True,"allowed_idps":[otp],"options_preflight_bypass":False}))' "$OTP_ID")"
if [[ -n "$APP_ID" ]]; then
  APP_RESULT="$(api PUT "/accounts/$ACCOUNT_ID/access/apps/$APP_ID" "$APP_BODY")"
else
  APP_RESULT="$(api POST "/accounts/$ACCOUNT_ID/access/apps" "$APP_BODY")"
fi
printf '%s' "$APP_RESULT" | check_success || fail 'A Cloudflare Access alkalmazás nem állítható be.'
APP_ID="$(printf '%s' "$APP_RESULT" | json_result_value 'print(r.get("id") or "")')"
ACCESS_AUD="$(printf '%s' "$APP_RESULT" | json_result_value 'print(r.get("aud") or "")')"
[[ -n "$APP_ID" && -n "$ACCESS_AUD" ]] || fail 'Az Access alkalmazás ID/AUD értéke hiányzik.'

POLICIES="$(api GET "/accounts/$ACCOUNT_ID/access/apps/$APP_ID/policies?per_page=100")"
printf '%s' "$POLICIES" | check_success || fail 'Az Access szabályok nem kérhetők le.'
POLICY_ID="$(printf '%s' "$POLICIES" | python3 -c 'import json,sys; data=json.load(sys.stdin); print(next((x.get("id","") for x in data.get("result",[]) if x.get("name")=="FormatX owner only"),""))')"
POLICY_BODY="$(python3 -c 'import json,sys; print(json.dumps({"name":"FormatX owner only","decision":"allow","precedence":1,"include":[{"email":{"email":sys.argv[1]}}],"require":[{"login_method":{"id":sys.argv[2]}}],"session_duration":"8h"}))' "$ADMIN_EMAIL" "$OTP_ID")"
if [[ -n "$POLICY_ID" ]]; then
  POLICY_RESULT="$(api PUT "/accounts/$ACCOUNT_ID/access/apps/$APP_ID/policies/$POLICY_ID" "$POLICY_BODY")"
else
  POLICY_RESULT="$(api POST "/accounts/$ACCOUNT_ID/access/apps/$APP_ID/policies" "$POLICY_BODY")"
fi
printf '%s' "$POLICY_RESULT" | check_success || fail 'A tulajdonosi Access-szabály nem állítható be.'

printf '6/10 – Éles Wrangler-konfiguráció készítése…\n'
python3 - "$DB_ID" "$ADMIN_EMAIL" "$AUTH_DOMAIN" "$ACCESS_AUD" "$TMP_CONFIG" <<'PY'
import json,sys
from pathlib import Path
data=json.loads(Path('wrangler.jsonc').read_text(encoding='utf-8'))
data['d1_databases']=[{'binding':'LICENSE_DB','database_name':'formatx-license-db','database_id':sys.argv[1],'migrations_dir':'license-migrations'}]
data.setdefault('vars',{}).update({'ADMIN_EMAILS':sys.argv[2],'ACCESS_TEAM_DOMAIN':'https://'+sys.argv[3].removeprefix('https://').rstrip('/'),'ACCESS_AUD':sys.argv[4]})
Path(sys.argv[5]).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
PY
if [[ "$PERSIST_CONFIG" == "1" ]]; then
  cp -- "$TMP_CONFIG" "$ROOT_DIR/wrangler.jsonc"
  printf 'A D1- és Access-konfiguráció elmentve a tartós wrangler.jsonc fájlba.\n'
fi

printf '7/10 – Titkok és vészhelyzeti helyi jelszó…\n'
SECRET_LIST="$(npx wrangler secret list --config "$TMP_CONFIG" 2>/dev/null || true)"
set_secret_if_missing(){
  local name="$1" value="$2"
  if ! grep -q "\"name\"[[:space:]]*:[[:space:]]*\"$name\"" <<<"$SECRET_LIST"; then
    printf '%s' "$value" | npx wrangler secret put "$name" --config "$TMP_CONFIG" >/dev/null
  fi
}
set_secret_if_missing LICENSE_PEPPER "$(openssl rand -base64 48 | tr -d '\n')"
set_secret_if_missing ADMIN_SESSION_SECRET "$(openssl rand -base64 48 | tr -d '\n')"
if ! grep -q '"ADMIN_PASSWORD_RECORD"' <<<"$SECRET_LIST" || [[ "$RESET_PASSWORD" == "1" ]]; then
  FALLBACK_PASSWORD="$(openssl rand -base64 24 | tr -d '\n' | tr '/+' 'AZ')"
  PASSWORD_RECORD="$(python3 -c 'import base64,hashlib,os,sys; pw=sys.argv[1].encode(); salt=os.urandom(24); iterations=600000; derived=hashlib.pbkdf2_hmac("sha256",pw,salt,iterations,dklen=32); b64=lambda b:base64.urlsafe_b64encode(b).decode().rstrip("="); print(f"v1:{iterations}:{b64(salt)}:{b64(derived)}")' "$FALLBACK_PASSWORD")"
  printf '%s' "$PASSWORD_RECORD" | npx wrangler secret put ADMIN_PASSWORD_RECORD --config "$TMP_CONFIG" >/dev/null
  umask 077
  cat > "$LOGIN_FILE" <<EOF
FormatX tulajdonosi licenckezelő
Cím: $ADMIN_URL
Admin e-mail: $ADMIN_EMAIL
Vészhelyzeti helyi jelszó: $FALLBACK_PASSWORD

Elsődleges belépés: Cloudflare Access egyszer használatos e-mail-kód.
A helyi jelszó csak tartalék, ne küldd el másnak.
EOF
  chmod 600 "$LOGIN_FILE"
fi

printf '8/10 – D1 migráció, dry-run és telepítés…\n'
npx wrangler d1 migrations apply "$DB_NAME" --remote --config "$TMP_CONFIG"
rm -rf .wrangler-license-dry-run
npx wrangler deploy --dry-run --config "$TMP_CONFIG" --outdir .wrangler-license-dry-run
npx wrangler deploy --config "$TMP_CONFIG"
rm -rf .wrangler-license-dry-run

printf '9/10 – Élő licenc-API ellenőrzése…\n'
status=''
for attempt in $(seq 1 24); do
  status="$(curl -sS -o /tmp/formatx-license-health.json -w '%{http_code}' --max-time 20 -H 'Cache-Control: no-cache' "$HEALTH_URL" || true)"
  if [[ "$status" == '200' ]] && python3 -c 'import json; o=json.load(open("/tmp/formatx-license-health.json")); assert o.get("ok") is True' 2>/dev/null; then break; fi
  sleep 5
done
[[ "$status" == '200' ]] || fail "A licenc-API nem állt fel. HTTP: ${status:-nincs válasz}"

printf '10/10 – Adminvédelem ellenőrzése…\n'
admin_status="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 -H 'Cache-Control: no-cache' "$ADMIN_URL" || true)"
case "$admin_status" in 200|302|303) ;; *) fail "Az adminfelület váratlan HTTP-állapotot adott: $admin_status";; esac

printf '\n============================================================\n'
printf ' KÉSZ – a FormatX licenckezelő élő\n'
printf ' Admin: %s\n' "$ADMIN_URL"
printf ' Belépés: %s + egyszer használatos e-mail-kód\n' "$ADMIN_EMAIL"
printf ' Tartalék belépési adat: %s\n' "$LOGIN_FILE"
printf ' API: %s\n' "$HEALTH_URL"
printf '============================================================\n'