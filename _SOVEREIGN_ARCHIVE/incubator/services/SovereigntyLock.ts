/**
 * SovereigntyLock.ts
 * 
 * Cryptographic Immutability Layer
 * Ensures execution traces and causal chains cannot be tampered with,
 * creating an auditable chain of custody for all autonomous decisions.
 */

import { KernelExecutionTrace } from './SovereignKernel';
import crypto from 'crypto';

export interface LockedTrace {
    trace: KernelExecutionTrace;
    hash: string;
    previousHash: string;
    timestamp: number;
    blockNumber: number;
}

export class SovereigntyLock {
    private static chain: LockedTrace[] = [];
    private static genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';

    /**
     * Lock an execution trace with cryptographic hash
     * Creates immutable record of autonomous decision
     */
    public static lockTrace(trace: KernelExecutionTrace): LockedTrace {
        const previousHash = this.chain.length > 0
            ? this.chain[this.chain.length - 1].hash
            : this.genesisHash;

        const timestamp = Date.now();
        const blockNumber = this.chain.length;

        // Create deterministic hash of trace + chain context
        const hash = this.calculateHash(trace, previousHash, timestamp, blockNumber);

        const lockedTrace: LockedTrace = {
            trace,
            hash,
            previousHash,
            timestamp,
            blockNumber
        };

        this.chain.push(lockedTrace);

        console.log(`[SovereigntyLock] 🔒 Block #${blockNumber} locked: ${hash.substring(0, 16)}...`);

        return lockedTrace;
    }

    /**
     * Calculate SHA-256 hash of execution trace
     */
    private static calculateHash(
        trace: KernelExecutionTrace,
        previousHash: string,
        timestamp: number,
        blockNumber: number
    ): string {
        const data = JSON.stringify({
            trace,
            previousHash,
            timestamp,
            blockNumber
        });

        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Verify integrity of the execution chain
     */
    public static verifyChain(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        for (let i = 0; i < this.chain.length; i++) {
            const block = this.chain[i];
            const expectedPrevHash = i > 0 ? this.chain[i - 1].hash : this.genesisHash;

            // Verify previous hash linkage
            if (block.previousHash !== expectedPrevHash) {
                errors.push(`Block #${i}: Previous hash mismatch`);
            }

            // Verify hash calculation
            const recalculatedHash = this.calculateHash(
                block.trace,
                block.previousHash,
                block.timestamp,
                block.blockNumber
            );

            if (recalculatedHash !== block.hash) {
                errors.push(`Block #${i}: Hash verification failed (tampering detected)`);
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Get chain statistics
     */
    public static getChainStats(): {
        length: number;
        latestHash: string;
        totalExecutions: number;
    } {
        return {
            length: this.chain.length,
            latestHash: this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : this.genesisHash,
            totalExecutions: this.chain.reduce((sum, block) => sum + block.trace.stages.length, 0)
        };
    }

    /**
     * Export chain for audit/storage
     */
    public static exportChain(): LockedTrace[] {
        return [...this.chain]; // Return copy to prevent mutation
    }

    /**
     * Get specific block by number
     */
    public static getBlock(blockNumber: number): LockedTrace | null {
        return this.chain[blockNumber] || null;
    }
}
