import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  vehicle: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ status: "error", message: "Please fill all required fields." }, { status: 400 });
    }

    const data = parsed.data;

    await prisma.$transaction([
      prisma.message.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          vehicle: data.vehicle || "",
          service: data.service || "",
          message: data.message,
          status: "unread",
        },
      }),
      prisma.adminNotification.create({
        data: {
          type: "contact",
          title: `New inquiry from ${data.name}`,
          message: data.message.slice(0, 200),
        },
      }),
    ]);

    return NextResponse.json({ status: "success", message: "Message sent successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "error", message: "Failed to send message." }, { status: 500 });
  }
}
