/**
 * ForensicDataAggregator
 * Responsible for mapping projectState + diagnosis into table data used by the template renderer.
 */
export function buildAnomalyRows(projectState: any, diagnosis: any) {
    const investigated = projectState.investigatedComponents || [];
    if (investigated.length === 0) return [];

    const anomalyData: any[] = [];

    investigated.forEach((compId: string) => {
        let serviceSearch = '';
        let evidence = 'N/A';
        let evidenceVal = '0.00';

        if (compId === 'runner' || compId === 'band') {
            serviceSearch = 'Cavitation Specialist';
            evidence = 'Volumetric Loss';
            evidenceVal = `${projectState.physics.volumetricLoss?.toFixed(2) || '0.00'} %`;
        } else if (compId === 'crown') {
            serviceSearch = 'Structural Integrity';
            evidence = 'Axial Thrust';
            evidenceVal = `${projectState.physics.axialThrustKN?.toFixed(1) || '0.0'} kN`;
        } else if (compId === 'noseCone') {
            serviceSearch = 'Oil Analysis';
            evidence = 'Bearing Temperature';
            evidenceVal = `${projectState.mechanical.bearingTemp?.toFixed(1) || '0.0'} °C`;
        }

        const note = (diagnosis && diagnosis.serviceNotes) ? diagnosis.serviceNotes.find((n: any) => n.service === serviceSearch) : null;

        anomalyData.push([
            compId.toUpperCase(),
            note ? note.message : 'Component manually flagged for investigation.',
            `PRIORITY: HIGH\nEvidence: ${evidence} (${evidenceVal})`
        ]);
    });

    return anomalyData;
}

export default { buildAnomalyRows };
