import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { Plan } from '@prisma/client';

// Schema for creating/getting user
const userSchema = z.object({
  email: z.string().email('Email tidak valid'),
});

// GET - Get user by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email diperlukan' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        invoices: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
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

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = userSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        data: existingUser,
        message: 'User sudah ada',
      });
    }

    // Create new user
    const user = await db.user.create({
      data: {
        email: validatedData.email,
        plan: Plan.FREE,
      },
    });

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User berhasil dibuat',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues?.[0]?.message || 'Validasi error';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Gagal membuat user' },
      { status: 500 }
    );
  }
}
