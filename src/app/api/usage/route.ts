import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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

    let user: any = null;

    // Try to find user by ID first
    if (userId) {
      const { data, error } = await supabase
        .from('users')
        .select('*, invoices(count)')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      user = data;
    }

    // If not found by ID, try email
    if (!user && email) {
      const { data, error } = await supabase
        .from('users')
        .select('*, invoices(count)')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      user = data;
    }

    // If user not found, create a new one
    if (!user) {
      const newEmail = email || `user_${Date.now()}@invoiceumkm.local`;
      const newUser = {
        id: userId || `user_${Date.now()}`,
        email: newEmail,
        plan: 'FREE' as const,
      };

      const { data: createdUser, error } = await supabase
        .from('users')
        .insert([newUser])
        .select('*, invoices(count)')
        .single();

      if (error) throw error;
      user = createdUser;
    }

    // Get invoice count
    const invoiceCount = user.invoices?.[0]?.count || 0;
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
