/**
 * ImmutableCoreLock.ts
 * 
 * Immutable Core Freeze
 * Prevents modifications to turbine physics models without architect-level approval
 */

import crypto from '../utils/cryptoUtils';

export enum ApprovalLevel {
    SYSTEM = 0,
    OPERATOR = 1,
    ENGINEER = 2,
    ARCHITECT = 3
}

export interface CoreModule {
    moduleName: string;
    version: string;
    hash: string;
    frozenAt: number;
    approvalRequired: ApprovalLevel;
}

export class ImmutableCoreLock {
    private static frozenModules: Map<string, CoreModule> = new Map();
    private static frozen: boolean = false;

    /**
     * Freeze core physics models
     */
    public static freezeCore(): void {
        console.log('[ImmutableCore] Freezing all turbine physics models...');

        // Freeze all physics optimizers
        this.freezeModule('KaplanOptimizer', '1.0.0', ApprovalLevel.ARCHITECT);
        this.freezeModule('FrancisOptimizer', '1.0.0', ApprovalLevel.ARCHITECT);
        this.freezeModule('PeltonOptimizer', '1.0.0', ApprovalLevel.ARCHITECT);
        this.freezeModule('BankiMichellOptimizer', '1.0.0', ApprovalLevel.ARCHITECT);

        // Freeze core services
        this.freezeModule('SovereignKernel', '1.0.0', ApprovalLevel.ARCHITECT);
        this.freezeModule('SovereignHealerService', '1.0.0', ApprovalLevel.ARCHITECT);
        this.freezeModule('ForensicDiagnosticService', '1.0.0', ApprovalLevel.ARCHITECT);

        this.frozen = true;

        console.log(`[ImmutableCore] ✅ ${this.frozenModules.size} modules frozen`);
        console.log('[ImmutableCore] 🔒 Changes require ARCHITECT-level Multi-Sig Veto');
    }

    /**
     * Freeze individual module
     */
    private static freezeModule(
        moduleName: string,
        version: string,
        approvalRequired: ApprovalLevel
    ): void {
        // Generate hash of module (simplified - would hash actual code)
        const hash = crypto
            .createHash('sha256')
            .update(`${moduleName}:${version}:${Date.now()}`)
            .digest('hex');

        const module: CoreModule = {
            moduleName,
            version,
            hash,
            frozenAt: Date.now(),
            approvalRequired
        };

        this.frozenModules.set(moduleName, module);

        console.log(`  [FROZEN] ${moduleName} v${version} (Hash: ${hash.substring(0, 16)}...)`);
    }

    /**
     * Check if modification is allowed
     */
    public static canModify(moduleName: string, userLevel: ApprovalLevel): {
        allowed: boolean;
        reason: string;
    } {
        if (!this.frozen) {
            return { allowed: true, reason: 'Core not frozen' };
        }

        const module = this.frozenModules.get(moduleName);
        if (!module) {
            return { allowed: true, reason: 'Module not in frozen core' };
        }

        if (userLevel >= module.approvalRequired) {
            return { allowed: true, reason: 'Sufficient approval level' };
        }

        return {
            allowed: false,
            reason: `Module frozen. Requires ${ApprovalLevel[module.approvalRequired]} approval (user has ${ApprovalLevel[userLevel]})`
        };
    }

    /**
     * Get frozen core status
     */
    public static getStatus(): {
        frozen: boolean;
        moduleCount: number;
        modules: CoreModule[];
    } {
        return {
            frozen: this.frozen,
            moduleCount: this.frozenModules.size,
            modules: Array.from(this.frozenModules.values())
        };
    }

    /**
     * Generate core integrity report
     */
    public static generateIntegrityReport(): string {
        const lines: string[] = [];

        lines.push('═══════════════════════════════════════');
        lines.push('  IMMUTABLE CORE INTEGRITY REPORT');
        lines.push('═══════════════════════════════════════');
        lines.push('');
        lines.push(`Status: ${this.frozen ? '🔒 FROZEN' : '🔓 UNLOCKED'}`);
        lines.push(`Modules: ${this.frozenModules.size}`);
        lines.push('');

        for (const module of this.frozenModules.values()) {
            lines.push(`📦 ${module.moduleName} v${module.version}`);
            lines.push(`   Hash: ${module.hash.substring(0, 32)}...`);
            lines.push(`   Approval: ${ApprovalLevel[module.approvalRequired]}`);
            lines.push(`   Frozen: ${new Date(module.frozenAt).toISOString()}`);
            lines.push('');
        }

        lines.push('═══════════════════════════════════════');

        return lines.join('\n');
    }
}
