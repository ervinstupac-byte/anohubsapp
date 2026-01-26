# PowerShell version of set-github-secrets
# Run in PowerShell with the environment variables set:
# $env:GITHUB_REPO = 'owner/repo'
# $env:VITE_SUPABASE_URL = 'https://...supabase.co'
# $env:VITE_SUPABASE_ANON_KEY = 'new_anon_key'
# $env:VITE_GEMINI_API_KEY = 'new_gemini_key' (optional)

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "gh CLI not found. Install it: https://cli.github.com/"
  exit 1
}

$repo = $env:GITHUB_REPO
if ([string]::IsNullOrWhiteSpace($repo)) {
  Write-Error "Please set environment variable GITHUB_REPO=owner/repo"
  exit 1
}

if ([string]::IsNullOrWhiteSpace($env:VITE_SUPABASE_URL) -or [string]::IsNullOrWhiteSpace($env:VITE_SUPABASE_ANON_KEY)) {
  Write-Error "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables"
  exit 1
}

gh secret set VITE_SUPABASE_URL -R $repo --body $env:VITE_SUPABASE_URL
gh secret set VITE_SUPABASE_ANON_KEY -R $repo --body $env:VITE_SUPABASE_ANON_KEY

if (-not [string]::IsNullOrWhiteSpace($env:VITE_GEMINI_API_KEY)) {
  gh secret set VITE_GEMINI_API_KEY -R $repo --body $env:VITE_GEMINI_API_KEY
}

if (-not [string]::IsNullOrWhiteSpace($env:CODECOV_TOKEN)) {
  gh secret set CODECOV_TOKEN -R $repo --body $env:CODECOV_TOKEN
}

Write-Host "Secrets set for repo: $repo" -ForegroundColor Green
