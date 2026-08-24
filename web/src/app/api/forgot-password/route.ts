import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ status: "error", message: "Valid email required." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ status: "error", message: "No account found with that email." }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { reset_token: token, reset_expires: expires },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    return NextResponse.json({
      status: "success",
      message: "Password reset link generated.",
      resetUrl: process.env.APP_ENV === "development" ? resetUrl : undefined,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "error", message: "Request failed." }, { status: 500 });
  }
}
