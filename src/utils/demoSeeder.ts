/**
 * Demo Data Seeder
 * 
 * Populates localStorage with realistic demo data for work orders,
 * component health, and operating hours on first application load.
 */

import { WorkOrder } from '../contexts/MaintenanceContext';
import { ComponentHealthRegistry } from '../models/TechnicalSchema';

const DEMO_SEED_KEY = 'anohub_demo_seeded';
const WORK_ORDERS_KEY = 'workOrders';
const COMPONENT_HEALTH_KEY = 'componentHealth';
const OPERATING_HOURS_KEY = 'operatingHours';

/**
 * Check if demo data has already been seeded
 */
export function checkIfSeeded(): boolean {
    return localStorage.getItem(DEMO_SEED_KEY) === 'true';
}

/**
 * Generate realistic demo work orders
 */
function generateDemoWorkOrders(): WorkOrder[] {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return [
        {
            id: 'WO-DEMO-001',
            assetId: 'demo-1',
            assetName: 'HPP Demo',
            trigger: 'SERVICE_ALERT' as const,
            component: 'bearing',
            description: 'Replace SKF-6312 bearing due to temperature alert (95°C detected)',
            priority: 'HIGH' as const,
            status: 'IN_PROGRESS' as const,
            assignedTechnician: 'Amir H.',
            requiredParts: ['SKF-6312', 'THERMAL-PASTE-HT200', 'SEAL-KIT-SK450'],
            estimatedHoursToComplete: 4,
            createdAt: yesterday,
            updatedAt: now
        },
        {
            id: 'WO-DEMO-002',
            assetId: 'demo-1',
            assetName: 'HPP Demo',
            trigger: 'AI_PREDICTION' as const,
            component: 'seal',
            description: 'Preventive seal replacement - RUL estimate shows 250 hours remaining',
            priority: 'MEDIUM' as const,
            status: 'PENDING' as const,
            requiredParts: ['SEAL-KIT-SK450', 'GASKET-SET-GS220'],
            estimatedHoursToComplete: 2,
            createdAt: yesterday,
            updatedAt: yesterday
        },
        {
            id: 'WO-DEMO-003',
            assetId: 'demo-1',
            assetName: 'HPP Demo',
            trigger: 'MANUAL' as const,
            component: 'wicketGate',
            description: 'Wicket gate servo motor calibration and clearance adjustment',
            priority: 'MEDIUM' as const,
            status: 'COMPLETED' as const,
            assignedTechnician: 'Jasmin M.',
            requiredParts: ['SERVO-MOTOR-SM450'],
            estimatedHoursToComplete: 3,
            createdAt: twoDaysAgo,
            updatedAt: yesterday,
            completedAt: yesterday,
            completionNotes: 'Servo motor calibrated successfully. Clearance adjusted to 0.42mm (within spec). System tested at 60% load.'
        },
        {
            id: 'WO-DEMO-004',
            assetId: 'demo-1',
            assetName: 'HPP Demo',
            trigger: 'SERVICE_ALERT' as const,
            component: 'runnerClearance',
            description: 'Runner clearance inspection - routine 2000h service interval',
            priority: 'LOW' as const,
            status: 'COMPLETED' as const,
            assignedTechnician: 'Nedim K.',
            estimatedHoursToComplete: 1,
            createdAt: weekAgo,
            updatedAt: weekAgo,
            completedAt: weekAgo,
            completionNotes: 'Runner clearance measured at 0.38mm. Within optimal range. No action required.'
        },
        {
            id: 'WO-DEMO-005',
            assetId: 'demo-1',
            assetName: 'HPP Demo',
            trigger: 'AI_PREDICTION' as const,
            component: 'hose',
            description: 'Hydraulic hose replacement - pressure sensor detected micro-leak',
            priority: 'HIGH' as const,
            status: 'PENDING' as const,
            requiredParts: ['HYDRAULIC-HOSE-16MM-450BAR', 'HOSE-CLAMP-HC16'],
            estimatedHoursToComplete: 2,
            createdAt: now,
            updatedAt: now
        },
        {
            id: 'WO-DEMO-006',
            assetId: 'demo-1',
            assetName: 'HPP Demo',
            trigger: 'MANUAL' as const,
            component: 'generator',
            description: 'Generator insulation resistance test (annual compliance)',
            priority: 'LOW' as const,
            status: 'PENDING' as const,
            assignedTechnician: 'Emir S.',
            estimatedHoursToComplete: 1,
            createdAt: yesterday,
            updatedAt: yesterday
        }
    ];
}

/**
 * Generate realistic component health data
 */
function generateComponentHealth(): ComponentHealthRegistry {
    return {
        'demo-1': {
            'bearing': {
                score: 45,
                status: 'CRITICAL',
                lastMeasured: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                lastMeasurementValue: 95,
                component: 'bearing'
            },
            'runnerClearance': {
                score: 95,
                status: 'OPTIMAL',
                lastMeasured: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // week ago
                lastMeasurementValue: 0.38,
                component: 'runnerClearance'
            },
            'seal': {
                score: 75,
                status: 'GOOD',
                lastMeasured: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
                lastMeasurementValue: 0.15,
                component: 'seal'
            },
            'wicketGate': {
                score: 60,
                status: 'WARNING',
                lastMeasured: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                lastMeasurementValue: 0.42,
                component: 'wicketGate'
            },
            'generator': {
                score: 88,
                status: 'GOOD',
                lastMeasured: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
                lastMeasurementValue: 1200,
                component: 'generator'
            },
            'hose': {
                score: 52,
                status: 'WARNING',
                lastMeasured: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
                lastMeasurementValue: 445,
                component: 'hose'
            }
        }
    };
}

/**
 * Generate realistic operating hours
 */
function generateOperatingHours(): Record<string, number> {
    return {
        'demo-1': 15750,
        'DEFAULT_ASSET': 1250
    };
}

/**
 * Seed all demo data to localStorage
 */
export function seedDemoData(): void {
    try {
        // Generate demo data
        const workOrders = generateDemoWorkOrders();
        const componentHealth = generateComponentHealth();
        const operatingHours = generateOperatingHours();

        // Store in localStorage
        localStorage.setItem(WORK_ORDERS_KEY, JSON.stringify(workOrders));
        localStorage.setItem(COMPONENT_HEALTH_KEY, JSON.stringify(componentHealth));
        localStorage.setItem(OPERATING_HOURS_KEY, JSON.stringify(operatingHours));
        localStorage.setItem(DEMO_SEED_KEY, 'true');

        console.log('[DemoSeeder] ✅ Demo data seeded successfully');
        console.log(`  - ${workOrders.length} work orders`);
        console.log(`  - ${Object.keys(componentHealth['demo-1']).length} component health entries`);
        console.log(`  - ${Object.keys(operatingHours).length} operating hour records`);
    } catch (error) {
        console.error('[DemoSeeder] ❌ Failed to seed demo data:', error);
    }
}

/**
 * Reset demo data (clear and reseed)
 */
export function resetDemoData(): void {
    try {
        // Clear existing data
        localStorage.removeItem(WORK_ORDERS_KEY);
        localStorage.removeItem(COMPONENT_HEALTH_KEY);
        localStorage.removeItem(OPERATING_HOURS_KEY);
        localStorage.removeItem(DEMO_SEED_KEY);
        localStorage.removeItem('maintenanceChecklists'); // Clear completed checklists too

        console.log('[DemoSeeder] 🗑️ Demo data cleared');

        // Reseed
        seedDemoData();
    } catch (error) {
        console.error('[DemoSeeder] ❌ Failed to reset demo data:', error);
    }
}

/**
 * Initialize demo data on app load if needed
 */
export function initializeDemoData(): void {
    if (!checkIfSeeded()) {
        console.log('[DemoSeeder] 🌱 First load detected - seeding demo data...');
        seedDemoData();
    } else {
        console.log('[DemoSeeder] ✓ Demo data already seeded');
    }
}
