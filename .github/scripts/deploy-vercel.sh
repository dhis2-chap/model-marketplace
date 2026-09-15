#!/usr/bin/env bash
#
# Build and deploy site/ to Vercel.
#
#   ./.github/scripts/deploy-vercel.sh production   # promote to the live domains
#   ./.github/scripts/deploy-vercel.sh preview      # throwaway preview URL
#
# Runs from the repository root. The project's Root Directory (site/) and its
# build settings live in the Vercel project itself and arrive with
# `vercel pull`, so nothing here duplicates them.
#
# Required environment: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID.
# The two IDs are what stand in for the gitignored .vercel/project.json.

set -euo pipefail

target="${1:-preview}"
case "$target" in
  production|preview) ;;
  *) echo "usage: $(basename "$0") [production|preview]" >&2; exit 2 ;;
esac

: "${VERCEL_TOKEN:?not set — add it as a repository secret}"
: "${VERCEL_ORG_ID:?not set — see .vercel/project.json, field orgId}"
: "${VERCEL_PROJECT_ID:?not set — see .vercel/project.json, field projectId}"

# Pinned so a CLI release cannot change what a push to main does.
cli="vercel@${VERCEL_CLI_VERSION:-59.17.0}"

vc() { pnpm dlx "$cli" "$@" --token="$VERCEL_TOKEN"; }

echo "::group::vercel pull ($target)"
vc pull --yes --environment="$target"
echo "::endgroup::"

# The same `next build` that CI runs: the YAML goes through the zod schema,
# so invalid registry data fails here rather than reaching the live site.
echo "::group::vercel build ($target)"
vc build --target="$target"
echo "::endgroup::"

# Only the deployment URL goes to stdout; tail guards against any install
# chatter pnpm dlx may add ahead of it.
echo "::group::vercel deploy ($target)"
url=$(vc deploy --prebuilt --target="$target" | tail -n 1)
echo "::endgroup::"

# $url is the immutable deployment hostname, which sits behind Vercel's
# deployment protection — it 302s to an SSO login, so it is the wrong thing to
# hand a reader. The aliases are the public entry points; take the shortest,
# which is the custom domain rather than the scope-suffixed one. Fail soft: if
# the lookup gives nothing, the deployment URL is still a true answer.
public_url="$url"
alias_host=$(vc inspect "$url" --json 2>/dev/null \
  | jq -r '[.aliases[]?] | min_by(length) // empty') || alias_host=""
if [ -n "$alias_host" ]; then
  public_url="https://$alias_host"
fi

echo "deployed $target: $public_url (deployment: $url)"
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    echo "Deployed **$target** — <$public_url>"
    echo ""
    echo "Deployment: \`$url\`"
  } >> "$GITHUB_STEP_SUMMARY"
fi
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  # `url` is what the GitHub deployment record links to, so it is the public
  # one; the immutable deployment stays available under its own name.
  echo "url=$public_url" >> "$GITHUB_OUTPUT"
  echo "deployment_url=$url" >> "$GITHUB_OUTPUT"
fi
