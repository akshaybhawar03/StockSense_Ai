import { api } from './api';
import { uploadCSV } from './inventory';

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

const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3 MB

function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
        img.onload = () => {
            URL.revokeObjectURL(url);
            let quality = 0.8;
            let scale = 1.0;

            const tryCompress = () => {
                const canvas = document.createElement('canvas');
                canvas.width = Math.floor(img.width * scale);
                canvas.height = Math.floor(img.height * scale);
                const ctx = canvas.getContext('2d');
                if (!ctx) { reject(new Error('Canvas not available')); return; }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
                    if (blob.size <= MAX_IMAGE_BYTES || quality <= 0.4) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const dataUrl = e.target!.result as string;
                            const comma = dataUrl.indexOf(',');
                            resolve(comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl);
                        };
                        reader.onerror = () => reject(reader.error);
                        reader.readAsDataURL(blob);
                    } else {
                        quality -= 0.1;
                        if (quality < 0.4) scale *= 0.75;
                        tryCompress();
                    }
                }, 'image/jpeg', quality);
            };

            tryCompress();
        };
        img.src = url;
    });
}

export async function scanBill(file: File) {
    // PDFs cannot be canvas-compressed; images are compressed to stay under 3 MB.
    const isPdf = file.type === 'application/pdf';
    const image = isPdf ? await fileToBase64(file) : await compressImage(file);
    const mediaType = isPdf ? file.type : 'image/jpeg';
    const payload: ScanBillPayload = {
        image,
        mediaType,
        fileName: file.name,
    };
    const res = await api.post<ScanBillResponse>('/scan-bill', payload);
    return res.data;
}

function slugSku(name: string) {
    const base = (name || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) || 'item';
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${base}-${suffix}`;
}

function csvCell(v: string | number) {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function productsToCsv(products: ScannedProduct[], supplier?: string) {
    const headers = ['product_name', 'sku', 'category', 'unit', 'unit_price', 'current_stock', 'supplier'];
    const rows = products.map(p => [
        p.name,
        slugSku(p.name),
        'Scanned Bill',
        p.unit,
        Number(p.rate) || 0,
        Number(p.quantity) || 0,
        supplier || '',
    ].map(csvCell).join(','));
    return [headers.join(','), ...rows].join('\n');
}

export async function confirmScanBill(products: ScannedProduct[], supplier?: string) {
    // Backend /inventory/batch expects multipart CSV — reuse the same path as CSV upload.
    const csv = productsToCsv(products, supplier);
    const blob = new Blob([csv], { type: 'text/csv' });
    const file = new File([blob], `scanned-bill-${Date.now()}.csv`, { type: 'text/csv' });
    const res = await uploadCSV(file);
    return res.data;
}

// Kept for callers that still want raw JSON batch (not used by modal).
export async function confirmScanBillJson(products: ScannedProduct[], supplier?: string) {
    const res = await api.post('/inventory/batch', { products, supplier });
    return res.data;
}
