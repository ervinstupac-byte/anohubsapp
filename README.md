<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1zgDE7SyHUytzj4hoREdr3YUoYebyO9bl

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create a `.env.local` file at the project root with the following variables (replace values with your keys), or copy `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` to set your values.

   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   - Note: All `VITE_` variables are built into the client bundle and therefore public. Do not store private server secrets in them.
   - If you are deploying to a hosting provider, configure the same `VITE_` variables in your provider's environment settings.
   - Important: Do not commit `.env.local` or any file containing your credentials. If you already have an `.env` file committed with keys, remove it from the repo and rotate the keys immediately.
   - If you previously committed `.env`, untrack it and commit the change so it won't be included in future commits. From the project root run:

   ```bash
   git rm --cached .env
   git add .gitignore
   git commit -m "Remove committed .env and add to .gitignore"
   git push
   ```

   - If you need to scrub the file from the repository history (irreversible), use a history rewriting tool such as `git filter-repo` or the BFG Repo-Cleaner and then force-push. Example using `git filter-repo`:

   ```bash
   # Install: https://github.com/newren/git-filter-repo
   git filter-repo --path .env --invert-paths
   # Then force push to your remote (WARNING: rewrites history)
   git push --force
   ```

   - Only perform a history rewrite if you understand the consequences (will change commit hashes and require collaborators to rebase or re-clone). If you'd like, I can help with that offline.

## Setting repository secrets (GitHub Actions)

To include environment variables for CI or deployments, add them via the repository Settings → Secrets → Actions, or via GitHub CLI:

```bash
# Using the GitHub CLI
gh secret set VITE_SUPABASE_URL --body "https://your-supabase-url.supabase.co"
gh secret set VITE_SUPABASE_ANON_KEY --body "your_supabase_anon_key"
gh secret set VITE_GEMINI_API_KEY --body "your_gemini_api_key"
gh secret set CODECOV_TOKEN --body "your_codecov_token"
```

After setting these, the CI workflow will use `secrets.CODECOV_TOKEN` if present to publish coverage, and `GITHUB_TOKEN` is used by the deployment action.

## Deploying to GitHub Pages

The repository is configured to deploy to GitHub Pages using the `gh-pages` branch. You can deploy manually using the npm script:

```bash
npm run deploy
```

Or let the CI automatically deploy on push to `main` (the workflow uses `GITHUB_TOKEN`). If you want PR previews, consider using Vercel or Netlify which automatically create preview deploys per PR.


3. Run the app in development:
   `npm run dev`

4. Build for production:
   `npm run build`
   and preview locally with:
   `npm run preview`
