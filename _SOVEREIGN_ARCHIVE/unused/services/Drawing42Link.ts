/**
 * DRAWING 42 LINK
 * The File System Integrator 🗺️📂
 * Connects abstract drawing references to physical files on the server.
 */

export interface DocumentLink {
    status: 'FOUND' | 'MISSING';
    filePath: string;
    page: number;
    viewCoordinates: string; // e.g., "x=500,y=500,zoom=200%"
}

export class Drawing42Link {

    private notes: Map<string, string[]> = new Map();

    /**
     * OPEN DOCUMENT
     * Resolves the request to a specific document location.
     */
    openDocument(drawingId: string, pageNumber: number, highlightedRegion: string): DocumentLink {
        // Mock File System Check
        const rootDir = '/mnt/secure_archive/drawings/';

        let filename = 'Unknown.pdf';
        if (drawingId === 'D42') filename = 'D42_Surge_Tank_Rev5.pdf';
        if (drawingId === 'D108') filename = 'D108_Seal_Assembly_Rev2.pdf';

        const fullPath = `${rootDir}${filename}`;

        return {
            status: 'FOUND',
            filePath: fullPath,
            page: pageNumber,
            viewCoordinates: highlightedRegion // Passed to PDF Viewer
        };
    }

    /**
     * ANNOTATE DOCUMENT
     * Adds a Field Note to the drawing implementation.
     */
    annotateDocument(drawingId: string, note: string): { success: boolean; totalNotes: number } {
        if (!this.notes.has(drawingId)) {
            this.notes.set(drawingId, []);
        }
        this.notes.get(drawingId)?.push(note);
        return { success: true, totalNotes: this.notes.get(drawingId)?.length || 0 };
    }

    getNotes(drawingId: string): string[] {
        return this.notes.get(drawingId) || [];
    }
}
