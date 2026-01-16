import React, { useEffect, useRef, useState } from 'react';

interface Props {
    viewMode: 'hall' | 'generator';
    setViewMode: (mode: 'hall' | 'generator') => void;
    activeAssetId?: string | null;
}

/**
 * SurgicalDigitalTwin - High-fidelity interactive turbine visualization
 */
const SurgicalDigitalTwin: React.FC<Props> = ({ viewMode, setViewMode, activeAssetId }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>('');

    // 1. Dynamic SVG Loading
    useEffect(() => {
        const fileName = viewMode === 'hall' ? 'main-hall.svg' : 'geno_fr_h_manje_od_5.svg';
        const path = `/assets/${fileName}`;

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

    // 3. Coordinate Sidebar with Visual Highlight
    useEffect(() => {
        if (!containerRef.current || !svgContent) return;

        // Reset all highlights
        const allGroups = containerRef.current.querySelectorAll('.manual-group');
        allGroups.forEach(g => g.classList.remove('active-highlight'));

        // Apply active highlight to selected component group
        if (activeAssetId) {
            // We look for group-generator, group-miv, group-manhole etc.
            const targetId = `#group-${activeAssetId}`;
            const targetElement = containerRef.current.querySelector(targetId);

            if (targetElement) {
                targetElement.classList.add('active-highlight');
                // Scroll into view if needed (optional for large SVGs)
                // targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeAssetId, svgContent]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex flex-col items-center justify-center p-4 svg-container overflow-hidden"
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
};

export default SurgicalDigitalTwin;
