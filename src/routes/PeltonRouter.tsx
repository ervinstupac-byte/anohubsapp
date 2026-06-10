import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spinner } from '../shared/components/ui/Spinner';
import { LoadingShimmer } from '../shared/components/ui/LoadingShimmer';
import { ROUTES } from './paths';

const PeltonVertical = React.lazy(() => import('../features/pelton/components/PeltonVertical'));
const PeltonHorizontal = React.lazy(() => import('../features/pelton/components/PeltonHorizontal'));

const PeltonRouter: React.FC = () => {
    return (
        <Suspense fallback={<LoadingShimmer />}>
            <Routes>
                <Route path={ROUTES.PELTON.VERTICAL} element={<PeltonVertical />} />
                <Route path={ROUTES.PELTON.HORIZONTAL} element={<PeltonHorizontal />} />
                <Route path="*" element={<PeltonVertical />} />
            </Routes>
        </Suspense>
    );
};

export default PeltonRouter;
