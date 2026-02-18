import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for updating user
const updateUserSchema = z.object({
  plan: z.enum(['free', 'pro']).optional(),
  invoiceLimit: z.number().min(1).optional(),
});

// GET - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      include: {
        invoices: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Parse items JSON for each invoice
    const invoicesWithParsedItems = user.invoices.map(invoice => ({
      ...invoice,
      items: JSON.parse(invoice.items),
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        invoices: invoicesWithParsedItems,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data user' },
      { status: 500 }
    );
  }
}

// PUT - Update user (plan, invoiceLimit)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update user
    const updateData: any = {};
    if (validatedData.plan !== undefined) {
      updateData.plan = validatedData.plan;
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User berhasil diupdate',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues?.[0]?.message || 'Validasi error';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete user (cascade will delete invoices)
    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus user' },
      { status: 500 }
    );
  }
}
