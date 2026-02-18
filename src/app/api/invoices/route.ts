import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { Plan } from '@prisma/client';

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
    
    const whereClause = userId ? { userId } : {};
    
    const invoices = await db.invoice.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

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
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data invoice' },
      { status: 500 }
    );
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Invoice API] Received body:', JSON.stringify(body, null, 2));

    // Validate request body
    const validatedData = createInvoiceSchema.parse(body);
    console.log('[Invoice API] Validated data:', validatedData);

    // Check if user exists, create if not
    let user = await db.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      console.log('[Invoice API] User not found, creating new user...');
      user = await db.user.create({
        data: {
          id: validatedData.userId,
          email: validatedData.customerEmail || `user-${validatedData.userId}@invoiceumkm.id`,
          plan: Plan.FREE,
        },
      });
      console.log('[Invoice API] User created:', user);
    }

    // Calculate total
    const total = validatedData.items.reduce(
      (sum, item) => sum + (item.quantity * item.price),
      0
    );
    console.log('[Invoice API] Calculated total:', total);

    // Generate invoice number (INV + timestamp + random)
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    console.log('[Invoice API] Invoice number:', invoiceNumber);

    // Serialize items to JSON
    const itemsJson = JSON.stringify(validatedData.items);
    console.log('[Invoice API] Items JSON:', itemsJson);

    // Create invoice
    console.log('[Invoice API] Creating invoice in database...');
    const invoice = await db.invoice.create({
      data: {
        userId: validatedData.userId,
        invoiceNumber,
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail || null,
        customerPhone: validatedData.customerPhone || null,
        address: validatedData.address || null,
        logoUrl: validatedData.logoUrl || null,
        notes: validatedData.notes || null,
        themeColor: validatedData.themeColor,
        total,
        isPro: validatedData.isPro,
        hasQris: validatedData.hasQris,
        items: itemsJson,
      },
    });
    console.log('[Invoice API] Invoice created successfully:', invoice);

    // Return invoice with parsed items
    const responseInvoice = {
      ...invoice,
      items: validatedData.items,
    };

    return NextResponse.json({
      success: true,
      data: responseInvoice,
    }, { status: 201 });
  } catch (error) {
    console.error('[Invoice API] Error creating invoice:', error);
    
    let errorMessage = 'Gagal membuat invoice';
    let statusCode = 500;

    if (error instanceof z.ZodError) {
      errorMessage = error.issues?.[0]?.message || 'Validasi error';
      statusCode = 400;
      console.error('[Invoice API] Validation error:', error.issues);
    } else if (error instanceof Error) {
      errorMessage = error.message;
      console.error('[Invoice API] Error details:', error.message);
    }

    return NextResponse.json(
      { success: false, error: errorMessage, details: error instanceof Error ? error.message : String(error) },
      { status: statusCode }
    );
  }
}
