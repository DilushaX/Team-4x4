import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getActiveCustomers, updateMockCustomer } from "@/lib/mock-data";

const schema = z.object({ email: z.string().email("Please enter a valid email address.") });

const GLOBAL_TOKENS = globalThis as unknown as {
  __RESET_TOKENS__?: Record<string, { token: string; expires: number }>;
};
if (!GLOBAL_TOKENS.__RESET_TOKENS__) {
  GLOBAL_TOKENS.__RESET_TOKENS__ = {};
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ status: "error", message: "Please enter a valid email." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();

    // Check in demo users, mock customers, and database
    const isDemoAdmin = email === "admin@team4x4.lk";
    const isDemoCustomer = email === "kasun@email.lk";
    const mockCustomer = getActiveCustomers().find((c) => c.email.toLowerCase() === email);

    let dbUser = null;
    try {
      dbUser = await prisma.user.findUnique({ where: { email } });
    } catch {
      /* DB unavailable */
    }

    if (!isDemoAdmin && !isDemoCustomer && !mockCustomer && !dbUser) {
      return NextResponse.json(
        { status: "error", message: "No account found with that email address. Please sign up first." },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(24).toString("hex");
    const expires = Date.now() + 3600000; // 1 hour

    // Store in global memory map
    GLOBAL_TOKENS.__RESET_TOKENS__![email] = { token, expires };

    // Update in Prisma DB if online
    if (dbUser) {
      try {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { reset_token: token, reset_expires: new Date(expires) },
        });
      } catch {
        /* DB unavailable */
      }
    }

    const resetUrl = `/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    return NextResponse.json({
      status: "success",
      message: "Reset link generated successfully.",
      resetUrl,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ status: "error", message: "Request failed. Please try again." }, { status: 500 });
  }
}
