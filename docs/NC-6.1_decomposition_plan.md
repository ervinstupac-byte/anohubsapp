**NC-6.1: ExecutiveDashboard & ForensicReportService Decomposition Plan**

Goal: split each monster into 4–5 focused modules to improve testability, separation of concerns, and replace UI-side heavy work with services/workers.

ExecutiveDashboard.tsx -> target modules
- `ExecutiveDashboard` (UI shell): presentational component only — renders panels and delegates actions/events to services.
- `dashboard/dataProviders`:
  - `ProjectStateAdapter` — reads canonical `ProjectStateManager` and exposes memoized selectors (pure functions) and subscription hooks.
  - `ForecastProvider` — encapsulates AI forecast calls (`aiPredictionService`) and cache retrieval (supabase). Returns Promise/observable and abstracts retry/fallback.
- `dashboard/featureControllers`:
  - `ForensicController` — orchestrates `ForensicReportService` invocation (delegates PDF creation to worker/service), handles download/telemetry logging.
  - `ExpertLoopController` — encapsulates `ExpertFeedbackLoop` interactions and exposes simple callbacks.
- `dashboard/ui`:
  - small presentational subcomponents (PeltonPreviewCard, LogisticsPreviewCard, BrakePreviewCard) each <150 LOC, purely presentational.

ForensicReportService.ts -> target modules
- `forensics/template` — report templating & layout primitives (JS functions to assemble data structures used by renderer).
- `forensics/renderer` — PDF rendering engine wrappers (jsPDF + autotable). Pure rendering from templated data.
- `forensics/snapshot` — image capture helper (html2canvas wrapper) — isolated, returns DataURL or throws well-typed errors.
- `forensics/signature` — digital signature utilities (generateSignature) and key/engine abstractions.
- `forensics/runner` — orchestrator that composes template + snapshot + render + persist; intended to run in a background worker or serverless job.

Migration & Execution Notes
- Move heavy `generateForensicDossier` work into `forensics/runner` and call from UI via `ForensicController` which triggers a background job (serverless or worker thread).
- Provide robust typed interfaces between modules; add unit tests for `template`, `renderer`, and `signature`.

Priority refactor plan (stepwise):
1. Create `forensics/template` and `forensics/signature` modules; keep current service delegating to them (no external behavior change).
2. Extract `snapshot` wrapper and ensure it returns stable DataURL or fails with descriptive error.
3. Move rendering to `forensics/renderer` and ensure it accepts preformatted data and snapshot image.
4. Introduce `forensics/runner` as async worker target; update `ForensicReportService.generateForensicDossier` to call runner (later change to remote job).
5. Break `ExecutiveDashboard` into presentational + controllers; replace in-component logic with calls to `ForecastProvider` and `ForensicController`.

Testing & CI
- Add unit tests for each new module and a high-level integration test for the runner in Node environment.
- Run `npm run test` after each extraction step.

Risks & Mitigations
- Temporary duplication: for safety initial refactors will be wrappers delegating to original methods until fully validated.
- DB/API contract changes: ensure `ForensicController` validates inputs and falls back to safe responses.
