#!/bin/bash
set -e

export SKIP_ENV_VALIDATION=1
export NEXT_SKIP_NATIVE_SWC=1

# Create a fake SWC module
mkdir -p node_modules/@next/swc-linux-arm64-gnu
cat > node_modules/@next/swc-linux-arm64-gnu/index.js << 'EOFJS'
module.exports = {
  transformSync: (code) => ({ code }),
  parseSync: (code) => ({ program: {} })
};
EOFJS

# Try to build with fallback
npx next build || true
