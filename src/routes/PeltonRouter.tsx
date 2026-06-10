import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spinner } from '../shared/components/ui/Spinner';
import { LoadingShimmer } from '../shared/components/ui/LoadingShimmer';
import { ROUTES } from './paths';

const PeltonVertical = React.lazy(() => import('../features/pelton/components/PeltonVertical'));
const PeltonHorizontal = React.lazy(() => import('../features/pelton/components/PeltonHorizontal'));
const PeltonSurgicalHub = React.lazy(() => import('../features/pelton/components/PeltonSurgicalHub').then(module => ({ default: module.PeltonSurgicalHub })));

const PeltonRouter: React.FC = () => {
    return (
        <Suspense fallback={<LoadingShimmer />}>
            <Routes>
                <Route path={ROUTES.PELTON.VERTICAL} element={<PeltonVertical />} />
                <Route path={ROUTES.PELTON.HORIZONTAL} element={<PeltonHorizontal />} />
                <Route path="twin" element={<PeltonSurgicalHub />} />
                <Route path="*" element={<PeltonVertical />} />
            </Routes>
        </Suspense>
    );
};

export default PeltonRouter;
