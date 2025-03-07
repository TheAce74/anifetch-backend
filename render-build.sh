#!/usr/bin/env bash
set -o errexit  # Exit on error

pnpm install
pnpm build  # Uncomment if needed

# Define Puppeteer cache paths
PUPPETEER_CACHE_DIR=${PUPPETEER_CACHE_DIR:-/opt/render/.cache/puppeteer}
XDG_CACHE_HOME=${XDG_CACHE_HOME:-/opt/render/.cache}

# Ensure directories exist
mkdir -p "$PUPPETEER_CACHE_DIR"
mkdir -p "$XDG_CACHE_HOME/puppeteer"

# Store/pull Puppeteer cache with build cache
if [[ -d "$XDG_CACHE_HOME/puppeteer" && -n "$(ls -A "$XDG_CACHE_HOME/puppeteer")" ]]; then
  echo "...Copying Puppeteer Cache from Build Cache"
  cp -R "$XDG_CACHE_HOME/puppeteer/." "$PUPPETEER_CACHE_DIR"
else
  echo "...Storing Puppeteer Cache in Build Cache"
  cp -R "$PUPPETEER_CACHE_DIR/." "$XDG_CACHE_HOME/puppeteer"
fi
