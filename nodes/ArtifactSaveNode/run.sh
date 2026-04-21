#!/bin/sh
set -eu

if [ -z "${ARTIFACT_PATH:-}" ]; then
  echo "ERROR: ARTIFACT_PATH is not set"
  exit 1
fi
if [ -z "${MINCY_SERVER:-}" ] || [ -z "${MINCY_TOKEN:-}" ] || [ -z "${MINCY_RUN_ID:-}" ]; then
  echo "ERROR: MINCY_SERVER / MINCY_TOKEN / MINCY_RUN_ID must be set by the agent"
  exit 1
fi

cd /workspace

if [ ! -e "$ARTIFACT_PATH" ]; then
  echo "ERROR: $ARTIFACT_PATH does not exist in the workspace"
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

NAME="${ARTIFACT_NAME:-$(basename "$ARTIFACT_PATH")}"
TMP_FILE="$(mktemp)"

echo "Archiving $ARTIFACT_PATH → $NAME.tar.gz"
tar -czf "$TMP_FILE" "$ARTIFACT_PATH"

SIZE=$(stat -c%s "$TMP_FILE" 2>/dev/null || stat -f%z "$TMP_FILE")
echo "  size: $SIZE bytes"

echo "Uploading to $MINCY_SERVER/api/agents/artifacts"
curl -fsS -X POST \
  -H "Authorization: Bearer $MINCY_TOKEN" \
  -F "run_id=$MINCY_RUN_ID" \
  -F "step_id=${MINCY_STEP_ID:-}" \
  -F "name=${NAME}.tar.gz" \
  -F "file=@$TMP_FILE;type=application/gzip" \
  "$MINCY_SERVER/api/agents/artifacts"

rm -f "$TMP_FILE"
echo
echo "Saved artifact: $NAME"
