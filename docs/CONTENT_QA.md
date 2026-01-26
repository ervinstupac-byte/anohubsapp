**Content QA & Storybook**

Steps to run locally:

- Run unit tests (includes i18n sanity check):
  ```bash
  npm run test
  ```

- Run the i18n check directly:
  ```bash
  npm run check-i18n
  ```

- Start Storybook (visual content review):
  ```bash
  npm run storybook
  ```
  Note: If Storybook CLI fails locally due to environment or version mismatches, CI will verify `build-storybook` on push/PR.

CI:
- The `Content QA` workflow runs on PRs and `main` and will run tests, the i18n check, and build Storybook.

How this helps:
- Unit tests assert important UI copy is present and prevent accidental removal.
- `check-i18n` ensures translation files (when present) don't contain empty strings.
- Storybook provides a visual surface for content reviewers and translators.
