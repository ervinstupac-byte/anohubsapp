import { DOSSIER_LIBRARY, DossierFile } from '../data/knowledge/DossierLibrary';

export interface ScanResult {
    verifiedFiles: number;
    totalFiles: number;
    missingPaths: string[];
    details: Array<{ path: string; status: 'OK' | 'MISSING' }>;
}

export class ArchiveScanner {
    /**
     * Scans the virtual /docs/ directory (mapped to public/archive or similar)
     * and returns a count of existing .pdf or .html files.
     */
    static async scanDocs(): Promise<ScanResult> {
        const totalFiles = DOSSIER_LIBRARY.length;
        const details: Array<{ path: string; status: 'OK' | 'MISSING' }> = [];
        let verifiedFiles = 0;
        const missingPaths: string[] = [];

        // In a real file system access (Node.js), we would check fs.existsSync.
        // In the browser, we must attempt to fetch the resource (HEAD request if possible, or GET).
        // Since we want to update the UI "Discovery Horizon", we'll do this asynchronously.

        const promises = DOSSIER_LIBRARY.map(async (file: DossierFile) => {
            try {
                // Construct the URL. DOSSIER_LIBRARY paths are usually absolute like /archive/foo.pdf
                // We use HEAD method to save bandwidth, fallback to GET if HEAD fails (some servers block HEAD)
                const response = await fetch(file.path, { method: 'HEAD' });

                if (response.ok) {
                    verifiedFiles++;
                    details.push({ path: file.path, status: 'OK' });
                } else {
                    // Try GET as backup (some dev servers don't handle HEAD correctly for static files)
                    const getResponse = await fetch(file.path, { method: 'GET' });
                    if (getResponse.ok) {
                        verifiedFiles++;
                        details.push({ path: file.path, status: 'OK' });
                    } else {
                        missingPaths.push(file.path);
                        details.push({ path: file.path, status: 'MISSING' });
                    }
                }
            } catch (error) {
                missingPaths.push(file.path);
                details.push({ path: file.path, status: 'MISSING' });
            }
        });

        await Promise.all(promises);

        return {
            verifiedFiles,
            totalFiles,
            missingPaths,
            details
        };
    }
}
