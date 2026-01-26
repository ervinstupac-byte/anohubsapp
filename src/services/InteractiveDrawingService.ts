/**
 * INTERACTIVE DRAWING SERVICE
 * The Drawing Viewer 🖼️🖱️
 * Resolves references like "Drawing 42" to actual file paths.
 */

export class InteractiveDrawingService {

    /**
     * OPEN DRAWING
     * Simulates opening a viewer or returning a file path.
     */
    openDrawing(refId: string): string {
        // Normalize "Drawing 42", "D42", "Drawing-42"
        const cleanRef = refId.replace(/Drawing\s?/i, '').trim();

        if (cleanRef === '42') {
            return '/assets/drawings/D42_Surge_Tank.pdf';
        }
        if (cleanRef === '108') {
            return '/assets/drawings/D108_Seal_Assembly.pdf';
        }

        return '/assets/drawings/General_Arrangement.pdf'; // Default
    }
}
