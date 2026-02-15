# CODEBASE_MANIFEST

Generated: 2026-02-15T10:00:00.000Z

## src

Folder Purpose: Project folder holding related source files.

File Inventory:
- **App.tsx** (UI-Component): Main application entry point with routing and context providers.
- **constants.ts** (Legacy-Asset): Application-wide constants and type definitions.
- **index.css** (Legacy-Asset): Global styles and Tailwind imports.
- **logo.svg** (Legacy-Asset): SVG asset.
- **main.ts** (Legacy-Asset): Bootstrap logic.
- **main.tsx** (UI-Component): React root rendering.
- **setupTests.ts** (Legacy-Asset): Vitest setup configuration.
- **tsc_errors.log** (Legacy-Asset): TypeScript error log.
- **types.ts** (Legacy-Asset): Zod schemas and TypeScript interfaces.
- **vite-env.d.ts** (Legacy-Asset): Vite environment definitions.

## src/components/three

Folder Purpose: React Three Fiber 3D components for Digital Twin visualization.

File Inventory:
- **TurbineRunner3D.tsx** (UI-Component): Interactive 3D turbine model with reactive data binding (heat/stress maps) and educational info panels.

## src/core

Folder Purpose: Core business logic and physics engines.

File Inventory:
- **PhysicsEngine.ts** (Data-Service): High-precision physics calculations (Decimal.js) including thermal offsets, legacy watcher logic, and manufacturer bid validation.
- **TechnicalSchema.ts** (Data-Service): Unified schema definitions for `PhysicsResult` (backend) and `TechnicalProjectState` (UI).

## src/features/telemetry/store

Folder Purpose: Zustand stores for state management.

File Inventory:
- **useTelemetryStore.ts** (Data-Service): Centralized telemetry store with transient update support for 3D components.

## src/components

Folder Purpose: Shared UI components.

File Inventory:
- **CommandCenter.tsx** (UI-Component): Main dashboard integrating 3D Digital Twin, live metrics, and diagnostics.
- **TruthHeatmapDemo.tsx** (UI-Component): Standalone demo for 3D reactive data binding.

## Note on Backend

The `backend/` directory has been removed. All legacy Python logic has been ported to `src/core/PhysicsEngine.ts`.
