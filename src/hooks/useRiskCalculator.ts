import { useMemo } from 'react';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { Asset } from '../types.ts';
import idAdapter from '../utils/idAdapter';

export const useRiskCalculator = (assetId?: string | number) => {
    const { assets, selectedAsset, assetLogs } = useAssetContext();

    // Use provided assetId or fall back to selectedAsset
    let targetAsset: Asset | undefined;
    if (assetId !== undefined && assetId !== null) {
        const numeric = typeof assetId === 'number' ? assetId : idAdapter.toNumber(assetId);
        targetAsset = numeric === null ? undefined : assets.find(a => a.id === numeric);
    } else {
        targetAsset = selectedAsset ?? undefined;
    }

    return useMemo(() => {
        if (!targetAsset) {
            return { status: 'SAFE', reason: ['No asset selected'], score: 0 };
        }

        const reasons: string[] = [];
        let status: 'CRITICAL' | 'WARNING' | 'SAFE' = 'SAFE';
        let score = 0; // 0 = Safe, 100 = Critical

        // --- 1. MAINTENANCE SCHEDULE RISK ---
        // Find the last maintenance log
        const lastMaintenance = assetLogs
            .filter(log => log.assetId === targetAsset.id && log.category === 'MAINTENANCE')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        if (lastMaintenance) {
            const timeSince = Date.now() - new Date(lastMaintenance.date).getTime();
            const daysSince = Math.floor(timeSince / (1000 * 60 * 60 * 24));

            if (daysSince > 180) { // 6 Months
                status = 'WARNING';
                score += 40;
                reasons.push(`Maintenance overdue significantly (${daysSince} days).`);
            } else if (daysSince > 90) { // 3 Months
                if (status === 'SAFE') status = 'WARNING'; // Don't downgrade Critical
                score += 20;
                reasons.push(`Routine maintenance due (${daysSince} days since last).`);
            }
        } else {
            // Missing maintenance history is a risk in itself!
            // Only if the asset is old enough? Assuming new assets are ok.
            // For safety, we mark as info/warning if no history.
            if (targetAsset.status !== 'Planned') {
                score += 10;
                reasons.push('No maintenance history recorded.');
            }
        }


        // --- 2. EFFICIENCY RISK ---
        if (targetAsset.specs && targetAsset.specs.efficiency) {
            const efficiency = Number(targetAsset.specs.efficiency);
            if (efficiency < 85) {
                status = 'WARNING';
                score += 30;
                reasons.push(`Turbine efficiency degraded (${efficiency}%).`);
            }
        }

        // --- 3. PHYSICS VIOLATIONS (CRITICAL IMPERATIVES) ---
        // Vibration (Francis > 5mm/s is BAD)
        if (targetAsset.specs && targetAsset.specs.vibration) {
            const vibration = Number(targetAsset.specs.vibration);
            if (vibration > 5) {
                status = 'CRITICAL';
                score = 100; // Instant Critical
                reasons.push(`CRITICAL: Vibration ${vibration}mm/s exceeds safety limits!`);
            }
        }

        // RPM Limits
        if (targetAsset.specs && targetAsset.specs.rpm) {
            const rpm = Number(targetAsset.specs.rpm);
            if (rpm > 1000) {
                status = 'CRITICAL';
                score = 100;
                reasons.push(`CRITICAL: RPM ${rpm} exceeds mechanical rating.`);
            }
        }

        // --- 4. MANUAL OVERRIDES ---
        if (targetAsset.status === 'Critical') {
            status = 'CRITICAL';
            if (score < 100) score = 95;
            reasons.push('Asset manually flagged as CRITICAL.');
        } else if (targetAsset.status === 'Warning') {
            if (status !== 'CRITICAL') status = 'WARNING';
            if (score < 50) score = 60;
            reasons.push('Asset manually flagged as Warning.');
        }

        // Default "Safe" message
        if (reasons.length === 0) {
            reasons.push('All systems nominal.');
        }

        return { status, reason: reasons, score: Math.min(100, score) };
    }, [targetAsset, assetLogs]); // Re-calc if logs change
};
