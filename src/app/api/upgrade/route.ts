import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Plan } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { error: "User ID or email is required" },
        { status: 400 }
      );
    }

    // Find user by ID or email
    let user;
    if (userId) {
      user = await db.user.findUnique({
        where: { id: userId },
      });
    } else if (email) {
      user = await db.user.findUnique({
        where: { email },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already PRO
    if (user.plan === Plan.PRO) {
      return NextResponse.json(
        { message: "User is already on PRO plan", plan: Plan.PRO },
        { status: 200 }
      );
    }

    // Upgrade to PRO
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { plan: Plan.PRO },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully upgraded to PRO",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        plan: updatedUser.plan,
      },
    });
  } catch (error) {
    console.error("Error upgrading plan:", error);
    return NextResponse.json(
      { error: "Failed to upgrade plan" },
      { status: 500 }
    );
  }
}

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
        select: {
          id: true,
          email: true,
          plan: true,
          createdAt: true,
        },
      });
    } else if (email) {
      user = await db.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          plan: true,
          createdAt: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch user plan" },
      { status: 500 }
    );
  }
}
