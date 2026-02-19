import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById, deleteInvoice } from '@/lib/supabase';
import { z } from 'zod';

// Interface for Invoice Item
interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

// GET - Get single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('[GET Invoice] Request ID:', id);

    const invoice = await getInvoiceById(id);

    console.log('[GET Invoice] Found:', invoice ? 'yes' : 'no');

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice tidak ditemukan' },
        { status: 404 }
      );
    }

    // Parse items JSON
    let items: InvoiceItem[];
    try {
      items = JSON.parse(invoice.items) as InvoiceItem[];
    } catch (parseError) {
      console.error('[GET Invoice] Error parsing items:', parseError);
      items = [];
    }

    // Convert to camelCase for consistency
    const responseInvoice = {
      ...invoice,
      id: invoice.id,
      userId: invoice.user_id,
      invoiceNumber: invoice.invoice_number,
      customerName: invoice.customer_name,
      customerEmail: invoice.customer_email,
      customerPhone: invoice.customer_phone,
      logoUrl: invoice.logo_url,
      themeColor: invoice.theme_color,
      hasQris: invoice.has_qris,
      isPro: invoice.is_pro,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
      items,
    };

    return NextResponse.json({
      success: true,
      data: responseInvoice,
    });
  } catch (error) {
    console.error('[GET Invoice] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Gagal mengambil data invoice';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Update invoice (not fully implemented)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log('[PUT Invoice] Request ID:', id, 'Body:', body);

    // Check if invoice exists
    const existingInvoice = await getInvoiceById(id);

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice tidak ditemukan' },
        { status: 404 }
      );
    }

    // Note: Update not fully implemented - would need updateInvoice helper
    return NextResponse.json(
      { success: false, error: 'Update not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error('[PUT Invoice] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate invoice' },
      { status: 500 }
    );
  }
}

// DELETE - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('[DELETE Invoice] Attempting to delete invoice:', id);

    // Check if invoice exists
    const existingInvoice = await getInvoiceById(id);

    console.log('[DELETE Invoice] Found invoice:', existingInvoice ? 'yes' : 'no');

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete invoice
    await deleteInvoice(id);

    console.log('[DELETE Invoice] Successfully deleted:', id);

    return NextResponse.json({
      success: true,
      message: 'Invoice berhasil dihapus',
    });
  } catch (error) {
    console.error('[DELETE Invoice] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Gagal menghapus invoice: ${errorMessage}` },
      { status: 500 }
    );
  }
}
