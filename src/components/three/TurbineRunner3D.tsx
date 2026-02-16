import React, { useRef, forwardRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAssetContext } from '../../contexts/AssetContext';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';

// Educational Content Dictionary
const COMPONENT_INFO: Record<string, { title: string; desc: string; metricKey: string; unit: string }> = {
    runner_hub: {
        title: "Runner Hub (Crown)",
        desc: "Central mounting interface. Critical thermal zone for bearing heat dissipation.",
        metricKey: "mechanical.bearingTemp",
        unit: "°C"
    },
    blade: {
        title: "Hydrofoil Blade",
        desc: "Primary torque converter. Subject to high Hoop Stress and cavitation erosion.",
        metricKey: "physics.hoopStressMPa",
        unit: "MPa"
    },
    nose_cone: {
        title: "Nose Cone",
        desc: "Hydrodynamic fairing. Reduces flow separation and vortex formation.",
        metricKey: "mechanical.vibration",
        unit: "mm/s"
    }
};

// Placeholder colors
const COLORS = {
    CYAN: '#22d3ee',
    RED: '#ef4444',
    AMBER: '#f59e0b',
    EMERALD: '#10b981',
    GRAY: '#64748b'
};

interface RunnerMeshProps {
    rpm: number;
    onMeshClick?: (id: string, point: THREE.Vector3 | null) => void;
    active?: boolean;
    turbineType?: string;
    heatmapMode?: boolean;
    deltaMap?: any; // Component ID -> Delta Value (0-100) or TruthDelta Object
    selectedPart?: string | null;
    showInfoPanel?: boolean;
}

const RunnerMesh: React.FC<RunnerMeshProps> = ({ 
    rpm, 
    onMeshClick, 
    active = true, 
    turbineType = 'francis',
    heatmapMode = false,
    deltaMap = {},
    selectedPart,
    showInfoPanel
}) => {
    const groupRef = useRef<THREE.Group | null>(null);
    const [hoveredPart, setHoveredPart] = useState<string | null>(null);
    
    // Optimization: Pre-allocate color objects to avoid garbage collection in useFrame
    const tempColor = useMemo(() => new THREE.Color(), []);
    const baseHubColor = useMemo(() => new THREE.Color(COLORS.CYAN), []);
    const hotColor = useMemo(() => new THREE.Color(COLORS.RED), []);
    const warningColor = useMemo(() => new THREE.Color(COLORS.AMBER), []);

    // Live Data for Info Panel
    const telemetry = useTelemetryStore(state => ({
        bearingTemp: state.mechanical?.bearingTemp ?? 0,
        hoopStress: state.physics?.hoopStressMPa ?? 0,
        vibration: state.mechanical?.vibration ?? 0
    }));

    useFrame((state, delta) => {
        if (active && groupRef.current) {
            // 1. Rotation Animation (Slow down if inspecting)
            const speedMultiplier = selectedPart ? 0.1 : 1.0;
            groupRef.current.rotation.y += (rpm / 60) * delta * 2 * Math.PI * speedMultiplier;

            // 2. Reactive Data Binding (Transient Update Pattern)
            // Access store directly without triggering React re-renders for mesh updates
            const storeState = useTelemetryStore.getState();
            
            // Extract Physics Data
            const bearingTemp = storeState.mechanical?.bearingTemp ?? 40; // °C (Default to nominal)
            const hoopStress = storeState.physics?.hoopStressMPa ?? 0; // MPa
            const vibration = storeState.mechanical?.vibration ?? 0; // mm/s

            // Traverse the mesh group to update materials
            groupRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const material = child.material as THREE.MeshStandardMaterial;
                    const isSelected = selectedPart === child.name || (selectedPart === 'blade' && child.name.startsWith('blade'));
                    const isHovered = hoveredPart === child.name || (hoveredPart === 'blade' && child.name.startsWith('blade'));

                    // Selection Highlight (Emissive Pulse)
                    if (isSelected) {
                        const pulse = (Math.sin(state.clock.elapsedTime * 4) + 1) * 0.5;
                        material.emissive.setHex(0x22d3ee); // Cyan Glow
                        material.emissiveIntensity = 0.5 + (pulse * 0.5);
                    } else if (isHovered) {
                         material.emissive.setHex(0xffffff);
                         material.emissiveIntensity = 0.2;
                    } else {
                        // Reset Emissive if not selected/hovered (unless stress map is active)
                        if (!heatmapMode) material.emissiveIntensity = 0;
                    }

                    // A. Heat Map -> Hub / Bearing
                    // Logic: Nominal < 60°C (Cyan) -> Warning 60-80°C (Amber) -> Critical > 80°C (Red)
                    if (child.name === 'runner_hub') {
                        if (!heatmapMode && !isSelected) { // Only override if not in manual heatmap mode
                            const t = THREE.MathUtils.clamp((bearingTemp - 40) / 60, 0, 1); // Normalize 40-100 range
                            material.color.lerpColors(baseHubColor, hotColor, t);
                        }
                    }

                    // B. Stress Map -> Blades
                    // Logic: Hoop Stress increases emissive intensity (Red Glow)
                    // Range: 0 - 150 MPa
                    if (child.name === 'blade') {
                        if (!heatmapMode && !isSelected) {
                            const stressRatio = THREE.MathUtils.clamp(hoopStress / 150, 0, 1);
                            
                            // Base color remains metallic, but emissive glow represents stress
                            material.emissive.setHex(0xff0000); // Red glow
                            material.emissiveIntensity = stressRatio * 2.0; // Intensity 0.0 -> 2.0

                            // Optional: Vibration wobble effect on vertex shader could go here, 
                            // but for now we'll just pulse the scale slightly if vibration is high
                            if (vibration > 5) {
                                const wobble = 1 + Math.sin(state.clock.elapsedTime * 20) * 0.005 * (vibration / 10);
                                child.scale.setScalar(wobble);
                            } else {
                                child.scale.setScalar(1);
                            }
                        }
                    }
                }
            });
        }
    });

    const handle = (id: string, e: any) => {
        e.stopPropagation();
        // Normalize blade IDs
        const normalizedId = id.startsWith('blade') ? 'blade' : id;
        onMeshClick?.(normalizedId, e?.point ?? null);
    };

    // Helper to get color based on delta map
    const getComponentColor = (componentId: string, defaultColor: string) => {
        if (!heatmapMode || !deltaMap) return defaultColor;
        
        const delta = deltaMap[componentId];
        if (!delta) return COLORS.GRAY; // No data

        // Handle TruthDelta object (from TruthDeltaEngine)
        if (typeof delta === 'object' && 'color' in delta) {
            return delta.color;
        }

        // Handle numeric delta (legacy/simple map)
        if (typeof delta === 'number') {
            // Heatmap gradient: Green (0) -> Yellow (50) -> Red (100)
            if (delta > 80) return COLORS.RED;
            if (delta > 40) return COLORS.AMBER;
            if (delta > 0) return COLORS.EMERALD; // Explicit agreement
        }
        
        return COLORS.GRAY;
    };

    // Render different geometry based on turbine type
    const isPelton = turbineType === 'pelton';
    const isKaplan = turbineType === 'kaplan';

    // Get Info for Panel
    const info = selectedPart ? COMPONENT_INFO[selectedPart] : null;
    const metricValue = info ? (
        info.metricKey === 'mechanical.bearingTemp' ? telemetry.bearingTemp :
        info.metricKey === 'physics.hoopStressMPa' ? telemetry.hoopStress :
        info.metricKey === 'mechanical.vibration' ? telemetry.vibration : 0
    ) : 0;

    return (
        <group ref={groupRef}>
            {/* Info Panel Overlay */}
            {showInfoPanel && info && (
                <Html position={[2, 2, 0]} center style={{ pointerEvents: 'none' }}>
                    <div className="w-64 bg-slate-900/90 backdrop-blur border border-cyan-500/50 p-4 rounded shadow-2xl">
                        <h3 className="text-cyan-400 font-bold font-mono text-sm uppercase mb-1">{info.title}</h3>
                        <p className="text-slate-300 text-xs mb-3 leading-relaxed">{info.desc}</p>
                        
                        <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-white/10">
                            <span className="text-slate-400 text-[10px] font-mono uppercase">Live Metric</span>
                            <div className="text-right">
                                <span className="text-white font-mono font-bold text-sm">{metricValue.toFixed(1)}</span>
                                <span className="text-slate-500 text-[10px] ml-1">{info.unit}</span>
                            </div>
                        </div>
                    </div>
                </Html>
            )}

            {/* HUB/CROWN */}
            <mesh 
                name="runner_hub"
                position={[0, isPelton ? 0 : 0.5, 0]} 
                onClick={(e) => handle('runner_hub', e)}
                onPointerOver={() => setHoveredPart('runner_hub')}
                onPointerOut={() => setHoveredPart(null)}
            >
                <cylinderGeometry args={[isPelton ? 2 : 1.5, isPelton ? 2 : 1.5, 0.5, 32]} />
                <meshStandardMaterial 
                    color={getComponentColor('runner_hub', "#22d3ee")} 
                    transparent 
                    opacity={0.8} 
                    metalness={0.8} 
                    roughness={0.2} 
                />
            </mesh>

            {/* BLADES */}
            {Array.from({ length: isPelton ? 18 : (isKaplan ? 5 : 13) }).map((_, i) => {
                const count = isPelton ? 18 : (isKaplan ? 5 : 13);
                const angle = (i / count) * Math.PI * 2;
                const radius = isPelton ? 2.5 : 2.0;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const bladeId = `blade_${i + 1}`;

                return (
                    <mesh
                        key={i}
                        name={`blade_${i + 1}`}
                        position={[x, 0, z]}
                        rotation={[0, angle, isPelton ? 0 : (isKaplan ? Math.PI / 4 : Math.PI / 6)]}
                        onClick={(e) => handle(bladeId, e)}
                        onPointerOver={() => setHoveredPart('blade')}
                        onPointerOut={() => setHoveredPart(null)}
                    >
                        {isPelton ? (
                            // Pelton Buckets (Simplified as spheres/cups)
                            <sphereGeometry args={[0.4, 16, 16]} />
                        ) : (
                            // Francis/Kaplan Blades
                            <boxGeometry args={[0.3, 1.5, isKaplan ? 1.8 : 1.2]} />
                        )}
                        <meshStandardMaterial
                            color={getComponentColor('blades', isKaplan ? "#facc15" : "#22d3ee")}
                            metalness={0.9}
                            roughness={0.2}
                        />
                    </mesh>
                );
            })}

            {/* NOSE CONE (Francis/Kaplan) */}
            {!isPelton && (
                <mesh 
                    name="nose_cone"
                    position={[0, -1, 0]} 
                    rotation={[Math.PI, 0, 0]} 
                    onClick={(e) => handle('nose_cone', e)}
                    onPointerOver={() => setHoveredPart('nose_cone')}
                    onPointerOut={() => setHoveredPart(null)}
                >
                    <coneGeometry args={[1.0, 1.5, 32]} />
                    <meshStandardMaterial 
                        color={getComponentColor('nose_cone', "#ef4444")} 
                        transparent 
                        opacity={0.6} 
                    />
                </mesh>
            )}
        </group>
    );
};

// Internal Error Boundary for 3D Context
class ThreeErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error: any, errorInfo: any) {
        console.error("3D Turbine Crash:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <mesh>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial color="#ef4444" wireframe />
                </mesh>
            );
        }
        return this.props.children;
    }
}

export interface TurbineRunner3DProps {
    rpm: number;
    className?: string;
    onSelect?: (id: string) => void;
    heatmapMode?: boolean;
    deltaMap?: any;
    selectedPart?: string | null;
    showInfoPanel?: boolean;
}

export const TurbineRunner3D = forwardRef<HTMLDivElement, TurbineRunner3DProps>(({ 
    rpm, 
    className, 
    onSelect,
    heatmapMode,
    deltaMap,
    selectedPart,
    showInfoPanel
}, ref) => {
    const { selectedAsset } = useAssetContext();
    const [active, setActive] = useState(false);
    const [crashSafe, setCrashSafe] = useState(true);
    const glRef = useRef<any>(null);

    // NC-20301: Dispose WebGL context on unmount to prevent GPU leak
    useEffect(() => {
        return () => {
            if (glRef.current) {
                try {
                    glRef.current.dispose();
                    console.log('[TurbineRunner3D] 🧹 WebGL context disposed');
                } catch (e) { /* ignore */ }
                glRef.current = null;
            }
        };
    }, []);

    // Robust type checking
    const turbineType = (selectedAsset?.turbine_type || selectedAsset?.type || 'francis').toLowerCase();

    if (!crashSafe) return <div className="p-4 text-red-500 font-mono text-xs border border-red-500">3D RENDER FAILURE</div>;

    return (
        <div
            ref={ref}
            className={`relative ${className || "w-full h-full"}`}
            onPointerEnter={() => setActive(true)}
            onPointerLeave={() => setActive(false)}
        >
            <Canvas shadows dpr={[1, 2]} frameloop={active ? 'always' : 'demand'}
                gl={{ preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
                onCreated={(state) => {
                    // NC-20301: Capture gl ref for cleanup
                    glRef.current = state.gl;
                    if (!state.gl) setCrashSafe(false);
                    // NC-20801: Handle Context Loss
                    state.gl.domElement.addEventListener('webglcontextlost', (event) => {
                        event.preventDefault();
                        console.warn('[TurbineRunner3D] ⚠️ WebGL Context Lost - Attempting recovery');
                    });
                    state.gl.domElement.addEventListener('webglcontextrestored', () => {
                        console.log('[TurbineRunner3D] ♻️ WebGL Context Restored');
                        setCrashSafe(true);
                        setActive(true);
                        setTimeout(() => setActive(false), 100);
                    });
                }}
            >
                <PerspectiveCamera makeDefault position={[5, 4, 6]} fov={50} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <pointLight position={[-10, -5, -5]} intensity={0.5} color="#22d3ee" />

                <ThreeErrorBoundary>
                    <RunnerMesh
                        rpm={rpm}
                        active={active}
                        turbineType={turbineType}
                        onMeshClick={(id) => onSelect?.(id)}
                        heatmapMode={heatmapMode}
                        deltaMap={deltaMap}
                        selectedPart={selectedPart}
                        showInfoPanel={showInfoPanel}
                    />
                </ThreeErrorBoundary>

                <OrbitControls enablePan={false} minPolarAngle={0} maxPolarAngle={Math.PI / 1.5} />
                <Environment preset="city" />
            </Canvas>

            {/* Type Indicator Overlay */}
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-xs text-white font-mono rounded pointer-events-none">
                TYPE: {turbineType.toUpperCase()}
            </div>
        </div>
    );
});
