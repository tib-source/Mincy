#!/bin/sh
set -eu

if [ -z "${CACHE_PATH:-}" ] || [ -z "${CACHE_KEY:-}" ]; then
  echo "ERROR: CACHE_PATH and CACHE_KEY must be set"
  exit 1
fi
if [ -z "${MINCY_SERVER:-}" ] || [ -z "${MINCY_TOKEN:-}" ] || [ -z "${MINCY_PROJECT_ID:-}" ]; then
  echo "ERROR: MINCY_SERVER / MINCY_TOKEN / MINCY_PROJECT_ID must be set by the agent"
  exit 1
fi

if [ ! -e "$CACHE_PATH" ]; then
  echo "Nothing to cache: $CACHE_PATH does not exist. Skipping."
  exit 0
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

# Archive relative to / so absolute paths round-trip on restore.
case "$CACHE_PATH" in
  /*) REL="${CACHE_PATH#/}" ;;
  *)  echo "ERROR: CACHE_PATH must be absolute (got: $CACHE_PATH)"; exit 1 ;;
esac

TMP_FILE="$(mktemp)"

echo "Archiving $CACHE_PATH"
tar -czf "$TMP_FILE" -C / "$REL"

SIZE=$(stat -c%s "$TMP_FILE" 2>/dev/null || stat -f%z "$TMP_FILE")
echo "  size: $SIZE bytes"

echo "Uploading cache '$CACHE_KEY' to $MINCY_SERVER/api/agents/caches"
curl -fsS -X POST \
  -H "Authorization: Bearer $MINCY_TOKEN" \
  -F "project_id=$MINCY_PROJECT_ID" \
  -F "key=$CACHE_KEY" \
  -F "file=@$TMP_FILE;type=application/gzip" \
  "$MINCY_SERVER/api/agents/caches"

rm -f "$TMP_FILE"
echo
echo "Saved cache: $CACHE_KEY"
