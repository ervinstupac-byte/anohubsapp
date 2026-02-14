import { Asset } from '../types';
import { EnhancedAsset, TurbineConfiguration, TurbineFamily, TurbineVariant } from '../models/turbine/types';
import { AssetIdentity } from '../types/assetIdentity';

/**
 * Maps a standard Asset (with AssetIdentity in specs) to an EnhancedAsset
 * required by the Commissioning and Forensic modules.
 */
export const mapAssetToEnhancedAsset = (asset: Asset): EnhancedAsset => {
    // Extract Identity if available
    const identity = asset.specs?.identity as AssetIdentity | undefined;
    const profile = asset.turbineProfile;

    // Determine Family
    let family: TurbineFamily = 'FRANCIS';
    if (asset.turbine_type) {
        family = asset.turbine_type as TurbineFamily;
    } else if (profile?.type) {
        family = profile.type.toUpperCase() as TurbineFamily;
    }

    // Determine Variant (Default to vertical if unknown)
    let variant: TurbineVariant = 'francis_vertical';
    const orientation = identity?.machineConfig?.orientation || profile?.configuration || 'VERTICAL';
    
    if (family === 'FRANCIS') {
        variant = orientation === 'VERTICAL' ? 'francis_vertical' : 'francis_horizontal';
    } else if (family === 'KAPLAN') {
        variant = orientation === 'VERTICAL' ? 'kaplan_vertical' : 'kaplan_horizontal';
    } else if (family === 'PELTON') {
        variant = orientation === 'VERTICAL' ? 'pelton_vertical' : 'pelton_horizontal';
    }

    // Map Configuration
    const config: TurbineConfiguration = {
        head: identity?.machineConfig?.ratedHeadM || 0,
        flow_max: identity?.machineConfig?.ratedFlowM3S || 0,
        runner_diameter: identity?.machineConfig?.runnerDiameterMM ? identity.machineConfig.runnerDiameterMM / 1000 : 0,
        commissioning_date: identity?.commissioningYear ? new Date(identity.commissioningYear, 0, 1).toISOString() : new Date().toISOString(),
        manufacturer: identity?.manufacturer || 'Unknown',
        serial_number: `SN-${asset.id}`,
        rated_speed: identity?.machineConfig?.ratedSpeedRPM || profile?.rpmNominal || 0,
        
        // Family Specifics
        blade_count: identity?.machineConfig?.numberOfBlades || profile?.specificParams?.bladeCount,
        nozzle_count: profile?.specificParams?.needleCount,

        // Physical Dimensions & Limits
        design_head: identity?.machineConfig?.ratedHeadM || 0,
        design_flow: identity?.machineConfig?.ratedFlowM3S || 0,
    };

    return {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        location: asset.location,
        coordinates: asset.coordinates,
        capacity: asset.capacity,
        status: asset.status,
        imageUrl: asset.imageUrl,
        
        turbine_family: family,
        turbine_variant: variant,
        turbine_config: config,
        // operational_thresholds can be derived or left undefined for defaults
    };
};
