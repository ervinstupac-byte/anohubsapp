/**
 * CavitationWatcher.ts
 * 
 * Physics Hardening: NPSH & Thoma Sigma
 * Updated with Read-Only Defaults for safety.
 */

export interface CavitationStatus {
    npshAvailable: number; // m
    npshRequired: number; // m
    sigmaPlant: number; // Thoma available
    sigmaCritical: number; // Thoma required
    riskLevel: 'SAFE' | 'INCEPTION' | 'FULL_CAVITATION';
}

export class CavitationWatcher {

    // SAFEGUARDS
    public static readonly DEFAULT_ATMOS_BAR = 1.013; // Sea level
    public static readonly CRITICAL_SIGMA_DEFAULT = 0.15; // Francis Turbine approx

    public static analyze(
        tailwaterElMasl: number,
        runnerElMasl: number,
        netHeadM: number,
        waterTempC: number,
        atmosPressureBar: number = this.DEFAULT_ATMOS_BAR
    ): CavitationStatus {

        // Guardrails
        if (netHeadM <= 0) netHeadM = 1; // Prevent div by zero
        if (waterTempC < 0) waterTempC = 0; // Frozen?

        // 1. Vapor Pressure Head (Hv)
        const pVapKpa = 0.611 * Math.exp((17.27 * waterTempC) / (waterTempC + 237.3));
        const hv = (pVapKpa * 1000) / (997 * 9.81);

        // 2. Atmos Head (Ha)
        const ha = (atmosPressureBar * 100000) / (997 * 9.81);

        // 3. Suction Setting (Hs)
        const submergence = tailwaterElMasl - runnerElMasl;

        // NPSH_A
        const npshA = ha - hv + submergence;

        // 4. Thoma Sigma (Plant)
        const sigmaPlant = npshA / netHeadM;

        // 5. Critical Sigma
        const sigmaCritical = this.CRITICAL_SIGMA_DEFAULT;

        // 6. NPSH Required
        const npshR = sigmaCritical * netHeadM;

        let risk: CavitationStatus['riskLevel'] = 'SAFE';
        if (npshA < npshR) risk = 'FULL_CAVITATION';
        else if (npshA < npshR * 1.3) risk = 'INCEPTION';

        return {
            npshAvailable: npshA,
            npshRequired: npshR,
            sigmaPlant,
            sigmaCritical,
            riskLevel: risk
        };
    }
}
