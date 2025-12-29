# AnoHUB v2.4.0 (The "Toolbox" Edition) - Release Notes
**Date:** 2025-12-29
**Status:** Stable / Production-Ready

---

## **EXECUTIVE SUMMARY**
AnoHUB v2.4.0 marks a strategic pivot from a "Concept Scada Simulator" to a **"Professional Engineering Utility"**. We have successfully purged all "fake" elements (simulation loops, random data generators, AI hallucination risks) to focus purely on **Deterministic Logic** and **User-Generated Data**.

The application is now a "Digital Logbook & Field Companion" for Hydro Engineers, offering offline-first reliability and physics-grade calculation tools.

---

## **KEY HIGHLIGHTS**

### **1. Strategic Pivot: Authenticity Over Flash**
*   **Removed:** Client Portal (Simulation), Admin Approval (Fake Workflow), Random Graph Animators.
*   **Added:** "Toolbox Launchpad" - A utilitarian dashboard that only displays data that exists.
*   **Philosophy:** "If it's not true, don't show it." The application starts empty (Zero State) and grows only as the engineer registers assets and performs work.

### **2. Architecture: "Synaptic Integration"**
*   **Central Nervous System:** The Dashboard (`ToolboxLaunchpad`) is now tightly coupled with `AssetContext` and `MaintenanceContext`.
*   **Reactive Data Flow:** Actions taken in the Logbook or Asset Wizard reflect immediately across the application (Header Counters, Activity Streams).
*   **Component Modularity:** The Sidebar and Navigation logic have been decoupled from `App.tsx`, creating a modular, maintainable codebase.

### **3. Performance & Reliability**
*   **Offline-First:** All data (Assets, Logs, Work Orders) is persisted via `localStorage`. The application functions 100% without an active internet connection after initial load.
*   **Zero-Latency:** By removing server-side dependency for core operations, interactions are effectively instant ( < 16ms).
*   **Zero-Hallucination:** We have disabled generative AI guessing for engineering values. All outputs (e.g., in HPP Builder) are results of deterministic physics equations.

---

## **TECHNICAL SPECIFICATIONS**

### **Stack**
*   **Core:** React 18, TypeScript 5.0
*   **Build System:** Vite (Production Build Optimized)
*   **Styling:** Tailwind CSS (Slate/Cyan "Industrial" Theme)
*   **Icons:** Lucide-React (Unified Iconography)

### **Core Modules**
1.  **HPP Design Studio:** Physics engine for sizing turbines (Francis/Kaplan/Pelton) based on Head/Flow.
2.  **Maintenance Logbook:** Digital ledger for manual field entries with "Proof of Work" capability.
3.  **Fleet Manager:** Local-persistence database for managing plant assets.
4.  **Engineering Calculators:** Bolt Torque, Shaft Alignment, Hydraulic Pressure.

### **Security & Data**
*   **Data Sovereignty:** User data currently resides solely on the client device.
*   **Validation:** Strict type-checking on all inputs prevents calculation errors.

---

## **KNOWN ISSUES / FUTURE ROADMAP**
*   **Cloud Sync (Roadmap):** Currently data is local-only. Future versions will introduce optional encrypted cloud backup.
*   **IoT Integration (Roadmap):** The "Digital Panel" is ready to receive real MQTT signals from SCADA gateways.

---

*Built with precision by the AnoHUB Engineering Team.*
