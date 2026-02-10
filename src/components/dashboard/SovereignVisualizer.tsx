import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Text } from '@react-three/drei';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import * as THREE from 'three';

// Placeholder Francis Turbine Geometry
const FrancisTurbineModel: React.FC<{ rpm: number }> = ({ rpm }) => {
    const runnerRef = useRef<THREE.Group>(null);
    const spiralCaseRef = useRef<THREE.Group>(null);

    // Rotation Logic: RPM -> Radians per frame
    useFrame((state, delta) => {
        if (runnerRef.current) {
            // RPM / 60 = Revolutions per second
            // * 2PI = Radians per second
            // * delta = Radians for this frame
            const rps = rpm / 60;
            const rads = rps * Math.PI * 2 * delta;
            runnerRef.current.rotation.y += rads;
        }
    });

    // Material definitions
    const steelMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
        color: '#475569', 
        metalness: 0.8, 
        roughness: 0.2 
    }), []);
    
    const runnerMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
        color: '#0ea5e9', // Cyan-500
        metalness: 0.9, 
        roughness: 0.1,
        emissive: '#0ea5e9',
        emissiveIntensity: rpm > 0 ? 0.2 : 0
    }), [rpm]);

    return (
        <group>
            {/* Spiral Case (Torus) - Static */}
            <group ref={spiralCaseRef} rotation={[Math.PI / 2, 0, 0]}>
                <mesh material={steelMaterial}>
                    <torusGeometry args={[3, 1, 16, 100, Math.PI * 1.8]} />
                </mesh>
                {/* Inlet Pipe */}
                <mesh position={[3, 0, 0]} rotation={[0, 0, 0]} material={steelMaterial}>
                    <cylinderGeometry args={[1, 1, 4, 32]} />
                </mesh>
            </group>

            {/* Runner (Rotating Assembly) */}
            <group ref={runnerRef}>
                {/* Hub */}
                <mesh position={[0, 0, 0]} material={runnerMaterial}>
                    <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
                </mesh>
                
                {/* Blades (represented as cones/boxes) */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <mesh 
                        key={i} 
                        position={[Math.sin(i * Math.PI / 6) * 1.5, 0, Math.cos(i * Math.PI / 6) * 1.5]} 
                        rotation={[0, -i * Math.PI / 6, 0]}
                        material={runnerMaterial}
                    >
                        <boxGeometry args={[0.2, 1.8, 1]} />
                    </mesh>
                ))}
            </group>

            {/* Draft Tube (Cone) - Static */}
            <mesh position={[0, -2.5, 0]} rotation={[Math.PI, 0, 0]} material={steelMaterial}>
                <coneGeometry args={[2, 3, 32, 1, true]} />
            </mesh>
        </group>
    );
};

export const SovereignVisualizer: React.FC = () => {
    const { mechanical } = useTelemetryStore();
    const rpm = Number(mechanical?.rpm ?? 0);

    return (
        <div className="w-full h-full min-h-[400px] bg-slate-950 relative rounded-xl overflow-hidden border border-slate-800">
            <div className="absolute top-4 left-4 z-10">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Digital Twin</span>
                    <span className="text-xs font-mono text-cyan-400">FRANCIS VERTICAL • LIVE</span>
                </div>
            </div>
            
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
                <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 1.5} minDistance={3} maxDistance={15} />
                
                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <Environment preset="city" />

                {/* The Machine */}
                <FrancisTurbineModel rpm={rpm} />

                {/* Floor Grid */}
                <gridHelper args={[20, 20, '#1e293b', '#0f172a']} position={[0, -4, 0]} />
            </Canvas>
        </div>
    );
};

// Part of the Sovereign Engineering Corps - Protocol NC-11700.
