#!/usr/bin/env bash
# Quickstart script for VERINEX AI — AICTE Case Coordination Intelligence System
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

export PATH="$DIR/.tools/bin:$PATH"

echo "================================================================="
echo "   VERINEX AI — AICTE Case Coordination Intelligence System     "
echo "   Smart India Hackathon 2026 | Team ID: 197631 | SIH26264      "
echo "================================================================="

if [ "$1" == "--dev" ]; then
    echo "Starting Vite Development Server..."
    npm run dev
elif [ "$1" == "--python" ]; then
    echo "Starting Python Flask Server..."
    ./venv/bin/python3 server.py
else
    echo "Building production bundle..."
    npm run build
    echo ""
    echo "Starting production server on http://localhost:3000..."
    ./venv/bin/python3 server.py
fi

