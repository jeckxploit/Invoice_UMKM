import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Plan } from "@prisma/client";
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

    let user;
    if (userId) {
      user = await db.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: { invoices: true },
          },
        },
      });
    } else if (email) {
      user = await db.user.findUnique({
        where: { email },
        include: {
          _count: {
            select: { invoices: true },
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const invoiceCount = user._count.invoices;
    const isPro = user.plan === Plan.PRO;
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
    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 }
    );
  }
}
