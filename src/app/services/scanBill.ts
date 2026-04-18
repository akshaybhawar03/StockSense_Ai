import { api } from './api';

export interface ScannedProduct {
    name: string;
    quantity: number;
    unit: string;
    rate: number;
}

export interface ScanBillResponse {
    products: ScannedProduct[];
    supplier?: string;
    total?: number;
}

export interface ScanBillPayload {
    image: string;
    mediaType: string;
    fileName: string;
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const comma = result.indexOf(',');
            resolve(comma >= 0 ? result.slice(comma + 1) : result);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

export async function scanBill(file: File) {
    const image = await fileToBase64(file);
    const payload: ScanBillPayload = {
        image,
        mediaType: file.type,
        fileName: file.name,
    };
    const res = await api.post<ScanBillResponse>('/scan-bill', payload);
    return res.data;
}

export async function confirmScanBill(products: ScannedProduct[], supplier?: string) {
    const res = await api.post('/scan-bill/confirm', { products, supplier });
    return res.data;
}
