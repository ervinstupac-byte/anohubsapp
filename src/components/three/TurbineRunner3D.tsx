import React, { useRef, forwardRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { TruthDeltaMap } from '../../utils/TruthDeltaEngine';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useAssetContext } from '../../contexts/AssetContext';

// BRANDING COLORS
const COLORS = {
    CYAN: "#22d3ee", // h-cyan
    GOLD: "#fbbf24", // h-gold (fallback for warnings)
    RED: "#ef4444",   // Danger
    GREEN: "#10b981", // Nominal
    PURPLE: "#a855f7" // Delta Sparks
};

interface DiagnosticHighlights {
    oil?: number;
    cavitation?: number;
    structural?: number;
}

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
    diagnosticHighlights?: DiagnosticHighlights;
    investigatedComponents?: string[];
    turbineType?: 'francis' | 'kaplan';
}

const ModelLoader: React.FC<{ path: string; color: string }> = ({ path, color }) => {
    try {
        const { scene } = useGLTF(path);
        // Apply branding materials to the scene
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.material = new THREE.MeshStandardMaterial({
                    color: color,
                    metalness: 0.9,
                    roughness: 0.2,
                });
            }
        });
        return <primitive object={scene} />;
    } catch (e) {
        console.warn(`Could not load model at ${path}, falling back to primitives.`);
        return null;
    }
};

const RunnerMesh: React.FC<RunnerMeshProps & { active?: boolean }> = ({
    rpm,
    color = COLORS.CYAN,
    deltaMap,
    heatmapMode = false,
    ghostMode = false,
    baselineDelta,
    onSelect,
    highlightId,
    deltaIndex,
    diagnosticHighlights,
    investigatedComponents,
    turbineType = 'francis'
    , active = false
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const toggleInvestigation = useTelemetryStore(state => state.toggleInvestigation);

    const [pautAdvice, setPautAdvice] = React.useState<{ visible: boolean; pos: [number, number, number] }>({ visible: false, pos: [0, 0, 0] });

    // Dynamic pathing based on asset type
    const modelPath = `/assets/models/${turbineType}_turbine.glb`;

    useFrame((state, delta) => {
        // Only animate when active to reduce CPU/GPU usage
        if (!active) return;
        if (groupRef.current) {
            groupRef.current.rotation.y += (rpm / 60) * delta * 2 * Math.PI;
        }
    });

    const handleClick = (id: string, e: any) => {
        e.stopPropagation();
        if (onSelect) onSelect(id);

        // NC-5.4: PAUT Resolution Recommendation for High-Stress Zones
        if (id === 'runner' || id === 'band' || id === 'blade') {
            const clickPos = e.point;
            setPautAdvice({
                visible: true,
                pos: [clickPos.x, clickPos.y, clickPos.z]
            });
            // Auto-hide after 5 seconds
            setTimeout(() => setPautAdvice(prev => ({ ...prev, visible: false })), 5000);
        }

        if (diagnosticHighlights) {
            const CRITICAL_THRESHOLD = 60;
            let serviceToFocus: string | null = null;

            if (id === 'crown' || id === 'noseCone') {
                if (diagnosticHighlights.oil !== undefined && diagnosticHighlights.oil < CRITICAL_THRESHOLD) {
                    serviceToFocus = 'Oil Analysis';
                }
            }

            if (id === 'runner' || id === 'band') {
                if (diagnosticHighlights.cavitation !== undefined && diagnosticHighlights.cavitation < CRITICAL_THRESHOLD) {
                    serviceToFocus = 'Cavitation Specialist';
                }
            }

            if ((id === 'crown' || id === 'band') && !serviceToFocus) {
                if (diagnosticHighlights.structural !== undefined && diagnosticHighlights.structural < 1.2) {
                    serviceToFocus = 'Structural Integrity';
                }
            }

            if (serviceToFocus) {
                const event = new CustomEvent('focusServiceEvent', { detail: { service: serviceToFocus } });
                window.dispatchEvent(event);
                toggleInvestigation(id);
            }
        }
    };

    const getHighlight = (id: string, baseColor: string) => {
        if (highlightId && highlightId.includes(id)) return COLORS.RED;
        if (investigatedComponents?.includes(id)) return COLORS.CYAN;

        const CRITICAL_THRESHOLD = 60;
        if (diagnosticHighlights) {
            if (id === 'crown' || id === 'noseCone') {
                if (diagnosticHighlights.oil !== undefined && diagnosticHighlights.oil < CRITICAL_THRESHOLD) return COLORS.RED;
            }
            if (id === 'runner' || id === 'band') {
                if (diagnosticHighlights.cavitation !== undefined && diagnosticHighlights.cavitation < CRITICAL_THRESHOLD) return COLORS.RED;
            }
            if (id === 'crown' || id === 'band') {
                if (diagnosticHighlights.structural !== undefined && diagnosticHighlights.structural < 1.2) return COLORS.RED;
            }
        }
        return baseColor;
    };

    const emissiveIntensity = heatmapMode ? 0.3 : 0;

    return (
        <group ref={groupRef}>
            {/* Try to load GLB model first */}
            <React.Suspense fallback={null}>
                <ModelLoader path={modelPath} color={color} />
            </React.Suspense>

            {/* NC-5.4: PAUT Recommendation Popover */}
            {pautAdvice.visible && (
                <Html position={pautAdvice.pos} center distanceFactor={10}>
                    <div className="bg-black/90 border border-emerald-500/50 p-2 rounded shadow-2xl backdrop-blur-md animate-fade-in-up whitespace-nowrap pointer-events-none">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                Optimal PAUT Resolution: 0.5mm
                            </span>
                        </div>
                        <div className="text-[7px] text-slate-500 font-mono mt-0.5">
                            Case-Study Verified [SCC Detection]
                        </div>
                    </div>
                </Html>
            )}

            {/* PRIMITIVE FALLBACK / OVERLAY (Shown if model not loaded or for specific parts) */}
            <group>
                <mesh position={[0, 1.2, 0]} onClick={(e) => handleClick('crown', e)}>
                    <cylinderGeometry args={[1.5, 2.5, 0.5, 32]} />
                    <meshStandardMaterial
                        color={getHighlight('crown', color)}
                        metalness={0.9}
                        roughness={0.3}
                        opacity={0.3}
                        transparent={true}
                    />
                </mesh>

                <mesh position={[0, 0, 0]} onClick={(e) => handleClick('band', e)}>
                    <cylinderGeometry args={[3, 3, 0.3, 32]} />
                    <meshStandardMaterial
                        color={getHighlight('band', color)}
                        metalness={0.85}
                        roughness={0.4}
                        opacity={0.3}
                        transparent={true}
                    />
                </mesh>

                {Array.from({ length: 13 }).map((_, i) => {
                    const angle = (i / 13) * Math.PI * 2;
                    const x = Math.cos(angle) * 2.5;
                    const z = Math.sin(angle) * 2.5;
                    return (
                        <mesh key={i} position={[x, 0.5, z]} rotation={[0, angle, Math.PI / 6]} onClick={(e) => handleClick('runner', e)}>
                            <boxGeometry args={[0.3, 1.5, 1.2]} />
                            <meshStandardMaterial
                                color={getHighlight('runner', color)}
                                metalness={0.95}
                                roughness={0.2}
                                opacity={0.3}
                                transparent={true}
                            />
                        </mesh>
                    );
                })}

                <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]} onClick={(e) => handleClick('noseCone', e)}>
                    <coneGeometry args={[1.2, 1.5, 32]} />
                    <meshStandardMaterial
                        color={getHighlight('noseCone', color)}
                        metalness={0.9}
                        roughness={0.3}
                        opacity={0.3}
                        transparent={true}
                    />
                </mesh>
            </group>

            {/* Ghost Mode & Retrofit Delta Logic */}
            {ghostMode && baselineDelta && (
                <group>
                    <mesh position={[0, 1.2, 0]}>
                        <cylinderGeometry args={[1.5, 2.5, 0.5, 32]} />
                        <meshBasicMaterial color="#ffffff" wireframe={true} opacity={0.1} transparent={true} />
                    </mesh>
                    {/* ... other ghost parts ... */}
                </group>
            )}

            {ghostMode && deltaIndex !== undefined && (
                <Html position={[0, 3, 0]} center>
                    <div className="bg-slate-900/90 border border-h-cyan/50 p-2 rounded backdrop-blur-sm pointer-events-none whitespace-nowrap">
                        <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">Retrofit Delta</div>
                        <div className={`text-sm font-bold font-mono ${deltaIndex >= 0 ? 'text-h-green' : 'text-h-red'}`}>
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
    diagnosticHighlights?: DiagnosticHighlights;
    investigatedComponents?: string[];
}>(({ rpm, className, deltaMap, heatmapMode = false, ghostMode = false, baselineDelta, onSelect, highlightId, deltaIndex, diagnosticHighlights, investigatedComponents }, ref) => {
    // Determine turbine type from store or context (default to francis)
    const { selectedAsset } = useAssetContext();
    const turbineType = (selectedAsset?.type || 'francis').toLowerCase() as 'francis' | 'kaplan';

    const [active, setActive] = useState(false);

    return (
        <div ref={ref} className={className || "w-full h-full"} onPointerEnter={() => setActive(true)} onPointerLeave={() => setActive(false)}>
            <Canvas gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }} dpr={[1, 2]} frameloop={active ? 'always' : 'demand'}>
                <PerspectiveCamera makeDefault position={[8, 4, 8]} fov={50} />
                <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={5} maxDistance={20} />
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
                <pointLight position={[-10, -10, -5]} intensity={0.3} color={COLORS.CYAN} />

                <group position={[0, 0, 0]}>
                    <RunnerMesh
                        rpm={rpm}
                        active={active}
                        deltaMap={deltaMap}
                        heatmapMode={heatmapMode}
                        ghostMode={ghostMode}
                        baselineDelta={baselineDelta}
                        onSelect={onSelect}
                        highlightId={highlightId}
                        deltaIndex={deltaIndex}
                        diagnosticHighlights={diagnosticHighlights}
                        investigatedComponents={investigatedComponents}
                        turbineType={turbineType}
                    />
                </group>
                <Environment preset="night" />
            </Canvas>
        </div>
    );
});
