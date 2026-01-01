import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { TruthDeltaMap } from '../../utils/TruthDeltaEngine';

interface RunnerMeshProps {
    rpm: number;
    color?: string;
    deltaMap?: TruthDeltaMap;
    heatmapMode?: boolean;
    ghostMode?: boolean;
    baselineDelta?: TruthDeltaMap;
    onSelect?: (id: string) => void;
    highlightId?: string | null;
    deltaIndex?: number;
}

const RunnerMesh: React.FC<RunnerMeshProps> = ({
    rpm,
    color = "#2dd4bf",
    deltaMap,
    heatmapMode = false,
    ghostMode = false,
    baselineDelta,
    onSelect,
    highlightId,
    deltaIndex
}) => {
    const groupRef = useRef<THREE.Group>(null);

    // Rotation animation
    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += (rpm / 60) * delta * 2 * Math.PI;
        }
    });

    // Get color for component based on delta map
    const getComponentColor = (componentKey: keyof TruthDeltaMap) => {
        if (!heatmapMode || !deltaMap) return color;
        return deltaMap[componentKey]?.color || color;
    };

    // Get emissive intensity for heatmap mode
    const getEmissive = (componentKey: keyof TruthDeltaMap) => {
        if (!heatmapMode || !deltaMap) return undefined;
        return deltaMap[componentKey]?.color;
    };

    // Helper for click handling
    const handleClick = (id: string, e: any) => {
        e.stopPropagation();
        if (onSelect) onSelect(id);
    };

    // Helper for highlight color
    const getHighlight = (id: string, baseColor: string) => {
        return (highlightId && highlightId.includes(id)) ? "#ef4444" : baseColor; // Tactical Red highlight
    };

    const emissiveIntensity = heatmapMode ? 0.3 : 0;

    return (
        <group ref={groupRef}>
            {/* Main Turbine Meshes */}
            {/* Crown (Top Hub) */}
            <mesh
                position={[0, 1.2, 0]}
                onClick={(e) => handleClick('crown', e)}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                <cylinderGeometry args={[1.5, 2.5, 0.5, 32]} />
                <meshStandardMaterial
                    color={getHighlight('crown', getComponentColor('crown')!)}
                    metalness={0.9}
                    roughness={0.3}
                    emissive={getEmissive('crown')}
                    emissiveIntensity={emissiveIntensity}
                />
            </mesh>

            {/* Band (Outer Ring) */}
            <mesh
                position={[0, 0, 0]}
                onClick={(e) => handleClick('band', e)}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                <cylinderGeometry args={[3, 3, 0.3, 32]} />
                <meshStandardMaterial
                    color={getHighlight('band', getComponentColor('band')!)}
                    metalness={0.85}
                    roughness={0.4}
                    emissive={getEmissive('band')}
                    emissiveIntensity={emissiveIntensity}
                />
            </mesh>

            {/* Runner Blades (13 blades) */}
            {Array.from({ length: 13 }).map((_, i) => {
                const angle = (i / 13) * Math.PI * 2;
                const x = Math.cos(angle) * 2.5;
                const z = Math.sin(angle) * 2.5;
                return (
                    <mesh
                        key={i}
                        position={[x, 0.5, z]}
                        rotation={[0, angle, Math.PI / 6]}
                        onClick={(e) => handleClick('runner', e)}
                    >
                        <boxGeometry args={[0.3, 1.5, 1.2]} />
                        <meshStandardMaterial
                            color={getHighlight('runner', getComponentColor('runner')!)}
                            metalness={0.95}
                            roughness={0.2}
                            emissive={getEmissive('runner')}
                            emissiveIntensity={emissiveIntensity}
                        />
                    </mesh>
                );
            })}

            {/* Nose Cone (Bottom) */}
            <mesh
                position={[0, -0.5, 0]}
                rotation={[Math.PI, 0, 0]}
                onClick={(e) => handleClick('noseCone', e)}
            >
                <coneGeometry args={[1.2, 1.5, 32]} />
                <meshStandardMaterial
                    color={getHighlight('noseCone', getComponentColor('noseCone')!)}
                    metalness={0.9}
                    roughness={0.3}
                    emissive={getEmissive('noseCone')}
                    emissiveIntensity={emissiveIntensity}
                />
            </mesh>

            {/* Ghost Mode: Baseline Overlay */}
            {ghostMode && baselineDelta && (
                <group>
                    {/* Ghost Crown */}
                    <mesh position={[0, 1.2, 0]}>
                        <cylinderGeometry args={[1.5, 2.5, 0.5, 32]} />
                        <meshBasicMaterial
                            color="#ffffff"
                            wireframe={true}
                            opacity={0.3}
                            transparent={true}
                        />
                    </mesh>

                    {/* Ghost Band */}
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[3, 3, 0.3, 32]} />
                        <meshBasicMaterial
                            color="#ffffff"
                            wireframe={true}
                            opacity={0.3}
                            transparent={true}
                        />
                    </mesh>

                    {/* Ghost Blades */}
                    {Array.from({ length: 13 }).map((_, i) => {
                        const angle = (i / 13) * Math.PI * 2;
                        const x = Math.cos(angle) * 2.5;
                        const z = Math.sin(angle) * 2.5;
                        return (
                            <mesh key={`ghost - ${i} `} position={[x, 0.5, z]} rotation={[0, angle, Math.PI / 6]}>
                                <boxGeometry args={[0.3, 1.5, 1.2]} />
                                <meshBasicMaterial
                                    color="#ffffff"
                                    wireframe={true}
                                    opacity={0.3}
                                    transparent={true}
                                />
                            </mesh>
                        );
                    })}

                    {/* Ghost Nose Cone */}
                    <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
                        <coneGeometry args={[1.2, 1.5, 32]} />
                        <meshBasicMaterial
                            color="#ffffff"
                            wireframe={true}
                            opacity={0.3}
                            transparent={true}
                        />
                    </mesh>

                    {/* Delta Sparks (Purple particles at deviation points) */}
                    {deltaMap && Object.entries(deltaMap).map(([key, delta]) => {
                        if (delta.confidence < 80) { // Show sparks where confidence is low (high deviation)
                            return (
                                <mesh key={`spark - ${key} `} position={[0, 0.5, 0]}>
                                    <sphereGeometry args={[0.1, 8, 8]} />
                                    <meshBasicMaterial
                                        color="#a855f7"
                                        opacity={0.6}
                                        transparent={true}
                                    />
                                </mesh>
                            );
                        }
                        return null;
                    })}
                </group>
            )}

            {/* PERFORMANCE DELTA INDEX (GHOST MODE) */}
            {ghostMode && deltaIndex !== undefined && (
                <Html position={[0, 3, 0]} center>
                    <div className="bg-slate-900/90 border border-cyan-500/50 p-2 rounded backdrop-blur-sm pointer-events-none whitespace-nowrap">
                        <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">Retrofit Delta</div>
                        <div className={`text-sm font-bold font-mono ${deltaIndex >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {deltaIndex >= 0 ? '+' : ''}{deltaIndex.toFixed(1)}% {deltaIndex >= 0 ? 'GAIN' : 'LOSS'}
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
};

export const TurbineRunner3D = forwardRef<HTMLDivElement, {
    rpm: number;
    className?: string;
    deltaMap?: TruthDeltaMap;
    heatmapMode?: boolean;
    ghostMode?: boolean;
    baselineDelta?: TruthDeltaMap;
    onSelect?: (id: string) => void;
    highlightId?: string | null;
    deltaIndex?: number;
}>(({ rpm, className, deltaMap, heatmapMode = false, ghostMode = false, baselineDelta, onSelect, highlightId, deltaIndex }, ref) => {
    return (
        <div ref={ref} className={className || "w-full h-full"}>
            <Canvas gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }} dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[8, 4, 8]} fov={50} />
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={5}
                    maxDistance={20}
                />

                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
                <pointLight position={[-10, -10, -5]} intensity={0.3} color="#06b6d4" />

                <group position={[0, 0, 0]}>
                    <RunnerMesh
                        rpm={rpm}
                        deltaMap={deltaMap}
                        heatmapMode={heatmapMode}
                        ghostMode={ghostMode}
                        baselineDelta={baselineDelta}
                        onSelect={onSelect}
                        highlightId={highlightId}
                        deltaIndex={deltaIndex}
                    />
                </group>

                <Environment preset="night" />
            </Canvas>
        </div>
    );
});
