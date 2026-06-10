import { useState, useEffect, useCallback } from 'react';

export type SchematicView = 'main-hall' | 'generator-detail' | 'miv-detail' | 'spiral-case-detail' | 'runner-detail';

interface UseSVGLoaderResult {
    svgContent: string | null;
    isLoading: boolean;
    error: Error | null;
    currentView: SchematicView;
    switchView: (view: SchematicView) => void;
    addGroupInteractivity: (svgElement: SVGSVGElement, onGroupClick: (groupId: string) => void) => void;
}

const SCHEMATIC_PATHS: Record<SchematicView, string> = {
    // heavy schematics are lazily served from /assets/heavy when present
    'main-hall': '/assets/heavy/main-hall.svg',
    'generator-detail': '/assets/heavy/geno_fr_h_manje_od_5.svg',
    'miv-detail': '/assets/schematics/francis-h5/miv-detail.svg',
    'spiral-case-detail': '/assets/schematics/francis-h5/spiral-case-detail.svg',
    'runner-detail': '/assets/schematics/francis-h5/runner-detail.svg',
};

/**
 * NC-4.5 SVG Portal Loader
 * Dynamically loads SVG schematics and enables surgical grouping with ID injection
 */
export const useSVGLoader = (initialView: SchematicView = 'main-hall'): UseSVGLoaderResult => {
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [currentView, setCurrentView] = useState<SchematicView>(initialView);

    const loadSVG = useCallback(async (view: SchematicView) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(SCHEMATIC_PATHS[view]);

            if (!response.ok) {
                throw new Error(`Failed to load SVG: ${response.statusText}`);
            }

            const svgText = await response.text();
            setSvgContent(svgText);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error loading SVG'));
            console.error('[useSVGLoader] Error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const switchView = useCallback((view: SchematicView) => {
        setCurrentView(view);
        loadSVG(view);
    }, [loadSVG]);

    /**
     * Surgical Grouping: Adds click handlers to <g> elements with IDs matching "group-*"
     */
    const addGroupInteractivity = useCallback((svgElement: SVGSVGElement, onGroupClick: (groupId: string) => void) => {
        const groups = svgElement.querySelectorAll('g[id^="group-"]');

        groups.forEach((group) => {
            const groupId = group.id.replace('group-', '');

            // Make group interactive
            group.setAttribute('class', 'francis-interactive-group');
            group.setAttribute('style', 'cursor: pointer; transition: all 0.3s ease;');

            // Add click handler
            group.addEventListener('click', (e) => {
                e.stopPropagation();
                onGroupClick(groupId);
            });

            // Add hover effects
            group.addEventListener('mouseenter', () => {
                const paths = group.querySelectorAll('path, circle, rect, polygon');
                paths.forEach(path => {
                    path.setAttribute('data-original-opacity', path.getAttribute('opacity') || '1');
                    path.setAttribute('opacity', '1');
                    path.setAttribute('filter', 'drop-shadow(0 0 8px currentColor)');
                });
            });

            group.addEventListener('mouseleave', () => {
                const paths = group.querySelectorAll('path, circle, rect, polygon');
                paths.forEach(path => {
                    const originalOpacity = path.getAttribute('data-original-opacity') || '1';
                    path.setAttribute('opacity', originalOpacity);
                    path.removeAttribute('filter');
                });
            });
        });
    }, []);

    // Initial load
    useEffect(() => {
        loadSVG(currentView);
    }, [currentView, loadSVG]);

    return {
        svgContent,
        isLoading,
        error,
        currentView,
        switchView,
        addGroupInteractivity,
    };
};
