import React, { useEffect, useRef, useState } from 'react';

interface Marker {
    id: string;
    x: number; // percentage (0-100)
    y: number; // percentage (0-100)
    label: string;
}

interface Props {
    activeAssetId?: string | null;
    xrayEnabled?: boolean;
    setXrayEnabled?: (v: boolean) => void;
    onMarkerClick?: (id: string) => void;
}

const KAPLAN_MARKERS: Marker[] = [
    { id: 'generator', x: 50, y: 20, label: 'Generator' },
    { id: 'spiral-casing', x: 20, y: 50, label: 'Spiral Casing' },
    { id: 'guide-vanes', x: 35, y: 60, label: 'Guide Vanes' },
    { id: 'runner', x: 50, y: 70, label: 'Kaplan Runner' },
    { id: 'draft-tube', x: 50, y: 90, label: 'Draft Tube' },
];

/**
 * KaplanSurgicalTwin - Image-based interactive twin for Kaplan
 */
const KaplanSurgicalTwin: React.FC<Props> = ({ activeAssetId, xrayEnabled, setXrayEnabled, onMarkerClick }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState<number>(1);
    const [panX, setPanX] = useState<number>(0);
    const [panY, setPanY] = useState<number>(0);
    const isPanningRef = useRef(false);
    const panStartRef = useRef<{x:number;y:number}|null>(null);

    const imageSrc = '/assets/pic.s_Background/vertikalniKaplan_fullview.png';
    const markers = KAPLAN_MARKERS;

    // Pointer-based panning + wheel zoom
    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        const targetElement = el.querySelector('#zoom-container') as HTMLElement | null;
        if (!targetElement) return;

        const onWheel = (ev: WheelEvent) => {
            ev.preventDefault();
            const rect = targetElement.getBoundingClientRect();
            const cx = ev.clientX - rect.left;
            const cy = ev.clientY - rect.top;
            const delta = -ev.deltaY;
            const factor = Math.exp(delta * 0.0012); // smooth zoom
            const newZoom = Math.max(0.4, Math.min(4, +(zoom * factor).toFixed(3)));

            // adjust pan so the point under cursor stays fixed
            const newPanX = cx - (cx - panX) * (newZoom / zoom);
            const newPanY = cy - (cy - panY) * (newZoom / zoom);
            setZoom(newZoom);
            setPanX(newPanX);
            setPanY(newPanY);
        };

        let pointerId: number | null = null;

        const onPointerDown = (ev: PointerEvent) => {
            if (ev.button !== 0) return;
            isPanningRef.current = true;
            pointerId = ev.pointerId;
            try { (ev.target as Element).setPointerCapture(pointerId); } catch(e){}
            panStartRef.current = { x: ev.clientX - panX, y: ev.clientY - panY };
        };

        const onPointerMove = (ev: PointerEvent) => {
            if (!isPanningRef.current || panStartRef.current == null) return;
            setPanX(ev.clientX - panStartRef.current.x);
            setPanY(ev.clientY - panStartRef.current.y);
        };

        const onPointerUp = (ev: PointerEvent) => {
            if (pointerId !== null) {
                try { (ev.target as Element).releasePointerCapture(pointerId); } catch (e) {}
            }
            isPanningRef.current = false;
            panStartRef.current = null;
            pointerId = null;
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        el.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        return () => {
            el.removeEventListener('wheel', onWheel);
            el.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [zoom, panX, panY]);

    const zoomIn = () => setZoom(z => Math.min(3, +(z + 0.15).toFixed(2)));
    const zoomOut = () => setZoom(z => Math.max(0.5, +(z - 0.15).toFixed(2)));
    const resetZoom = () => {
        setZoom(1);
        setPanX(0);
        setPanY(0);
    };

    const handleMarkerClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (onMarkerClick) onMarkerClick(id);
        
        try {
            window.dispatchEvent(new CustomEvent('twin:asset-click', { detail: id }));
        } catch (err) {
            console.warn('Unable to dispatch twin:asset-click', err);
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4 relative bg-[#0b1121] overflow-hidden" ref={containerRef}>
            
            {/* The Pan/Zoom Container */}
            <div 
                id="zoom-container"
                className="relative w-[80%] max-w-4xl aspect-[4/3] touch-none select-none"
                style={{
                    transformOrigin: '0 0',
                    transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                    transition: isPanningRef.current ? 'none' : 'transform 100ms ease'
                }}
            >
                {/* Background Image */}
                <img 
                    src={imageSrc} 
                    alt="Kaplan Turbine Twin" 
                    className={`w-full h-full object-contain pointer-events-none transition-all duration-500 ${xrayEnabled ? 'grayscale opacity-60 mix-blend-screen' : ''}`}
                    draggable={false}
                />

                {/* Markers Overlay */}
                {markers.map(marker => {
                    const isActive = activeAssetId === marker.id;
                    return (
                        <div 
                            key={marker.id}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer group`}
                            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                            onClick={(e) => handleMarkerClick(marker.id, e)}
                        >
                            {/* Pulse Effect */}
                            <div className={`absolute w-8 h-8 rounded-full border-2 ${isActive ? 'border-cyan-400 animate-ping opacity-100' : 'border-cyan-500/50 group-hover:animate-ping opacity-0 group-hover:opacity-100'} transition-all`} />
                            
                            {/* Marker Core */}
                            <div className={`w-4 h-4 rounded-full border-2 shadow-[0_0_15px_rgba(34,211,238,0.8)] transition-all z-10 ${isActive ? 'bg-cyan-400 border-white scale-125' : 'bg-slate-900 border-cyan-500 group-hover:bg-cyan-900'}`} />
                            
                            {/* Label */}
                            <div className={`mt-2 px-2 py-1 bg-slate-900/80 backdrop-blur-sm border rounded text-[10px] font-mono tracking-widest whitespace-nowrap transition-all ${isActive ? 'border-cyan-400 text-cyan-50' : 'border-white/10 text-slate-400 opacity-0 group-hover:opacity-100'}`}>
                                {marker.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
                <button onClick={zoomIn} className="w-8 h-8 flex items-center justify-center bg-slate-900/80 hover:bg-cyan-900/80 border border-slate-700 text-slate-300 hover:text-white rounded transition-colors text-lg font-mono leading-none shadow-lg">+</button>
                <button onClick={zoomOut} className="w-8 h-8 flex items-center justify-center bg-slate-900/80 hover:bg-cyan-900/80 border border-slate-700 text-slate-300 hover:text-white rounded transition-colors text-lg font-mono leading-none shadow-lg">−</button>
                <button onClick={resetZoom} className="px-2 py-1.5 bg-slate-900/80 hover:bg-cyan-900/80 border border-slate-700 text-slate-300 hover:text-white rounded transition-colors text-[10px] uppercase font-bold tracking-widest shadow-lg">Reset</button>
                {typeof setXrayEnabled === 'function' && (
                    <button
                        onClick={() => setXrayEnabled(!xrayEnabled)}
                        className={`mt-4 px-2 py-1.5 border rounded transition-colors text-[10px] uppercase font-bold tracking-widest shadow-lg ${xrayEnabled ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-slate-900/80 hover:bg-cyan-900/80 border-slate-700 text-slate-300 hover:text-white'}`}>
                        X‑Ray
                    </button>
                )}
            </div>
        </div>
    );
};

export default KaplanSurgicalTwin;
