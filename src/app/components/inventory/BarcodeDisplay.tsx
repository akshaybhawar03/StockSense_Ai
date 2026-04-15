import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Printer } from 'lucide-react';

interface BarcodeDisplayProps {
    barcode: string;
    productName: string;
    sku: string;
}

export function BarcodeDisplay({ barcode, productName, sku }: BarcodeDisplayProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !barcode) return;
        try {
            JsBarcode(svgRef.current, barcode, {
                format: 'EAN13',
                width: 2,
                height: 80,
                displayValue: true,
                fontSize: 14,
                margin: 8,
                background: '#ffffff',
                lineColor: '#000000',
            });
        } catch {
            // Invalid barcode value — JsBarcode will not render
        }
    }, [barcode]);

    const handlePrint = () => {
        const svg = svgRef.current;
        if (!svg) return;
        const svgHtml = svg.outerHTML;
        const win = window.open('', '_blank', 'width=420,height=340');
        if (!win) return;
        win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Barcode Label — ${productName}</title>
  <style>
    body { margin: 0; display: flex; flex-direction: column; align-items: center; padding: 20px; font-family: sans-serif; }
    .name { font-weight: bold; font-size: 13px; margin-bottom: 6px; text-align: center; }
    .sku  { font-size: 11px; color: #666; margin-top: 4px; font-family: monospace; }
  </style>
</head>
<body>
  <p class="name">${productName}</p>
  ${svgHtml}
  <p class="sku">SKU: ${sku}</p>
  <script>window.onload = function () { window.print(); window.close(); }<\/script>
</body>
</html>`);
        win.document.close();
    };

    return (
        <div className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
            <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{productName}</p>
            <svg ref={svgRef} className="max-w-full" />
            <p className="text-xs text-gray-400 font-mono">SKU: {sku}</p>
            <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-[rgb(var(--accent-primary))] text-white text-sm rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
                <Printer className="w-4 h-4" /> Print Label
            </button>
        </div>
    );
}
