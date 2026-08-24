import { NextRequest, NextResponse } from "next/server";
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

    const existing = await prisma.subscriber.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return NextResponse.json({ status: "success", message: "You are already subscribed!" });
    }

    await prisma.subscriber.create({ data: { email: parsed.data.email } });
    return NextResponse.json({ status: "success", message: "Thank you for subscribing!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "error", message: "Subscription failed." }, { status: 500 });
  }
}
