import React from 'react';
import { ProjectGenesisForm } from '../components/ProjectGenesisForm';
import { DashboardHeader } from '../components/DashboardHeader';
import { GlobalFooter } from '../components/GlobalFooter';

const ProjectGenesisPage: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#020617] text-slate-100">
            <DashboardHeader
                title={<span className="text-cyan-500 font-black tracking-widest uppercase">FIELD INGESTION // GENESIS PROTOCOL</span>}
                onToggleSidebar={() => { }} // Sidebar control handled by layout
            />
            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white mb-2">Project Genesis</h1>
                    <p className="text-slate-400 max-w-2xl">
                        Universal field data ingestion terminal. Capture site specifications, hydrological parameters, and logistical constraints for new HPP deployments.
                    </p>
                </div>
                <ProjectGenesisForm />
            </main>
            <GlobalFooter />
        </div>
    );
};

export default ProjectGenesisPage;
