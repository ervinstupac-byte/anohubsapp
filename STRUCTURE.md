# SOVEREIGN CODEBASE STRUCTURE (NC-12310)

## 1. Core Architecture (The Neural Spine)
*   **src/App.tsx**: The central router and application shell.
*   **src/main.tsx**: Boot sequence, i18n hydration, and React mount.
*   **src/routes/**: Dedicated routers for specialized domains (Francis, Maintenance).

## 2. The Sovereign Engine (Logic Core)
*   **src/services/Sovereign_Executive_Engine.ts**: The master decision-making brain.
*   **src/services/SafetyInterlockEngine.ts**: Critical safety protocols.
*   **src/services/AncestralOracle.ts**: [RE-GRAFTED] Legacy knowledge repository & search.
*   **src/core/PhysicsEngine.ts**: High-fidelity physics calculations.
*   **src/features/physics-core/UnifiedPhysicsCore.ts**: Shared physics formulas.
*   **src/lib/physics/CorrosionCore.ts**: [RE-GRAFTED] Galvanic corrosion physics.

## 3. Turbine Variants (The Fleet)
*   **src/lib/engines/TurbineFactory.ts**: Factory pattern for instantiating turbine behaviors.
*   **src/lib/engines/FrancisEngine.ts**: Specific logic for Francis turbines.
*   **src/lib/engines/KaplanEngine.ts**: Specific logic for Kaplan turbines.
*   **src/lib/engines/PeltonEngine.ts**: Specific logic for Pelton turbines.
*   **src/lib/engines/CrossflowEngine.ts**: Specific logic for Crossflow turbines.

## 4. UI Components (The Face)
*   **src/components/dashboard/**: Core dashboard widgets (ScadaCore, MasterSovereignDashboard).
    *   `SandboxOverlay.tsx`: Includes Disaster Simulation (Vibration/Thermal/Rust).
*   **src/components/forensics/**: Forensic tools (VisionAnalyzer, AudioSpectrogram).
    *   `CorrosionMonitor.tsx`: [RE-GRAFTED] Anode life visualization.
*   **src/components/diagnostic-twin/**: 3D Digital Twin and Sidebar.

## 5. Sovereign Archive (The Vault)
*   **_SOVEREIGN_ARCHIVE/**: Storage for deprecated but valuable code.
    *   `legacy_logic/`: High-value engineering logic preserved from purge.
    *   `case_studies_static/`: Historical compliance data.
    *   `ClientDashboard.tsx`
    *   `LegacyModeHub.tsx`
    *   `UniversalFleetDashboard.tsx`
    *   `GalvanicCorrosionMonitor.tsx`
    *   `IncidentSimulator.tsx`
    *   `AnoHubOS.tsx`

## 6. Deprecated Zones (Purged)
*   **src/features/discovery-vault/**: [DELETED] All assets integrated or archived.

---
// Part of the Sovereign Engineering Corps - Protocol NC-13300 (Vault Zero Achieved)
