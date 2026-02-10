import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, TorusKnot, Lathe } from '@react-three/drei';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import * as THREE from 'three';

// --- PROPS ---
interface SovereignVisualizerProps {
    sandboxStress?: number | null; // NC-12200: Sandbox Linkage
}

// --- 3D MODEL ---
const FrancisTurbineModel: React.FC<{ rpm: number; stress: number | null }> = ({ rpm, stress }) => {
    const runnerRef = useRef<THREE.Group>(null);
    const spiralCaseRef = useRef<THREE.Group>(null);

    // Rotation Logic
    useFrame((state, delta) => {
        if (runnerRef.current) {
            const rps = rpm / 60;
            const rads = rps * Math.PI * 2 * delta;
            runnerRef.current.rotation.y += rads;
        }
    });

    // --- MATERIALS ---
    // NC-12200: Reactive Material (Red Glow if Stress > 200 MPa)
    const isCriticalStress = stress !== null && stress > 200;

    const caseMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
        color: isCriticalStress ? '#ef4444' : '#64748b', // Red-500 or Slate-500
        metalness: 0.6, 
        roughness: 0.2,
        emissive: isCriticalStress ? '#ef4444' : '#000000',
        emissiveIntensity: isCriticalStress ? 0.5 : 0
    }), [isCriticalStress]);
    
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
        <group>
            {/* SPIRAL CASE (Volute) - Updated to TorusKnot for complexity */}
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

            {/* DRAFT TUBE */}
            <mesh position={[0, -2, 0]} rotation={[Math.PI, 0, 0]} material={caseMaterial}>
                <cylinderGeometry args={[1.5, 2.5, 3, 32, 1, true]} />
            </mesh>
        </group>
    );
};

export const SovereignVisualizer: React.FC<SovereignVisualizerProps> = ({ sandboxStress = null }) => {
    const { mechanical } = useTelemetryStore();
    const rpm = Number(mechanical?.rpm ?? 0);

    return (
        <div className="w-full h-full min-h-[400px] bg-slate-950 relative rounded-xl overflow-hidden border border-slate-800 shadow-inner">
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
            
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[6, 4, 6]} fov={45} />
                <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 1.5} minDistance={4} maxDistance={20} />
                
                {/* Lighting */}
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
                <pointLight position={[-5, 5, -5]} intensity={0.5} color="#0ea5e9" />
                <Environment preset="city" />

                <FrancisTurbineModel rpm={rpm} stress={sandboxStress} />
            </Canvas>
        </div>
    );
};
