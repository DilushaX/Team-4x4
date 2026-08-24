import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { getFormString, getFormNumber } from "@/lib/uploads";
import { decimalToNumber } from "@/lib/money";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = request.nextUrl.searchParams.get("id");
  try {
    if (id) {
      const order = await prisma.order.findUnique({
        where: { id: parseInt(id, 10) },
        include: { items: true, user: true },
      });
      if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({
        order: {
          ...order,
          total_amount: decimalToNumber(order.total_amount),
          delivery_fee: decimalToNumber(order.delivery_fee),
          items: order.items.map((i) => ({ ...i, price: decimalToNumber(i.price) })),
        },
      });
    }

    const orders = await prisma.order.findMany({
      orderBy: { created_at: "desc" },
      include: { items: true },
    });
    return NextResponse.json({
      orders: orders.map((o) => ({
        ...o,
        total_amount: decimalToNumber(o.total_amount),
        delivery_fee: decimalToNumber(o.delivery_fee),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { action, id, status, payment_status, notes, whatsapp_reference } = body;

    if (action === "update_status") {
      await prisma.order.update({
        where: { id },
        data: {
          status,
          ...(payment_status ? { payment_status } : {}),
          ...(notes ? { notes } : {}),
          ...(whatsapp_reference ? { whatsapp_reference } : {}),
        },
      });
      await prisma.adminNotification.create({
        data: {
          type: "order",
          title: `Order #${id} updated`,
          message: `Status changed to ${status}`,
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
