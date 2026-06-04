// Galvanic Corrosion Monitor Service
// Cathodic protection tracking for PIT and Bulb turbines

export interface ZincAnodeReading {
  anodeId: string; // e.g., "ZN-001"
  location: string; // e.g., "Spiral Case Inlet"
  timestamp: number;

  // Measurements
  mass: number; // kg - current anode mass
  voltage: number; // mV vs reference electrode (typically Ag/AgCl)
  current: number; // mA - protection current

  // Calculated
  consumptionRate: number; // kg/year
  estimatedLifeRemaining: number; // months
}

export interface CathodicProtectionSystem {
  assetId: number;
  turbineType: 'PIT' | 'BULB' | 'TUBULAR';
  anodes: ZincAnodeReading[];

  // System health
  overallProtection: 'EXCELLENT' | 'GOOD' | 'MARGINAL' | 'INSUFFICIENT';
  averageVoltage: number; // mV (target: -800 to -1050 mV vs Ag/AgCl)

  // Grounding check
  generatorGroundingResistance: number; // Ohms (should be < 1 Ohm)
  strayCurrentDetected: boolean;
}

export interface CorrosionAlert {
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  category: 'ANODE_DEPLETION' | 'VOLTAGE_DROP' | 'STRAY_CURRENT' | 'GROUNDING_ISSUE';
  message: string;
  recommendation: string;
}

export class GalvanicCorrosionService {
  /**
   * Analyze cathodic protection system
   */
  static analyzeCathodicProtection(system: CathodicProtectionSystem): CorrosionAlert[] {
    const alerts: CorrosionAlert[] = [];

    // 1. CHECK ANODE DEPLETION
    for (const anode of system.anodes) {
      if (anode.estimatedLifeRemaining < 3) {
        alerts.push({
          severity: 'CRITICAL',
          category: 'ANODE_DEPLETION',
          message: `Cink-anoda ${anode.anodeId} (${anode.location}) gotovo iscrpljena: ${anode.estimatedLifeRemaining.toFixed(1)} mjeseca preostalo.`,
          recommendation:
            'HITNO: Naručiti zamjensku anodu. Instalacija planirati u roku od mjesec dana.',
        });
      } else if (anode.estimatedLifeRemaining < 6) {
        alerts.push({
          severity: 'WARNING',
          category: 'ANODE_DEPLETION',
          message: `Cink-anoda ${anode.anodeId} preostalo: ${anode.estimatedLifeRemaining.toFixed(1)} mjeseci.`,
          recommendation: 'Planirati zamjenu anode u narednih 3-6 mjeseci.',
        });
      }

      // Check for abnormally high consumption rate
      if (anode.consumptionRate > 5) {
        alerts.push({
          severity: 'WARNING',
          category: 'ANODE_DEPLETION',
          message: `Anoda ${anode.anodeId} troši se prebrzo: ${anode.consumptionRate.toFixed(1)} kg/god (normal <3 kg/god).`,
          recommendation: 'Provjeriti strujne putove i uzemljenje generatora.',
        });
      }
    }

    // 2. CHECK PROTECTION VOLTAGE
    if (system.averageVoltage > -750) {
      alerts.push({
        severity: 'CRITICAL',
        category: 'VOLTAGE_DROP',
        message: `Potencijal katodne zaštite: ${system.averageVoltage.toFixed(0)} mV (cilj: -800 do -1050 mV).`,
        recommendation:
          'RIZIK OD GALVANSKE KOROZIJE KUĆIŠTA! Dodati nove anode ili provjeriti električni kontakt.',
      });
    } else if (system.averageVoltage > -800) {
      alerts.push({
        severity: 'WARNING',
        category: 'VOLTAGE_DROP',
        message: `Potencijal katodne zaštite marginalan: ${system.averageVoltage.toFixed(0)} mV.`,
        recommendation: 'Monitoring učestaiti na mjesečno. Razmotriti dodavanje anoda.',
      });
    }

    // 3. CHECK FOR STRAY CURRENTS
    if (system.strayCurrentDetected) {
      alerts.push({
        severity: 'CRITICAL',
        category: 'STRAY_CURRENT',
        message: 'Detektovane lutajuće struje u sistemu.',
        recommendation:
          'Kritično: Lutajuće struje ubrzavaju koroziju. Provjeriti uzemljenje generatora i razdvojnike.',
      });
    }

    // 4. CHECK GENERATOR GROUNDING
    if (system.generatorGroundingResistance > 1.0) {
      alerts.push({
        severity: 'WARNING',
        category: 'GROUNDING_ISSUE',
        message: `Otpor uzemljenja generatora: ${system.generatorGroundingResistance.toFixed(2)} Ω (cilj: <1 Ω).`,
        recommendation:
          'Provjeriti uzemljenje generatora. Loše uzemljenje može uzrokovati strujne putove kroz vodu i ubrzati koroziju.',
      });
    }

    // CORRELATION: Fast anode depletion + grounding issue
    const fastDepletingAnodes = system.anodes.filter(a => a.consumptionRate > 5);
    if (fastDepletingAnodes.length > 0 && system.generatorGroundingResistance > 1.0) {
      alerts.push({
        severity: 'CRITICAL',
        category: 'GROUNDING_ISSUE',
        message: `🤖 AI KORELACIJA: Cink-anode 'odu' prebrzo (${fastDepletingAnodes.length} anoda > 5 kg/god) + loše uzemljenje (${system.generatorGroundingResistance.toFixed(2)} Ω).`,
        recommendation:
          'RIZIK OD GALVANSKE KOROZIJE KUĆIŠTA! Hitno provjeriti uzemljenje generatora. Lutajuće struje prolaze kroz vodu umjesto kroz zemlju.',
      });
    }

    return alerts;
  }

  /**
   * Calculate anode consumption rate and remaining life
   */
  static calculateAnodeLife(
    currentMass: number,
    initialMass: number,
    monthsElapsed: number
  ): { consumptionRate: number; estimatedLifeRemaining: number } {
    const massLost = initialMass - currentMass;
    const consumptionRate = (massLost / monthsElapsed) * 12; // kg/year

    const remainingMass = currentMass;
    const estimatedLifeRemaining = (remainingMass / massLost) * monthsElapsed;

    return {
      consumptionRate,
      estimatedLifeRemaining,
    };
  }

  /**
   * Generate corrosion protection report
   */
  static generateProtectionReport(
    system: CathodicProtectionSystem,
    alerts: CorrosionAlert[]
  ): string {
    let report = `🛡️ GALVANSKA KOROZIJA - MONITORING REPORT\n`;
    report += `Turbina: ${system.assetId} (${system.turbineType})\n\n`;

    report += `SISTEM KATODNE ZAŠTITE:\n`;
    report += `Status: ${system.overallProtection}\n`;
    report += `Prosječan potencijal: ${system.averageVoltage.toFixed(0)} mV (cilj: -800 do -1050 mV)\n`;
    report += `Otpor uzemljenja: ${system.generatorGroundingResistance.toFixed(2)} Ω\n\n`;

    report += `CINK-ANODE (${system.anodes.length} komada):\n`;
    system.anodes.forEach(anode => {
      report += `  • ${anode.anodeId} (${anode.location}): ${anode.mass.toFixed(1)} kg, `;
      report += `preostalo ${anode.estimatedLifeRemaining.toFixed(1)} mj\n`;
    });

    report += `\n`;

    if (alerts.length === 0) {
      report += `✅ Nema upozorenja. Katodna zaštita funkcionira ispravno.\n`;
    } else {
      report += `⚠️ UPOZORENJA (${alerts.length}):\n\n`;
      alerts.forEach((alert, i) => {
        const icon =
          alert.severity === 'CRITICAL' ? '🔴' : alert.severity === 'WARNING' ? '🟡' : '🔵';
        report += `${icon} ${i + 1}. ${alert.message}\n`;
        report += `   Preporuka: ${alert.recommendation}\n\n`;
      });
    }

    return report;
  }
}
