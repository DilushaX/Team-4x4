import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ status: "error", message: "Invalid reset data." }, { status: 400 });
    }

    const { email, token, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user || user.reset_token !== token) {
      return NextResponse.json({ status: "error", message: "Invalid or expired reset link." }, { status: 400 });
    }

    if (user.reset_expires && user.reset_expires < new Date()) {
      return NextResponse.json({ status: "error", message: "Reset link has expired." }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash, reset_token: null, reset_expires: null },
    });

    return NextResponse.json({ status: "success", message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "error", message: "Reset failed." }, { status: 500 });
  }
}
