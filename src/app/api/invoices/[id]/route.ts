import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
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
    const invoice = await db.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice tidak ditemukan' },
        { status: 404 }
      );
    }

    // Parse items JSON
    const responseInvoice = {
      ...invoice,
      items: JSON.parse(invoice.items) as InvoiceItem[],
    };

    return NextResponse.json({
      success: true,
      data: responseInvoice,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data invoice' },
      { status: 500 }
    );
  }
}

// PUT - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Schema for updating invoice
    const updateInvoiceSchema = z.object({
      customerName: z.string().min(1, 'Nama pelanggan wajib diisi').optional(),
      customerEmail: z.string().email().optional().or(z.literal('')),
      customerPhone: z.string().optional(),
      address: z.string().optional(),
      logoUrl: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(['pending', 'paid', 'overdue']).optional(),
      themeColor: z.string().optional(),
      items: z.array(z.object({
        name: z.string().min(1, 'Nama item wajib diisi'),
        description: z.string().optional(),
        quantity: z.number().min(1, 'Jumlah harus lebih dari 0'),
        price: z.number().min(0, 'Harga tidak boleh negatif'),
      })).optional(),
    });

    const validatedData = updateInvoiceSchema.parse(body);

    // Check if invoice exists
    const existingInvoice = await db.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice tidak ditemukan' },
        { status: 404 }
      );
    }

    // Calculate new total if items are provided
    let total = existingInvoice.total;
    let itemsJson = existingInvoice.items;

    if (validatedData.items) {
      total = validatedData.items.reduce(
        (sum, item) => sum + (item.quantity * item.price),
        0
      );
      itemsJson = JSON.stringify(validatedData.items);
    }

    // Update invoice
    const updateData: any = {};
    if (validatedData.customerName !== undefined) updateData.customerName = validatedData.customerName;
    if (validatedData.customerEmail !== undefined) updateData.customerEmail = validatedData.customerEmail || null;
    if (validatedData.customerPhone !== undefined) updateData.customerPhone = validatedData.customerPhone || null;
    if (validatedData.address !== undefined) updateData.address = validatedData.address || null;
    if (validatedData.logoUrl !== undefined) updateData.logoUrl = validatedData.logoUrl || null;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes || null;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.themeColor !== undefined) updateData.themeColor = validatedData.themeColor;
    updateData.total = total;
    if (validatedData.items) updateData.items = itemsJson;

    const invoice = await db.invoice.update({
      where: { id },
      data: updateData,
    });

    // Parse items for response
    const responseInvoice = {
      ...invoice,
      items: JSON.parse(invoice.items) as InvoiceItem[],
    };

    return NextResponse.json({
      success: true,
      data: responseInvoice,
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues?.[0]?.message || 'Validasi error';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }
    
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
    
    // Check if invoice exists
    const existingInvoice = await db.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete invoice
    await db.invoice.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus invoice' },
      { status: 500 }
    );
  }
}
