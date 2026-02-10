import React, { useEffect, useRef } from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';

/**
 * NC-9300: Resonance Audio System
 * Synthesizes a low-frequency hum (120Hz/240Hz) when vibration harmonics are critical.
 * Uses Web Audio API for asset-free sound generation.
 * Synchronized across all windows via TelemetryStore.
 */
export const ResonanceAudioSystem: React.FC = () => {
    const { resonanceState } = useTelemetryStore();
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const isPlayingRef = useRef(false);

    useEffect(() => {
        // Initialize AudioContext
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0;
        gainNode.connect(ctx.destination);

        audioContextRef.current = ctx;
        gainNodeRef.current = gainNode;

        return () => {
            ctx.close();
        };
    }, []);

    useEffect(() => {
        if (!audioContextRef.current || !gainNodeRef.current) return;

        const ctx = audioContextRef.current;
        const gainNode = gainNodeRef.current;
        const { isResonant, frequency, amplitude } = resonanceState || { isResonant: false, frequency: 0, amplitude: 0 };

        // Ensure context is running (browser autoplay policy)
        if (ctx.state === 'suspended' && isResonant) {
            ctx.resume().catch(() => {
                // Ignore autoplay errors - requires user interaction
            });
        }

        if (isResonant && frequency > 0) {
            // Start oscillator if not running
            if (!isPlayingRef.current) {
                const osc = ctx.createOscillator();
                osc.type = 'sawtooth'; // More "mechanical" buzz than sine
                osc.frequency.value = frequency;
                
                // Add a lowpass filter to make it a "hum" rather than a "buzz"
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 400;
                
                osc.connect(filter);
                filter.connect(gainNode);
                
                osc.start();
                oscillatorRef.current = osc;
                isPlayingRef.current = true;
            } else if (oscillatorRef.current) {
                // Update frequency ramped for smoothness
                oscillatorRef.current.frequency.setTargetAtTime(frequency, ctx.currentTime, 0.1);
            }

            // Modulate volume (amplitude 0-1 -> gain 0-0.15)
            // Add a tremolo effect for "instability" feeling?
            // Keep it simple first.
            const targetGain = Math.min(amplitude * 0.15, 0.15);
            gainNode.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.2);

        } else {
            // Stop/Fade out
            if (isPlayingRef.current) {
                gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
                
                // Stop oscillator after fade out
                setTimeout(() => {
                    if (!resonanceState?.isResonant && oscillatorRef.current) {
                        oscillatorRef.current.stop();
                        oscillatorRef.current.disconnect();
                        oscillatorRef.current = null;
                        isPlayingRef.current = false;
                    }
                }, 600);
            }
        }
    }, [resonanceState]);

    return null; // Headless component
};
