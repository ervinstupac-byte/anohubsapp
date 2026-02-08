# RELEASE NC‑200

## Scope
- Unified OptimizationHUD across dashboards using the central telemetry store and hill‑chart optimizer.
- Guest Audit walkthrough executed across demo and dashboards.
- Final coupling verification completed with [OK]/[BROKEN] statuses.

## Changes
- Shared HUD component: src/shared/components/hud/OptimizationHUD.tsx
- Integration:
  - ExecutiveDashboard: src/components/dashboard/ExecutiveDashboard.tsx
  - UniversalTurbineDashboard: src/components/UniversalTurbineDashboard.tsx

## Verification
- Lint: pass (tsc --noEmit)
- Tests: pass (31 test files, 97 tests)

## Coupling Status
- OptimizationHUD → useTelemetryStore + EfficiencyOptimizer [OK]
- ExecutiveDashboard → ForensicReportService.generateForensicDossier/openAndDownloadBlob [OK]
- UniversalTurbineDashboard → ForensicReportService.generateSovereignDiagnosticAudit/openAndDownloadBlob [OK]
- UniversalTurbineDashboard → DemoStorytellerService.runMasterDemo + telemetry updates [OK]
- PublicPortal → RCAService.analyze via scenario buttons [OK]
- ForensicLab → useDigitalLedger snapshots + ForensicReportService dossier export [OK]
- SafetyInterlockEngine status → UniversalTurbineDashboard interlock badge [OK]
- EngineeringValidation static API → ExecutiveDashboard validations [OK]

## Notes
- OptimizationHUD consumes net head, flow, and efficiency from useTelemetryStore and displays η, η_max, and Δ consistently across screens.
