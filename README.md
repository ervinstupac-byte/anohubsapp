# AnoHubsApp: Sovereign Hydroelectric Management System

## 🌊 Project Overview
AnoHubsApp is a next-generation Hydroelectric Power Plant (HPP) management platform designed for the "Sovereign" operator. It integrates real-time SCADA telemetry, financial impact analysis, and advanced forensic diagnostics into a unified Commander Dashboard.

## 🏗️ Architecture
For a detailed breakdown of the codebase structure, please refer to **[STRUCTURE.md](STRUCTURE.md)**.

The system is built on a modern React/TypeScript stack, utilizing `zustand` for high-frequency telemetry state management and `framer-motion` for fluid industrial visualizations.

## 🛡️ Forensic Integrity Architecture
As part of the **NC-10090 Security Lockdown**, the platform now includes a dedicated Forensic Integrity module designed to detect, analyze, and mitigate physical asset degradation.

### Key Modules:

#### 1. VisionAnalyzer & Surface Forensics
*   **AI-Driven Diagnosis**: Automatically triggers 'ABRASIVE EROSION' warnings when telemetry indicates high sediment wear rates.
*   **Logic Core**: Reacts to `ErosionStatus` from the central `useTelemetryStore`.
*   **Visual Feedback**: Provides texture analysis for Pitted, Polished, and High-Erosion surface states.

#### 2. SCADA Core Thermal Overlays
*   **Forensic Mode**: A toggleable layer on the ScadaCore turbine model.
*   **Visualization**: Renders real-time Thermal/Stress gradients (Red/Yellow/Green) on the Spiral Case and Runner to highlight potential failure points.

#### 3. Sovereign Telemetry Store
*   **Central Nervous System**: Managing `ErosionStatus`, `HydraulicStream`, and `MechanicalStream` in a unified, persisted store.
*   **Reactive wiring**: Ensures that physical sensor data (RPM, Flow, Vibration) drives the forensic UI instantaneously.

#### 4. KillSwitch Protocol
*   **System Lockdown**: A global override mechanism to effectively "shut down" the digital twin interface in critical safety scenarios.
*   **Integration**: Directly wired to the `Sovereign_Executive_Engine`.

## 🔐 Security & Compliance
*   **Environment Security**: `.env.local` and other sensitive configuration files are strictly excluded from version control.
*   **Clean Artifacts**: The build manifest (`MANIFEST.json`) has been scrubbed of development artifacts (`.venv`, `__pycache__`) to ensure a lean production footprint.

---
*Maintained by the Sovereign Engineering Corps.*
