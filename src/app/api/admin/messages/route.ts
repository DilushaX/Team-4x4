import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const message = await prisma.message.findUnique({ where: { id: parseInt(id, 10) } });
    return NextResponse.json({ message });
  }

  const messages = await prisma.message.findMany({ orderBy: { created_at: "desc" } });
  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    if (body.action === "mark_read") {
      await prisma.message.update({ where: { id: body.id }, data: { status: "read" } });
      return NextResponse.json({ status: "success" });
    }
    if (body.action === "delete") {
      await prisma.message.delete({ where: { id: body.id } });
      return NextResponse.json({ status: "success" });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
