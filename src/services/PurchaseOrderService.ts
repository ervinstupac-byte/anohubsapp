/**
 * PurchaseOrderService.ts
 * 
 * Automated Purchase Order (PO) Generation
 * Creates JSON payloads ready for ERP system integration
 */

import { ProcurementRequisition } from './PredictiveProcurementService';

export interface PurchaseOrder {
    poNumber: string;
    requisitionId: string;
    vendor: {
        name: string;
        code: string;
        address: string;
        contact: string;
    };
    orderDate: number;
    requestedDeliveryDate: number;
    urgencyLevel: 'STANDARD' | 'EXPRESS' | 'EMERGENCY';
    lineItems: Array<{
        lineNumber: number;
        partNumber: string;
        vendorPartNumber: string;
        description: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        deliveryLocation: string;
    }>;
    totals: {
        subtotal: number;
        tax: number;
        shipping: number;
        total: number;
    };
    terms: {
        paymentTerms: string;
        incoterms: string;
        currency: string;
    };
    notes: string;
    approvalRequired: boolean;
    createdAt: number;
}

export class PurchaseOrderService {

    /**
     * Generate purchase order from requisition
     */
    public static generatePurchaseOrder(requisition: ProcurementRequisition): PurchaseOrder {
        const poNumber = this.generatePONumber();
        const part = requisition.part;

        // Determine urgency and delivery
        let urgencyLevel: 'STANDARD' | 'EXPRESS' | 'EMERGENCY';
        let requestedDeliveryDays: number;
        let shippingCost: number;

        if (requisition.urgency === 'CRITICAL') {
            urgencyLevel = 'EMERGENCY';
            requestedDeliveryDays = Math.floor(part.leadTimeDays * 0.5); // 50% faster
            shippingCost = part.unitCost * 0.15; // 15% express shipping
        } else if (requisition.urgency === 'URGENT') {
            urgencyLevel = 'EXPRESS';
            requestedDeliveryDays = Math.floor(part.leadTimeDays * 0.75); // 25% faster
            shippingCost = part.unitCost * 0.08; // 8% expedited
        } else {
            urgencyLevel = 'STANDARD';
            requestedDeliveryDays = part.leadTimeDays;
            shippingCost = part.unitCost * 0.03; // 3% standard
        }

        const requestedDeliveryDate = Date.now() + requestedDeliveryDays * 24 * 60 * 60 * 1000;

        const subtotal = requisition.requestedQuantity * part.unitCost;
        const tax = subtotal * 0.25; // 25% VAT (Croatia)
        const shipping = shippingCost * requisition.requestedQuantity;
        const total = subtotal + tax + shipping;

        const po: PurchaseOrder = {
            poNumber,
            requisitionId: requisition.requisitionId,
            vendor: {
                name: part.supplierName,
                code: this.getVendorCode(part.supplierName),
                address: this.getVendorAddress(part.supplierName),
                contact: this.getVendorContact(part.supplierName)
            },
            orderDate: Date.now(),
            requestedDeliveryDate,
            urgencyLevel,
            lineItems: [
                {
                    lineNumber: 1,
                    partNumber: part.partNumber,
                    vendorPartNumber: part.supplierPartNumber,
                    description: part.description,
                    quantity: requisition.requestedQuantity,
                    unitPrice: part.unitCost,
                    totalPrice: subtotal,
                    deliveryLocation: `HE ${part.assetId} - Warehouse`
                }
            ],
            totals: {
                subtotal,
                tax,
                shipping,
                total
            },
            terms: {
                paymentTerms: 'Net 30',
                incoterms: 'DDP (Delivered Duty Paid)',
                currency: 'EUR'
            },
            notes: this.generateNotes(requisition),
            approvalRequired: total > 50000, // Require approval for >€50k
            createdAt: Date.now()
        };

        console.log(`[PurchaseOrder] Generated ${poNumber} for ${part.description}`);
        console.log(`  Total: €${total.toLocaleString()} | Delivery: ${requestedDeliveryDays} days`);

        return po;
    }

    /**
     * Generate PO number
     */
    private static generatePONumber(): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const seq = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        return `PO-${year}${month}-${seq}`;
    }

    /**
     * Get vendor code
     */
    private static getVendorCode(supplierName: string): string {
        const codes: Record<string, string> = {
            'SKF Croatia': 'VEN-001',
            'Rade Končar': 'VEN-002',
            'Voith Hydro': 'VEN-003',
            'Litostroj Power': 'VEN-004',
            'Local Supplier': 'VEN-999'
        };
        return codes[supplierName] || 'VEN-000';
    }

    /**
     * Get vendor address
     */
    private static getVendorAddress(supplierName: string): string {
        const addresses: Record<string, string> = {
            'SKF Croatia': 'Radnička cesta 180, 10000 Zagreb, Croatia',
            'Rade Končar': 'Fallerovo šetalište 22, 10000 Zagreb, Croatia',
            'Voith Hydro': 'Alexanderstraße 11, 89522 Heidenheim, Germany',
            'Litostroj Power': 'Litostrojska cesta 50, 1000 Ljubljana, Slovenia',
            'Local Supplier': 'Local Address, Croatia'
        };
        return addresses[supplierName] || 'Unknown Address';
    }

    /**
     * Get vendor contact
     */
    private static getVendorContact(supplierName: string): string {
        const contacts: Record<string, string> = {
            'SKF Croatia': 'sales@skf.hr | +385 1 6398 100',
            'Rade Končar': 'comercial@koncar.hr | +385 1 3652 111',
            'Voith Hydro': 'info@voith.com | +49 7321 37 0',
            'Litostroj Power': 'info@litostrojpower.eu | +386 1 5860 200',
            'Local Supplier': 'contact@local.hr | +385 xx xxx xxxx'
        };
        return contacts[supplierName] || 'No contact';
    }

    /**
     * Generate PO notes
     */
    private static generateNotes(requisition: ProcurementRequisition): string {
        let notes = '';

        notes += `Requisition: ${requisition.requisitionId}\n`;
        notes += `Asset: ${requisition.part.assetId}\n`;
        notes += `RUL: ${requisition.rulDays} days until predicted failure\n`;
        notes += `Urgency: ${requisition.urgency}\n\n`;

        if (requisition.urgency === 'CRITICAL') {
            notes += '⚠️ EMERGENCY ORDER - CRITICAL COMPONENT FAILURE IMMINENT\n';
            notes += 'Please expedite delivery via fastest available method.\n';
            notes += 'Contact plant manager immediately upon dispatch.\n\n';
        } else if (requisition.urgency === 'URGENT') {
            notes += '⚠️ URGENT - Expedited delivery required\n';
            notes += 'Standard lead time is insufficient for maintenance schedule.\n\n';
        }

        notes += `Reason: ${requisition.reason}\n`;

        return notes;
    }

    /**
     * Export PO as JSON
     */
    public static exportPOToJSON(po: PurchaseOrder): string {
        return JSON.stringify(po, null, 2);
    }

    /**
     * Send PO to ERP system (mock)
     */
    public static async sendToERP(po: PurchaseOrder): Promise<boolean> {
        console.log('[PurchaseOrder] Sending to ERP system...');
        console.log(`  PO Number: ${po.poNumber}`);
        console.log(`  Vendor: ${po.vendor.name}`);
        console.log(`  Total: €${po.totals.total.toLocaleString()}`);

        // In production: POST to actual ERP API
        // const response = await fetch('https://erp.company.com/api/purchase-orders', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: this.exportPOToJSON(po)
        // });

        // Mock success
        console.log('[PurchaseOrder] ✅ Successfully sent to ERP');
        return true;
    }
}
