#!/usr/bin/env bash
set -euo pipefail

origin=${1:?Pass the public HTTPS origin}
if [[ "$origin" != https://* ]]; then
  echo "Smoke target must use HTTPS" >&2
  exit 1
fi

get() {
  curl --fail --silent --show-error --max-time 20 "$origin$1"
}

post() {
  curl --fail --silent --show-error --max-time 20 \
    --header 'Content-Type: application/json' \
    --data "$2" \
    "$origin/api-proxy$1"
}

get /healthz | jq -e '.status == "ok" and .service == "frontend"' >/dev/null
get /api-proxy/api/health | jq -e '.status == "ok" and .service == "api"' >/dev/null

post /api/json/format '{"json":"{\"a\":1}"}' | jq -e '.result | contains("\"a\": 1")' >/dev/null
post /api/json/validate '{"json":"{\"a\":1}"}' | jq -e '.valid == true' >/dev/null
post /api/json/minify '{"json":"{ \"a\": 1 }"}' | jq -e '.result == "{\"a\":1}"' >/dev/null
post /api/encoding/base64/encode '{"value":"hello"}' | jq -e '.result == "aGVsbG8="' >/dev/null
post /api/encoding/base64/decode '{"value":"aGVsbG8="}' | jq -e '.result == "hello"' >/dev/null
post /api/encoding/url/encode '{"value":"hello world"}' | jq -e '.result == "hello%20world"' >/dev/null
post /api/encoding/url/decode '{"value":"hello%20world"}' | jq -e '.result == "hello world"' >/dev/null
post /api/security/hash '{"value":"hello","algorithm":"SHA256"}' | jq -e '.result == "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"' >/dev/null
post /api/security/jwt/decode '"eyJhbGciOiJub25lIn0.eyJzdWIiOiJkZW1vIn0."' | jq -e '.payload.sub == "demo"' >/dev/null
post /api/generator/uuid '{}' | jq -e '.result | test("^[0-9a-fA-F-]{36}$")' >/dev/null

headers=$(curl --silent --show-error --head --max-time 20 "$origin/tools/json/formatter")
for name in content-security-policy x-frame-options x-content-type-options strict-transport-security; do
  if ! grep -iq "^$name:" <<< "$headers"; then
    echo "Missing security header: $name" >&2
    exit 1
  fi
done

echo "Public origin, API routes, and security headers passed: $origin"
