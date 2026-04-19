interface InvoiceItem {
  name: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface InvoiceData {
  invoice_number: string;
  date: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  items?: InvoiceItem[];
  subtotal: number;
  gst: number;
  total: number;
  payment_mode?: string;
  received?: number;
  balance?: number;
  notes?: string;
}

function formatINR(n: number): string {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return d;
  }
}

function numberToWords(num: number): string {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n === 0) return '';
    if (n < 20) return a[n] + ' ';
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '') + ' ';
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred ' + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
  }

  const rupees = Math.floor(num);
  const paise  = Math.round((num - rupees) * 100);
  let result = inWords(rupees).trim() + ' Rupees';
  if (paise > 0) result += ' and ' + inWords(paise).trim() + ' Paise';
  return result + ' only';
}

export function generateInvoicePDF(inv: Record<string, unknown>): void {
  const invoice_number = String(inv.invoice_number ?? inv.number ?? 'INV-0001');
  const date           = String(inv.date ?? inv.created_at ?? new Date().toISOString());
  const customer_name  = String(inv.customer_name ?? '');
  const customer_addr  = String(inv.customer_address ?? inv.billing_address ?? '');
  const customer_phone = String(inv.customer_phone ?? '');
  const subtotal  = Number(inv.subtotal ?? inv.sub_total ?? 0);
  // Support unified gst field OR split Indian GST (cgst + sgst) OR igst
  const rawGst    = Number(inv.gst ?? inv.tax ?? inv.tax_amount ?? inv.igst ?? 0)
                  + Number(inv.cgst ?? 0)
                  + Number(inv.sgst ?? 0);
  const rawTotal  = Number(inv.total ?? inv.total_amount ?? 0);
  // If backend bakes tax into `total` without exposing breakdown, derive it
  const gst       = rawGst > 0 ? rawGst : (rawTotal > subtotal ? rawTotal - subtotal : 0);
  const total     = rawTotal > 0 ? rawTotal : subtotal + gst;
  const received       = Number(inv.received ?? inv.paid ?? inv.paid_amount ?? 0);
  const balance        = Number(inv.balance ?? (total - received));
  const payment_mode   = String(inv.payment_mode ?? inv.mode ?? 'Credit');
  const notes          = String(inv.notes ?? inv.terms ?? 'Thank you for doing business with us.');

  const rawItems: InvoiceItem[] = (() => {
    const src = inv.items ?? inv.line_items ?? inv.products;
    if (Array.isArray(src) && src.length > 0) {
      return (src as Record<string, unknown>[]).map((it, idx) => ({
        name:       String(it.name ?? it.product_name ?? it.item_name ?? `Item ${idx + 1}`),
        quantity:   Number(it.quantity ?? it.qty ?? 1),
        unit_price: Number(it.unit_price ?? it.price ?? it.rate ?? 0),
        amount:     (() => {
          const a = Number(it.amount ?? it.line_total ?? it.total ?? 0);
          const q = Number(it.quantity ?? it.qty ?? 1);
          const p = Number(it.unit_price ?? it.price ?? it.rate ?? 0);
          // fallback: calculate from qty × price if backend doesn't send amount
          return a > 0 ? a : q * p;
        })(),
      }));
    }
    return [{ name: 'Services / Goods', quantity: 1, unit_price: subtotal, amount: subtotal }];
  })();

  const totalQty = rawItems.reduce((s, it) => s + it.quantity, 0);

  const itemRows = rawItems
    .map(
      (it, i) => `
      <tr>
        <td class="sl">${i + 1}</td>
        <td class="item-name">${it.name}</td>
        <td class="num">${it.quantity}</td>
        <td class="num">₹ ${Number(it.unit_price).toFixed(2)}</td>
        <td class="num">₹ ${Number(it.amount).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Tax Invoice – ${invoice_number}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #111; background: #fff; }
  .page { width: 210mm; min-height: 297mm; padding: 12mm 14mm; margin: 0 auto; }

  h1.title { text-align: center; font-size: 18px; font-weight: bold; letter-spacing: 1px; margin-bottom: 10px; }

  .header-box { border: 1px solid #aaa; padding: 10px 12px; margin-bottom: 0; }
  .biz-name { font-size: 16px; font-weight: bold; }
  .biz-meta { font-size: 11px; color: #333; margin-top: 2px; }

  .bill-row { display: flex; border: 1px solid #aaa; border-top: none; }
  .bill-left { flex: 1; padding: 8px 12px; border-right: 1px solid #aaa; }
  .bill-right { width: 220px; padding: 8px 12px; }
  .bill-label { font-size: 10px; color: #555; margin-bottom: 2px; }
  .bill-value { font-size: 12px; font-weight: bold; }

  table.items { width: 100%; border-collapse: collapse; margin-top: 0; border: 1px solid #aaa; border-top: none; }
  table.items th {
    background: #f5f5f5; font-size: 11px; font-weight: bold; padding: 6px 8px;
    text-align: left; border-bottom: 1px solid #aaa;
  }
  table.items th.num, table.items td.num { text-align: right; }
  table.items th.sl,  table.items td.sl  { text-align: center; width: 30px; }
  table.items td { padding: 6px 8px; border-bottom: 1px solid #e5e5e5; font-size: 11.5px; }
  table.items tr.total-row td {
    font-weight: bold; background: #f9f9f9; border-top: 1px solid #aaa; border-bottom: 1px solid #aaa;
  }
  td.item-name { max-width: 240px; }

  .summary-row { display: flex; border: 1px solid #aaa; border-top: none; }
  .payment-box { flex: 1; padding: 8px 12px; border-right: 1px solid #aaa; }
  .totals-box  { width: 260px; padding: 4px 12px; }
  .totals-box table { width: 100%; }
  .totals-box td { padding: 3px 4px; font-size: 11.5px; }
  .totals-box td:last-child { text-align: right; font-weight: 600; }
  .totals-box tr.grand td { font-size: 13px; font-weight: bold; border-top: 1px solid #aaa; padding-top: 5px; }

  .words-row { border: 1px solid #aaa; border-top: none; padding: 6px 12px; font-size: 11px; }
  .words-label { color: #555; display: inline; }
  .words-value { font-style: italic; display: inline; margin-left: 4px; }

  .footer-row { display: flex; border: 1px solid #aaa; border-top: none; min-height: 80px; }
  .terms-box { flex: 1; padding: 8px 12px; border-right: 1px solid #aaa; }
  .sign-box   { width: 200px; padding: 8px 12px; text-align: center; }
  .sign-box p { margin-top: 48px; font-size: 11px; color: #555; }
  .section-label { font-size: 10px; font-weight: bold; color: #555; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 8mm 10mm; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="page">

  <h1 class="title">Tax Invoice</h1>

  <!-- Business header -->
  <div class="header-box">
    <div class="biz-name">SmartGodown</div>
    <div class="biz-meta">Inventory Management System</div>
  </div>

  <!-- Bill To + Invoice Details -->
  <div class="bill-row">
    <div class="bill-left">
      <div class="bill-label">Bill To:</div>
      <div class="bill-value">${customer_name || '&nbsp;'}</div>
      ${customer_addr ? `<div style="font-size:11px;margin-top:2px;">${customer_addr}</div>` : ''}
      ${customer_phone ? `<div style="font-size:11px;color:#555;">Ph: ${customer_phone}</div>` : ''}
    </div>
    <div class="bill-right">
      <div class="bill-label">Invoice Details:</div>
      <div style="margin-top:4px;font-size:11.5px;"><b>No:</b> ${invoice_number}</div>
      <div style="font-size:11.5px;"><b>Date:</b> ${formatDate(date)}</div>
    </div>
  </div>

  <!-- Items table -->
  <table class="items">
    <thead>
      <tr>
        <th class="sl">#</th>
        <th>Item Name</th>
        <th class="num">Quantity</th>
        <th class="num">Price / Unit (₹)</th>
        <th class="num">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
      <tr class="total-row">
        <td class="sl"></td>
        <td><b>Total</b></td>
        <td class="num"><b>${totalQty}</b></td>
        <td class="num"></td>
        <td class="num"><b>₹ ${subtotal.toFixed(2)}</b></td>
      </tr>
    </tbody>
  </table>

  <!-- Payment mode + Totals -->
  <div class="summary-row">
    <div class="payment-box">
      <div class="section-label">Payment Mode:</div>
      <div style="margin-top:4px;">${payment_mode}</div>
    </div>
    <div class="totals-box">
      <table>
        <tr><td>Sub Total :</td><td>${formatINR(subtotal)}</td></tr>
        ${gst > 0 ? `<tr><td>GST / Tax :</td><td>${formatINR(gst)}</td></tr>` : ''}
        <tr class="grand"><td>Total :</td><td>${formatINR(total)}</td></tr>
        <tr><td style="font-size:11px;color:#555;">Received :</td><td style="font-size:11px;color:#555;">${formatINR(received)}</td></tr>
        <tr><td style="font-size:11.5px;font-weight:bold;">Balance :</td><td style="font-size:11.5px;font-weight:bold;">${formatINR(balance)}</td></tr>
      </table>
    </div>
  </div>

  <!-- Amount in words -->
  <div class="words-row">
    <span class="words-label">Invoice Amount In Words :</span>
    <span class="words-value">${numberToWords(total)}</span>
  </div>

  <!-- Terms + Signature -->
  <div class="footer-row">
    <div class="terms-box">
      <div class="section-label">Terms And Conditions:</div>
      <div style="margin-top:4px;font-size:11px;color:#444;">${notes}</div>
    </div>
    <div class="sign-box">
      <div class="section-label">For SmartGodown:</div>
      <p>Authorized Signatory</p>
    </div>
  </div>

</div>

</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:0;visibility:hidden;';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) { document.body.removeChild(iframe); return; }

  doc.open();
  doc.write(html);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }, 300);
}
