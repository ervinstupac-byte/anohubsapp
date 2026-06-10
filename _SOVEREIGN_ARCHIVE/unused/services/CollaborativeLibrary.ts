/**
 * COLLABORATIVE LIBRARY
 * The Verified Solution Archive 🏷️✅
 * Tags documents as 'Verified Solutions' accessible by all sites.
 */

export interface VerifiedDoc {
    docId: string;
    verifiedBy: string; // Site Name
    forIssue: string;
    globalTag: boolean;
}

export class CollaborativeLibrary {
    private verifiedDocs: Map<string, VerifiedDoc> = new Map();

    /**
     * VERIFY SOLUTION
     * A site tags a document as the "Golden Key".
     */
    markAsSolution(docId: string, siteName: string, issue: string) {
        this.verifiedDocs.set(docId, {
            docId,
            verifiedBy: siteName,
            forIssue: issue,
            globalTag: true
        });
    }

    /**
     * CHECK FOR SOLUTION
     * Other sites check if a document is trusted.
     */
    checkVerification(docId: string): string | null {
        const doc = this.verifiedDocs.get(docId);
        if (doc && doc.globalTag) {
            return `✅ FLEET VERIFIED by ${doc.verifiedBy} for '${doc.forIssue}'`;
        }
        return null;
    }
}
