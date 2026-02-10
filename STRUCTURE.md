# Project Structure

```
src/
├── __tests__
│   ├── audit-trail.test.ts
│   ├── sovereign-math-stress.test.ts
│   ├── sovereign-math.test.ts
│   ├── stress_integrity.test.ts
│   ├── turbine-math.test.ts
│   └── ui-smoke.test.tsx
├── AnoHub_site
│   ├── case-studies
│   │   ├── cs-compliance-shield
│   │   │   └── index.html
│   │   ├── cs-digital-protocol-roi
│   │   │   └── index.html
│   │   ├── cs-fish-passage-optimization
│   │   │   └── index.html
│   │   ├── cs-forensic-ndt-fatigue
│   │   │   └── index.html
│   │   ├── cs-francis-misalignment
│   │   │   └── index.html
│   │   ├── cs-hydraulic-hammer-mitigation
│   │   │   └── index.html
│   │   ├── cs-kaplan-optimization
│   │   │   └── index.html
│   │   ├── cs-lcc-procurement-audit
│   │   │   └── index.html
│   │   ├── cs-me-synergy-erosion
│   │   │   └── index.html
│   │   ├── cs-pelton-abrasion
│   │   │   └── index.html
│   │   ├── cs-predictive-maintenance-roi
│   │   │   └── index.html
│   │   ├── cs-shaft-system-stability
│   │   │   └── index.html
│   │   └── index.html
│   ├── insights
│   │   ├── article-1-engineering-immunity
│   │   │   └── index.html
│   │   ├── article-10-check-engine-light
│   │   │   └── index.html
│   │   ├── article-11-digital-twin
│   │   │   └── index.html
│   │   ├── article-12-me-synergy-audit
│   │   │   └── index.html
│   │   ├── article-13-sediment-silt
│   │   │   └── index.html
│   │   ├── article-14-3d-flow-analysis
│   │   │   └── index.html
│   │   ├── article-15-scada-ceo-gap
│   │   │   └── index.html
│   │   ├── article-16-ai-paradox
│   │   │   └── index.html
│   │   ├── article-17-cultural-betrayal
│   │   │   └── index.html
│   │   ├── article-2-low-bid
│   │   │   └── index.html
│   │   ├── article-3-winter-challenges
│   │   │   └── index.html
│   │   ├── article-4-dach-leadership
│   │   │   └── index.html
│   │   ├── article-5-human-sensor
│   │   │   └── index.html
│   │   ├── article-6-ticking-bomb
│   │   │   └── index.html
│   │   ├── article-7-fortress-maintenance
│   │   │   └── index.html
│   │   ├── article-8-symbiosis-standard
│   │   │   └── index.html
│   │   ├── article-9-holistic-view
│   │   │   └── index.html
│   │   └── index.html
│   ├── protocol
│   │   ├── anohub_alignment_v2
│   │   │   └── index.html
│   │   ├── anohub_asset_v2
│   │   │   └── index.html
│   │   ├── anohub_cavitation_v2
│   │   │   └── index.html
│   │   ├── anohub_core_v2
│   │   │   └── index.html
│   │   ├── anohub_cost_v2
│   │   │   └── index.html
│   │   ├── anohub_dam_v2
│   │   │   └── index.html
│   │   ├── anohub_flood_v2
│   │   │   └── index.html
│   │   ├── anohub_fluid_v2
│   │   │   └── index.html
│   │   ├── anohub_flux_v2
│   │   │   └── index.html
│   │   ├── anohub_global_v2
│   │   │   └── index.html
│   │   ├── anohub_iso_v2
│   │   │   └── index.html
│   │   ├── anohub_methodology_v2
│   │   │   └── index.html
│   │   ├── anohub_organization_v2
│   │   │   └── index.html
│   │   ├── anohub_payment_v2
│   │   │   └── index.html
│   │   ├── anohub_protocol_v2
│   │   │   └── index.html
│   │   ├── anohub_quality_v2
│   │   │   └── index.html
│   │   ├── anohub_repair_v2
│   │   │   └── index.html
│   │   ├── anohub_risk_v2
│   │   │   └── index.html
│   │   ├── anohub_security_v2
│   │   │   └── index.html
│   │   ├── anohub_seismic_v2
│   │   │   └── index.html
│   │   ├── anohub_standards_v2
│   │   │   └── index.html
│   │   ├── anohub_structural_v2
│   │   │   └── index.html
│   │   ├── anohub_thermal_v2
│   │   │   └── index.html
│   │   ├── anohub_turbine_v2
│   │   │   └── index.html
│   │   └── anohub_vibration_v2
│   │       └── index.html
│   └── Turbine_Friend
│       ├── Francis_SOP_Welding
│       │   └── index.html
│       ├── Francis_Symptom_Dictionary
│       │   └── index.html
│       ├── Francis_Wear_Analytics
│       │   └── index.html
│       ├── Kaplan_T
│       │   └── index.html
│       ├── Pelton_T
│       │   └── index.html
│       └── index.html
├── App.tsx
├── assets
│   ├── digital_cfd_mesh.png
│   └── generator_blueprint.svg
├── components
│   ├── ai
│   │   └── DrTurbineInsightsCard.tsx
│   ├── AnoHubOS.tsx
│   ├── ARXRayView.tsx
│   ├── AssetSetupWizard.tsx
│   ├── AutoReportGenerator.tsx
│   ├── BlackBoxForensics.tsx
│   ├── BootSequence.tsx
│   ├── cerebro
│   │   ├── CerebroContextEngine.tsx
│   │   ├── CerebroCore.tsx
│   │   └── panels
│   │       ├── AcousticsPanel.tsx
│   │       ├── ElectricalPanel.tsx
│   │       ├── HydraulicsPanel.tsx
│   │       ├── MechanicalPanel.tsx
│   │       ├── PhysicsPanel.tsx
│   │       ├── SafetyPanel.tsx
│   │       └── StructuralPanel.tsx
│   ├── CommissioningModeDashboard.tsx
│   ├── dashboard
│   │   ├── anohub
│   │   │   ├── AnohubHeader.tsx
│   │   │   ├── AnohubSidebar.tsx
│   │   │   ├── LiveTelemetryFooter.tsx
│   │   │   └── ui
│   │   │       ├── CyberCard.tsx
│   │   │       ├── CyberMap.tsx
│   │   │       ├── CyberMetric.tsx
│   │   │       ├── MetricCard.tsx
│   │   │       ├── MetricTrend.tsx
│   │   │       └── StatusBadge.tsx
│   │   ├── AssetPassportCard.tsx
│   │   ├── AutarkyDashboard.tsx
│   │   ├── AuxiliarySystemsDashboard.tsx
│   │   ├── CBMDashboard.tsx
│   │   ├── CirculatoryDashboard.tsx
│   │   ├── CivilIntegrityDashboard.tsx
│   │   ├── ComplianceView.tsx
│   │   ├── ControlLoopVisualizer.tsx
│   │   ├── CyberMap.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── ExecutiveDashboard.tsx
│   │   ├── ExecutiveFinancialDashboard.tsx
│   │   ├── FinancialRiskTicker.tsx
│   │   ├── ForensicAnalysisView.tsx
│   │   ├── HeritageSearchWidget.tsx
│   │   ├── LubeStatus.tsx
│   │   ├── QuickCalcCard.tsx
│   │   ├── QuickCalcSidebar.tsx
│   │   ├── ScadaCore.tsx
│   │   ├── ScadaCoreControlOverlay.tsx
│   │   ├── ScadaCoreHotspots.tsx
│   │   ├── ScadaCorePeltonNozzles.tsx
│   │   ├── ScadaCoreState.tsx
│   │   ├── ScadaCoreVariant.tsx
│   │   ├── SyncBadge.tsx
│   │   ├── SystemHealthWidget.tsx
│   │   ├── WorkOrderSummary.tsx
│   │   └── __tests__
│   │       ├── AssetPassportCard.test.tsx
│   │       ├── HeritageSearchWidget.test.tsx
│   │       ├── QuickCalcCard.test.tsx
│   │       ├── QuickCalcSidebar.test.tsx
│   │       ├── ScadaCoreControlOverlay.test.tsx
│   │       ├── ScadaCoreHotspots.test.tsx
│   │       ├── ScadaCorePeltonNozzles.test.tsx
│   │       ├── ScadaCoreState.test.tsx
│   │       ├── ScadaCoreVariant.test.tsx
│   │       ├── SyncBadge.test.tsx
│   │       └── WorkOrderSummary.test.tsx
│   ├── diagnostic-twin
│   │   ├── NeuralFlowMap.tsx
│   │   └── Sidebar.tsx
│   ├── DigitalIntegrity.tsx
│   ├── forensics
│   │   ├── ForensicDashboard.tsx
│   │   └── __tests__
│   │       └── ForensicDashboard.test.tsx
│   ├── GlobalMap.tsx
│   ├── HPPBuilder.tsx
│   ├── Hub.tsx
│   ├── HydroSchool.tsx
│   ├── hydroschool
│   │   ├── HydroschoolSimulator.tsx
│   │   └── __tests__
│   │       └── HydroschoolSimulator.test.tsx
│   ├── HydroStaticTestMonitor.tsx
│   ├── InstallationGuarantee.tsx
│   ├── KnowledgeCapturePanel.tsx
│   ├── layout
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── MaintenanceLogbook.tsx
│   ├── MaintenancePredictor.tsx
│   ├── precision
│   │   └── PrecisionInput.tsx
│   ├── Questionnaire.tsx
│   ├── RiskReport.tsx
│   ├── SettingsPanel.tsx
│   ├── turbine
│   │   └── KaplanDashboard.tsx
│   └── ui
│       ├── InfoTooltip.tsx
│       ├── Sparkline.tsx
│       └── Switch.tsx
├── config
│   ├── AssetThresholds.ts
│   ├── DeploymentConfig.ts
│   ├── featureFlags.ts
│   ├── sensorConfig.ts
│   └── SystemConstants.ts
├── constants.ts
├── contexts
│   ├── AIPredictionContext.tsx
│   ├── AssetConfigContext.tsx
│   ├── AssetContext.tsx
│   ├── AuditContext.tsx
│   ├── AuthContext.tsx
│   ├── ClientContext.tsx
│   ├── CommissioningContext.tsx
│   ├── ContextAwarenessContext.tsx
│   ├── ContextAwareSystem.tsx
│   ├── DensityContext.tsx
│   ├── DiagnosticContext.tsx
│   ├── DocumentContext.tsx
│   ├── DrillDownContext.tsx
│   ├── FleetContext.tsx
│   ├── ForensicsContext.tsx
│   ├── GlobalErrorContext.tsx
│   ├── GlobalProvider.tsx
│   ├── HPPDesignContext.tsx
│   ├── HydrologyContext.tsx
│   ├── InventoryContext.tsx
│   ├── MaintenanceContext.tsx
│   ├── NavigationContext.tsx
│   ├── NotificationContext.tsx
│   ├── ProjectContext.tsx
│   ├── ProjectStateContext.tsx
│   ├── QuestionnaireContext.tsx
│   ├── RiskContext.tsx
│   ├── TelemetryContext.tsx
│   ├── ToastContext.tsx
│   ├── useHPPData.ts
│   ├── VoiceAssistantContext.tsx
│   ├── WorkflowContext.tsx
│   └── WorkOrderContext.tsx
├── core
│   ├── PhysicsEngine.ts
│   ├── PLCGateway.ts
│   └── TechnicalSchema.ts
├── data
│   ├── checklistTemplates
│   │   ├── francis.json
│   │   ├── kaplan.json
│   │   └── pelton.json
│   ├── componentData.ts
│   ├── componentEncyclopediaMapping.ts
│   ├── componentMappings.ts
│   ├── ExpertDossierRegistry.json
│   ├── ExpertKnowledgeBase.json
│   ├── FrancisMaintenanceProtocols.ts
│   ├── knowledge
│   │   ├── ComponentTaxonomy.ts
│   │   ├── ContextMap.ts
│   │   ├── DossierLibrary.ts
│   │   ├── KnowledgeBase.ts
│   │   └── MasterKnowledgeMap.json
│   ├── mitigationLibrary.ts
│   ├── protocols
│   │   ├── francis_horizontal_protocols.ts
│   │   └── GeneratedProtocols.ts
│   └── turbineDetailData.ts
├── features
│   ├── business
│   │   └── logic
│   │       ├── FinancialCalculator.ts
│   │       └── __tests__
│   │           └── FinancialCalculator.test.ts
│   ├── config
│   │   ├── ProjectConfigStore.ts
│   │   └── __tests__
│   │       └── ProjectConfigStore.test.ts
│   ├── discovery-vault
│   │   └── vault
│   │       ├── business-roi
│   │       │   └── ServiceConsultingFeedbackLoop.ts
│   │       └── knowledge-base
│   │           └── KnowledgeCapturePanel.tsx
│   ├── maintenance
│   │   ├── hooks
│   │   │   └── useMaintenancePrediction.ts
│   │   ├── logic
│   │   │   ├── PredictiveAnalytics.ts
│   │   │   └── __tests__
│   │       │       └── Predictor.test.ts
│   │   └── types.ts
│   ├── physics-core
│   │   ├── ExpertDiagnosisEngine.ts
│   │   ├── PhysicsCalculations.logic.ts
│   │   ├── UnifiedPhysicsCore.ts
│   │   └── __tests__
│   │       └── PhysicsCalculations.test.ts
│   ├── reporting
│   │   ├── ProfessionalReportEngine.ts
│   │   └── ReportGenerator.ts
│   └── telemetry
│       ├── hooks
│       │   ├── usePhysicsMetrics.ts
│       │   └── useTelemetrySubscription.ts
│       └── store
│           ├── useTelemetryStore.ts
│           └── __tests__
│               └── telemetry-store.test.ts
├── hooks
│   ├── useContextEngine.ts
│   ├── useCrossModuleActions.tsx
│   ├── useEngineeringMath.ts
│   ├── useHPPDiagnostics.ts
│   ├── useSmartActions.ts
│   └── useTheme.ts
├── i18n
│   ├── bs_new.json
│   ├── en_new.json
│   ├── hr.json
│   ├── index.ts
│   ├── mk.json
│   ├── si.json
│   └── sl.json
├── lib
│   ├── automation
│   │   └── RCAService.ts
│   ├── commissioning
│   │   └── WizardService.ts
│   └── engines
│       ├── BaseEngine.ts
│       ├── FrancisEngine.ts
│       ├── KaplanEngine.ts
│       ├── PeltonEngine.ts
│       └── types.ts
├── main.tsx
├── models
│   ├── AssetHierarchy.ts
│   ├── FrancisVerticalConfiguration.ts
│   ├── LargeTurbineAuxiliarySystems.ts
│   ├── MaintenanceChronicles.ts
│   ├── RepairContext.ts
│   ├── turbine
│   │   └── types.ts
│   └── knowledge
│       └── ContextTypes.ts
├── schemas
│   ├── engineering.ts
│   └── supabase.ts
├── scripts
│   └── hashes_applied.json
├── services
│   ├── AbsoluteZero.ts
│   ├── AcousticFingerprintingService.ts
│   ├── ActuatorDiagnosticCore.ts
│   ├── AdaptiveCombinatorTuner.ts
│   ├── AdaptiveGovernor.ts
│   ├── AdditiveManufacturingBridge.ts
│   ├── AdditiveManufacturingService.ts
│   ├── AdversarialSimulator.ts
│   ├── AgingEstimator.ts
│   ├── AIFindingService.ts
│   ├── AIPredictionService.ts
│   ├── AlarmStormFilter.ts
│   ├── AncestralOracle.ts
│   ├── ArchiveSearchEngine.ts
│   ├── AssetIdentityService.ts
│   ├── AuditorExportService.ts
│   ├── AutoReportService.ts
│   ├── BaseGuardian.ts
│   ├── BasinCoordinator.ts
│   ├── CavitationWatcher.ts
│   ├── CollaborationWorkflowService.ts
│   ├── CommissioningProtocol.ts
│   ├── CommissioningService.ts
│   ├── CommissioningSimulation.ts
│   ├── core
│   │   ├── FinancialImpactEngine.ts
│   │   ├── PhysicsMathService.ts
│   │   ├── UnitConverter.ts
│   │   └── VibrationForensics.ts
│   ├── DrTurbineAI.ts
│   ├── Drawing42Link.ts
│   ├── EfficiencyCurveHardener.ts
│   ├── EfficiencyOptimizer.ts
│   ├── EnergyMerchant.ts
│   ├── ErosionCorrosionSynergy.ts
│   ├── EventLogger.ts
│   ├── ExpertActionGuide.ts
│   ├── ExpertInference.ts
│   ├── GovernorHPUGuardian.ts
│   ├── HillChartInterpolation.ts
│   ├── HiveRegistry.ts
│   ├── IndustrialDataBridge.ts
│   ├── InstitutionalKnowledgeService.ts
│   ├── IntelligentLubricationController.ts
│   ├── InterlockMatrix.ts
│   ├── KaplanBladePhysics.ts
│   ├── KaplanHubMonitor.ts
│   ├── KaplanPhysicsEngine.ts
│   ├── KnowledgeInjector.ts
│   ├── LifeExtensionEngine.ts
│   ├── LiveMathSync.ts
│   ├── MarketDrivenStrategy.ts
│   ├── MasterIntelligenceEngine.ts
│   ├── MetalFactoryLink.ts
│   ├── MolecularIntegrityMonitor.ts
│   ├── PeltonPhysicsOptimizer.ts
│   ├── ProfileLoader.ts
│   ├── PulseArchiver.ts
│   ├── reportService.ts
│   ├── SafeControlAdapter.ts
│   ├── SafetyInterlockDesignConstraints.ts
│   ├── SafetyInterlockEngine.ts
│   ├── SandErosionTracker.ts
│   ├── SentinelKernel.ts
│   ├── ServiceChecklistEngine.ts
│   ├── ServiceConsultingFeedbackLoop.ts
│   ├── ShaftSealGuardian.ts
│   ├── SolutionArchitect.ts
│   ├── SovereignMemory.ts
│   ├── Sovereign_Executive_Engine.ts
│   ├── StrategicPlanningService.ts
│   ├── supabaseClient.ts
│   ├── TelemetryLogger.ts
│   ├── TemporalDivergenceEngine.ts
│   ├── TheMemoryLink.ts
│   ├── ThePulseEngine.ts
│   ├── ThermalCompensator.ts
│   ├── ThermalManagementCore.ts
│   ├── ThresholdResolver.ts
│   ├── ThrustBearingMaster.ts
│   ├── TimeSpoofingDetector.ts
│   ├── TransformerOilAnalyst.ts
│   ├── TransformerOilGuardian.ts
│   ├── TrashRackMonitor.ts
│   ├── TrashRackRobot.ts
│   ├── TrueWearScheduler.ts
│   ├── TruthJudge.ts
│   ├── TurbineClassifier.ts
│   ├── TurbineMasterCore.ts
│   ├── TurbinePhysicsOptimizer.ts
│   ├── UpstreamPulseIntegrator.ts
│   ├── V2GOrchestrator.ts
│   ├── ValueCompounder.ts
│   ├── VibrationBaseline.ts
│   ├── VibrationExpert.ts
│   ├── VideoForensicsService.ts
│   ├── VisionAnalysisService.ts
│   ├── VisionReportGenerator.ts
│   ├── VisualInspectionService.ts
│   ├── VortexDiagnostic.ts
│   ├── VPPSynchronizer.ts
│   ├── WarehouseIntegrationService.ts
│   ├── WaterHammerMonitor.ts
│   ├── WatershedInflowPredictor.ts
│   ├── WicketGateKinematics.ts
│   ├── WisdomFilter.ts
│   ├── WisdomProfitCalculator.ts
│   └── __tests__
│       ├── AIPredictionService.test.ts
│       ├── BaseGuardian.test.ts
│       ├── CavitationWatcher.test.ts
│       ├── CommissioningSimulation.test.ts
│       ├── EfficiencyOptimizer.test.ts
│       ├── FinancialImpactEngine.test.ts
│       ├── HillChartInterpolation.test.ts
│       ├── InterlockMatrix.test.ts
│       ├── KaplanBladePhysics.test.ts
│       ├── SafetyInterlockDesignConstraints.test.ts
│       ├── SafetyInterlockEngine.test.ts
│       ├── ShaftSealGuardian.test.ts
│       ├── ThrustBearingMaster.test.ts
│       ├── TurbineClassifier.test.ts
│       └── TurbinePhysicsOptimizer.test.ts
├── setupTests.ts
├── shared
│   ├── components
│   │   ├── hud
│   │   │   └── OptimizationHUD.tsx
│   │   └── ui
│   │       ├── Breadcrumbs.tsx
│   │       ├── EngineeringCard.tsx
│   │       ├── EngineeringSkeleton.tsx
│   │       ├── FetchSkeleton.tsx
│   │       ├── GlassCard.tsx
│   │       ├── index.ts
│   │       ├── LoadingShimmer.tsx
│   │       ├── ModernButton.tsx
│   │       ├── ModernInput.tsx
│   │       ├── ModuleFallback.tsx
│   │       ├── Skeleton.tsx
│   │       ├── Spinner.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── StatusIndicator.tsx
│   │       ├── ToastSystem.tsx
│   │       ├── Tooltip.tsx
│   │       └── TurbineLoader.tsx
│   └── design-tokens.ts
├── stores
│   ├── ProtocolHistoryStore.ts
│   ├── useAppStore.ts
│   ├── useComponentStore.ts
│   ├── useDigitalLedger.ts
│   └── useTheme.ts
├── test
│   └── setup.ts
├── types
│   ├── aiFinding.ts
│   ├── assetIdentity.ts
│   ├── checklist.ts
│   ├── diagnostics.ts
│   ├── plc.ts
│   ├── sovereign-core.d.ts
│   └── trends.ts
├── types.ts
├── utils
│   ├── CircularBuffer.ts
│   ├── designEfficiency.ts
│   ├── DiagnosticEngine.ts
│   ├── eta.ts
│   ├── etaSanitizer.ts
│   ├── fonts
│   │   └── Roboto-Regular-base64.ts
│   ├── i18nUtils.ts
│   ├── idAdapter.ts
│   ├── performance.ts
│   ├── RootCauseEngine.ts
│   ├── SentinelKernel.ts
│   ├── SignalFilter.ts
│   ├── SignalProcessor.ts
│   ├── storageUtils.ts
│   └── TruthDeltaEngine.ts
├── vite-env.d.ts
└── workers
    ├── BlackBoxRecorder.worker.ts
    ├── forensicPdf.worker.ts
    ├── journal.worker.ts
    ├── physics.worker.ts
    └── swarm.worker.ts
```

# THE DORMANT BRAIN (NEURAL ABSORPTION NC-10050)

The following logic blocks are highly sophisticated but currently "sleeping" (0 references). They represent the future intelligence of the Sovereign Engine.

### 1. AutoReportService.ts (415 lines)
**Function:** Automated post-service report generation with AI insights.
**Power:** Compares "As-Found" vs "As-Left" states to calculate precise ROI and efficiency gains.
**Input:** `ServiceMeasurement[]` (Vibration, Alignment, Efficiency, Cavitation).

### 2. CommissioningProtocol.ts (405 lines)
**Function:** Digital guardian for post-repair startup and validation.
**Power:** Enforces strict mechanical, hydraulic, and electrical acceptance criteria before allowing operation.
**Input:** `CommissioningCheckItem` (Alignment < 0.05mm, Vibration fingerprints).

### 3. CollaborationWorkflowService.ts (362 lines)
**Function:** Multi-user approval chain for critical measurements.
**Power:** Prevents "pencil-whipping" by requiring AI validation and Consultant remote sign-off for critical metrics.
**Input:** `MeasurementSubmission` (Geodetic, Vibration, Oil Analysis).

### 4. ServiceConsultingFeedbackLoop.ts (348 lines)
**Function:** Machine learning loop for consulting accuracy.
**Power:** Tracks the *actual* outcome of paid consulting advice vs *predicted* ROI, refining the engine's future financial predictions.
**Input:** `OptimizationTrackingEntry` (Predicted vs Actual Efficiency/ROI).

### 5. Sovereign_Executive_Engine.ts (318 lines)
**Function:** The "One Brain to Rule Them All".
**Power:** Integrates Physics, Finance, Safety, Memory, and Supply Chain into a single autonomous decision matrix.
**Input:** `ExecutiveState` (Molecular Integrity, Financials, Market Strategy).
