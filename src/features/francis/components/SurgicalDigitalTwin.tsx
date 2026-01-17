import React, { useEffect, useRef, useState } from 'react';

interface Props {
    viewMode: 'hall' | 'generator';
    setViewMode: (mode: 'hall' | 'generator') => void;
    activeAssetId?: string | null;
    xrayEnabled?: boolean;
    setXrayEnabled?: (v: boolean) => void;
}

/**
 * SurgicalDigitalTwin - High-fidelity interactive turbine visualization
 */
const SurgicalDigitalTwin: React.FC<Props> = ({ viewMode, setViewMode, activeAssetId, xrayEnabled, setXrayEnabled }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const [zoom, setZoom] = useState<number>(1);
    const [panX, setPanX] = useState<number>(0);
    const [panY, setPanY] = useState<number>(0);
    const isPanningRef = useRef(false);
    const panStartRef = useRef<{x:number;y:number}|null>(null);

    // 1. Dynamic SVG Loading
    useEffect(() => {
        const fileName = viewMode === 'hall' ? 'main-hall.svg' : 'geno_fr_h_manje_od_5.svg';
        const path = `/assets/schematics/francis-h5/${fileName}`;

        fetch(path)
            .then(res => {
                if (!res.ok) throw new Error(`Asset not found: ${path}`);
                return res.text();
            })
            .then(setSvgContent)
            .catch(err => {
                console.error("Twin Load Error:", err);
                setSvgContent(`<div class="text-rose-500 font-mono text-xs uppercase">[LOAD_FAILURE] ${err.message}</div>`);
            });
    }, [viewMode]);

    // 2. Attach DOM Event Listeners (Navigation)
    useEffect(() => {
        if (!containerRef.current || !svgContent) return;

        // We only attach listeners for navigation groups
        const generatorGroup = containerRef.current.querySelector('#group-generator');

        if (generatorGroup) {
            (generatorGroup as HTMLElement).style.cursor = 'pointer';
            const handleNav = () => setViewMode('generator');
            generatorGroup.addEventListener('click', handleNav);

            return () => {
                if (generatorGroup) generatorGroup.removeEventListener('click', handleNav);
            };
        }
    }, [svgContent, setViewMode]);

    // 2.1 Runtime SVG cleanup: remove skeleton/empty groups and canonicalize duplicate ids
    useEffect(() => {
        if (!containerRef.current || !svgContent) return;
        const svgRoot = containerRef.current.querySelector('svg');
        if (!svgRoot) return;

        // Ensure background doesn't capture pointer events
        const bg = svgRoot.querySelector('#background-drawing') as HTMLElement | null;
        if (bg) bg.style.pointerEvents = 'none';

        // Collect manual groups and remove duplicates: keep the last occurrence
        const groups = Array.from(svgRoot.querySelectorAll('.manual-group')) as HTMLElement[];
        const idMap = new Map<string, HTMLElement[]>();
        groups.forEach(g => {
            const id = g.id || '';
            if (!id) return;
            const list = idMap.get(id) || [];
            list.push(g);
            idMap.set(id, list);
        });

        idMap.forEach((arr, id) => {
            if (arr.length > 1) {
                // remove all but the last
                for (let i = 0; i < arr.length - 1; i++) arr[i].remove();
            }
        });

        // Normalize shaft-seal -> group-seal
        const shaft = svgRoot.querySelector('#group-shaft-seal') as HTMLElement | null;
        const canonical = svgRoot.querySelector('#group-seal') as HTMLElement | null;
        if (shaft) {
            if (canonical) {
                // canonical exists, remove the shaft duplicate
                shaft.remove();
            } else {
                shaft.id = 'group-seal';
            }
        }

        // Remove truly empty skeleton groups (no children or only whitespace)
        const remaining = Array.from(svgRoot.querySelectorAll('.manual-group')) as HTMLElement[];
        remaining.forEach(g => {
            if (!g.hasChildNodes() || g.innerHTML.trim() === '') g.remove();
        });

    }, [svgContent]);

    // (no-op) placeholder removed; visibility is handled in a later effect tied to xrayEnabled

    // 3. Coordinate Sidebar with Visual Highlight
    useEffect(() => {
        if (!containerRef.current || !svgContent) return;

        // Reset all highlights
        const allGroups = containerRef.current.querySelectorAll('.manual-group');
        allGroups.forEach(g => g.classList.remove('active-highlight'));

        // Apply active highlight to selected component group
        if (activeAssetId) {
            // We look for group-generator, group-miv, group-manhole etc.
            const normalized = String(activeAssetId).toLowerCase();
            const targetId = `#group-${normalized}`;
            const targetElement = containerRef.current.querySelector(targetId);

            if (targetElement) {
                targetElement.classList.add('active-highlight');
                // Scroll into view if needed (optional for large SVGs)
                // targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeAssetId, svgContent]);

    // 4. Enable clicking marker groups inside the injected SVG to emit app events
    useEffect(() => {
        if (!containerRef.current || !svgContent) return;

        const svgRoot = containerRef.current.querySelector('svg');
        if (!svgRoot) return;

        const groups = Array.from(svgRoot.querySelectorAll('.manual-group')) as HTMLElement[];

        const handlers: Array<{ el: HTMLElement; fn: EventListener }> = [];

        groups.forEach(g => {
            // make sure the group is pointer-visible
            g.style.cursor = 'pointer';

            const id = g.id || '';
            const normalized = id.replace(/^group-/, '').toLowerCase();

            const fn = () => {
                // dispatch a window-level custom event so the parent hub can react
                try {
                    window.dispatchEvent(new CustomEvent('twin:asset-click', { detail: normalized }));
                } catch (e) {
                    // fallback: no-op
                    // eslint-disable-next-line no-console
                    console.warn('Unable to dispatch twin:asset-click', e);
                }
            };

            g.addEventListener('click', fn);
            handlers.push({ el: g, fn });
        });

        return () => {
            handlers.forEach(h => h.el.removeEventListener('click', h.fn));
        };
    }, [svgContent]);

    // 5. Apply zoom+pan transform to the injected SVG
    useEffect(() => {
        if (!containerRef.current) return;
        const svgRoot = containerRef.current.querySelector('svg') as HTMLElement | null;
        if (!svgRoot) return;
        svgRoot.style.transition = 'transform 100ms ease';
        // use top-left origin so zoom math is simpler
        svgRoot.style.transformOrigin = '0 0';
        svgRoot.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    }, [zoom, panX, panY, svgContent]);

    // 5.1 Pointer-based panning + wheel zoom
    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        const svgRoot = el.querySelector('svg') as HTMLElement | null;
        if (!svgRoot) return;

        const onWheel = (ev: WheelEvent) => {
            ev.preventDefault();
            const rect = svgRoot.getBoundingClientRect();
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
            // only start pan on primary button
            if (ev.button !== 0) return;
            isPanningRef.current = true;
            pointerId = ev.pointerId;
            (ev.target as Element).setPointerCapture(pointerId);
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
    }, [svgContent, zoom, panX, panY]);

    // 6. Toggle visibility of X‑Ray only groups when xrayEnabled changes
    useEffect(() => {
        if (!containerRef.current || !svgContent) return;
        const svgRoot = containerRef.current.querySelector('svg');
        if (!svgRoot) return;

        const xrayGroups = Array.from(svgRoot.querySelectorAll('#group-runner, #group-seal')) as HTMLElement[];
        xrayGroups.forEach(g => {
            if (xrayEnabled) {
                g.style.display = '';
                g.style.pointerEvents = '';
            } else {
                g.style.display = 'none';
                g.style.pointerEvents = 'none';
            }
        });
    }, [svgContent, xrayEnabled]);

    // zoom helpers
    const zoomIn = () => setZoom(z => Math.min(3, +(z + 0.15).toFixed(2)));
    const zoomOut = () => setZoom(z => Math.max(0.5, +(z - 0.15).toFixed(2)));
    const resetZoom = () => setZoom(1);

    return (
        <div className="w-full h-full flex items-center justify-center p-4 svg-outer relative">
            <div
                ref={containerRef}
                className="w-full h-full flex items-center justify-center p-4 svg-container overflow-hidden"
                dangerouslySetInnerHTML={{ __html: svgContent }}
            />

            {/* Controls */}
            <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
                <button onClick={zoomIn} className="px-2 py-1 bg-black/40 text-white rounded">+</button>
                <button onClick={zoomOut} className="px-2 py-1 bg-black/40 text-white rounded">−</button>
                <button onClick={resetZoom} className="px-2 py-1 bg-black/40 text-white rounded">Reset</button>
                {typeof setXrayEnabled === 'function' && (
                    <button
                        onClick={() => setXrayEnabled(!xrayEnabled)}
                        className={`px-2 py-1 rounded ${xrayEnabled ? 'bg-cyan-500 text-black' : 'bg-black/40 text-white'}`}>
                        X‑Ray
                    </button>
                )}
            </div>
        </div>
    );
};

export default SurgicalDigitalTwin;
