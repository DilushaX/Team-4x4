import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = request.nextUrl.searchParams.get("id");
  const search = request.nextUrl.searchParams.get("search") || "";

  try {
    if (id) {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id, 10) },
        include: { customer: true, orders: { orderBy: { created_at: "desc" }, take: 10 } },
      });
      return NextResponse.json({ customer: user });
    }

    const customers = await prisma.user.findMany({
      where: {
        role: "customer",
        ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}),
      },
      include: { customer: true, _count: { select: { orders: true } } },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ customers });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    if (body.action === "delete") {
      await prisma.user.delete({ where: { id: body.id } });
      return NextResponse.json({ status: "success" });
    }
    if (body.action === "edit") {
      await prisma.customer.update({
        where: { user_id: body.id },
        data: {
          phone: body.phone,
          address: body.address,
          vehicle_model: body.vehicle_model,
          notes: body.notes,
        },
      });
      return NextResponse.json({ status: "success" });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
