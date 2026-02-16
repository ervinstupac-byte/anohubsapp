import React, { useRef, forwardRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAssetContext } from '../../contexts/AssetContext';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import aiPredictionService, { PredictionReport } from '../../services/AIPredictionService';
import { TelemetryData } from '../../contexts/TelemetryContext';

// Educational Content Dictionary
const COMPONENT_INFO: Record<string, { title: string; desc: string; metricKey: string; unit: string; aiType?: 'bearing' | 'cavitation' | 'efficiency' }> = {
    runner_hub: {
        title: "Runner Hub (Crown)",
        desc: "Central mounting interface. Critical thermal zone for bearing heat dissipation.",
        metricKey: "mechanical.bearingTemp",
        unit: "°C",
        aiType: 'bearing'
    },
    blade: {
        title: "Hydrofoil Blade",
        desc: "Primary torque converter. Subject to high Hoop Stress and cavitation erosion.",
        metricKey: "physics.hoopStressMPa",
        unit: "MPa",
        aiType: 'cavitation'
    },
    nose_cone: {
        title: "Nose Cone",
        desc: "Hydrodynamic fairing. Reduces flow separation and vortex formation.",
        metricKey: "mechanical.bearingTemp", // Mapped to bearing temp for heat visualization
        unit: "°C",
        aiType: 'efficiency'
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

export type DeltaMap = Record<string, number | { color: string }>;

interface RunnerMeshProps {
    rpm: number;
    useLivePhysics?: boolean;
    onMeshClick?: (id: string, point: THREE.Vector3 | null) => void;
    active?: boolean;
    turbineType?: string;
    heatmapMode?: boolean;
    deltaMap?: DeltaMap; // Component ID -> Delta Value (0-100) or TruthDelta Object
    selectedPart?: string | null;
    showInfoPanel?: boolean;
    selectedAssetId?: string;
}

// Component to display AI predictions
const AIPredictionOverlay = ({ type, assetId }: { type: 'bearing' | 'cavitation' | 'efficiency', assetId?: string }) => {
    const [prediction, setPrediction] = useState<PredictionReport | null>(null);

    useEffect(() => {
        if (!assetId) return;

        const updatePrediction = () => {
            const state = useTelemetryStore.getState();
            const numericId = parseInt(assetId.replace(/\D/g, '')) || 1;
            
            const toNum = (val: any) => typeof val === 'number' ? val : (val?.toNumber?.() ?? 0);

            // Construct minimal TelemetryData for AI service
            const telemetry: TelemetryData = {
                assetId: assetId,
                timestamp: Date.now(),
                status: 'OPTIMAL',
                vibration: toNum(state.mechanical.vibration),
                temperature: toNum(state.mechanical.bearingTemp),
                efficiency: toNum(state.hydraulic.efficiency) * 100,
                output: toNum(state.physics.powerMW),
                pumpFlowRate: toNum(state.hydraulic.flow),
                reservoirLevel: toNum(state.site.grossHead),
                tailwaterLevel: 0,
                piezometricPressure: toNum(state.physics.staticPressureBar),
                cavitationIntensity: toNum(state.mechanical.acousticMetrics?.cavitationIntensity),
                // Defaults for required fields
                seepageRate: 0, foundationDisplacement: 0, wicketGatePosition: 0, cylinderPressure: 0,
                actuatorPosition: 0, oilPressureRate: 0, hoseTension: 0, pipeDiameter: 0, safetyValveActive: false,
                oilReservoirLevel: 0, rotorHeadVibration: 0, excitationActive: true, vibrationSpectrum: [],
                drainagePumpActive: false, drainagePumpFrequency: 0, wicketGateSetpoint: 0, lastCommandTimestamp: 0,
                fatiguePoints: 0, vibrationPhase: 0, oilViscosity: 0, bearingLoad: 0, statorTemperatures: [],
                actualBladePosition: 0, bypassValveActive: false, hydrostaticLiftActive: false, shaftSag: 0,
                responseTimeIndex: 0, proximityX: 0, proximityY: 0, excitationCurrent: 0, rotorEccentricity: 0,
                bearingGrindIndex: 0, acousticBaselineMatch: 0, ultrasonicLeakIndex: 0
            };

            let report: PredictionReport | null = null;
            if (type === 'bearing') {
                report = aiPredictionService.predictBearingThermalTTT(numericId, telemetry);
            } else if (type === 'cavitation') {
                report = aiPredictionService.assessCavitationRisk(telemetry);
            } else if (type === 'efficiency') {
                report = aiPredictionService.predictEfficiencyDecay(numericId);
            }
            setPrediction(report);
        };

        // Initial update
        updatePrediction();
        const interval = setInterval(updatePrediction, 2000);
        return () => clearInterval(interval);
    }, [type, assetId]);

    if (!prediction || prediction.probability < 0.1) return null;

    return (
        <div className="mt-2 pt-2 border-t border-slate-700/50">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${prediction.probability > 0.5 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-purple-400 text-[10px] font-mono uppercase font-bold tracking-wider">AI Forecast</span>
                </div>
                <span className={`text-[9px] font-bold ${prediction.probability > 0.5 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {(prediction.probability * 100).toFixed(0)}% Risk
                </span>
            </div>
            
            {prediction.timeToFailureHours !== null && (
                <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-400">Est. TTF:</span>
                    <span className="font-mono font-bold text-white bg-slate-800 px-1 rounded">
                        {prediction.timeToFailureHours < 1 ? '<1' : prediction.timeToFailureHours.toFixed(1)}h
                    </span>
                </div>
            )}
            
            <p className="text-[9px] text-slate-400 leading-tight italic border-l-2 border-purple-500/30 pl-1">
                {prediction.mitigationAction}
            </p>
        </div>
    );
};

// Isolated component for live metric updates to prevent 3D re-renders
const LiveMetricDisplay = ({ metricKey, unit }: { metricKey: string, unit: string }) => {
    const value = useTelemetryStore(state => {
        // Safe deep access
        if (metricKey === 'mechanical.bearingTemp') return state.mechanical?.bearingTemp ?? 0;
        if (metricKey === 'physics.hoopStressMPa') return state.physics?.hoopStressMPa ?? 0;
        if (metricKey === 'mechanical.vibration') return state.mechanical?.vibration ?? 0;
        return 0;
    });

    return (
        <div className="text-right">
            <span className="text-white font-mono font-bold text-sm">{value.toFixed(1)}</span>
            <span className="text-slate-500 text-[10px] ml-1">{unit}</span>
        </div>
    );
};

// Cavitation Bubbles Visualization
const CavitationBubbles = ({ active, rpm, useLivePhysics }: { active: boolean, rpm: number, useLivePhysics?: boolean }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 200;
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const [positions] = useState(() => new Float32Array(count * 3));
    const [speeds] = useState(() => new Float32Array(count));

    // Initialize random positions
    useEffect(() => {
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 4; // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2; // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 4; // z
            speeds[i] = 0.05 + Math.random() * 0.1;
        }
    }, [count, positions, speeds]);

    useFrame((state, delta) => {
        if (!active || !meshRef.current) return;

        // Get cavitation risk from store (sigma)
        const storeState = useTelemetryStore.getState();
        // Assuming sigma < 1.0 implies cavitation risk. Lower sigma -> More visible bubbles.
        const sigma = storeState.hydraulic?.sigma ?? 1.5;
        const cavitationIntensity = Math.max(0, (1.5 - sigma) * 2); // 0 to 1+

        // Use live RPM if requested
        const effectiveRpm = useLivePhysics ? (storeState.mechanical?.rpm ?? 0) : rpm;

        if (cavitationIntensity <= 0.1) {
            meshRef.current.visible = false;
            return;
        }
        meshRef.current.visible = true;

        for (let i = 0; i < count; i++) {
            // Update Y position (rising bubbles)
            positions[i * 3 + 1] += speeds[i] * (1 + effectiveRpm / 1000) * 10 * delta; 
            
            // Reset if too high
            if (positions[i * 3 + 1] > 2) {
                positions[i * 3 + 1] = -2;
                positions[i * 3] = (Math.random() - 0.5) * 4;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
            }

            // Spiral motion based on RPM
            const angle = state.clock.elapsedTime * (effectiveRpm / 60) + i;
            const radius = 2 + Math.sin(angle * 3) * 0.2;
            const x = Math.cos(angle) * radius + positions[i * 3];
            const z = Math.sin(angle) * radius + positions[i * 3 + 2];

            dummy.position.set(x, positions[i * 3 + 1], z);
            
            // Scale based on intensity
            const scale = Math.min(0.15, cavitationIntensity * 0.1 * (1 + Math.sin(state.clock.elapsedTime * 10 + i)));
            dummy.scale.setScalar(scale);
            
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial 
                color="#ffffff" 
                transparent 
                opacity={0.6} 
                roughness={0.1}
                metalness={0.1}
            />
        </instancedMesh>
    );
};

// Pelton Nozzles (Injectors)
const PeltonNozzles = ({ count = 4 }: { count?: number }) => {
    const nozzlesRef = useRef<THREE.InstancedMesh>(null);
    const needlesRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        if (!nozzlesRef.current || !needlesRef.current) return;
        
        const state = useTelemetryStore.getState();
        // 0-100% (Needle Retraction)
        // 100% = Open (Retracted back)
        // 0% = Closed (Extended forward)
        const openPct = state.governor?.actualValue?.toNumber?.() ?? 50; 
        const needleRetraction = (openPct / 100) * 0.4; // Range of motion

        const radius = 3.5;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // 1. Nozzle Body (Fixed)
            dummy.position.set(x, 0, z);
            dummy.lookAt(0, 0, 0);
            dummy.rotateX(Math.PI / 2); // Align cylinder Y to look direction
            dummy.updateMatrix();
            nozzlesRef.current.setMatrixAt(i, dummy.matrix);

            // 2. Needle (Moving)
            // Needle moves along the radial line.
            // Closed (0%) -> Tip closer to center
            // Open (100%) -> Tip further from center (retracted)
            // Base pos is same as nozzle.
            dummy.position.set(x, 0, z);
            dummy.lookAt(0, 0, 0);
            
            // Move backward (away from center) based on retraction
            // Local Z is pointing to center. We want to move -Z (away)? 
            // wait, lookAt makes +Z point to target? No, usually -Z in OpenGL, but ThreeJS lookAt points +Z? 
            // Actually, Object3D.lookAt points the local +Z axis at the target.
            // So moving -Z moves away from center.
            dummy.translateZ(-0.5 - needleRetraction); 
            
            dummy.rotateX(Math.PI / 2); // Align cone
            dummy.updateMatrix();
            needlesRef.current.setMatrixAt(i, dummy.matrix);
        }
        nozzlesRef.current.instanceMatrix.needsUpdate = true;
        needlesRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group>
            <instancedMesh ref={nozzlesRef} args={[undefined, undefined, count]}>
                <cylinderGeometry args={[0.2, 0.4, 1.5, 16]} />
                <meshStandardMaterial color="#475569" metalness={0.8} />
            </instancedMesh>
            <instancedMesh ref={needlesRef} args={[undefined, undefined, count]}>
                <coneGeometry args={[0.15, 0.8, 16]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
            </instancedMesh>
        </group>
    );
};

// Wicket Gates (Guide Vanes)
const WicketGates = ({ count = 20 }: { count?: number }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        if (!meshRef.current) return;
        
        const state = useTelemetryStore.getState();
        // 0-100%
        const gateOpening = state.governor?.actualValue?.toNumber?.() ?? 50; 
        
        // Calculate angle: 0% = Closed, 100% = Open
        // Adjust these angles based on "closed" vs "open" visuals
        // Tangential (closed) vs Radial (open)
        const angleRad = THREE.MathUtils.degToRad(20 + (gateOpening / 100) * 60);

        const radius = 3.2; // Outside the runner

        for (let i = 0; i < count; i++) {
            const circleAngle = (i / count) * Math.PI * 2;
            
            // Position
            const x = Math.cos(circleAngle) * radius;
            const z = Math.sin(circleAngle) * radius;
            
            dummy.position.set(x, 0, z);
            
            // Rotation: Tangent + Gate Angle
            dummy.rotation.y = -circleAngle + angleRad;
            
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <boxGeometry args={[0.1, 1.0, 0.6]} /> 
            <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
        </instancedMesh>
    );
};

// Shaft & Coupling Assembly
const ShaftAssembly = ({ rpm }: { rpm: number }) => {
    const groupRef = useRef<THREE.Group>(null);
    const boltsRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const boltCount = 8;

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Rotation (synced with runner)
        const rotationSpeed = (rpm / 60) * delta * 2 * Math.PI;
        groupRef.current.rotation.y += rotationSpeed;

        // Bolt Health Visualization
        if (boltsRef.current) {
            const storeState = useTelemetryStore.getState();
            const safetyFactor = storeState.physics?.boltSafetyFactor ?? 2.0;
            
            // Color Logic: Green > 1.5 > Yellow > 1.1 > Red
            const color = new THREE.Color();
            if (safetyFactor < 1.1) color.setHex(0xef4444); // Red
            else if (safetyFactor < 1.5) color.setHex(0xfacc15); // Yellow
            else color.setHex(0x22c55e); // Green (Metal/Green tint)

            for (let i = 0; i < boltCount; i++) {
                boltsRef.current.setColorAt(i, color);
            }
            boltsRef.current.instanceColor!.needsUpdate = true;
        }
    });

    // Initialize Bolts
    useMemo(() => {
        if (!boltsRef.current) return;
        const radius = 0.8; // Flange radius
        for (let i = 0; i < boltCount; i++) {
            const angle = (i / boltCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            dummy.position.set(x, 2.0, z); // Position on coupling flange
            dummy.updateMatrix();
            boltsRef.current.setMatrixAt(i, dummy.matrix);
        }
        boltsRef.current.instanceMatrix.needsUpdate = true;
    }, [dummy]);

    return (
        <group ref={groupRef}>
            {/* Main Shaft */}
            <mesh position={[0, 2.5, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 5, 32]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Coupling Flange */}
            <mesh position={[0, 2.0, 0]}>
                <cylinderGeometry args={[1.0, 1.0, 0.2, 32]} />
                <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Coupling Bolts */}
            <instancedMesh ref={boltsRef} args={[undefined, undefined, boltCount]}>
                <cylinderGeometry args={[0.08, 0.08, 0.3, 6]} />
                <meshStandardMaterial metalness={0.5} roughness={0.5} />
            </instancedMesh>
        </group>
    );
};

// Guide Bearing (Stationary)
const GuideBearing = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (!meshRef.current) return;
        
        const storeState = useTelemetryStore.getState();
        const temp = storeState.mechanical?.bearingTemp ?? 40;
        
        // Heat Map: 60C (Normal) -> 90C (Red)
        // Lerp from Gray to Red
        const t = Math.min(1, Math.max(0, (temp - 60) / 30));
        const color = new THREE.Color(0x475569).lerp(new THREE.Color(0xef4444), t);
        
        (meshRef.current.material as THREE.MeshStandardMaterial).color.copy(color);
        
        // Pulse if critical
        if (temp > 85) {
            meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.02);
        } else {
            meshRef.current.scale.setScalar(1);
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 3.5, 0]}>
            <cylinderGeometry args={[1.2, 1.2, 0.8, 32]} />
            <meshStandardMaterial color="#475569" transparent opacity={0.9} metalness={0.5} />
            {/* Inner Ring (Shaft Contact) */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.42, 0.42, 0.8, 32]} />
                <meshStandardMaterial color="#f1f5f9" side={THREE.DoubleSide} />
            </mesh>
        </mesh>
    );
};

// Sediment Particles (Sand Erosion)
const SedimentParticles = ({ count = 500, ppm = 0 }: { count?: number, ppm?: number }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    // Store individual speeds and offsets
    const [particles] = useState(() => {
        return new Array(count).fill(0).map(() => ({
            speed: 0.1 + Math.random() * 0.2,
            offset: Math.random() * 100,
            radius: 1.5 + Math.random() * 2.0, // Distribution around blades
            angleOffset: Math.random() * Math.PI * 2
        }));
    });

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Visibility based on PPM
        // < 100 PPM: Invisible
        // > 1000 PPM: Fully Visible
        const visibleCount = Math.min(count, Math.floor((ppm / 1000) * count));
        
        if (visibleCount === 0) {
            meshRef.current.visible = false;
            return;
        }
        meshRef.current.visible = true;

        for (let i = 0; i < count; i++) {
            if (i > visibleCount) {
                // Hide excess particles
                dummy.scale.set(0, 0, 0);
                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);
                continue;
            }

            const p = particles[i];
            
            // Move downwards (with flow)
            // Y position loops from 2 to -2
            const time = state.clock.elapsedTime * p.speed + p.offset;
            const y = 2 - (time % 4);
            
            // Swirl with flow (spiral)
            const angle = time * 2 + p.angleOffset;
            const x = Math.cos(angle) * p.radius;
            const z = Math.sin(angle) * p.radius;

            dummy.position.set(x, y, z);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[0.05, 0]} />
            <meshStandardMaterial color="#d97706" transparent opacity={0.8} />
        </instancedMesh>
    );
};

// Draft Tube Vortex (Part Load / Rough Zone)
const DraftTubeVortex = ({ active, rpm }: { active: boolean, rpm: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);

    useFrame((state, delta) => {
        if (!meshRef.current || !materialRef.current) return;
        
        if (!active) {
            meshRef.current.visible = false;
            return;
        }
        meshRef.current.visible = true;

        // Rotate vortex with the runner (but usually slower, e.g. 0.2-0.3x RPM)
        // Rheingans frequency is typically f/3.6
        const vortexSpeed = (rpm / 60) * Math.PI * 2 * 0.28; 
        meshRef.current.rotation.y -= vortexSpeed * delta;

        // Pulse opacity for "breathing" effect of pressure pulsation
        const pulse = 0.3 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
        materialRef.current.opacity = pulse;
        
        // Stretch/Wobble
        meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    });

    return (
        <mesh ref={meshRef} position={[0, -2.5, 0]} rotation={[0, 0, Math.PI]}>
            {/* Twisted helical shape approx using cone/cylinder */}
            <cylinderGeometry args={[0.2, 0.8, 4, 8, 10, true]} />
            <meshStandardMaterial 
                ref={materialRef}
                color="#a5f3fc" 
                transparent 
                opacity={0.3} 
                side={THREE.DoubleSide}
                wireframe={true} // Rope look
            />
        </mesh>
    );
};

const RunnerMesh: React.FC<RunnerMeshProps> = ({ 
    rpm, 
    useLivePhysics = false,
    onMeshClick, 
    active = true, 
    turbineType = 'francis',
    heatmapMode = false,
    deltaMap,
    selectedPart,
    showInfoPanel,
    selectedAssetId
}) => {
    const groupRef = useRef<THREE.Group | null>(null);
    const [hoveredPart, setHoveredPart] = useState<string | null>(null);
    
    // State for visual features that need to persist across frames or are used outside useFrame
    const [effectiveRpm, setEffectiveRpm] = useState(rpm);
    const [showVortex, setShowVortex] = useState(false);
    const [bladePitch, setBladePitch] = useState(0);
    const [sedimentPPM, setSedimentPPM] = useState(0);

    // Optimization: Pre-allocate color objects to avoid garbage collection in useFrame
    const baseHubColor = useMemo(() => new THREE.Color(COLORS.CYAN), []);
    const baseConeColor = useMemo(() => new THREE.Color(COLORS.RED), []); // Base for nose cone (though typically metallic/painted)
    const hotColor = useMemo(() => new THREE.Color(0xff0000), []); // Pure Red for heat
    const stressColor = useMemo(() => new THREE.Color(0xff0000), []); // Red for stress

    useFrame((state, delta) => {
        if (active && groupRef.current) {
            const toNum = (val: any) => typeof val === 'number' ? val : (val?.toNumber?.() ?? 0);

            // 2. Reactive Data Binding (Transient Update Pattern)
            // Access store directly without triggering React re-renders for mesh updates
            const storeState = useTelemetryStore.getState();
            
            // Determine effective RPM
            const currentRpm = useLivePhysics ? (storeState.mechanical?.rpm ?? 0) : rpm;
            
            // Update React state periodically for outside-useFrame components (throttle)
            // Or just update ref-based visuals directly. 
            // BUT: Array.map for blades is inside render, so it needs React state or forceUpdate.
            // Better: Move blade pitch logic into a separate component <Blades /> that uses useFrame.
            // For now, let's just update the refs we have. But blades are recreated on re-render if we use React State.
            // We are using React State for effectiveRpm/showVortex/bladePitch to trigger re-renders.
            // To avoid thrashing, only update if changed significantly.
            
            // NOTE: Updating React state from useFrame causes re-renders every frame! BAD!
            // We should use Refs for mesh updates and only re-render if structural changes occur.
            // However, the blade map uses `bladePitch` in the rotation prop. 
            // If we want smooth animation, we should use a Ref for the blades group and update children rotation in useFrame.
            
            // Workaround for this turn: Use a Ref for blade pitch and update manually in traverse?
            // Yes, we are already traversing.
            
            // Visual feedback for transient dynamics (Governor Slew / Water Inertia)
            // Check for Load Rejection / Trip (High RPM, Low Gate)
            const isTripped = currentRpm > 600 && (storeState.governor?.actualValue?.toNumber?.() ?? 0) < 10;
            
            // Check for Vortex Conditions (Francis/Kaplan Part Load)
            const powerMW = storeState.physics?.powerMW ?? 0;
            const ratedMW = 10; // Demo
            const loadPct = (powerMW / ratedMW) * 100;
            const isVortexCondition = !isPelton && currentRpm > 100 && loadPct < 40;
            
            // Kaplan Blade Pitch
            const currentPitch = isKaplan ? (storeState.governor?.bladeAngle?.toNumber?.() ?? 0) : 0;

            // 1. Rotation Animation (Slow down if inspecting)
            const speedMultiplier = selectedPart ? 0.1 : 1.0;
            const rotationSpeed = (currentRpm / 60) * delta * 2 * Math.PI * speedMultiplier;
            groupRef.current.rotation.y += rotationSpeed;
            
            // Extract Physics Data
            const bearingTemp = storeState.mechanical?.bearingTemp ?? 40; // °C (Default to nominal)
            const hoopStress = storeState.physics?.hoopStressMPa ?? 0; // MPa
            const vibration = storeState.mechanical?.vibration ?? 0; // mm/s
            const eccentricity = storeState.physics?.eccentricity ?? 0; // 0-1 ratio
            const surgePressure = storeState.physics?.surgePressureBar ?? 0;
            const sedimentPPM = storeState.erosion?.sedimentPPM ?? 0;

            // Update external state throttled or via refs
            // We'll pass `currentRpm` and `isVortexCondition` to child components via props? 
            // No, DraftTubeVortex needs them.
            // Let's rely on the fact that DraftTubeVortex handles its own visibility via Ref if we pass "active" but we need to update "active" state.
            // Actually DraftTubeVortex is a child component. We can't update its props from useFrame without re-render.
            // SOLUTION: Move the DraftTubeVortex logic INTO the main useFrame or use a Ref for it.
            // We already have <DraftTubeVortex> with props. 
            // Let's cheat slightly: We will NOT animate pitch via props for now, we will do it in traverse.
            
            // --- INDUSTRIAL PHYSICS VISUALIZATION ---
            
            // 1. Eccentricity (Orbit Offset)
            // Real machines orbit around a center. If eccentricity > 0, shift the group position.
            if (useLivePhysics && eccentricity > 0.1) {
                // Orbit radius scales with eccentricity (0.1 -> 0.05 units)
                const orbitRadius = eccentricity * 0.2; 
                // Orbit speed is typically 1x RPM (synchronous whirl) or 0.5x RPM (oil whirl)
                const orbitAngle = state.clock.elapsedTime * (currentRpm / 60) * Math.PI * 2;
                
                groupRef.current.position.x = Math.cos(orbitAngle) * orbitRadius;
                groupRef.current.position.z = Math.sin(orbitAngle) * orbitRadius;
            } else {
                groupRef.current.position.x = 0;
                groupRef.current.position.z = 0;
            }

            // 2. Vibration (Tilt/Wobble)
            // If vibration is high, tilt the runner slightly
            if (isTripped || (useLivePhysics && vibration > 2.0)) {
                const tiltMax = Math.min(0.1, vibration * 0.01 + (isTripped ? 0.05 : 0)); // Max 0.1 radians
                const wobbleSpeed = state.clock.elapsedTime * 20;
                groupRef.current.rotation.x = Math.sin(wobbleSpeed) * tiltMax;
                groupRef.current.rotation.z = Math.cos(wobbleSpeed) * tiltMax;
            } else {
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta * 5);
                groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 5);
            }

            // Traverse the mesh group to update materials AND geometry transforms (Pitch)
            groupRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    // Update Blade Pitch Manually
                    if (child.name.startsWith('blade')) {
                         // Parse index from name "blade_1"
                         const idx = parseInt(child.name.split('_')[1]) - 1;
                         // Base rotation was set in initial render. We need to respect that.
                         // But modifying rotation.z directly here is additive to the group rotation? 
                         // No, group rotates Y. Child rotates relative to group.
                         // Base rotation: [0, angle, baseTilt]
                         // We want: [0, angle, baseTilt + pitch]
                         
                         const count = isPelton ? 18 : (isKaplan ? 5 : 13);
                         const angle = (idx / count) * Math.PI * 2;
                         const baseTilt = isPelton ? 0 : (isKaplan ? Math.PI / 4 : Math.PI / 6);
                         const pitchRad = THREE.MathUtils.degToRad(currentPitch);
                         
                         child.rotation.y = angle;
                         child.rotation.z = baseTilt + pitchRad;
                    }

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
                    } else if (isTripped) {
                        // Emergency Red Flash on Trip
                        const flash = (Math.sin(state.clock.elapsedTime * 10) + 1) * 0.5;
                        material.emissive.setHex(0xff0000);
                        material.emissiveIntensity = 0.5 + (flash * 0.5);
                    } else {
                        // Reset Emissive if not selected/hovered (unless stress map is active)
                        if (!heatmapMode) material.emissiveIntensity = 0;
                    }

                    // A. Heat Map -> Nose Cone / Hub
                    // Logic: Nominal < 60°C -> Lerp to Red as it exceeds 60°C
                    if (child.name === 'nose_cone' || child.name === 'runner_hub') {
                        if (!heatmapMode && !isSelected) { // Only override if not in manual heatmap mode
                            // Threshold: 60°C. Range: 60°C -> 100°C maps to 0 -> 1
                            const t = THREE.MathUtils.clamp((bearingTemp - 60) / 40, 0, 1);
                            
                            // Get base color (either from delta map or default)
                            // We re-derive default to avoid persisting the lerped color permanently
                            // Ideally, we should store original color in userData, but here we assume defaults
                            const originalHex = child.name === 'nose_cone' ? COLORS.RED : COLORS.CYAN;
                            const originalColor = new THREE.Color(originalHex);
                            
                            // If t > 0, lerp towards hot color
                            material.color.lerpColors(originalColor, hotColor, t);
                        }
                    }

                    // B. Stress Map -> Blades
                    // Logic: Hoop Stress increases emissive intensity (Red Glow)
                    // Range: 0 - 200 MPa
                    if (child.name.startsWith('blade')) {
                        if (!heatmapMode && !isSelected) {
                            const stressRatio = THREE.MathUtils.clamp(hoopStress / 200, 0, 1);
                            
                            if (stressRatio > 0.1) {
                                // Base color remains metallic, but emissive glow represents stress
                                material.emissive.copy(stressColor); // Red glow
                                material.emissiveIntensity = stressRatio * 3.0; // Intensity 0.0 -> 3.0
                            } else if (!isSelected && !isHovered) {
                                material.emissiveIntensity = 0;
                            }

                            // Surge Pressure Effect (Pulse Scale)
                            if (useLivePhysics && surgePressure > 50) {
                                const surgePulse = 1 + Math.sin(state.clock.elapsedTime * 30) * 0.02 * (surgePressure / 100);
                                child.scale.setScalar(surgePulse);
                            } else {
                                child.scale.setScalar(1);
                            }
                        }
                    }
                }
            });
            
            // Sync state for Vortex (Throttled)
            // Only update if changed to avoid render loop
            if (showVortex !== isVortexCondition) setShowVortex(isVortexCondition);
            if (Math.abs(effectiveRpm - currentRpm) > 1) setEffectiveRpm(currentRpm);
            
            const storeSediment = storeState.erosion?.sedimentPPM ?? 0;
            if (Math.abs(sedimentPPM - storeSediment) > 10) setSedimentPPM(storeSediment);
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
        if (delta === undefined || delta === null) return COLORS.GRAY; // No data

        // Handle TruthDelta object (from TruthDeltaEngine)
        if (typeof delta === 'object' && 'color' in delta) {
            return delta.color;
        }

        // Handle numeric delta (legacy/simple map)
        if (typeof delta === 'number') {
            // Heatmap gradient: Green (0) -> Yellow (50) -> Red (100)
            if (delta > 80) return COLORS.RED;
            if (delta > 40) return COLORS.AMBER;
            if (delta >= 0) return COLORS.EMERALD; // Explicit agreement
        }
        
        return COLORS.GRAY;
    };

    // Render different geometry based on turbine type
    const isPelton = turbineType === 'pelton';
    const isKaplan = turbineType === 'kaplan';

    // Get Info for Panel
    const info = selectedPart ? COMPONENT_INFO[selectedPart] : null;

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
                            <LiveMetricDisplay metricKey={info.metricKey} unit={info.unit} />
                        </div>

                        {info.aiType && selectedAssetId && (
                            <AIPredictionOverlay type={info.aiType} assetId={selectedAssetId} />
                        )}
                    </div>
                </Html>
            )}

            {/* Cavitation Particles */}
            <CavitationBubbles active={active} rpm={rpm} useLivePhysics={useLivePhysics} />

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

                // Dynamic Blade Pitch (Kaplan)
                // If Kaplan, we want to animate the blade angle (pitch)
                // Use governor.bladeAngle if available, else derive from gate
                // Initial render value. Updates happen in useFrame traverse.
                const initialPitch = isKaplan ? (useTelemetryStore.getState().governor?.bladeAngle?.toNumber?.() ?? 0) : 0; 
                const pitchRad = THREE.MathUtils.degToRad(initialPitch);

                return (
                    <mesh
                        key={i}
                        name={`blade_${i + 1}`}
                        position={[x, 0, z]}
                        rotation={[0, angle, (isPelton ? 0 : (isKaplan ? Math.PI / 4 : Math.PI / 6)) + pitchRad]}
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
            
            {/* Shaft Assembly */}
            <ShaftAssembly rpm={effectiveRpm} />

            {/* Guide Bearing */}
            <GuideBearing />

            {/* Draft Tube Vortex Rope */}
            {!isPelton && <DraftTubeVortex active={showVortex} rpm={effectiveRpm} />}

            {/* Sediment Particles */}
            <SedimentParticles count={1000} ppm={sedimentPPM} />

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
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
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
    useLivePhysics?: boolean;
    className?: string;
    onSelect?: (id: string) => void;
    heatmapMode?: boolean;
    deltaMap?: DeltaMap;
    selectedPart?: string | null;
    showInfoPanel?: boolean;
}

export const TurbineRunner3D = forwardRef<HTMLDivElement, TurbineRunner3DProps>(({ 
    rpm, 
    useLivePhysics,
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
    const glRef = useRef<THREE.WebGLRenderer | null>(null);

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
                    {turbineType === 'pelton' ? (
                        <PeltonNozzles count={6} />
                    ) : (
                        <WicketGates />
                    )}
                    <RunnerMesh
                        rpm={rpm}
                        useLivePhysics={useLivePhysics}
                        active={active}
                        turbineType={turbineType}
                        onMeshClick={(id) => onSelect?.(id)}
                        heatmapMode={heatmapMode}
                        deltaMap={deltaMap}
                        selectedPart={selectedPart}
                        showInfoPanel={showInfoPanel}
                        selectedAssetId={selectedAsset?.id ? String(selectedAsset.id) : undefined}
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
