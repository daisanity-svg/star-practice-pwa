#!/usr/bin/env bash
set -o pipefail
cd /Users/aiuser/AI-Workspace/projects/star-game
echo "PWD=$(pwd)"
node -v
npm -v
echo "--- npm run typecheck ---"
npm run typecheck
echo "--- npm run lint ---"
npm run lint
echo "--- npm run build ---"
npm run build
