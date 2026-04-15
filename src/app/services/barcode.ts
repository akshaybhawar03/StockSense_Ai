import { api } from './api';

/** Look up a product by its EAN-13 barcode */
export const getProductByBarcode = (barcode: string) =>
    api.get('/inventory/barcode', { params: { barcode } });

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
