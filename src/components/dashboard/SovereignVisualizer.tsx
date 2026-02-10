import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, TorusKnot, Lathe, CameraControls } from '@react-three/drei';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import * as THREE from 'three';
import { Camera, AlertTriangle, X, Database } from 'lucide-react';
import { AncestralOracle } from '../../services/AncestralOracle';

// --- PROPS ---
interface SovereignVisualizerProps {
    sandboxStress?: number | null; // NC-12200: Sandbox Linkage
    sandboxValues?: {
        flow: number;
        head: number;
        gate: number;
        vibration?: number;
        temperature?: number;
        voltage?: number;
    };
}

// --- 3D MODEL ---
const FrancisTurbineModel: React.FC<{ 
    rpm: number; 
    stress: number | null;
    sandboxValues: SovereignVisualizerProps['sandboxValues'];
    onCameraFocus: (target: THREE.Object3D) => void;
}> = ({ rpm, stress, sandboxValues, onCameraFocus }) => {
    const groupRef = useRef<THREE.Group>(null);
    const runnerRef = useRef<THREE.Group>(null);
    const spiralCaseRef = useRef<THREE.Group>(null);
    const bearingRef = useRef<THREE.Mesh>(null);

    // Destructure Sandbox Values (with defaults)
    const vibration = sandboxValues?.vibration ?? 0;
    const temperature = sandboxValues?.temperature ?? 45;
    const voltage = sandboxValues?.voltage ?? -950;

    // NC-12600: Vibration Jitter
    useFrame((state) => {
        // Rotation
        if (runnerRef.current) {
            const rps = rpm / 60;
            const rads = rps * Math.PI * 2 * state.clock.getDelta();
            runnerRef.current.rotation.y += rads;
        }

        // Vibration Shake
        if (groupRef.current && vibration > 4.5) {
            const intensity = (vibration - 4.5) * 0.02;
            groupRef.current.position.x = (Math.random() - 0.5) * intensity;
            groupRef.current.position.y = (Math.random() - 0.5) * intensity;
            groupRef.current.position.z = (Math.random() - 0.5) * intensity;
        } else if (groupRef.current) {
            groupRef.current.position.set(0, 0, 0);
        }
    });

    // Camera Focus Triggers
    useEffect(() => {
        if (vibration > 10 && runnerRef.current) onCameraFocus(runnerRef.current);
        if (temperature > 100 && bearingRef.current) onCameraFocus(bearingRef.current);
        if (voltage > -500 && spiralCaseRef.current) onCameraFocus(spiralCaseRef.current);
    }, [vibration, temperature, voltage, onCameraFocus]);

    // --- MATERIALS ---
    // NC-12600: Stress Material (Emerald -> Red)
    const caseMaterial = useMemo(() => {
        const safeColor = new THREE.Color('#10b981'); // Emerald
        const criticalColor = new THREE.Color('#ef4444'); // Red
        const t = stress ? Math.min(Math.max((stress - 50) / 250, 0), 1) : 0;
        
        return new THREE.MeshStandardMaterial({ 
            color: safeColor.clone().lerp(criticalColor, t),
            metalness: 0.6, 
            roughness: 0.2,
            emissive: stress && stress > 200 ? '#ef4444' : '#000000',
            emissiveIntensity: stress && stress > 200 ? 0.5 : 0
        });
    }, [stress]);
    
    // NC-12600: Thermal Material (Glows > 70C)
    const bearingMaterial = useMemo(() => {
        const isOverheating = temperature > 70;
        return new THREE.MeshStandardMaterial({
            color: '#94a3b8',
            metalness: 0.8,
            roughness: 0.4,
            emissive: '#f97316', // Orange
            emissiveIntensity: isOverheating ? (temperature - 70) / 40 : 0
        });
    }, [temperature]);

    const runnerMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
        color: '#0ea5e9', // Cyan-500
        metalness: 0.9, 
        roughness: 0.1,
        emissive: '#0ea5e9',
        emissiveIntensity: rpm > 0 ? 0.2 : 0
    }), [rpm]);

    // Lathe Profile for Runner Hub (Bell Shape)
    const runnerProfile = useMemo(() => {
        const points = [];
        for (let i = 0; i < 10; i++) {
            points.push(new THREE.Vector2(Math.sin(i * 0.2) * 0.5 + 0.2, (i - 5) * 0.2));
        }
        return points;
    }, []);

    return (
        <group ref={groupRef}>
            {/* SPIRAL CASE (Volute) */}
            <group ref={spiralCaseRef} rotation={[Math.PI / 2, 0, 0]}>
                <mesh material={caseMaterial}>
                    <torusKnotGeometry args={[1.8, 0.5, 128, 16, 2, 3]} />
                </mesh>
            </group>

            {/* RUNNER (Rotating Assembly) */}
            <group ref={runnerRef}>
                {/* Hub (Lathe) */}
                <Lathe args={[runnerProfile, 32]} material={runnerMaterial} rotation={[0, 0, 0]} />
                
                {/* Blades */}
                {Array.from({ length: 13 }).map((_, i) => (
                    <mesh 
                        key={i} 
                        position={[Math.sin(i * Math.PI / 6.5) * 1.2, 0, Math.cos(i * Math.PI / 6.5) * 1.2]} 
                        rotation={[0, -i * Math.PI / 6.5, 0.2]}
                        material={runnerMaterial}
                    >
                        <boxGeometry args={[0.1, 1.5, 0.8]} />
                    </mesh>
                ))}
            </group>

            {/* NC-12600: BEARINGS (Thermal Target) */}
            <mesh ref={bearingRef} position={[0, 1.2, 0]} material={bearingMaterial}>
                <cylinderGeometry args={[0.8, 0.8, 0.5, 32]} />
            </mesh>

            {/* DRAFT TUBE */}
            <mesh position={[0, -2, 0]} rotation={[Math.PI, 0, 0]} material={caseMaterial}>
                <cylinderGeometry args={[1.5, 2.5, 3, 32, 1, true]} />
            </mesh>
        </group>
    );
};

export const SovereignVisualizer: React.FC<SovereignVisualizerProps> = ({ sandboxStress = null, sandboxValues }) => {
    const { mechanical } = useTelemetryStore();
    const rpm = Number(mechanical?.rpm ?? 0);
    const cameraControlsRef = useRef<CameraControls>(null);
    
    // Snapshot State
    const [snapshotOpen, setSnapshotOpen] = useState(false);
    const [snapshotData, setSnapshotData] = useState<any>(null);

    const handleCameraFocus = (target: THREE.Object3D) => {
        cameraControlsRef.current?.fitToBox(target, true, { paddingLeft: 1, paddingRight: 1, paddingTop: 1, paddingBottom: 1 });
    };

    // NC-12600: Incident Snapshot
    const generateIncidentSnapshot = () => {
        // 1. Gather Data
        const vibration = sandboxValues?.vibration ?? 0;
        const temp = sandboxValues?.temperature ?? 0;
        const oracleWarning = AncestralOracle.consult(
            vibration > 10 ? 'vibration' : temp > 90 ? 'thermal' : 'corrosion'
        );

        const snapshot = {
            timestamp: new Date().toISOString(),
            telemetry: { ...sandboxValues, stress: sandboxStress },
            oracle: oracleWarning,
            id: `INC-${Math.floor(Math.random() * 10000)}`
        };

        setSnapshotData(snapshot);
        setSnapshotOpen(true);
    };

    return (
        <div className="w-full h-full min-h-[400px] bg-slate-950 relative rounded-xl overflow-hidden border border-slate-800 shadow-inner group">
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Digital Twin</span>
                    <span className="text-xs font-mono text-cyan-400">FRANCIS VERTICAL • LIVE</span>
                    {sandboxStress !== null && (
                        <div className="mt-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 rounded text-[9px] font-mono text-emerald-400 w-fit">
                            SANDBOX ACTIVE
                        </div>
                    )}
                </div>
            </div>

            {/* Snapshot Trigger */}
            <button 
                onClick={generateIncidentSnapshot}
                className="absolute top-4 right-4 z-10 bg-slate-900/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                title="Capture Incident Snapshot"
            >
                <Camera className="w-4 h-4" />
            </button>
            
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[6, 4, 6]} fov={45} />
                <CameraControls ref={cameraControlsRef} maxPolarAngle={Math.PI / 1.5} minDistance={2} maxDistance={20} />
                
                {/* Lighting */}
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
                <pointLight position={[-5, 5, -5]} intensity={0.5} color="#0ea5e9" />
                <Environment preset="city" />

                <FrancisTurbineModel 
                    rpm={rpm} 
                    stress={sandboxStress} 
                    sandboxValues={sandboxValues} 
                    onCameraFocus={handleCameraFocus}
                />
            </Canvas>

            {/* Incident Snapshot Modal (Black Box) */}
            {snapshotOpen && snapshotData && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Database className="w-4 h-4 text-amber-500" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-200">Black Box Record</span>
                            </div>
                            <button onClick={() => setSnapshotOpen(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">Incident Detected</h4>
                                    <p className="text-xs text-slate-500 font-mono">{snapshotData.timestamp}</p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-950 rounded p-3 font-mono text-[10px] text-slate-300 space-y-1 border border-slate-800">
                                <div className="flex justify-between">
                                    <span>VIBRATION:</span>
                                    <span className={snapshotData.telemetry.vibration > 4.5 ? 'text-red-400' : 'text-emerald-400'}>
                                        {snapshotData.telemetry.vibration?.toFixed(2)} mm/s
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>TEMP:</span>
                                    <span className={snapshotData.telemetry.temperature > 70 ? 'text-orange-400' : 'text-emerald-400'}>
                                        {snapshotData.telemetry.temperature?.toFixed(1)} °C
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>STRESS:</span>
                                    <span className={snapshotData.telemetry.stress > 200 ? 'text-red-400' : 'text-emerald-400'}>
                                        {snapshotData.telemetry.stress?.toFixed(1)} MPa
                                    </span>
                                </div>
                            </div>

                            <div className="bg-amber-900/10 border border-amber-500/20 rounded p-3">
                                <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Ancestral Oracle</div>
                                <p className="text-xs text-amber-200 italic leading-relaxed">
                                    "{snapshotData.oracle}"
                                </p>
                            </div>
                        </div>
                        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
                            <button 
                                onClick={() => setSnapshotOpen(false)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded transition-colors"
                            >
                                CLOSE ARCHIVE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
