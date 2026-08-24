import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getActiveCustomers, updateMockCustomer } from "@/lib/mock-data";

const schema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const GLOBAL_TOKENS = globalThis as unknown as {
  __RESET_TOKENS__?: Record<string, { token: string; expires: number }>;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Invalid reset data.";
      return NextResponse.json({ status: "error", message: errorMsg }, { status: 400 });
    }

    const { email, token, password } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // Verify token from memory or Prisma
    const memoryRecord = GLOBAL_TOKENS.__RESET_TOKENS__?.[cleanEmail];
    let isTokenValid = false;

    if (memoryRecord && memoryRecord.token === token && memoryRecord.expires > Date.now()) {
      isTokenValid = true;
      delete GLOBAL_TOKENS.__RESET_TOKENS__![cleanEmail];
    }

    let dbUser = null;
    try {
      dbUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (dbUser && dbUser.reset_token === token) {
        if (!dbUser.reset_expires || dbUser.reset_expires >= new Date()) {
          isTokenValid = true;
        }
      }
    } catch {
      /* DB unavailable */
    }

    if (!isTokenValid) {
      return NextResponse.json(
        { status: "error", message: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 10);

    // Update in Prisma DB if available
    if (dbUser) {
      try {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { password: hash, reset_token: null, reset_expires: null },
        });
      } catch {
        /* DB unavailable */
      }
    }

    // Update in persistent customer store
    const mockCustomer = getActiveCustomers().find((c) => c.email.toLowerCase() === cleanEmail);
    if (mockCustomer) {
      updateMockCustomer(mockCustomer.id, { password: hash });
    }

    return NextResponse.json({
      status: "success",
      message: "Your password has been updated successfully! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ status: "error", message: "Reset failed. Please try again." }, { status: 500 });
  }
}
