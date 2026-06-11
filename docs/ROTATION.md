Rotation and automation

## Anon key

Use the Supabase Console to rotate the anon key: Project → Settings → API → Regenerate anon key.

After you generate a new key, update your repository secrets so CI and hosts use the new value.

## Service role key

Rotate after any admin script, migration, or incident that may have exposed `SUPABASE_SERVICE_ROLE_KEY`:

1. Supabase Console → Settings → API → **Regenerate** service_role key.
2. Update locally: `.env.local` (`SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_KEY` if scripts use that alias).
3. Update CI: GitHub Actions secrets `SUPABASE_KEY` / `SUPABASE_SERVICE_ROLE_KEY`.
4. Update hosting: Vercel (or other) production/preview env vars — never expose service role to `VITE_*` client vars.
5. Re-run any server scripts that cached the old key (`generate_forensic_pdf.js`, `persist_test.cjs`, etc.).
6. Log: date, operator, reason (e.g. "post-RLS staging apply").

The repo contains helper scripts that call the GitHub CLI (`gh`) to set secrets locally.

Usage (bash):

```bash
# Authenticate with GitHub CLI first: gh auth login
export GITHUB_REPO=ervinstupac-byte/anohubsapp
export VITE_SUPABASE_URL=https://cplfoowmdakqzoljuwcf.supabase.co
export VITE_SUPABASE_ANON_KEY="NEW_SUPABASE_KEY"
export VITE_GEMINI_API_KEY="NEW_GEMINI_KEY"
./scripts/set-github-secrets.sh
```

Usage (PowerShell):

```powershell
# $env:GITHUB_REPO = 'ervinstupac-byte/anohubsapp'
# $env:VITE_SUPABASE_URL = 'https://cplfoowmdakqzoljuwcf.supabase.co'
# $env:VITE_SUPABASE_ANON_KEY = 'NEW_SUPABASE_KEY'
# $env:VITE_GEMINI_API_KEY = 'NEW_GEMINI_KEY'
./scripts/set-github-secrets.ps1
```

Notes:

- Do not paste sensitive keys into chat or commit them into the repository.
- The scripts require `gh` to be installed and authenticated.
- If you want help updating hosting provider variables, tell me which provider (Vercel/Netlify) and provide tokens or run the provider CLI locally.
