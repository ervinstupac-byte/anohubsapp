# AnoHUB SCADA System

## State of the Union (v1.0.0 - Synapse Integration)

**AnoHUB** is a next-generation Hydroelectric Power Plant (HPP) SCADA and Maintenance application. It bridges the gap between traditional industrial control and modern intuitive UX.

### 🌟 Key Features

#### 1. The "Francis Hub" (Turbine Friend)
A centralized ecosystem of 22 interactive Standard Operating Procedures (SOPs), categorized into 5 critical sectors.
*   **3D Digital Twin**: Interactive, real-time 3D visualization of the Francis Runner using `react-three-fiber`.
*   **Live Physics**: Real-time headers displaying RPM, Grid Frequency (Hz), and Active Power (MW).

#### 2. Reality Bridge (Supabase Persistence)
*   **Cloud Sync**: Infinite persistence for Maintenance Logs and Work Orders via Supabase.
*   **Realtime Collaboration**: Instant updates across clients using Postgres Changes.
*   **Optimistic UI**: Immediate interface feedback while data saves in the background.

#### 3. Synapse Integration (The "Golden Thread")
Modules are no longer isolated. The system features a "Golden Thread" workflow:
*   **Detection**: An engineer identifies a risk in an SOP (e.g., Water Hammer > 20 bar).
*   **Action**: A unified "Log Observation" button instantly creates a ticket.
*   **Routing**: The system navigates to the `Maintenance Logbook`, pre-filling context.

#### 4. Enterprise-Grade Foundation
*   **Global Command Palette**: `Ctrl+K` navigation to any module instantly.
*   **Internationalization (i18n)**: Full support for 6 languages (EN, ES, FR, DE, ZH, BS).
*   **PDF Generation**: Local-first PDF report generation with embedded custom fonts.
*   **Modular Architecture**: Clean separation of routes (`FrancisRouter`, `MaintenanceRouter`).

### 🛠 Tech Stack
*   **Frontend**: React, TypeScript, Vite.
*   **3D Engine**: Three.js, React Three Fiber, Drei.
*   **Backend**: Supabase (PostgreSQL, Realtime, Auth).
*   **Styling**: Tailwind CSS (Executive/Dark Industrial Theme).
*   **Animation**: Framer Motion.
*   **State Management**: React Context + Supabase Subscription.
*   **Routing**: React Router v6.
*   **Icons**: Lucide React.

### 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### 📂 Architecture Overview

*   `src/components/francis/*`: SOP Implementation (Visual & Interactive).
*   `src/components/three/*`: 3D Models and Visualization Components.
*   `src/services/supabaseClient.ts`: Database Connection & Helpers.
*   `src/contexts/MaintenanceContext.tsx`: Realtime State Management.
*   `src/routes/paths.ts`: Centralized Route Constants.
*   `src/i18n/*`: Localization files.
*   `src/models/*`: Physics & Engineering Types.

---
*Built by the AnoHUB Engineering Team (Deepmind + User Pair Programming)* 
*Status: READY FOR PHASE 5 (Context Engine)*