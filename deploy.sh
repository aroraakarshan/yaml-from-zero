#!/usr/bin/env bash
set -euo pipefail

echo "==> Building with BASE_PATH=/yaml-from-zero..."
BASE_PATH=/yaml-from-zero npx vite build

echo "==> Deploying to Cloudflare Workers..."
npx wrangler deploy

echo "==> Done. Verify at https://courses.akarshanarora.com/yaml-from-zero/"
