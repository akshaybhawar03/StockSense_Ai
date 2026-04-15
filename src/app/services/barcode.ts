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
