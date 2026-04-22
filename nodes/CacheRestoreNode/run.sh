#!/bin/sh
set -eu


if [ -z "${MINCY_SERVER:-}" ] || [ -z "${MINCY_TOKEN:-}" ] || [ -z "${MINCY_PROJECT_ID:-}" ]; then
  echo "ERROR: MINCY_SERVER / MINCY_TOKEN / MINCY_PROJECT_ID must be set by the agent"
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "Installing curl..."
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update && apt-get install -y curl >/dev/null 2>&1
  elif command -v apk >/dev/null 2>&1; then
    apk add --no-cache curl >/dev/null 2>&1
  else
    echo "ERROR: curl is required but no supported package manager found"
    exit 1
  fi
fi
NAME="${CACHE_KEY:-cache}"

echo "Getting signed URL for $MINCY_SERVER/api/agents/caches"

BODY_FILE="$(mktemp)"
STATUS=$(curl -sS -G \
  -o "$BODY_FILE" \
  -w "%{http_code}" \
  -H "Authorization: Bearer $MINCY_TOKEN" \
  --data-urlencode "project_id=$MINCY_PROJECT_ID" \
  --data-urlencode "key=${NAME}" \
  "$MINCY_SERVER/api/agents/caches" || echo "000")

case "$STATUS" in
  2??)
    URL=$(sed -n 's/.*"url":"\([^"]*\)".*/\1/p' "$BODY_FILE")
    rm -f "$BODY_FILE"
    ;;
  404)
    echo "No cache found for key: $NAME. Continuing without cache..."
    rm -f "$BODY_FILE"
    exit 0
    ;;
  *)
    echo "ERROR: cache lookup failed (HTTP $STATUS)"
    cat "$BODY_FILE"
    rm -f "$BODY_FILE"
    exit 1
    ;;
esac

if [ -z "$URL" ]; then
  echo "ERROR: 200 OK but no url field in response"
  exit 1
fi

TMP_FILE="$(mktemp)"
curl -fsS -o "$TMP_FILE" "$URL"
# Extract at / — save wrote paths relative to /, so this restores them in place.
echo "Extracting cache '$NAME' to original paths"
tar -xzf "$TMP_FILE" -C / --no-same-owner
rm -f "$TMP_FILE"
echo "Restored cache: $NAME"
