#!/usr/bin/env bash
set -o errexit  # Exit on error

pnpm install
pnpm build  # Uncomment if needed

# Define Puppeteer cache paths
PUPPETEER_CACHE_DIR=${PUPPETEER_CACHE_DIR:-/opt/render/.cache/puppeteer}
XDG_CACHE_HOME=${XDG_CACHE_HOME:-/opt/render/.cache}
BUILD_CACHE_DIR="$XDG_CACHE_HOME/puppeteer"

# Ensure directories exist
mkdir -p "$PUPPETEER_CACHE_DIR"
mkdir -p "$BUILD_CACHE_DIR"

# Only copy if the source and destination are different
if [[ -d "$BUILD_CACHE_DIR" && -n "$(ls -A "$BUILD_CACHE_DIR")" && "$BUILD_CACHE_DIR" != "$PUPPETEER_CACHE_DIR" ]]; then
  echo "...Copying Puppeteer Cache from Build Cache"
  rsync -a "$BUILD_CACHE_DIR/" "$PUPPETEER_CACHE_DIR/"
else
  echo "...Storing Puppeteer Cache in Build Cache"
  rsync -a "$PUPPETEER_CACHE_DIR/" "$BUILD_CACHE_DIR/"
fi
