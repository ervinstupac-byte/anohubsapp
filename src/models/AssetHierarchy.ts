/**
 * Asset Hierarchy Model
 * Supports nested component trees for drill-down navigation
 */

export enum AssetNodeType {
    SITE = 'site',
    POWERHOUSE = 'powerhouse',
    UNIT = 'unit',              // Top-level turbine-generator set
    TURBINE = 'turbine',
    GENERATOR = 'generator',
    COMPONENT = 'component',     // Rotor, Stator, Runner, etc.
    SUBCOMPONENT = 'subcomponent' // Bearing, Seal, Blade, etc.
}

export interface AssetNode {
    id: string;                    // Unique identifier
    path: string;                  // Hierarchical path: "Unit_01/Generator/Rotor/Bearing_DE"
    name: string;
    type: AssetNodeType;
    parentId?: string;
    children: AssetNode[];

    // Metadata
    metadata: {
        manufacturer?: string;
        serialNumber?: string;
        installDate?: string;
        lastMaintenance?: string;
        specifications?: Record<string, any>;
        criticality?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        documentation?: {
            drawingId?: string;
            manualPage?: number;
            pdfLink?: string;
        };
        notes?: string;
    };

    // Telemetry attachment point
    telemetryEnabled: boolean;
    sensorIds?: string[];

    // Visual representation
    svgPath?: string;              // Path to SVG for this component
    hotspotCoords?: { x: number; y: number };
}

/**
 * Francis Horizontal Turbine Asset Tree
 * Pre-configured hierarchy for <5MW horizontal Francis turbine
 */
export function createFrancisHorizontalAssetTree(): AssetNode {
    const root: AssetNode = {
        id: 'UNIT_01',
        path: 'Unit_01',
        name: 'Francis Horizontal Unit 01',
        type: AssetNodeType.UNIT,
        telemetryEnabled: true,
        sensorIds: [],
        metadata: {
            manufacturer: 'ANDRITZ',
            serialNumber: 'FH-2024-001',
            installDate: '2024-01-15',
            specifications: {
                ratedPowerMW: 4.5,
                ratedHeadM: 80,
                ratedFlowM3S: 12,
                ratedRPM: 600
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    // ========================================
    // TURBINE SECTION
    // ========================================

    const turbine: AssetNode = {
        id: 'TURBINE_01',
        path: 'Unit_01/Turbine',
        name: 'Francis Turbine',
        type: AssetNodeType.TURBINE,
        parentId: 'UNIT_01',
        telemetryEnabled: true,
        metadata: {
            manufacturer: 'ANDRITZ',
            specifications: {
                runnerDiameterMM: 1200,
                numberOfBlades: 15,
                specificSpeed: 120
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    // Turbine > Runner
    const runner: AssetNode = {
        id: 'RUNNER_01',
        path: 'Unit_01/Turbine/Runner',
        name: 'Francis Runner',
        type: AssetNodeType.COMPONENT,
        parentId: 'TURBINE_01',
        telemetryEnabled: false,
        metadata: {
            manufacturer: 'ANDRITZ',
            serialNumber: 'RNR-FH-001',
            specifications: {
                material: 'Stainless Steel 13Cr4Ni',
                blades: 15,
                diameterMM: 1200
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    // Turbine > Shaft
    const shaft: AssetNode = {
        id: 'SHAFT_01',
        path: 'Unit_01/Turbine/Shaft',
        name: 'Main Shaft',
        type: AssetNodeType.COMPONENT,
        parentId: 'TURBINE_01',
        telemetryEnabled: true,
        sensorIds: ['vibration_shaft_x', 'vibration_shaft_y'],
        metadata: {
            specifications: {
                diameterMM: 280,
                material: 'Forged Steel 42CrMo4',
                lengthMM: 3500
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    // Turbine > Shaft > Shaft Seal  **🎯 THIS IS WHERE THE ANT EXPLORES!**
    const shaftSeal: AssetNode = {
        id: 'SHAFT_SEAL_01',
        path: 'Unit_01/Turbine/Shaft/ShaftSeal',
        name: 'Shaft Seal Assembly',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'SHAFT_01',
        telemetryEnabled: true,
        sensorIds: ['temp_shaft_seal', 'pressure_seal'],
        metadata: {
            manufacturer: 'EagleBurgmann',
            serialNumber: 'SS-MG12-4580',
            lastMaintenance: '2024-09-01',
            specifications: {
                type: 'Mechanical Face Seal',
                sealDiameterMM: 280,
                maxPressureBar: 12,
                coolantType: 'Water'
            },
            criticality: 'HIGH'
        },
        svgPath: '/assets/twins/shaft-seal-detail.svg',
        hotspotCoords: { x: 200, y: 150 },
        children: []
    };

    shaft.children.push(shaftSeal);

    // Turbine > Guide Vanes
    const guideVanes: AssetNode = {
        id: 'GUIDE_VANES_01',
        path: 'Unit_01/Turbine/GuideVanes',
        name: 'Guide Vane System',
        type: AssetNodeType.COMPONENT,
        parentId: 'TURBINE_01',
        telemetryEnabled: true,
        sensorIds: ['position_guide_vanes'],
        metadata: {
            specifications: {
                numberOfVanes: 20,
                actuatorType: 'Hydraulic Servomotor'
            },
            criticality: 'HIGH'
        },
        children: []
    };

    turbine.children.push(runner, shaft, guideVanes);

    // ========================================
    // GENERATOR SECTION
    // ========================================

    const generator: AssetNode = {
        id: 'GENERATOR_01',
        path: 'Unit_01/Generator',
        name: 'Synchronous Generator',
        type: AssetNodeType.GENERATOR,
        parentId: 'UNIT_01',
        telemetryEnabled: true,
        metadata: {
            manufacturer: 'ABB',
            serialNumber: 'GEN-SYN-5000-01',
            specifications: {
                ratedPowerMVA: 5.0,
                voltage: '11 kV',
                frequency: '50 Hz',
                poles: 10,
                powerFactor: 0.9
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    // Generator > Rotor
    const rotor: AssetNode = {
        id: 'ROTOR_01',
        path: 'Unit_01/Generator/Rotor',
        name: 'Generator Rotor',
        type: AssetNodeType.COMPONENT,
        parentId: 'GENERATOR_01',
        telemetryEnabled: true,
        sensorIds: ['temp_rotor_winding', 'vibration_rotor'],
        metadata: {
            specifications: {
                poles: 10,
                windingMaterial: 'Copper',
                coolingMethod: 'Air-cooled'
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    // Generator > Stator
    const stator: AssetNode = {
        id: 'STATOR_01',
        path: 'Unit_01/Generator/Stator',
        name: 'Generator Stator',
        type: AssetNodeType.COMPONENT,
        parentId: 'GENERATOR_01',
        telemetryEnabled: true,
        sensorIds: ['temp_stator_winding_A', 'temp_stator_winding_B', 'temp_stator_winding_C'],
        metadata: {
            specifications: {
                coreMaterial: 'Silicon Steel',
                windingType: '3-Phase',
                insulationClass: 'F'
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    // Generator > Bearings  **🎯 ANOTHER ANT DESTINATION!**
    const bearings: AssetNode = {
        id: 'BEARINGS_01',
        path: 'Unit_01/Generator/Bearings',
        name: 'Generator Bearing Assembly',
        type: AssetNodeType.COMPONENT,
        parentId: 'GENERATOR_01',
        telemetryEnabled: true,
        metadata: {
            criticality: 'CRITICAL'
        },
        children: []
    };

    // Generator > Bearings > Guide Bearing Upper  **🐜 ANT IS HERE!**
    const guideBearingUpper: AssetNode = {
        id: 'GUIDE_BEARING_UPPER',
        path: 'Unit_01/Generator/Bearings/GuideBearing_Upper',
        name: 'Guide Bearing (Upper)',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'BEARINGS_01',
        telemetryEnabled: true,
        sensorIds: ['temp_guide_bearing_upper', 'vibration_guide_upper'],
        metadata: {
            manufacturer: 'SKF',
            serialNumber: 'SKF-N320-ECP',
            lastMaintenance: '2024-06-15',
            specifications: {
                type: 'Cylindrical Roller Bearing',
                boreDiameterMM: 100,
                lubricationType: 'Oil Bath',
                oilGrade: 'ISO VG 68'
            },
            criticality: 'HIGH'
        },
        svgPath: '/assets/twins/guide-bearing-detail.svg',
        children: []
    };

    // Generator > Bearings > Guide Bearing Lower
    const guideBearingLower: AssetNode = {
        id: 'GUIDE_BEARING_LOWER',
        path: 'Unit_01/Generator/Bearings/GuideBearing_Lower',
        name: 'Guide Bearing (Lower)',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'BEARINGS_01',
        telemetryEnabled: true,
        sensorIds: ['temp_guide_bearing_lower', 'vibration_guide_lower'],
        metadata: {
            manufacturer: 'SKF',
            serialNumber: 'SKF-N320-ECP-02',
            specifications: {
                type: 'Cylindrical Roller Bearing',
                boreDiameterMM: 100,
                lubricationType: 'Oil Bath'
            },
            criticality: 'HIGH'
        },
        children: []
    };

    // Generator > Bearings > Thrust Bearing  **🐜 THE ANT'S DEEPEST DESTINATION!**
    const thrustBearing: AssetNode = {
        id: 'THRUST_BEARING',
        path: 'Unit_01/Generator/Bearings/ThrustBearing',
        name: 'Thrust Bearing',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'BEARINGS_01',
        telemetryEnabled: true,
        sensorIds: ['temp_thrust_bearing', 'axial_displacement'],
        metadata: {
            manufacturer: 'SKF',
            serialNumber: 'SKF-NN3020-AS-K-M-SP',
            lastMaintenance: '2024-06-15',
            specifications: {
                type: 'Double-Row Angular Contact Ball Bearing',
                boreDiameterMM: 100,
                axialSecure: false, // GRAVITY BOND ONLY!
                warningNote: 'CRITICAL: Do Not Levitate! Gravity Bond Only.', // User-visible warning
                axialLoadCapacityKN: 290,
                lubricationType: 'Grease',
                greaseType: 'SKF LGWA 2'
            },
            criticality: 'CRITICAL'
        },
        svgPath: '/assets/twins/thrust-bearing-detail.svg',
        hotspotCoords: { x: 400, y: 300 },
        children: []
    };

    bearings.children.push(guideBearingUpper, guideBearingLower, thrustBearing);

    // Generator > Exciter
    const exciter: AssetNode = {
        id: 'EXCITER_01',
        path: 'Unit_01/Generator/Exciter',
        name: 'Excitation System',
        type: AssetNodeType.COMPONENT,
        parentId: 'GENERATOR_01',
        telemetryEnabled: true,
        sensorIds: ['voltage_exciter', 'current_exciter'],
        metadata: {
            specifications: {
                type: 'Static Excitation',
                voltageRange: '0-250V DC'
            },
            criticality: 'HIGH'
        },
        children: []
    };

    generator.children.push(rotor, stator, bearings, exciter);

    // ========================================
    // ASSEMBLE COMPLETE TREE
    // ========================================

    root.children.push(turbine, generator);

    return root;
}

/**
 * Helper: Get node by path
 */
export function getNodeByPath(root: AssetNode, path: string): AssetNode | null {
    if (root.path === path) return root;

    for (const child of root.children) {
        const found = getNodeByPath(child, path);
        if (found) return found;
    }

    return null;
}

/**
 * Helper: Get all ancestor paths
 * Example: "Unit_01/Generator/Bearings/ThrustBearing" 
 *       -> ["Unit_01", "Unit_01/Generator", "Unit_01/Generator/Bearings"]
 */
export function getAncestorPaths(path: string): string[] {
    const parts = path.split('/');
    const ancestors: string[] = [];

    for (let i = 1; i < parts.length; i++) {
        ancestors.push(parts.slice(0, i).join('/'));
    }

    return ancestors;
}

// ===================================
// PELTON ASSET TREE (High Head)
// ===================================

export function createPeltonAssetTree(): AssetNode {
    const root: AssetNode = {
        id: 'PELTON_UNIT_01',
        path: 'Pelton_Unit_01',
        name: 'Pelton Vertical Unit 01',
        type: AssetNodeType.UNIT,
        telemetryEnabled: true,
        metadata: {
            manufacturer: 'VOITH',
            specifications: {
                ratedPowerMW: 12.0,
                ratedHeadM: 450, // High head!
                ratedFlowM3S: 3.2,
                ratedRPM: 500,
                numberOfJets: 6
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    const turbine: AssetNode = {
        id: 'PELTON_TURBINE_01',
        path: 'Pelton_Unit_01/Turbine',
        name: 'Pelton Turbine (6-Jet)',
        type: AssetNodeType.TURBINE,
        parentId: 'PELTON_UNIT_01',
        telemetryEnabled: true,
        metadata: { criticality: 'CRITICAL' },
        children: []
    };

    // 1. THE RUNNER (The Heart)
    const runner: AssetNode = {
        id: 'PELTON_RUNNER_01',
        path: 'Pelton_Unit_01/Turbine/Runner',
        name: 'Pelton Runner',
        type: AssetNodeType.COMPONENT,
        parentId: 'PELTON_TURBINE_01',
        telemetryEnabled: true,
        metadata: {
            specifications: {
                material: 'X3CrNiMo13-4 (13-4 Stainless)',
                numberOfBuckets: 22,
                bucketWidthMM: 450,
                runOutRadialMax: '0.15mm', // Master Spec
                runOutAxialMax: '0.20mm',   // Master Spec
                labyrinthClearanceMM: 0.8, // Design Gap
                efficiencyLossPerMM: 1.2   // % efficiency lost per mm wear
            },
            criticality: 'CRITICAL',
            // The Librarian Ant 📚
            // Linking physical asset to knowledge base
            documentation: {
                drawingId: 'dwg-pelton-runner-01',
                manualPage: 42,
                pdfLink: '/docs/manuals/pelton_maint_v1.pdf#page=42'
            }
        },
        children: []
    };

    // Buckets (Subcomponent) - Where we track HRC and Ra
    const buckets: AssetNode = {
        id: 'PELTON_BUCKETS',
        path: 'Pelton_Unit_01/Turbine/Runner/Buckets',
        name: 'Buckets Set',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'PELTON_RUNNER_01',
        telemetryEnabled: false, // Physical inspection mostly
        metadata: {
            specifications: {
                materialHardness: '280 HB', // HRC approx 29-30
                surfaceRoughness: 'Ra 0.8', // Smooth!
                coating: 'Tungsten Carbide (HVOF)', // Shield against Sand Monster
                splitterRadius: '1-2mm (DO NOT GRIND SHARP!)' // Expert Rule: Prevent tip cavitation
            },
            criticality: 'HIGH'
        },
        children: []
    };
    runner.children.push(buckets);

    // 2. THE DISTRIBUTOR (The Ring Main)
    const distributor: AssetNode = {
        id: 'PELTON_DISTRIBUTOR',
        path: 'Pelton_Unit_01/Turbine/Distributor',
        name: 'Distributor Ring',
        type: AssetNodeType.COMPONENT, // Or specific 'DISTRIBUTOR' type if added
        parentId: 'PELTON_TURBINE_01',
        telemetryEnabled: true,
        sensorIds: ['pressure_distributor'],
        metadata: { criticality: 'HIGH' },
        children: []
    };

    // Nozzles (1 to 6)
    for (let i = 1; i <= 6; i++) {
        const nozzle: AssetNode = {
            id: `NOZZLE_0${i}`,
            path: `Pelton_Unit_01/Turbine/Distributor/Nozzle_0${i}`,
            name: `Nozzle Assembly 0${i}`,
            type: AssetNodeType.COMPONENT,
            parentId: 'PELTON_DISTRIBUTOR',
            telemetryEnabled: true,
            sensorIds: [`nozzle_${i}_pos`, `deflector_${i}_status`],
            metadata: { criticality: 'HIGH' },
            children: []
        };

        // Needle
        nozzle.children.push({
            id: `NEEDLE_0${i}`,
            path: nozzle.path + '/Needle',
            name: 'Needle & Seat',
            type: AssetNodeType.SUBCOMPONENT,
            parentId: nozzle.id,
            telemetryEnabled: true,
            metadata: { criticality: 'HIGH' },
            children: []
        });

        // Deflector
        nozzle.children.push({
            id: `DEFLECTOR_0${i}`,
            path: nozzle.path + '/Deflector',
            name: 'Jet Deflector',
            type: AssetNodeType.SUBCOMPONENT,
            parentId: nozzle.id,
            telemetryEnabled: true,
            metadata: {
                criticality: 'CRITICAL', // Safety Critical!
                specifications: {
                    function: 'Overspeed Protection',
                    actuationTime: '< 1.8s'
                }
            },
            children: []
        });

        distributor.children.push(nozzle);
    }

    // 3. HOUSING
    const housing: AssetNode = {
        id: 'PELTON_HOUSING',
        path: 'Pelton_Unit_01/Turbine/Housing',
        name: 'Turbine Housing',
        type: AssetNodeType.COMPONENT,
        parentId: 'PELTON_TURBINE_01',
        telemetryEnabled: true,
        sensorIds: ['housing_pressure', 'air_valve_status'],
        metadata: { criticality: 'LOW' },
        children: []
    };

    // Brake Nozzle (Safety Add-on)
    housing.children.push({
        id: 'BRAKE_NOZZLE_01',
        path: 'Pelton_Unit_01/Turbine/Housing/BrakeNozzle',
        name: 'Brake Nozzle System',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'PELTON_HOUSING',
        telemetryEnabled: true,
        sensorIds: ['brake_valve_status', 'brake_pressure_bar'],
        metadata: {
            specifications: {
                function: 'Rapid Deceleration',
                maxPressureBar: 60,
                safetyRule: 'INTERLOCK: Cannot OPEN if Main Needle > 5%'
            },
            criticality: 'CRITICAL'
        },
        children: []
    });

    turbine.children.push(runner, distributor, housing);
    root.children.push(turbine); // Add Generator later or reuse standard generator

    return root;
}

// ===================================
// KAPLAN ASSET TREE (Low Head)
// ===================================

export function createKaplanAssetTree(): AssetNode {
    const root: AssetNode = {
        id: 'KAPLAN_UNIT_01',
        path: 'Kaplan_Unit_01',
        // ... (existing unit props) ...
        name: 'Kaplan Low-Head Unit 01', // keep existing line
        type: AssetNodeType.UNIT,
        telemetryEnabled: true,
        metadata: {
            manufacturer: 'LITOSTROJ',
            specifications: {
                ratedPowerMW: 25.0,
                ratedHeadM: 18, // Low head
                ratedFlowM3S: 150, // Massive flow!
                ratedRPM: 125,
                numberOfBlades: 5
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    // ... (rest of function remains same, focusing on adding Transformer to createGenericStationTree maybe? Or just keep it conceptually separate)
    // Wait, the user asked to add it to hierarchy. But our functions create Unit trees.
    // Let's modify 'createKaplanAssetTree' (or similar) to include these AUX systems attached to the Unit for now, 
    // or create a STATION level function. 
    // Given the structure, I'll attach AUX systems to the UNIT for this demo context, 
    // representing a "Unit Transformer" and "Unit Auxiliaries".

    // 4. MAIN TRANSFORMER (The Output Gate)
    const transformer: AssetNode = {
        id: 'MAIN_TRAFO_01',
        path: 'Kaplan_Unit_01/Transformer',
        name: 'Main Step-Up Transformer',
        type: AssetNodeType.COMPONENT,
        parentId: 'KAPLAN_UNIT_01',
        telemetryEnabled: true,
        sensorIds: ['trafo_temp', 'buchholz_status'],
        metadata: {
            criticality: 'CRITICAL', // SITE BLACKOUT RISK
            specifications: {
                ratingMVA: 30,
                voltageRatio: '11kV / 110kV',
                vectorGroup: 'YNd11'
            }
        },
        children: []
    };

    // 5. HPU (The Muscle)
    const hpu: AssetNode = {
        id: 'HPU_01',
        path: 'Kaplan_Unit_01/HPU',
        name: 'Hydraulic Power Unit',
        type: AssetNodeType.COMPONENT,
        parentId: 'KAPLAN_UNIT_01',
        telemetryEnabled: true,
        sensorIds: ['hpu_oil_temp', 'hpu_purity_iso'], // Cleanliness Monitor
        metadata: { criticality: 'HIGH' },
        children: []
    };

    // 6. COOLING WATER (The Lungs)
    const cooling: AssetNode = {
        id: 'COOLING_01',
        path: 'Kaplan_Unit_01/Cooling',
        name: 'Cooling Water System',
        type: AssetNodeType.COMPONENT,
        parentId: 'KAPLAN_UNIT_01',
        telemetryEnabled: true,
        sensorIds: ['cw_filter_deltaP'],
        metadata: { criticality: 'HIGH' },
        children: []
    };

    // 7. DC SYSTEM (The Last Defense)
    const dcSystem: AssetNode = {
        id: 'DC_SYSTEM_01',
        path: 'Kaplan_Unit_01/DC_System',
        name: '110V DC Battery Bank',
        type: AssetNodeType.COMPONENT,
        parentId: 'KAPLAN_UNIT_01',
        telemetryEnabled: true,
        sensorIds: ['dc_voltage_bus', 'battery_temp'],
        metadata: {
            criticality: 'CRITICAL',
            specifications: {
                voltageNominal: 110,
                capacityAh: 400,
                type: 'NiCd'
            }
        },
        children: []
    };

    // 8. COMPRESSED AIR (Energy Store)
    const airSystem: AssetNode = {
        id: 'AIR_SYSTEM_01',
        path: 'Kaplan_Unit_01/CompressedAir',
        name: 'HP Air System',
        type: AssetNodeType.COMPONENT,
        parentId: 'KAPLAN_UNIT_01',
        telemetryEnabled: true,
        sensorIds: ['air_pressure_receiver_1'],
        metadata: { criticality: 'HIGH' },
        children: []
    };

    // 9. CIVIL GUARDIAN (Structure)
    const civil: AssetNode = {
        id: 'CIVIL_01',
        path: 'Station/Civil',
        name: 'Powerhouse Structure',
        type: AssetNodeType.COMPONENT, // Technically 'Structure' but component works for tree
        parentId: 'STATION_ROOT', // Conceptually root, but here attaching to generic list or unit? 
        // User asked to update hierarchy. Let's attach to the root return or similar. 
        // Since we are returning a Unit, I will attach it to the Unit for demonstration or create a createStationTree 
        // but sticking to the pattern: Attach to the "Kaplan Unit" as "Unit Block Civil".
        telemetryEnabled: true,
        sensorIds: ['foundation_settlement_piezo', 'tilt_inclinometer_x'],
        metadata: {
            criticality: 'CRITICAL', // Structure fail = Game Over
            specifications: {
                maxTiltMMperM: 0.1, // Master Spec
                concreteType: 'C35/45',
                yearBuilt: '1985'
            }
        },
        children: []
    };

    root.children.push(transformer, hpu, cooling, dcSystem, airSystem, civil);

    const turbine: AssetNode = {
        id: 'KAPLAN_TURBINE_01',
        // ...
        // ...
        path: 'Kaplan_Unit_01/Turbine',
        name: 'Kaplan Turbine (Double Reg)',
        type: AssetNodeType.TURBINE,
        parentId: 'KAPLAN_UNIT_01',
        telemetryEnabled: true,
        metadata: { criticality: 'CRITICAL' },
        children: []
    };

    // 1. THE RUNNER (The Hub) - Oil Filled!
    const runner: AssetNode = {
        id: 'KAPLAN_RUNNER_01',
        path: 'Kaplan_Unit_01/Turbine/Runner',
        name: 'Kaplan Runner (Hub)',
        type: AssetNodeType.COMPONENT,
        parentId: 'KAPLAN_TURBINE_01',
        telemetryEnabled: true,
        sensorIds: ['hub_oil_pressure', 'hub_water_pressure', 'blade_angle_phi'],
        metadata: {
            specifications: {
                material: 'Stainless Steel',
                numberOfBlades: 5,
                hubDiameterMM: 1800,
                oilVolumeLiters: 1200
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    // Blades (Subcomponent) - Where we track Seals
    const blades: AssetNode = {
        id: 'KAPLAN_BLADES',
        path: 'Kaplan_Unit_01/Turbine/Runner/Blades',
        name: 'Runner Blades (Set)',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'KAPLAN_RUNNER_01',
        telemetryEnabled: false,
        metadata: {
            specifications: {
                material: 'Cavitation Resistant SS',
                sealMaterial: 'Bio-Polymer (Eco-Friendly)', // User Request
                servomotorStrokeMM: 450
            },
            criticality: 'HIGH'
        },
        children: []
    };
    runner.children.push(blades);

    // 2. GUIDE VANES (Wicket Gates)
    const guideVanes: AssetNode = {
        id: 'KAPLAN_GV',
        path: 'Kaplan_Unit_01/Turbine/GuideVanes',
        name: 'Wicket Gates',
        type: AssetNodeType.COMPONENT,
        parentId: 'KAPLAN_TURBINE_01',
        telemetryEnabled: true,
        sensorIds: ['guide_vane_opening_Y'],
        metadata: { criticality: 'HIGH' },
        children: []
    };

    // 3. DRAFT TUBE (Vortex Zone)
    const draftTube: AssetNode = {
        id: 'KAPLAN_DRAFT_TUBE',
        path: 'Kaplan_Unit_01/Turbine/DraftTube',
        name: 'Draft Tube',
        type: AssetNodeType.COMPONENT,
        parentId: 'KAPLAN_TURBINE_01',
        telemetryEnabled: true,
        sensorIds: ['dt_pressure_pulsation', 'dt_level'],
        metadata: {
            criticality: 'MEDIUM',
            specifications: {
                liner: 'Steel Upper / Concrete Lower',
                vortexBreaker: 'None'
            }
        },
        children: []
    };

    turbine.children.push(runner, guideVanes, draftTube);
    root.children.push(turbine);

    return root;
}
