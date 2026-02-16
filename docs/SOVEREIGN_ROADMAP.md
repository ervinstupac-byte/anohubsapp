# THE SOVEREIGN ROADMAP & IDEA LEDGER (NC-13700)

> "The core is pure, but the vision is infinite."
> — Sovereign Engineering Corps

This document serves as the **Strategic Roadmap** for the AnoHUB platform. It consolidates all future features, extracted concepts, and engineering visions discovered during the Vault Zero purge (Feb 2026).

---

## TIER 1: IMMEDIATE UPGRADES (The "Pending" Stack)
*These features have placeholders or partial implementations in the current Production Core.*

### 1. Forensic Reporting
*   **Dynamic Threshold Loading**: `AssetThresholds.ts` contains a placeholder for fetching threshold configs from an external API (`/api/asset-thresholds`) instead of hardcoded constants.
*   **Image Evidence Integration**: `ForensicReportService.ts` defines an `evidenceImages` interface (AI tags, issue type, thumbnails) that is currently unused. Future state involves embedding these directly into the PDF.
*   **Executive Briefing Data**: The `ExecutiveBriefingData` structure exists but is populated with simulated/calculated data. Needs connection to a live Fleet Aggregator.

### 2. Alignment Wizard (Commissioning)
*   **Bluetooth Dial Indicator Sync**: `AlignmentWizard.tsx` contains a `connectBluetooth` stub. Future update should use Web Bluetooth API to read values directly from digital indicators (e.g., Mitutoyo/Sylvac).
*   **Automated Runout Interpolation**: Current logic auto-increments angles by 45°. Future logic should interpolate a smooth sine wave from sparse data points (3-point circle fitting).

### 3. Physics Engine
*   **Material Roughness Expansion**: `PhysicsEngine.ts` has a limited `ROUGHNESS_MAP` (Steel, GRP, PEHD, Concrete). Needs expansion for aged/corroded materials (e.g., "Pitted Steel", "Bio-fouled Concrete").
*   **Bolt Grade Library**: The `BOLT_YIELD_MAP` covers standard metric grades (4.6 - 12.9). Needs expansion for Imperial grades and custom alloys.

---

## TIER 2: EXPANSION LOGIC (The "Archived" Blueprints)
*These concepts were extracted from `_SOVEREIGN_ARCHIVE/legacy_logic/` and are ready for re-integration.*

### 1. Asset Onboarding Wizard (`AssetOnboardingWizard.tsx`)
*   **Concept**: A multi-step "DNA Configuration" tool for new turbines.
*   **Logic to Restore**:
    *   **Conditional Module Unlocking**: Unlocking specific UI tabs (e.g., "Shaft Jacking") only if `orientation === 'VERTICAL'`.
    *   **Sensor Inventory Checklist**: Toggling UI features based on installed hardware (`hasGeneratorVibSensor`, `hasHPUSensors`).
    *   **Environmental Baseline**: Calculating an `erosionRiskScore` based on `penstockType` and `sludgeRemoval` capability.

### 2. Turbine Visual Navigator (`TurbineVisualNavigator.tsx`)
*   **Concept**: An interactive SVG blueprint allowing point-and-click navigation to subsystem dashboards.
*   **Logic to Restore**:
    *   **Precision Hitboxes**: The `createHitbox` logic for mapping click zones to specific coordinate sets.
    *   **Fullscreen Toggle**: Dedicated fullscreen mode for schematic review on tablets.
    *   **Debug Mode**: A flag to visualize hitbox boundaries during development.

---

## TIER 3: THE SOVEREIGN VISION (Long-Term R&D)
*Conceptual features derived from code comments and the "Ancestral Oracle" philosophy.*

### 1. The Ancestral Oracle (AI Forensics)
*   **Current State**: Static "Wisdom Tooltips" based on alarm codes.
*   **Future Vision**: A RAG (Retrieval-Augmented Generation) system that ingests PDF reports, email logs, and chat history to answer natural language queries like "When was the last time Unit 4 had high vibration?"
*   **Logic Pointer**: `AncestralOracle.ts` - "Answers questions from the future using the Master's preserved logic."

### 2. Automated Physics Optimization
*   **Current State**: Calculates efficiency and losses based on fixed inputs.
*   **Future Vision**: A "Digital Twin Solver" that suggests optimal parameter adjustments (e.g., "Reduce MIV opening by 2% to mitigate cavitation").
*   **Logic Pointer**: `PhysicsEngine.ts` - "Performance Delta" calculation is the seed for this optimizer.

### 3. Institutional Memory (The Ledger)
*   **Current State**: `LocalLedger` tracks user actions.
*   **Future Vision**: A cryptographically verifiable "Maintenance Passport" where every bolt torque and alignment check is signed, timestamped, and immutable.

---

## VAULT STATUS CONFIRMATION
*   **Status**: SEALED
*   **Location**: `_SOVEREIGN_ARCHIVE/`
*   **Contents**: `legacy_logic/` (High-value blueprints), `case_studies_static/` (Historical data).
*   **Access Policy**: Read-Only reference for Roadmap implementation.

// Signed: Sovereign Engineering Corps, Feb 2026
