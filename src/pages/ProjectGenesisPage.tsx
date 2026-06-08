import React from 'react';
import { ProjectGenesisForm } from '../components/ProjectGenesisForm';

const ProjectGenesisPage: React.FC = () => {
    return (
        <div className="w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">Project Genesis</h1>
                <p className="text-slate-400 max-w-2xl">
                    Universal field data ingestion terminal. Capture site specifications, hydrological parameters, and logistical constraints for new HPP deployments.
                </p>
            </div>
            <ProjectGenesisForm />
        </div>
    );
};

export default ProjectGenesisPage;
