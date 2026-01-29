import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import ComponentInfoPanel from '../diagnostics/ComponentInfoPanel';
import { useAssetContext } from '../../contexts/AssetContext';
import { supabase } from '../../services/supabaseClient';

const RunnerMesh: React.FC<{ rpm: number; onMeshClick?: (id: string, point: THREE.Vector3 | null) => void }> = ({ rpm, onMeshClick }) => {
  const groupRef = useRef<THREE.Group | null>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += (rpm / 60) * delta * 2 * Math.PI;
  });

  const handle = (id: string, e: any) => {
    e.stopPropagation();
    onMeshClick?.(id, e?.point ?? null);
  };

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]} onClick={(e) => handle('runner', e)}>
        <boxGeometry args={[3, 0.3, 3]} />
        <meshStandardMaterial color="#22d3ee" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, -0.6, 0]} onClick={(e) => handle('noseCone', e)}>
        <coneGeometry args={[0.8, 1.2, 16]} />
        <meshStandardMaterial color="#ef4444" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

interface TurbineRunner3DProps {
  rpm: number;
  className?: string;
  deltaMap?: any;
  heatmapMode?: boolean;
  ghostMode?: boolean;
  baselineDelta?: any;
  onSelect?: (id: string) => void;
  highlightId?: string | null;
  deltaIndex?: number;
  diagnosticHighlights?: any;
  investigatedComponents?: string[];
}

const TurbineRunner3D = forwardRef<HTMLDivElement, TurbineRunner3DProps>(({ rpm }, ref) => {
  const { selectedAsset } = useAssetContext();
  const [educationMode, setEducationMode] = useState(false);
  const [selectedMeshId, setSelectedMeshId] = useState<string | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel('public:work_orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'work_orders' }, () => {})
      .subscribe();
    return () => { try { supabase.removeChannel(channel); } catch (_) { } };
  }, [selectedAsset]);

  const handleMeshClick = (id?: string | null) => {
    if (!id) return;
    setSelectedMeshId(id);
  };

  return (
    <div ref={ref} className="w-full h-full relative">
      <div className="absolute top-3 right-3 z-30">
        <label className="flex items-center gap-2 bg-white/90 border px-2 py-1 rounded">
          <input type="checkbox" checked={educationMode} onChange={(e) => setEducationMode(e.target.checked)} />
          <span className="text-xs">Education Mode</span>
        </label>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[4, 3, 6]} fov={50} />
        <ambientLight intensity={0.5} />
        <RunnerMesh rpm={rpm} onMeshClick={(id, p) => handleMeshClick(id)} />
        <OrbitControls />
        <Environment preset="sunset" />
      </Canvas>

      {selectedMeshId && (
        <div className="fixed right-0 top-0 h-full z-40 w-96 p-4 bg-white/95">
          <ComponentInfoPanel meshId={selectedMeshId} onClose={() => setSelectedMeshId(null)} />
        </div>
      )}
    </div>
  );
});

export default TurbineRunner3D;
export { TurbineRunner3D };
