/**
 * Protocol NC-26: The Sovereign Ledger
 * 
 * Tamper-proof local blockchain for session logging.
 * Every entry contains the previous entry's hash (chaining).
 * H_n = SHA-256(Data_n + H_{n-1})
 * 
 * Storage: IndexedDB for persistent storage that survives browser restarts.
 */

// Genesis block hash (all zeros)
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

// IndexedDB configuration
const DB_NAME = 'SovereignLedger_NC26';
const DB_VERSION = 1;
const STORE_NAME = 'ledger_entries';

/**
 * Ledger entry structure
 */
export interface LedgerEntry {
    id: number;
    timestamp: number;
    action: string;
    data: Record<string, unknown>;
    previousHash: string;
    hash: string;
    source: string;
}

/**
 * Verification result
 */
export interface VerificationResult {
    valid: boolean;
    totalEntries: number;
    verifiedEntries: number;
    compromisedEntry?: LedgerEntry;
    rootHash: string;
}

/**
 * Computes SHA-256 hash of data
 */
async function computeHash(data: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Opens or creates the IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                store.createIndex('hash', 'hash', { unique: true });
            }
        };
    });
}

class SovereignLedgerService {
    private db: IDBDatabase | null = null;
    private lastHash: string = GENESIS_HASH;
    private entryCount: number = 0;
    private initialized: boolean = false;

    constructor() {
        this.initialize().catch(err => {
            console.error('[NC-26] Ledger initialization failed:', err);
        });
    }

    /**
     * Initialize the ledger and restore last hash from IndexedDB
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            this.db = await openDatabase();

            // Restore last hash from existing entries
            const lastEntry = await this.getLastEntry();
            if (lastEntry) {
                this.lastHash = lastEntry.hash;
                this.entryCount = lastEntry.id;
            }

            this.initialized = true;
            console.log(`[NC-26] Sovereign Ledger initialized. Entries: ${this.entryCount}, Root: ${this.lastHash.substring(0, 16)}...`);
        } catch (err) {
            console.error('[NC-26] Failed to initialize ledger:', err);
            throw err;
        }
    }

    /**
     * Gets the last entry from the ledger
     */
    private async getLastEntry(): Promise<LedgerEntry | null> {
        if (!this.db) return null;

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.openCursor(null, 'prev');

            request.onsuccess = () => {
                const cursor = request.result;
                resolve(cursor ? cursor.value as LedgerEntry : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Appends a new entry to the ledger with hash chaining
     */
    async append(action: string, data: Record<string, unknown>, source: string = 'SYSTEM'): Promise<LedgerEntry> {
        await this.initialize();

        if (!this.db) {
            throw new Error('[NC-26] Ledger database not initialized');
        }

        const timestamp = Date.now();
        const previousHash = this.lastHash;

        // Compute new hash: H_n = SHA-256(Data_n + H_{n-1})
        const payload = JSON.stringify({ timestamp, action, data, previousHash });
        const hash = await computeHash(payload + previousHash);

        const entry: Omit<LedgerEntry, 'id'> = {
            timestamp,
            action,
            data,
            previousHash,
            hash,
            source
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(entry);

            request.onsuccess = () => {
                const id = request.result as number;
                const fullEntry: LedgerEntry = { ...entry, id };

                this.lastHash = hash;
                this.entryCount = id;

                console.log(`[NC-26] Ledger entry #${id}: ${action} | Hash: ${hash.substring(0, 16)}...`);
                resolve(fullEntry);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Retrieves all entries from the ledger
     */
    async getAllEntries(): Promise<LedgerEntry[]> {
        await this.initialize();

        if (!this.db) return [];

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result as LedgerEntry[]);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Verifies the integrity of the entire ledger chain
     * Re-calculates all hashes and checks for tampering
     */
    async verifyIntegrity(): Promise<VerificationResult> {
        await this.initialize();

        const entries = await this.getAllEntries();

        if (entries.length === 0) {
            return {
                valid: true,
                totalEntries: 0,
                verifiedEntries: 0,
                rootHash: GENESIS_HASH
            };
        }

        // Sort by ID to ensure correct order
        entries.sort((a, b) => a.id - b.id);

        let expectedPreviousHash = GENESIS_HASH;
        let verifiedCount = 0;

        for (const entry of entries) {
            // Check previous hash matches
            if (entry.previousHash !== expectedPreviousHash) {
                console.error(`[NC-26] BREACH: Entry #${entry.id} previous hash mismatch`);
                return {
                    valid: false,
                    totalEntries: entries.length,
                    verifiedEntries: verifiedCount,
                    compromisedEntry: entry,
                    rootHash: this.lastHash
                };
            }

            // Recalculate hash
            const payload = JSON.stringify({
                timestamp: entry.timestamp,
                action: entry.action,
                data: entry.data,
                previousHash: entry.previousHash
            });
            const calculatedHash = await computeHash(payload + entry.previousHash);

            if (calculatedHash !== entry.hash) {
                console.error(`[NC-26] BREACH: Entry #${entry.id} hash mismatch`);
                return {
                    valid: false,
                    totalEntries: entries.length,
                    verifiedEntries: verifiedCount,
                    compromisedEntry: entry,
                    rootHash: this.lastHash
                };
            }

            expectedPreviousHash = entry.hash;
            verifiedCount++;
        }

        console.log(`[NC-26] Integrity verified: ${verifiedCount}/${entries.length} entries valid`);

        return {
            valid: true,
            totalEntries: entries.length,
            verifiedEntries: verifiedCount,
            rootHash: this.lastHash
        };
    }

    /**
     * Gets the current root hash (last entry's hash)
     */
    getRootHash(): string {
        return this.lastHash;
    }

    /**
     * Gets the entry count
     */
    getEntryCount(): number {
        return this.entryCount;
    }

    /**
     * Clears the entire ledger (use with caution!)
     */
    async clearLedger(): Promise<void> {
        await this.initialize();

        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => {
                this.lastHash = GENESIS_HASH;
                this.entryCount = 0;
                console.log('[NC-26] Ledger cleared');
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Exports the ledger for forensic analysis
     */
    async exportForForensics(): Promise<{
        entries: LedgerEntry[];
        rootHash: string;
        exportTimestamp: number;
        integrityStatus: VerificationResult;
    }> {
        const entries = await this.getAllEntries();
        const integrityStatus = await this.verifyIntegrity();

        return {
            entries,
            rootHash: this.lastHash,
            exportTimestamp: Date.now(),
            integrityStatus
        };
    }
}

// Singleton instance
export const SovereignLedger = new SovereignLedgerService();
