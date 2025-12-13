import React from 'react';

const InstallationGuarantee: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Installation Standard (Installation Guarantee)</h2>
        <p className="text-sm text-slate-400 mt-2">Non-negotiable protocol for closing the Execution Gap during assembly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl text-cyan-400 font-semibold mb-2">Precision Assembly</h3>
          <p className="text-slate-300">Mandatory laser alignment, torque verification and photo evidence per step to ensure warranty integrity and minimal LCC.</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl text-cyan-400 font-semibold mb-2">Digital Lockdown</h3>
          <p className="text-slate-300">Digital sign-off with immutable ledger recording for each verification step. No manual overrides without supervisory verification.</p>
        </div>
      </div>

      <div className="mt-6 bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-2">Protocol Steps</h3>
        <ol className="list-decimal list-inside text-slate-300 space-y-2">
          <li>Pre-assembly verification of dimensional tolerances.</li>
          <li>Torque and bolting checks with photo and torque-wrench logs.</li>
          <li>Laser shaft alignment to 0.05 mm/m with certified report.</li>
          <li>Final digital sign-off and ledger entry by supervising engineer.</li>
        </ol>
      </div>
    </div>
  );
};

export default InstallationGuarantee;