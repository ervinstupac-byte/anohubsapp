import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stage, OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface RunnerMeshProps {
    rpm: number;
    color?: string;
}

const RunnerMesh: React.FC<RunnerMeshProps> = ({ rpm, color = "#2dd4bf" }) => {
    const groupRef = useRef<THREE.Group>(null);
    const bladesRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // RPM to Radians per second: RPM * 2PI / 60
            // Slow down visually for effect if needed, but let's try 1:1 scale or 1:10 for visual comfort
            // Real hydro turbines spin 100-600 RPM. 
            // 300 RPM = 5 rot/sec. This is fast visually.
            // Let's scale it down by factor of 0.1 for pleasant UI visualization
            const speedFactor = 0.1;
            const rotationSpeed = (rpm * Math.PI * 2 / 60) * speedFactor;
            groupRef.current.rotation.y -= rotationSpeed * delta;
        }
    });

    // Francis Runner Geometry (Procedural)
    const bladeCount = 13;
    const blades = Array.from({ length: bladeCount });

    return (
        <group ref={groupRef}>
            {/* Crown (Top Hub) */}
            <mesh position={[0, 1.2, 0]}>
                <cylinderGeometry args={[1.5, 2.5, 0.5, 32]} />
                <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.3} />
            </mesh>

            {/* Band (Bottom Ring) - Optional, complex to model simply with primitives, omitting for now or using torus */}
            <mesh position={[0, -1.2, 0]}>
                <torusGeometry args={[2, 0.2, 16, 100]} />
                <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.3} />
            </mesh>

            {/* Blades */}
            <group ref={bladesRef}>
                {blades.map((_, i) => {
                    const angle = (i / bladeCount) * Math.PI * 2;
                    return (
                        <mesh
                            key={i}
                            position={[Math.cos(angle) * 1.8, 0, Math.sin(angle) * 1.8]}
                            rotation={[0, -angle + 0.5, 0.2]} // Slight tilt for "hydro" look
                        >
                            <boxGeometry args={[0.1, 2.2, 1.2]} />
                            <meshStandardMaterial
                                color={color}
                                metalness={0.8}
                                roughness={0.2}
                                emissive={color}
                                emissiveIntensity={0.2}
                            />
                        </mesh>
                    );
                })}
            </group>

            {/* Nose Cone */}
            <mesh position={[0, -1.5, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[1.5, 2, 32]} />
                <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    );
};

export const TurbineRunner3D: React.FC<{ rpm: number; className?: string }> = ({ rpm, className }) => {
    return (
        <div className={className || "w-full h-full"}>
            <Canvas gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[5, 2, 5]} fov={50} />

                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
                <spotLight position={[-5, 5, -5]} angle={0.3} penumbra={1} intensity={1} color="#2dd4bf" />

                {/* Environment Reflection */}
                <Environment preset="city" />

                {/* Model */}
                <group position={[0, 0, 0]}>
                    <RunnerMesh rpm={rpm} />
                </group>

                {/* Controls */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>
        </div>
    );
};
