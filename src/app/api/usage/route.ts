import { NextRequest, NextResponse } from "next/server";
import { getUserById, getUserByEmail, createUser, getInvoiceCount } from "@/lib/supabase";
import { FREE_PLAN_LIMIT, PRO_PLAN_LIMIT } from "@/lib/plans";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    if (!userId && !email) {
      return NextResponse.json(
        { error: "User ID or email is required" },
        { status: 400 }
      );
    }

    let user = null;

    // Try to find user by ID first
    if (userId) {
      user = await getUserById(userId);
    }

    // If not found by ID, try email
    if (!user && email) {
      user = await getUserByEmail(email);
    }

    // If user not found, create a new one
    if (!user) {
      const newId = userId || `user_${Date.now()}`;
      const newEmail = email || `${newId}@invoiceumkm.local`;
      user = await createUser(newEmail, 'FREE');
    }

    // Get invoice count
    const invoiceCount = await getInvoiceCount(user.id);
    const isPro = user.plan === 'PRO';
    const limit = isPro ? PRO_PLAN_LIMIT : FREE_PLAN_LIMIT;
    const remaining = isPro ? Infinity : Math.max(0, limit - invoiceCount);

    return NextResponse.json({
      success: true,
      data: {
        plan: user.plan,
        invoiceCount,
        limit,
        remaining,
        isPro,
        canCreate: invoiceCount < limit,
      },
    });
  } catch (error) {
    console.error("Error fetching usage:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch usage';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
