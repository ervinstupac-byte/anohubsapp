import React from 'react';
import HydroschoolSimulator from '../components/hydroschool/HydroschoolSimulator';

export const HydroschoolLanding: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-4">Hydroschool</h1>
            <p className="text-slate-300 mb-6">Interactive simulator and educational tools focused on turbine efficiency and 50-year preservation strategies.</p>
            <HydroschoolSimulator />
        </div>
    );
};

export default HydroschoolLanding;
