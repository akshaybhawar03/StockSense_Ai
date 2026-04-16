import { api } from './api';

/** Look up a product by its EAN-13 barcode number */
export const getProductByBarcode = (barcode: string) =>
    api.get(`/products/barcode/${barcode}`);

/** Generate an EAN-13 barcode for a product */
export const generateBarcode = (productId: string) =>
    api.post(`/products/${productId}/generate-barcode`);

/** Save a manually entered barcode to a product */
export const saveManualBarcode = (productId: string, barcode: string) =>
    api.patch(`/products/${productId}/barcode`, { barcode });

/** Bulk generate barcodes for all products that don't have one */
export const bulkGenerateBarcodes = () =>
    api.post('/products/bulk-generate-barcodes');

/** Checkout: decrement stock for each cart line */
export interface CheckoutLine {
    product_id: string;
    quantity: number;
    sale_price: number;
}

export const checkoutCart = (lines: CheckoutLine[]) =>
    Promise.all(
        lines.map(line =>
            api.post('/stock/record-sale', {
                product_id: line.product_id,
                quantity: line.quantity,
                sale_price: line.sale_price,
            })
        )
    );

// ─── Invoice checkout ────────────────────────────────────────────────────────

export interface InvoiceCheckoutLine {
    product_id: string;
    quantity: number;
    unit_price: number;
}

export interface InvoiceItem {
    product_name: string;
    sku: string;
    unit_price: number;
    quantity: number;
    line_total: number;
}

export interface Invoice {
    id?: string;
    invoice_number: string;
    created_at: string;
    subtotal: number;
    gst_rate: number;
    gst_amount: number;
    total_amount: number;
    item_count: number;
    status: string;
    items: InvoiceItem[];
}

/**
 * POST /invoices/checkout
 * Creates a GST invoice and decrements stock for each cart line.
 * Returns the full Invoice object from the backend.
 */
export const checkoutCartWithInvoice = (
    lines: InvoiceCheckoutLine[],
    gstRate = 18,
): Promise<{ data: Invoice }> =>
    api.post('/invoices/checkout', {
        items: lines,
        gst_rate: gstRate,
    });
