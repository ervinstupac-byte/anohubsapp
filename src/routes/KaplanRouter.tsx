import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingShimmer } from '../shared/components/ui/LoadingShimmer';

const KaplanVertical = React.lazy(() => import('../features/kaplan/components/KaplanVertical').then(module => ({ default: module.KaplanVertical })));
const KaplanBulb = React.lazy(() => import('../features/kaplan/components/KaplanBulb').then(module => ({ default: module.KaplanBulb })));
const KaplanSType = React.lazy(() => import('../features/kaplan/components/KaplanSType').then(module => ({ default: module.KaplanSType })));
const KaplanPit = React.lazy(() => import('../features/kaplan/components/KaplanPit').then(module => ({ default: module.KaplanPit })));
const KaplanSpiral = React.lazy(() => import('../features/kaplan/components/KaplanSpiral').then(module => ({ default: module.KaplanSpiral })));
const KaplanSurgicalHub = React.lazy(() => import('../features/kaplan/components/KaplanSurgicalHub').then(module => ({ default: module.KaplanSurgicalHub })));

const KaplanRouter: React.FC = () => {
    return (
        <Suspense fallback={<LoadingShimmer />}>
            <Routes>
                <Route path="vertical" element={<KaplanVertical />} />
                <Route path="bulb" element={<KaplanBulb />} />
                <Route path="s-type" element={<KaplanSType />} />
                <Route path="pit" element={<KaplanPit />} />
                <Route path="spiral" element={<KaplanSpiral />} />
                <Route path="twin" element={<KaplanSurgicalHub />} />
                <Route path="*" element={<KaplanVertical />} />
            </Routes>
        </Suspense>
    );
};

export default KaplanRouter;
