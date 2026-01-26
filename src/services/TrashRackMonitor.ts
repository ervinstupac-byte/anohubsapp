/**
 * TRASH RACK MONITOR
 * The Sneeze Counter - Detecting River Blockages
 * 
 * Monitors trash rack (rešetke) clogging and calculates:
 * - Head loss due to debris buildup
 * - Power loss (the "Money Leak") from reduced head
 * - Cleaning urgency based on accumulation rate
 */

// ============================================================================
// DATA STRUCTURES
// ============================================================================

export interface TrashRackStatus {
    timestamp: Date;

    // Measured Data
    upstreamLevel: number; // m above reference
    downstreamLevel: number; // m above reference
    headLoss: number; // m (calculated: upstream - downstream)

    // Hydraulic Parameters
    flowRate: number; // m³/s
    designHead: number; // m (head without clogging)
    actualHead: number; // m (design head - head loss)

    // The Money Leak Calculation
    powerLoss: number; // kW lost due to clogging
    dailyCost: number; // € per day at current power price

    // Clogging Severity
    severity: 'CLEAN' | 'MODERATE' | 'CRITICAL' | 'SEVERE';
    efficiencyLoss: number; // % reduction in turbine efficiency

    // Recommendations
    cleaningUrgency: 'NONE' | 'SCHEDULE' | 'SOON' | 'IMMEDIATE';
    estimatedTimeToSevere: number; // hours (based on accumulation rate)
    recommendation: string;
}

export interface MoneyLeakCalculation {
    headLoss: number; // m
    flowRate: number; // m³/s
    powerLoss: number; // kW
    energyLossDaily: number; // kWh per day
    costDaily: number; // € per day
    costMonthly: number; // € per month
    formula: string;
    explanation: string;
}

// ============================================================================
// TRASH RACK MONITOR SERVICE
// ============================================================================

export class TrashRackMonitor {
    // Physical constants
    private readonly RHO = 1000; // Water density (kg/m³)
    private readonly G = 9.81; // Gravity (m/s²)

    // Thresholds
    private readonly THRESHOLD_MODERATE = 0.2; // m
    private readonly THRESHOLD_CRITICAL = 0.5; // m
    private readonly THRESHOLD_SEVERE = 1.0; // m

    // Economic parameters (configurable)
    private powerPrice: number = 0.08; // €/kWh (default)

    constructor(powerPrice?: number) {
        if (powerPrice) this.powerPrice = powerPrice;
    }

    /**
     * THE SNEEZE COUNTER - Main monitoring function
     * Calculates head loss, power loss, and cleaning urgency
     */
    monitorTrashRack(
        upstreamLevel: number,
        downstreamLevel: number,
        flowRate: number,
        designHead: number
    ): TrashRackStatus {
        const timestamp = new Date();

        // Calculate head loss (the "sneeze")
        const headLoss = upstreamLevel - downstreamLevel;

        // Actual head available to turbine
        const actualHead = designHead - headLoss;

        // THE MONEY LEAK FORMULA
        // Power Loss = ρ · g · Q · ΔH
        // Where:
        //   ρ (rho) = water density (1000 kg/m³)
        //   g = gravity (9.81 m/s²)
        //   Q = flow rate (m³/s)
        //   ΔH = head loss (m)
        const powerLoss = this.calculatePowerLoss(flowRate, headLoss);

        // Calculate daily cost
        const energyLossDaily = powerLoss * 24; // kWh per day
        const dailyCost = energyLossDaily * this.powerPrice;

        // Determine severity
        const severity = this.determineSeverity(headLoss);

        // Calculate efficiency loss
        const efficiencyLoss = designHead > 0 ? (headLoss / designHead) * 100 : 0;

        // Determine cleaning urgency
        const { urgency, timeToSevere, recommendation } = this.determineCleaningUrgency(
            headLoss,
            severity,
            powerLoss
        );

        return {
            timestamp,
            upstreamLevel,
            downstreamLevel,
            headLoss,
            flowRate,
            designHead,
            actualHead,
            powerLoss,
            dailyCost,
            severity,
            efficiencyLoss,
            cleaningUrgency: urgency,
            estimatedTimeToSevere: timeToSevere,
            recommendation
        };
    }

    /**
     * THE MONEY LEAK CALCULATION
     * Magic Formula: P = ρ · g · Q · ΔH
     * 
     * This tells the boss EXACTLY how many kilowatts are being lost
     * due to leaves blocking the river!
     */
    calculateMoneyLeak(flowRate: number, headLoss: number): MoneyLeakCalculation {
        // Power loss in kW
        const powerLoss = this.calculatePowerLoss(flowRate, headLoss);

        // Energy loss per day
        const energyLossDaily = powerLoss * 24; // kWh

        // Cost calculations
        const costDaily = energyLossDaily * this.powerPrice;
        const costMonthly = costDaily * 30;

        return {
            headLoss,
            flowRate,
            powerLoss,
            energyLossDaily,
            costDaily,
            costMonthly,
            formula: 'P = ρ · g · Q · ΔH',
            explanation: `
🌊 THE MONEY LEAK EXPLAINED:

Power Loss = ${this.RHO} kg/m³ × ${this.G} m/s² × ${flowRate.toFixed(2)} m³/s × ${headLoss.toFixed(2)} m
           = ${powerLoss.toFixed(2)} kW

💰 FINANCIAL IMPACT:
- Every hour: ${powerLoss.toFixed(2)} kWh lost
- Every day: ${energyLossDaily.toFixed(2)} kWh = €${costDaily.toFixed(2)}
- Every month: €${costMonthly.toFixed(2)}

🍂 THE BLOCKAGE:
The trash rack has ${headLoss.toFixed(2)}m of leaves blocking the water.
Each meter of blockage steals power from the turbine!

👷 BOSS MESSAGE:
Send the mounters NOW! We're losing €${costDaily.toFixed(2)} per day!
      `.trim()
        };
    }

    /**
     * Internal power loss calculation
     * P = ρ · g · Q · ΔH / 1000 (convert to kW)
     */
    private calculatePowerLoss(flowRate: number, headLoss: number): number {
        return (this.RHO * this.G * flowRate * headLoss) / 1000;
    }

    /**
     * Determine clogging severity based on head loss
     */
    private determineSeverity(headLoss: number): TrashRackStatus['severity'] {
        if (headLoss >= this.THRESHOLD_SEVERE) return 'SEVERE';
        if (headLoss >= this.THRESHOLD_CRITICAL) return 'CRITICAL';
        if (headLoss >= this.THRESHOLD_MODERATE) return 'MODERATE';
        return 'CLEAN';
    }

    /**
     * Determine cleaning urgency and estimate time to severe condition
     */
    private determineCleaningUrgency(
        headLoss: number,
        severity: TrashRackStatus['severity'],
        powerLoss: number
    ): {
        urgency: TrashRackStatus['cleaningUrgency'];
        timeToSevere: number;
        recommendation: string;
    } {
        // Estimate accumulation rate (simplified: assume 0.1m per 12 hours)
        const accumulationRate = 0.1 / 12; // m/hour
        const timeToSevere = (this.THRESHOLD_SEVERE - headLoss) / accumulationRate;

        let urgency: TrashRackStatus['cleaningUrgency'];
        let recommendation: string;

        switch (severity) {
            case 'SEVERE':
                urgency = 'IMMEDIATE';
                recommendation = `🚨 EMERGENCY! Head loss is ${headLoss.toFixed(2)}m. Losing ${powerLoss.toFixed(0)}kW. STOP OPERATIONS and clean racks immediately!`;
                break;

            case 'CRITICAL':
                urgency = 'IMMEDIATE';
                recommendation = `⚠️ CRITICAL! Head loss is ${headLoss.toFixed(2)}m (>0.5m threshold). The Money Leak is ${powerLoss.toFixed(0)}kW! Send mounters to clean before efficiency drops further.`;
                break;

            case 'MODERATE':
                urgency = 'SOON';
                recommendation = `⚡ MODERATE clogging detected. Head loss: ${headLoss.toFixed(2)}m. Currently losing ${powerLoss.toFixed(0)}kW. Schedule cleaning within ${Math.floor(timeToSevere)} hours.`;
                break;

            case 'CLEAN':
                urgency = 'NONE';
                recommendation = `✅ Trash racks are CLEAN. Head loss: ${headLoss.toFixed(2)}m. Continue normal operation.`;
                break;
        }

        return { urgency, timeToSevere, recommendation };
    }

    /**
     * Simulate trash rack clogging over time
     * Useful for demonstration and training
     */
    simulateClogging(
        initialHeadLoss: number,
        accumulationRate: number, // m/hour
        duration: number, // hours
        flowRate: number,
        designHead: number
    ): TrashRackStatus[] {
        const snapshots: TrashRackStatus[] = [];

        for (let hour = 0; hour <= duration; hour++) {
            const currentHeadLoss = initialHeadLoss + (accumulationRate * hour);
            const upstreamLevel = designHead + currentHeadLoss;
            const downstreamLevel = designHead;

            snapshots.push(
                this.monitorTrashRack(upstreamLevel, downstreamLevel, flowRate, designHead)
            );
        }

        return snapshots;
    }
}
