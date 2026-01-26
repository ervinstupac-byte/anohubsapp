**Archive Manifest — /public and /src/shared audit**

Summary: This manifest lists flagged files and folders in `public/` and `src/shared/` that are either archival, generated inputs, or potentially unused. It includes size, modification timestamp, folder counts and references found in the repository.

- **public/Turbine_Grouped.svg** (file)
  - Size: 3,663,300 bytes
  - Modified: 2026-01-22T15:50:23.3855377+01:00
  - References: `scripts/group_svg.js`, `scripts/inspect_svg.cjs`, `scripts/inspect_svg.js`, `src/components/dashboard/TurbineVisualNavigator.tsx`, `repomix-output.xml`, `gh_pages_files.txt`, `gh_pages_all_remote.txt`
  - Status: Active — used by UI and scripts. Keep in place.

- **public/Gemini_Generated_Image_pk5hl3pk5hl3pk5h (1).svg** (file)
  - Size: 3,646,553 bytes
  - Modified: 2026-01-22T15:50:23.3810298+01:00
  - References: `scripts/group_svg.js`, `group_svg.js`, `repomix-output.xml`, `gh_pages_files.txt`, `gh_pages_all_remote.txt`
  - Status: Generated input — candidate for archival to `docs/archive/` (not used at runtime directly).

- **public/technical_whitepaper.html** (file)
  - Size: 11,045 bytes
  - Modified: 2026-01-22T15:50:24.1744771+01:00
  - References: `scripts/verify_nc102_integrity.js`, `scripts/verify_nc102_integrity.cjs`, `scripts/reports/nc102_integrity_report.json`
  - Status: Documentation — consider converting to Markdown under `/docs` or keep in `public/` if served.

- **public/francis-blueprint.jpg** (file)
  - Size: 385,757 bytes
  - Modified: 2026-01-22T15:50:24.0769658+01:00
  - Status: Visual asset; verify UI references before archiving.

- **public/francis_runner_info.svg** (file)
  - Size: 4,251,947 bytes
  - Modified: 2026-01-22T15:50:24.1654765+01:00
  - Status: Visual asset; verify UI references.

- **public/assets/schematics/francis-h5/main-hall.svg** (file)
  - Size: 3,663,228 bytes
  - Modified: 2026-01-22T15:50:24.0739663+01:00
  - References: `gh_pages_files.txt`, `gh_pages_all_remote.txt`
  - Status: Likely used by schematics viewer; verify runtime usage.

- **public/assets/schematics/francis-h5/main-hall-grouped.svg** (file)
  - Size: 3,666,668 bytes
  - Modified: 2026-01-22T15:50:24.0709658+01:00
  - References: `gh_pages_files.txt`, `gh_pages_all_remote.txt`
  - Status: Same as above.

- **src/shared/design-tokens.ts** (file)
  - Size: 4,502 bytes
  - Modified: 2026-01-22T15:50:24.6218088+01:00
  - References: No direct code references found by text search (may be imported dynamically or not used).
  - Status: Keep; if unused, canonicalize or remove after verification.

Folder summaries:

- **public/archive** (folder)
  - File count: 855
  - Total bytes: 13,279,772
  - Notes: protocol & insight HTML snapshots; candidate for archival to an external storage or `docs/archive/`.

- **public/archive.__bak__1768747356701** (folder)
  - File count: 855
  - Total bytes: 11,767,653
  - Notes: historical backup; low runtime relevance. Archive or compress.

- **public/francis-docs** (folder)
  - File count: 64
  - Total bytes: 1,206,537
  - References: `src/components/francis/SOPViewer.tsx` + many repomix entries
  - Notes: Served docs via `SOPViewer` — convert to canonical `/docs` markdown or keep as static HTML served from `/francis-docs` depending on desired doc workflow.

- **public/artifacts** (folder)
  - File count: 1
  - Total bytes: 12,171
  - Notes: CI diagnostic artifacts — should be stored outside repo or gitignored.

Recommendations (next steps):
1. I can generate a full CSV manifest (done) and a compact `docs/archive_manifest.md` (done). Review and approve moves.
2. If you approve, I can:
   - Move high-confidence legacy files into `docs/archive/` (safe move), e.g., `public/archive.__bak__1768747356701`, `public/Gemini_Generated_Image_*`.
   - Convert or relocate `public/francis-docs/` to `docs/francis-docs/` (preserve links) and update `SOPViewer` routing if needed.
   - Add `public/artifacts/` and `artifacts/` to `.gitignore` and provide a small script to upload artifacts externally.

Which next action do you want: (A) I should move the high-confidence legacy items into `docs/archive/` now, (B) only produce this manifest for review (no moves), or (C) produce expanded manifest (every file in `public/`) before moves? 
