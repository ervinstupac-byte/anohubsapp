import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './paths.ts';

// Lazy load components
const MaintenanceDashboard = lazy(() => import('../components/MaintenanceDashboard.tsx').then(m => ({ default: m.MaintenanceDashboard })));
const MaintenanceLogbook = lazy(() => import('../components/MaintenanceLogbook.tsx').then(m => ({ default: m.MaintenanceLogbook })));
const HydraulicMaintenance = lazy(() => import('../components/HydraulicMaintenance').then(m => ({ default: m.HydraulicMaintenance })));
const BoltTorqueCalculator = lazy(() => import('../components/BoltTorqueCalculator').then(m => ({ default: m.BoltTorqueCalculator })));
const SOPManager = lazy(() => import('../components/SOPManager').then(m => ({ default: m.SOPManager }))); // Shadow Engineer
const ShiftLog = lazy(() => import('../components/ShiftLog').then(m => ({ default: m.ShiftLog }))); // Intuition Log
const ARManager = lazy(() => import('../components/ARManager').then(m => ({ default: m.ARManager })));
const TechnicalPassport = lazy(() => import('../components/TechnicalPassport').then(m => ({ default: m.TechnicalPassport })));


import { LoadingShimmer } from '../components/ui/LoadingShimmer.tsx';

const MaintenanceRouter: React.FC = () => {
    return (
        <Suspense fallback={<LoadingShimmer />}>
            <Routes>
                {/* Default to dashboard */}
                <Route index element={<Navigate to={ROUTES.MAINTENANCE.DASHBOARD} replace />} />

                <Route path={ROUTES.MAINTENANCE.DASHBOARD} element={<MaintenanceDashboard />} />
                <Route path={ROUTES.MAINTENANCE.LOGBOOK} element={<MaintenanceLogbook />} />
                <Route path={ROUTES.MAINTENANCE.HYDRAULIC} element={<HydraulicMaintenance />} />
                <Route path={ROUTES.MAINTENANCE.BOLT_TORQUE} element={<BoltTorqueCalculator />} />
                <Route path={ROUTES.MAINTENANCE.SHADOW_ENGINEER} element={<SOPManager />} />
                <Route path={ROUTES.MAINTENANCE.INTUITION_LOG} element={<ShiftLog />} />
                <Route path={ROUTES.MAINTENANCE.AR_GUIDE} element={<ARManager />} />
                <Route path={ROUTES.MAINTENANCE.ASSET_PASSPORT} element={<TechnicalPassport />} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to={ROUTES.MAINTENANCE.DASHBOARD} replace />} />
            </Routes>
        </Suspense>
    );
};

export default MaintenanceRouter;
