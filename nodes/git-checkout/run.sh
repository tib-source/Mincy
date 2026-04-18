#!/bin/sh
set -eu

if [ -z "${REPO_URL:-}" ]; then
  echo "ERROR: REPO_URL is not set"
  exit 1
fi

REF="${REF:-main}"
DEPTH="${CLONE_DEPTH:-1}"

# Install git if not available
if ! command -v git >/dev/null 2>&1; then
  echo "Installing git..."
  apt-get update && apt-get install -y git >/dev/null 2>&1
fi

echo "Git version: $(git --version)"
echo "Cloning (ref: $REF, depth: $DEPTH)"

git clone --branch "$REF" --depth "$DEPTH" --single-branch "$REPO_URL" /workspace

cd /workspace
SHORT_SHA=$(git rev-parse --short HEAD)
echo "Checked out $SHORT_SHA on $REF"
ls -la