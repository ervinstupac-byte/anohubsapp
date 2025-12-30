# AnoHUB SCADA System

## State of the Union (v1.0.0 - Synapse Integration)

**AnoHUB** is a next-generation Hydroelectric Power Plant (HPP) SCADA and Maintenance application. It bridges the gap between traditional industrial control and modern intuitive UX.

### 🌟 Key Features

#### 1. The "Francis Hub" (Turbine Friend)
A centralized ecosystem of 22 interactive Standard Operating Procedures (SOPs), categorized into 5 critical sectors:
*   **Safety & Critical**: Shaft Alignment, Bearings, Vibration Analysis.
*   **Mechanical**: Governor PID, Linkage, Braking.
*   **Fluid & Chemical**: Oil Health, Cooling Water.
*   **Electrical**: Excitation (AVR/FCR), Transformer Integrity, Grid Sync.
*   **Civil**: Penstock (Joukowsky Water Hammer), Intake (Trash Rack).

#### 2. Synapse Integration (The "Golden Thread")
Modules are no longer isolated. The system features a "Golden Thread" workflow:
*   **Detection**: An engineer identifies a risk in an SOP (e.g., Water Hammer > 20 bar).
*   **Action**: A unified "Log Observation" button instantly creates a ticket.
*   **Routing**: The system navigates to the `Maintenance Logbook`, pre-filling context (Source & Reason).
*   **Ad-Hoc Logging**: Allows unplanned observations to be captured seamlessly.

#### 3. Maintenance Intelligence
*   **Ad-Hoc Logbook**: Dynamic entry creation for observations outside scheduled tasks.
*   **MaintenanceRouter**: Dedicated routing structure for all maintenance modules.
*   **AR & Shadow Engineer**: (Planned) Advanced assistance layers.

#### 4. Enterprise-Grade Foundation
*   **Global Command Palette**: `Ctrl+K` navigation to any module instantly.
*   **Internationalization (i18n)**: Full support for 6 languages (EN, ES, FR, DE, ZH, BS).
*   **PDF Generation**: Local-first PDF report generation with embedded custom fonts (Roboto).
*   **Modular Architecture**: Clean separation of routes (`FrancisRouter`, `MaintenanceRouter`).

### 🛠 Tech Stack
*   **Frontend**: React, TypeScript, Vite.
*   **Styling**: Tailwind CSS (Executive/Dark Industrial Theme).
*   **Animation**: Framer Motion.
*   **State Management**: React Context (Maintenance, Auth, Risk).
*   **Routing**: React Router v6.
*   **Icons**: Lucide React.
*   **Build Tool**: Vite.

### 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### 📂 Architecture Overview

*   `src/components/francis/*`: SOP Implementation (Visual & Interactive).
*   `src/routes/paths.ts`: Centralized Route Constants.
*   `src/routes/*Router.tsx`: Modular Routers.
*   `src/i18n/*`: Localization files.
*   `src/models/*`: Physics & Engineering Types.

---
*Built by the AnoHUB Engineering Team (Deepmind + User Pair Programming)* 
*Status: READY FOR DEPLOYMENT*