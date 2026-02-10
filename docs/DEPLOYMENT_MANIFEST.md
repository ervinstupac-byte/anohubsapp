# SOVEREIGN DEPLOYMENT MANIFEST
> **CLASSIFICATION:** SOVEREIGN EYES ONLY
> **DATE:** 2026-02-10
> **PROTOCOL:** NC-11900

## 1. System Status
*   **Version:** v1.0.0
*   **Codename:** Neural Bridge
*   **Deployment Target:** Vercel (Edge Network)
*   **Build Framework:** Vite + React (SPA)

## 2. Active Protocols
The following protocols have been successfully integrated and verified:

### 🟢 NC-11700: The Neural Bridge & AI Constitution
*   **Status:** ACTIVE
*   **Core Deliverable:** `docs/AI_CONTEXT.md` (Engineering Standard)
*   **Enforcement:** `.cursorrules` + Footer Compliance
*   **Data Integrity:** JSON Schemas for Telemetry & Sensor Data

### 🟢 NC-11800: The 3D Digital Twin Foundation
*   **Status:** ACTIVE
*   **Core Deliverable:** `SovereignVisualizer.tsx`
*   **Tech Stack:** React Three Fiber (R3F) + Drei
*   **Capabilities:** Real-time RPM-driven rotation, Environment Lighting, Primitive Turbine Geometry.

### 🟢 NC-11900: Deployment Sweep
*   **Status:** ACTIVE
*   **Core Deliverable:** Production Hardening
*   **Configuration:** `vercel.json` (SPA Rewrites), `.vercelignore` (Asset Exclusion)
*   **Security:** Environment Variable Sanitization (Zero Hardcoded Secrets)

## 3. Database Schema
*   **Provider:** Supabase (PostgreSQL)
*   **Key Tables:**
    *   `dynamic_sensor_data`: Time-series telemetry (partitioned).
    *   `sovereign_audit_log`: Immutable record of executive decisions.
    *   `turbine_metadata`: Static configuration for Kaplan/Francis/Pelton units.
*   **Schema Definition:** See `scripts/generate_schemas.mjs` for latest JSON representation.

## 4. Environment Variables
Required variables for production deployment (refer to `.env.example`):
*   `VITE_SUPABASE_URL`: API Endpoint
*   `VITE_SUPABASE_ANON_KEY`: Public API Key

---
// Part of the Sovereign Engineering Corps - Protocol NC-11900
