import { ROUTES } from '../../routes/paths';

/**
 * UNIFIED COMPONENT TAXONOMY
 * Maps the application's Route Structure to a Standardized ID System.
 * ID Format: {System}.{Subsystem}.{Component}
 */

export const COMPONENT_TAXONOMY: Record<string, string> = {
    // === CIVIL & INFRASTRUCTURE ===
    [ROUTES.FRANCIS.SOP.PENSTOCK]: 'francis.civil.penstock',
    [ROUTES.FRANCIS.SOP.INTAKE]: 'francis.civil.intake',
    [ROUTES.FRANCIS.SOP.WATER_HAMMER]: 'francis.civil.water_hammer',
    [ROUTES.FRANCIS.SOP.CATHODIC]: 'francis.civil.cathodic',
    [ROUTES.FRANCIS.SOP.AUXILIARY]: 'francis.civil.auxiliary',

    // === MECHANICAL ===
    [ROUTES.FRANCIS.SOP.BEARINGS]: 'francis.mechanical.bearings',
    [ROUTES.FRANCIS.SOP.ALIGNMENT]: 'francis.mechanical.alignment',
    [ROUTES.FRANCIS.SOP.THRUST_BALANCE]: 'francis.mechanical.thrust',
    [ROUTES.FRANCIS.SOP.VORTEX_CONTROL]: 'francis.mechanical.vortex',
    [ROUTES.FRANCIS.SOP.MIV_DISTRIBUTOR]: 'francis.mechanical.miv',
    [ROUTES.FRANCIS.SOP.REGULATING_RING]: 'francis.mechanical.reg_ring',
    [ROUTES.FRANCIS.SOP.LINKAGE]: 'francis.mechanical.linkage',
    [ROUTES.FRANCIS.SOP.BRAKING_SYSTEM]: 'francis.mechanical.brakes',
    [ROUTES.FRANCIS.SOP.SEAL_RECOVERY]: 'francis.mechanical.seals',
    [ROUTES.FRANCIS.SOP.COUPLING]: 'francis.mechanical.coupling',

    // === HYDRAULIC & FLUID ===
    [ROUTES.FRANCIS.SOP.OIL_HEALTH]: 'francis.fluid.oil',
    [ROUTES.FRANCIS.SOP.COOLING_WATER]: 'francis.fluid.cooling',
    [ROUTES.FRANCIS.SOP.DRAINAGE_PUMPS]: 'francis.fluid.drainage',
    [ROUTES.FRANCIS.SOP.LUBRICATION]: 'francis.fluid.lubrication',
    [ROUTES.FRANCIS.SOP.HPU]: 'francis.fluid.hpu',

    // === ELECTRICAL ===
    [ROUTES.FRANCIS.SOP.GENERATOR]: 'francis.electrical.generator',
    [ROUTES.FRANCIS.SOP.ELECTRICAL_HEALTH]: 'francis.electrical.health',
    [ROUTES.FRANCIS.SOP.GOVERNOR_PID]: 'francis.electrical.pid',
    [ROUTES.FRANCIS.SOP.GRID_SYNC]: 'francis.electrical.grid_sync',
    [ROUTES.FRANCIS.SOP.DISTRIBUTOR_SYNC]: 'francis.electrical.distributor',
    [ROUTES.FRANCIS.SOP.DC_SYSTEMS]: 'francis.electrical.dc',
    [ROUTES.FRANCIS.SOP.EXCITATION]: 'francis.electrical.excitation',
    [ROUTES.FRANCIS.SOP.TRANSFORMER]: 'francis.electrical.transformer',
};

// Reverse Lookup if needed (ID -> Route)
export const ID_TO_ROUTE = Object.entries(COMPONENT_TAXONOMY).reduce((acc, [route, id]) => {
    acc[id] = route;
    return acc;
}, {} as Record<string, string>);


/**
 * Resolves the current route path to a standardized Component ID
 * @param pathname Full URL pathname
 * @returns Component ID key (e.g. 'francis.mechanical.bearings') or null
 */
export const getComponentIdFromRoute = (pathname: string): string | null => {
    // Handle both exact match and 'contains' logic
    // We normalize by checking if the tax key exists at the end of the pathname

    // 1. Try exact match against the defined segments
    // The keys in taxonomy are usually just the last segment e.g. 'mechanics-bearings'
    // But ROUTES.FRANCIS.SOP values might be relative or absolute.
    // Let's iterate.

    for (const [routeKey, id] of Object.entries(COMPONENT_TAXONOMY)) {
        if (pathname.endsWith(routeKey) || pathname.includes(`/${routeKey}`)) {
            return id;
        }
    }

    return null;
};
