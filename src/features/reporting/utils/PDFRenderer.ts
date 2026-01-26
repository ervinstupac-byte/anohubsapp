import jsPDF from 'jspdf';

/**
 * PDF Rendering Utilities
 * 
 * Low-level PDF drawing functions for report generation.
 * Handles headers, footers, layout, and visual elements.
 */

// Standard A4 Page Dimensions
export const PAGE_CONFIG = {
    WIDTH: 210,
    HEIGHT: 297,
    MARGIN: 20
} as const;

// Brand Colors
export const COLORS = {
    TEAL: [45, 212, 191] as [number, number, number],
    SLATE_900: [15, 23, 42] as [number, number, number],
    SLATE_400: [148, 163, 184] as [number, number, number],
    AMBER_500: [245, 158, 11] as [number, number, number],
    RED_500: [220, 38, 38] as [number, number, number],
    EMERALD_500: [16, 185, 129] as [number, number, number],
    WHITE: [255, 255, 255] as [number, number, number]
} as const;

export const PDFRenderer = {
    /**
     * Draw standard report header
     */
    drawHeader: (doc: jsPDF, projectID: string, isDemo: boolean = false) => {
        // Teal header band
        doc.setFillColor(...COLORS.TEAL);
        doc.rect(0, 0, PAGE_CONFIG.WIDTH, 30, 'F');

        // Logo text
        doc.setTextColor(...COLORS.WHITE);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("AnoHUB", PAGE_CONFIG.MARGIN, 20);

        // Project ID
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`PROJEKT-ID: ${projectID}`, PAGE_CONFIG.WIDTH - PAGE_CONFIG.MARGIN - 40, 20);

        // Demo watermark (if applicable)
        if (isDemo) {
            doc.saveGraphicsState();
            doc.setGState(new (doc as any).GState({ opacity: 0.15 }));
            doc.setFontSize(60);
            doc.setTextColor(...COLORS.RED_500);
            doc.setFont("helvetica", "bold");
            doc.text("FORENSIC INCIDENT DATA", PAGE_CONFIG.WIDTH / 2, PAGE_CONFIG.HEIGHT / 2, {
                align: 'center',
                angle: 45
            });
            doc.restoreGraphicsState();
        }
    },

    /**
     * Draw standard footer
     */
    drawFooter: (doc: jsPDF, pageNum?: number) => {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
            `Platform Report | Vertraulich | ${new Date().toLocaleDateString('de-DE')}`,
            PAGE_CONFIG.MARGIN,
            PAGE_CONFIG.HEIGHT - 8
        );
    },

    /**
     * Draw digital forensic seal
     */
    drawDigitalSeal: (doc: jsPDF) => {
        const x = PAGE_CONFIG.WIDTH - 50;
        const y = PAGE_CONFIG.HEIGHT - 50;

        doc.setDrawColor(...COLORS.TEAL);
        doc.setLineWidth(1);
        doc.circle(x, y, 20, 'D');
        doc.circle(x, y, 18, 'D');

        doc.setFontSize(8);
        doc.setTextColor(...COLORS.TEAL);
        doc.setFont("helvetica", "bold");
        doc.text("DIGITAL", x, y - 5, { align: 'center' });
        doc.text("VERIFIED", x, y + 3, { align: 'center' });
        doc.setFontSize(6);
        doc.text("NC-4.2", x, y + 10, { align: 'center' });
    },

    /**
     * Draw Hill Chart (Efficiency plot)
     */
    drawHillChart: (doc: jsPDF, x: number, y: number, size: number) => {
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);

        // Ellipses (Hill Curves)
        doc.ellipse(x + size / 2, y + size / 2, size / 2, size / 3); // Outer
        doc.ellipse(x + size / 2, y + size / 2, size / 3, size / 4.5); // Mid
        doc.ellipse(x + size / 2, y + size / 2, size / 6, size / 9); // Inner (Peak)

        // Axes
        doc.line(x, y + size, x + size, y + size); // X axis (Flow)
        doc.line(x, y + size, x, y); // Y axis (Head)

        // Operating Point (Red Dot)
        doc.setFillColor(...COLORS.RED_500);
        doc.circle(x + size / 1.5, y + size / 1.5, 2, 'F');

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Wirkungsgrad-Kennfeld (Hill Chart)", x, y + size + 5);
    },

    /**
     * Draw Vibration Matrix
     */
    drawVibrationMatrix: (doc: jsPDF, x: number, y: number, size: number) => {
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);

        // 3x3 Grid
        const step = size / 3;
        for (let i = 0; i <= 3; i++) {
            doc.line(x + (i * step), y, x + (i * step), y + size); // Vertical
            doc.line(x, y + (i * step), x + size, y + (i * step)); // Horizontal
        }

        // Zone Labels
        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
        doc.text("Last", x + size / 2, y + size + 3, { align: 'center' });
        doc.text("Vibration", x - 2, y + size / 2, { angle: 90, align: 'center' });

        // Current State (Top Right - Worst Case)
        doc.setFillColor(...COLORS.RED_500);
        doc.circle(x + (step * 2.5), y + (step * 0.5), 3, 'F');

        doc.setFontSize(8);
        doc.text("Vibrationsmatrix", x, y + size + 5);
    },

    /**
     * Draw precision certification stamp
     */
    drawPrecisionStamp: (doc: jsPDF, x: number, y: number, passed: boolean) => {
        if (passed) {
            doc.setDrawColor(...COLORS.EMERALD_500);
            doc.setLineWidth(1);
            doc.circle(x, y, 25, 'D');
            doc.circle(x, y, 23, 'D');

            doc.setFontSize(10);
            doc.setTextColor(...COLORS.EMERALD_500);
            doc.setFont("helvetica", "bold");
            doc.text("PRECISION", x, y - 8, { align: 'center' });
            doc.setFontSize(14);
            doc.text("CERTIFIED", x, y + 2, { align: 'center' });
            doc.setFontSize(8);
            doc.text("GOLDEN 0.05 MM/M", x, y + 10, { align: 'center' });
        } else {
            const alertY = y - 10;
            doc.setFillColor(254, 242, 242); // Red 50
            doc.roundedRect(x - 75, alertY, 150, 20, 2, 2, 'F');
            doc.setTextColor(185, 28, 28); // Red 700
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("PRECISION ALERT: Alignment exceeds 0.05 mm/m", x, alertY + 12, { align: 'center' });
        }
    },

    /**
     * Draw financial impact box
     */
    drawFinancialImpactBox: (doc: jsPDF, x: number, y: number, lossEUR: number) => {
        doc.setFillColor(248, 250, 252); // Slate-50
        doc.roundedRect(x, y, 100, 45, 2, 2, 'F');

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Geschätzter jährlicher Verlust", x + 5, y + 10);

        doc.setFontSize(16);
        doc.setTextColor(...COLORS.RED_500);
        doc.setFont("helvetica", "bold");
        const formattedLoss = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(lossEUR);
        doc.text(formattedLoss, x + 5, y + 25);
    },

    /**
     * Draw health score box
     */
    drawHealthScoreBox: (doc: jsPDF, x: number, y: number, healthScore: number, turbineType: string) => {
        doc.setFillColor(33, 33, 33);
        doc.roundedRect(x, y, 70, 40, 2, 2, 'F');

        doc.setTextColor(...COLORS.WHITE);
        doc.setFontSize(10);
        doc.text(`${turbineType.toUpperCase()} HEALTH SCORE`, x + 5, y + 10);

        doc.setFontSize(24);
        doc.text(`${healthScore.toFixed(0)}%`, x + 5, y + 30);
    }
};
