import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Interface for Invoice Item
interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

// Interface for Invoice with parsed items
interface InvoiceWithItems {
  id: string;
  userId: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  address: string | null;
  logoUrl: string | null;
  notes: string | null;
  items: string; // JSON string
  total: number;
  status: string;
  isPro: boolean;
  hasQris: boolean;
  themeColor: string;
  tanggal: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Escape HTML to prevent XSS attacks
 * Replaces dangerous characters with HTML entities
 */
function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;');
}

/**
 * Sanitize CSS color value to prevent CSS injection
 * Only allows valid hex colors
 */
function sanitizeColor(color: string): string {
  // Validate hex color format
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  if (hexColorRegex.test(color)) {
    return color;
  }
  // Default to black if invalid
  return '#000000';
}

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();

    console.log('[PDF Generate] Request invoiceId:', invoiceId);

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID diperlukan' },
        { status: 400 }
      );
    }

    // Fetch invoice
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
    }) as InvoiceWithItems | null;

    console.log('[PDF Generate] Found invoice:', invoice ? 'yes' : 'no');

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice tidak ditemukan' },
        { status: 404 }
      );
    }

    // Parse items JSON
    let parsedItems: InvoiceItem[];
    try {
      parsedItems = JSON.parse(invoice.items) as InvoiceItem[];
      console.log('[PDF Generate] Parsed items:', parsedItems.length);
    } catch (parseError) {
      console.error('[PDF Generate] Error parsing items:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid invoice data' },
        { status: 500 }
      );
    }

    // Generate HTML for PDF
    const html = generateInvoiceHTML(invoice, parsedItems);

    // Return HTML that will be rendered as PDF in the browser
    return NextResponse.json({
      success: true,
      data: {
        html,
        invoice: {
          ...invoice,
          items: parsedItems,
        },
      },
    });
  } catch (error) {
    console.error('[PDF Generate] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Gagal generate PDF: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(invoice: InvoiceWithItems, items: InvoiceItem[]) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Sanitize theme color
  const safeThemeColor = sanitizeColor(invoice.themeColor);

  const watermark = !invoice.isPro ? `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); opacity: 0.05; font-size: 80px; font-weight: bold; color: #000; z-index: -1; white-space: nowrap;">
      INVOICEUMKM - FREE VERSION
    </div>
  ` : '';

  // Escape all user-provided data
  const escapedData = {
    invoiceNumber: escapeHtml(invoice.invoiceNumber),
    customerName: escapeHtml(invoice.customerName),
    customerEmail: escapeHtml(invoice.customerEmail),
    customerPhone: escapeHtml(invoice.customerPhone),
    address: escapeHtml(invoice.address),
    notes: escapeHtml(invoice.notes),
    status: escapeHtml(invoice.status),
    logoUrl: invoice.logoUrl ? escapeHtml(invoice.logoUrl) : null,
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${escapedData.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background: white;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      border-bottom: 3px solid ${safeThemeColor};
      padding-bottom: 20px;
    }
    .logo { max-width: 150px; max-height: 80px; object-fit: contain; }
    .invoice-title { text-align: right; }
    .invoice-title h1 {
      font-size: 32px;
      color: ${safeThemeColor};
      margin-bottom: 5px;
    }
    .invoice-number { font-size: 18px; font-weight: bold; color: #666; }
    .invoice-info { margin-top: 10px; font-size: 13px; color: #666; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .info-label { font-weight: 600; color: #333; }
    .customer-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .customer-info, .company-info { flex: 1; }
    .customer-info { padding-right: 20px; }
    .section-title {
      font-size: 12px;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .customer-name { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
    .customer-detail { font-size: 13px; color: #666; margin-bottom: 3px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: ${safeThemeColor};
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    .text-right { text-align: right; }
    .total-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .total-box {
      width: 300px;
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .total-row.grand-total {
      font-size: 18px;
      font-weight: bold;
      color: ${safeThemeColor};
      border-top: 2px solid #ddd;
      padding-top: 10px;
      margin-top: 10px;
      margin-bottom: 0;
    }
    .notes-section {
      margin-top: 30px;
      padding: 15px;
      background: #fff8e1;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
    }
    .notes-title { font-weight: bold; margin-bottom: 5px; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
    .qris-section {
      margin-top: 30px;
      text-align: center;
      padding: 20px;
      background: #f0f0f0;
      border-radius: 8px;
    }
    .qris-title { font-weight: bold; margin-bottom: 10px; }
    .qris-qr {
      width: 150px;
      height: 150px;
      background: white;
      margin: 0 auto 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #ddd;
    }
  </style>
</head>
<body>
  ${watermark}

  <div class="header">
    <div>
      ${escapedData.logoUrl ? `<img src="${escapedData.logoUrl}" class="logo" alt="Logo">` : `<div style="font-size: 24px; font-weight: bold; color: ${safeThemeColor};">INVOICE</div>`}
    </div>
    <div class="invoice-title">
      <h1>INVOICE</h1>
      <div class="invoice-number">${escapedData.invoiceNumber}</div>
      <div class="invoice-info">
        <div class="info-row">
          <span class="info-label">Tanggal:</span>
          <span>${formatDate(invoice.tanggal)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span style="text-transform: capitalize;">${escapedData.status}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="customer-section">
    <div class="customer-info">
      <div class="section-title">Ditagihkan Kepada</div>
      <div class="customer-name">${escapedData.customerName}</div>
      ${escapedData.address ? `<div class="customer-detail">${escapedData.address}</div>` : ''}
      ${escapedData.customerEmail ? `<div class="customer-detail">📧 ${escapedData.customerEmail}</div>` : ''}
      ${escapedData.customerPhone ? `<div class="customer-detail">📱 ${escapedData.customerPhone}</div>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 50px;">No</th>
        <th>Item</th>
        <th style="width: 100px; text-align: center;">Jumlah</th>
        <th style="width: 150px; text-align: right;">Harga</th>
        <th style="width: 150px; text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((item: InvoiceItem, index: number) => {
        const itemTotal = item.quantity * item.price;
        const safeItemName = escapeHtml(item.name);
        const safeItemDesc = item.description ? escapeHtml(item.description) : null;
        return `
        <tr>
          <td>${index + 1}</td>
          <td>
            <div style="font-weight: 600;">${safeItemName}</div>
            ${safeItemDesc ? `<div style="font-size: 12px; color: #666;">${safeItemDesc}</div>` : ''}
          </td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${formatCurrency(item.price)}</td>
          <td class="text-right" style="font-weight: 600;">${formatCurrency(itemTotal)}</td>
        </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-box">
      <div class="total-row">
        <span>Subtotal</span>
        <span>${formatCurrency(invoice.total)}</span>
      </div>
      <div class="total-row grand-total">
        <span>Total</span>
        <span>${formatCurrency(invoice.total)}</span>
      </div>
    </div>
  </div>

  ${escapedData.notes ? `
    <div class="notes-section">
      <div class="notes-title">Catatan</div>
      <div>${escapedData.notes}</div>
    </div>
  ` : ''}

  ${invoice.hasQris && invoice.isPro ? `
    <div class="qris-section">
      <div class="qris-title">📱 Scan QRIS untuk Pembayaran</div>
      <div class="qris-qr">
        <div style="color: #999; font-size: 12px;">QR Code QRIS</div>
      </div>
      <div style="font-size: 12px; color: #666;">Total: ${formatCurrency(invoice.total)}</div>
    </div>
  ` : ''}

  <div class="footer">
    <p>Dibuat dengan InvoiceUMKM - Solusi Invoice untuk UMKM Indonesia</p>
    <p style="margin-top: 5px;">${formatDate(invoice.createdAt)}</p>
  </div>
</body>
</html>
  `;
}
