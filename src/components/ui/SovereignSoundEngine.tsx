import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';

export const SovereignSoundEngine: React.FC = () => {
    const [isMuted, setIsMuted] = useState(true);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const oscRef = useRef<OscillatorNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);
    const lfoRef = useRef<OscillatorNode | null>(null);
    const lfoGainRef = useRef<GainNode | null>(null);

    // Telemetry Subscriptions
    const rpm = useTelemetryStore(state => state.mechanical.rpm || 0);
    const eccentricity = useTelemetryStore(state => state.alignment?.eccentricity || 0);
    const vibration = useTelemetryStore(state => state.mechanical.vibrationX || 0);

    // Initialize Audio Engine
    useEffect(() => {
        if (isMuted) return;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // 1. Main Drone (The "Machine Soul")
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth'; // Industrial texture
        osc.frequency.value = 50; // Base grid frequency

        // 2. Low Pass Filter (Muffle the sawtooth to make it "heavy")
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 120; // Dark rumble
        filter.Q.value = 5; // Resonance

        // 3. Main Gain (Volume)
        const gain = ctx.createGain();
        gain.gain.value = 0.1; // Start quiet

        // 4. LFO (Tremolo/Wobble based on RPM/Eccentricity)
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 2.0; // 120 RPM = 2Hz

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0; // Depth of modulation

        // Wiring: LFO -> LFO Gain -> Main Gain.gain (AM Synthesis)
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);

        // Wiring: Osc -> Filter -> Main Gain -> Out
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        // Start Engines
        osc.start();
        lfo.start();

        oscRef.current = osc;
        gainRef.current = gain;
        lfoRef.current = lfo;
        lfoGainRef.current = lfoGain;

        return () => {
            osc.stop();
            lfo.stop();
            ctx.close();
        };
    }, [isMuted]);

    // Live Modulation
    useEffect(() => {
        if (!audioCtxRef.current || isMuted) return;
        const now = audioCtxRef.current.currentTime;

        // Pitch Logic: Base 50Hz + slight RPM rise
        // 100 RPM = 50Hz. 500 RPM = 100Hz? 
        // Let's say Base = 40Hz + (RPM / 10).
        const targetPitch = 40 + (rpm / 5); 
        oscRef.current?.frequency.setTargetAtTime(targetPitch, now, 0.5);

        // Wobble Rate: 1x RPM
        const wobbleRate = Math.max(0.1, rpm / 60);
        lfoRef.current?.frequency.setTargetAtTime(wobbleRate, now, 0.5);

        // Wobble Depth (Eccentricity influence)
        // High E = Deep throbbing sound. Low E = Smooth hum.
        // Scale E (mm) to Gain (0-0.5). E=0.2mm -> 0.1 gain mod.
        const wobbleDepth = Math.min(0.5, eccentricity * 0.5); 
        lfoGainRef.current?.gain.setTargetAtTime(wobbleDepth, now, 0.5);

        // Overall Volume (Vibration influence)
        // High Vibration = Louder drone.
        // Base volume 0.05. Max 0.3.
        const targetVol = 0.05 + Math.min(0.2, vibration * 0.02);
        // Note: LFO modulates *around* this value? No, LFO connects to gain.gain AudioParam.
        // AudioParam value is sum of intrinsic value + inputs. 
        // So we set the intrinsic value here.
        gainRef.current?.gain.setTargetAtTime(targetVol, now, 0.5);

    }, [rpm, eccentricity, vibration, isMuted]);

    return (
        <button
            onClick={() => setIsMuted(!isMuted)}
            className={`fixed bottom-8 right-8 z-50 p-3 rounded-full border backdrop-blur-md transition-all ${
                isMuted 
                ? 'bg-slate-900/50 border-slate-700 text-slate-500 hover:text-white' 
                : 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
            }`}
            title={isMuted ? "Enable Sovereign Sound" : "Mute Machine Audio"}
        >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
        </button>
    );
};
