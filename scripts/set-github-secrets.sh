#!/usr/bin/env bash
# Usage: Ensure gh CLI is installed and authenticated (gh auth login)
# Then set environment variables and run this script:
#   export GITHUB_REPO=owner/repo
#   export VITE_SUPABASE_URL=https://...supabase.co
#   export VITE_SUPABASE_ANON_KEY=your_new_anon_key
#   export VITE_GEMINI_API_KEY=your_new_gemini_key
#   ./scripts/set-github-secrets.sh

set -euo pipefail

if ! command -v gh >/dev/null; then
  echo "gh CLI not found. Install from https://cli.github.com/"
  exit 1
fi

REPO=${GITHUB_REPO:-}
if [[ -z "$REPO" ]]; then
  echo "Please set GITHUB_REPO, e.g. export GITHUB_REPO=owner/repo"
  exit 1
fi

if [[ -z "${VITE_SUPABASE_URL:-}" || -z "${VITE_SUPABASE_ANON_KEY:-}" ]]; then
  echo "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment before running this script"
  exit 1
fi

# Set the repository secrets
gh secret set VITE_SUPABASE_URL -R "$REPO" --body "$VITE_SUPABASE_URL"
gh secret set VITE_SUPABASE_ANON_KEY -R "$REPO" --body "$VITE_SUPABASE_ANON_KEY"

# Optional
if [[ -n "${VITE_GEMINI_API_KEY:-}" ]]; then
  gh secret set VITE_GEMINI_API_KEY -R "$REPO" --body "$VITE_GEMINI_API_KEY"
fi

# Optional Codecov token
if [[ -n "${CODECOV_TOKEN:-}" ]]; then
  gh secret set CODECOV_TOKEN -R "$REPO" --body "$CODECOV_TOKEN"
fi

if [[ -n "${VERCEL_TOKEN:-}" && -n "${VERCEL_PROJECT:-}" ]]; then
  echo "Vercel token provided; set it in Vercel environment using Vercel CLI if desired"
fi

echo "Secrets set for repo: $REPO"
