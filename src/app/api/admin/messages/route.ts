import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

const MOCK_MESSAGES = [
  {
    id: 1,
    name: "Chaminda Bandara",
    email: "chaminda@gmail.com",
    phone: "+94 77 456 7890",
    subject: "Defender 110 Winch Installation",
    message: "Hi, I would like to inquire about installing a 12,000 lbs winch on my Defender 110 front bumper.",
    status: "read",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = request.nextUrl.searchParams.get("id");
  try {
    if (id) {
      const message = await prisma.message.findUnique({ where: { id: parseInt(id, 10) } });
      if (message) return NextResponse.json({ message });
      const mock = MOCK_MESSAGES.find((m) => m.id === parseInt(id, 10));
      return NextResponse.json({ message: mock || null });
    }

    const messages = await prisma.message.findMany({ orderBy: { created_at: "desc" } });
    if (messages && messages.length > 0) {
      return NextResponse.json({ messages });
    }
    return NextResponse.json({ messages: MOCK_MESSAGES });
  } catch {
    if (id) {
      const mock = MOCK_MESSAGES.find((m) => m.id === parseInt(id, 10));
      return NextResponse.json({ message: mock || null });
    }
    return NextResponse.json({ messages: MOCK_MESSAGES });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    if (body.action === "mark_read") {
      try {
        await prisma.message.update({ where: { id: body.id }, data: { status: "read" } });
      } catch {
        const mock = MOCK_MESSAGES.find((m) => m.id === body.id);
        if (mock) mock.status = "read";
      }
      return NextResponse.json({ status: "success" });
    }
    if (body.action === "delete") {
      try {
        await prisma.message.delete({ where: { id: body.id } });
      } catch {
        /* DB unavailable */
      }
      return NextResponse.json({ status: "success" });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
