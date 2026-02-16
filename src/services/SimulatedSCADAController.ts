// Simulated SCADA Controller
// Simulates the physical hardware interface for development

export class SimulatedSCADAController {

    static async readParameter(address: string): Promise<number> {
        // Simulate network delay
        await new Promise(r => setTimeout(r, 50));

        // Return simulated values
        if (address === 'TURBINE_RPM') return 428.5; // Kaplan rated
        if (address === 'GUIDE_VANE_OPENING') return 85.4; // %
        if (address === 'ACTIVE_POWER') return 12.4; // MW

        return 0;
    }

    static async writeParameter(address: string, value: number): Promise<boolean> {
        console.log(`📡 SCADA WRITE [${address}] = ${value}`);
        return true;
    }

    static async setInterlock(state: boolean): Promise<boolean> {
        console.log(`🔒 PHYSICAL INTERLOCK ${state ? 'ENGAGED' : 'RELEASED'}`);
        // Simulate relay click sound
        // playSound('relay_click.mp3'); 
        return true;
    }
}
