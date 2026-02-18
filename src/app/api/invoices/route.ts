import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// Schema for creating invoice
const createInvoiceSchema = z.object({
  userId: z.string().min(1, 'User ID wajib diisi'),
  customerName: z.string().min(1, 'Nama pelanggan wajib diisi'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerPhone: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().optional(),
  notes: z.string().optional(),
  themeColor: z.string().default('#000000'),
  items: z.array(z.object({
    name: z.string().min(1, 'Nama item wajib diisi'),
    description: z.string().optional(),
    quantity: z.number().min(1, 'Jumlah harus lebih dari 0'),
    price: z.number().min(0, 'Harga tidak boleh negatif'),
  })).min(1, 'Minimal 1 item'),
  isPro: z.boolean().default(false),
  hasQris: z.boolean().default(false),
});

// Interface for Invoice Item
interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

// GET - List all invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    // Check if user exists, create if not
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      // Auto-create user if not found
      await supabase
        .from('users')
        .insert([{
          id: userId,
          email: `user_${userId}@invoiceumkm.local`,
          plan: 'FREE',
        }]);
    }

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Parse items JSON for each invoice
    const invoicesWithParsedItems = invoices.map(invoice => ({
      ...invoice,
      items: JSON.parse(invoice.items) as InvoiceItem[],
    }));

    return NextResponse.json({
      success: true,
      data: invoicesWithParsedItems,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    const errorMessage = error instanceof Error ? error.message : 'Gagal mengambil data invoice';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createInvoiceSchema.parse(body);

    // Check if user exists, create if not
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', validatedData.userId)
      .single();

    if (!existingUser) {
      await supabase
        .from('users')
        .insert([{
          id: validatedData.userId,
          email: validatedData.customerEmail || `user-${validatedData.userId}@invoiceumkm.id`,
          plan: 'FREE',
        }]);
    }

    // Calculate total
    const total = validatedData.items.reduce(
      (sum, item) => sum + (item.quantity * item.price),
      0
    );

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // Serialize items to JSON
    const itemsJson = JSON.stringify(validatedData.items);

    // Create invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert([{
        user_id: validatedData.userId,
        invoice_number: invoiceNumber,
        customer_name: validatedData.customerName,
        customer_email: validatedData.customerEmail || null,
        customer_phone: validatedData.customerPhone || null,
        address: validatedData.address || null,
        logo_url: validatedData.logoUrl || null,
        notes: validatedData.notes || null,
        theme_color: validatedData.themeColor,
        total,
        is_pro: validatedData.isPro,
        has_qris: validatedData.hasQris,
        items: itemsJson,
      }])
      .select()
      .single();

    if (error) throw error;

    // Return invoice with parsed items
    const responseInvoice = {
      ...invoice,
      items: validatedData.items,
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
    };

    return NextResponse.json({
      success: true,
      data: responseInvoice,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);

    let errorMessage = 'Gagal membuat invoice';
    let statusCode = 500;

    if (error instanceof z.ZodError) {
      errorMessage = error.issues?.[0]?.message || 'Validasi error';
      statusCode = 400;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage, details: error instanceof Error ? error.message : String(error) },
      { status: statusCode }
    );
  }
}
