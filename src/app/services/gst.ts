import api from './api';

export interface Gstr1Summary {
    total_invoices: number;
    total_taxable_value: number;
    total_gst: number;
    total_invoice_value: number;
}

export interface B2BInvoice {
    invoice_number: string;
    date: string;
    customer_name: string;
    gstin: string;
    taxable_value: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
}

export interface B2CInvoice {
    invoice_number: string;
    date: string;
    customer_name: string;
    taxable_value: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
}

export interface HsnSummary {
    hsn_code: string;
    description: string;
    quantity: number;
    taxable_value: number;
    cgst: number;
    sgst: number;
    igst: number;
}

export interface Gstr1Data {
    summary: Gstr1Summary;
    b2b_invoices: B2BInvoice[];
    b2c_invoices: B2CInvoice[];
    hsn_summary: HsnSummary[];
}

export interface GstTrend {
    month: string;
    gst_amount: number;
}

export interface Gstr3bSummary {
    total_sales: number;
    taxable_value: number;
    cgst: number;
    sgst: number;
    igst: number;
    net_gst_liability: number;
}

export interface Gstr3bData {
    summary: Gstr3bSummary;
    trend: GstTrend[];
}

export function getGstr1(startDate: string, endDate: string, signal?: AbortSignal) {
    return api.get<Gstr1Data>('/gst/gstr1', {
        params: { start_date: startDate, end_date: endDate },
        signal,
    });
}

export function getGstr3b(startDate: string, endDate: string, signal?: AbortSignal) {
    return api.get<Gstr3bData>('/gst/gstr3b', {
        params: { start_date: startDate, end_date: endDate },
        signal,
    });
}

export async function downloadGstReport(
    type: 'gstr1' | 'gstr3b',
    format: 'pdf' | 'excel',
    startDate: string,
    endDate: string,
): Promise<void> {
    const token = localStorage.getItem('access_token');
    const baseUrl = import.meta.env.VITE_API_URL || 'https://stocksense-backend-wijr.onrender.com/api/v1';
    const url = `${baseUrl}/gst/download?type=${type}&format=${format}&start_date=${startDate}&end_date=${endDate}`;

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Download failed');

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = `${type}_${startDate}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    a.click();
    URL.revokeObjectURL(objectUrl);
}
