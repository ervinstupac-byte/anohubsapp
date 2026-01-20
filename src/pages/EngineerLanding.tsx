import React from 'react';
import { Link } from 'react-router-dom';

export const EngineerLanding: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-4">Engineer Console</h1>
            <p className="text-slate-300 mb-6">Tools and workflows tailored for engineering staff: HPP Builder, diagnostics, and configuration.</p>
            <div className="space-x-3">
                <Link to="/hpp-builder" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">Open HPP Builder</Link>
                <Link to="/francis/hub" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">Open Francis Hub</Link>
            </div>
        </div>
    );
};

export default EngineerLanding;
