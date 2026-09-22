#!/usr/bin/env bash
#
#   ./.github/scripts/deploy-vercel.sh production
#
# Build and deploy site/ to Vercel, from the repository root. Root Directory
# (site/), framework and Node version live in the Vercel project and arrive
# with `vercel pull`.
#
# Needs VERCEL_TOKEN, VERCEL_ORG_ID and VERCEL_PROJECT_ID. The two IDs stand
# in for the gitignored .vercel/project.json — without them `vercel pull
# --yes` would happily link a NEW project rather than this one, so they are
# checked rather than assumed. SITE_URL, if set, is reported as the public
# address; the deployment hostname Vercel returns is behind its SSO.

set -euo pipefail

target="${1:?usage: deploy-vercel.sh production|preview}"
: "${VERCEL_TOKEN:?}" "${VERCEL_ORG_ID:?}" "${VERCEL_PROJECT_ID:?}"

vc() { pnpm dlx vercel@59.17.0 "$@" --token="$VERCEL_TOKEN"; }

vc pull --yes --environment="$target"
vc build --target="$target"
url=$(vc deploy --prebuilt --target="$target" | tail -n 1)

echo "deployed $target: ${SITE_URL:-$url}"
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "url=${SITE_URL:-$url}" >> "$GITHUB_OUTPUT"
fi
