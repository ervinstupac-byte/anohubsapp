/**
 * IslandGridController.ts
 * 
 * Autonomous Island Mode Grid Control
 * Frequency & voltage regulation with virtual inertia
 * Handles sudden load steps (e.g., connecting entire towns)
 */

export class IslandGridController {
    private static islandMode = false;
    private static frequency = 50.0; // Hz
    private static voltage = 10.5; // kV
    private static loadMW = 0;
    private static readonly VIRTUAL_INERTIA = 5.0; // seconds

    public static activateIslandMode(): void {
        this.islandMode = true;
        console.log('\n🏝️  ISLAND MODE ACTIVATED');
        console.log('Autonomous grid control engaged\n');
    }

    public static connectLoad(loadMW: number, loadName: string): void {
        if (!this.islandMode) {
            console.log('❌ Not in island mode');
            return;
        }

        console.log(`\n[Island] Connecting load: ${loadName} (${loadMW} MW)`);

        // Simulate frequency dip with virtual inertia
        const frequencyDip = loadMW / (this.VIRTUAL_INERTIA * 100); // Simplified
        const minFrequency = this.frequency - frequencyDip;

        console.log(`  Initial frequency dip: ${this.frequency.toFixed(2)} → ${minFrequency.toFixed(2)} Hz`);

        // Virtual inertia response
        const recoveryTime = this.VIRTUAL_INERTIA * 2; // seconds
        console.log(`  Virtual inertia compensating (${recoveryTime}s)...`);

        // Governor response
        setTimeout(() => {
            this.frequency = 50.0;
            this.loadMW += loadMW;
            console.log(`  ✅ Frequency restored: 50.00 Hz`);
            console.log(`  Island load: ${this.loadMW} MW`);
        }, recoveryTime * 1000);
    }

    public static getStatus() {
        return {
            islandMode: this.islandMode,
            frequency: this.frequency,
            voltage: this.voltage,
            loadMW: this.loadMW
        };
    }
}
