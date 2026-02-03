import React, { useRef, forwardRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAssetContext } from '../../contexts/AssetContext';
// import ComponentInfoPanel from '../diagnostics/ComponentInfoPanel'; // Commented out to avoid circular deps if broken
// We can use a simplified internal info panel or just the one from the second block if it exists.
// The second block imported ComponentInfoPanel from '../ui/ComponentInfoPanel'.
// Let's assume we might need a fallback.

// Placeholder colors
const COLORS = {
    CYAN: '#22d3ee',
    RED: '#ef4444',
    AMBER: '#f59e0b',
    EMERALD: '#10b981'
};

const RunnerMesh: React.FC<{
    rpm: number;
    onMeshClick?: (id: string, point: THREE.Vector3 | null) => void;
    active?: boolean;
    turbineType?: string;
    deltaMap?: any;
    heatmapMode?: boolean;
}> = ({ rpm, onMeshClick, active = true, turbineType = 'francis', deltaMap, heatmapMode }) => {
    const groupRef = useRef<THREE.Group | null>(null);

    useFrame((_, delta) => {
        if (active && groupRef.current) {
            groupRef.current.rotation.y += (rpm / 60) * delta * 2 * Math.PI;
        }
    });

    const handle = (id: string, e: any) => {
        e.stopPropagation();
        onMeshClick?.(id, e?.point ?? null);
    };

    // Render different geometry based on turbine type
    const isPelton = turbineType === 'pelton';
    const isKaplan = turbineType === 'kaplan';

    return (
        <group ref={groupRef}>
            {/* HUB/CROWN */}
            <mesh position={[0, isPelton ? 0 : 0.5, 0]} onClick={(e) => handle('runner', e)}>
                <cylinderGeometry args={[isPelton ? 2 : 1.5, isPelton ? 2 : 1.5, 0.5, 32]} />
                <meshStandardMaterial color="#22d3ee" transparent opacity={0.8} metalness={0.8} roughness={0.2} />
            </mesh>

            {/* BLADES */}
            {Array.from({ length: isPelton ? 18 : (isKaplan ? 5 : 13) }).map((_, i) => {
                const count = isPelton ? 18 : (isKaplan ? 5 : 13);
                const angle = (i / count) * Math.PI * 2;
                const radius = isPelton ? 2.5 : 2.0;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;

                return (
                    <mesh
                        key={i}
                        position={[x, 0, z]}
                        rotation={[0, angle, isPelton ? 0 : (isKaplan ? Math.PI / 4 : Math.PI / 6)]}
                        onClick={(e) => handle('blade', e)}
                    >
                        {isPelton ? (
                            // Pelton Buckets (Simplified as spheres/cups)
                            <sphereGeometry args={[0.4, 16, 16]} />
                        ) : (
                            // Francis/Kaplan Blades
                            <boxGeometry args={[0.3, 1.5, isKaplan ? 1.8 : 1.2]} />
                        )}
                        <meshStandardMaterial
                            color={isKaplan ? "#facc15" : "#22d3ee"}
                            metalness={0.9}
                            roughness={0.2}
                        />
                    </mesh>
                );
            })}

            {/* NOSE CONE (Francis/Kaplan) */}
            {!isPelton && (
                <mesh position={[0, -1, 0]} rotation={[Math.PI, 0, 0]} onClick={(e) => handle('noseCone', e)}>
                    <coneGeometry args={[1.0, 1.5, 32]} />
                    <meshStandardMaterial color="#ef4444" transparent opacity={0.6} />
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

export const TurbineRunner3D = forwardRef<HTMLDivElement, {
    rpm: number;
    className?: string;
    onSelect?: (id: string) => void;
    deltaMap?: any;
    heatmapMode?: boolean;
    ghostMode?: boolean;
    baselineDelta?: any;
    deltaIndex?: number;
    showInfoPanel?: boolean;
    highlightId?: string | null;
    diagnosticHighlights?: {
        oil?: number;
        cavitation?: number;
        structural?: number;
    };
    investigatedComponents?: any[];
}>(({ rpm, className, onSelect, deltaMap, heatmapMode, ghostMode, baselineDelta, deltaIndex, showInfoPanel, highlightId, diagnosticHighlights, investigatedComponents }, ref) => {
    const { selectedAsset } = useAssetContext();
    const [active, setActive] = useState(false);
    const [crashSafe, setCrashSafe] = useState(true);

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
                onCreated={(state) => {
                    // Safety check context
                    if (!state.gl) setCrashSafe(false);
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
                        deltaMap={deltaMap}
                        heatmapMode={heatmapMode}
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

export default TurbineRunner3D;
