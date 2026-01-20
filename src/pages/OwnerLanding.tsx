import React from 'react';
import { Link } from 'react-router-dom';

export const OwnerLanding: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-4">Owner Portal</h1>
            <p className="text-slate-300 mb-6">High-level views for asset owners: performance summaries, financial briefs, and preservation guidance.</p>
            <div className="space-x-3">
                <Link to="/investor-briefing" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">Investor Briefing</Link>
                <Link to="/executive" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">Executive Dashboard</Link>
            </div>
        </div>
    );
};

export default OwnerLanding;
