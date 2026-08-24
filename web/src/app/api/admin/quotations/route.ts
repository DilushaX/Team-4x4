import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { decimalToNumber } from "@/lib/money";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const quotation = await prisma.quotation.findUnique({
      where: { id: parseInt(id, 10) },
      include: { items: true },
    });
    return NextResponse.json({
      quotation: quotation
        ? { ...quotation, total_amount: decimalToNumber(quotation.total_amount), items: quotation.items.map((i) => ({ ...i, price: decimalToNumber(i.price) })) }
        : null,
    });
  }

  const quotations = await prisma.quotation.findMany({ orderBy: { created_at: "desc" }, include: { items: true } });
  return NextResponse.json({
    quotations: quotations.map((q) => ({ ...q, total_amount: decimalToNumber(q.total_amount) })),
  });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "delete") {
      await prisma.quotation.delete({ where: { id: body.id } });
      return NextResponse.json({ status: "success" });
    }

    if (action === "update_status") {
      await prisma.quotation.update({ where: { id: body.id }, data: { status: body.status } });
      return NextResponse.json({ status: "success" });
    }

    if (action === "create") {
      const quotationNumber = `QT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
      const items = body.items || [];
      const total = items.reduce((sum: number, i: { quantity: number; price: number }) => sum + i.quantity * i.price, 0);

      const quotation = await prisma.quotation.create({
        data: {
          quotation_number: quotationNumber,
          customer_name: body.customer_name,
          email: body.email,
          phone: body.phone || "",
          vehicle_model: body.vehicle_model || "",
          total_amount: total,
          items: {
            create: items.map((i: { description: string; quantity: number; price: number }) => ({
              description: i.description,
              quantity: i.quantity,
              price: i.price,
            })),
          },
        },
      });

      return NextResponse.json({ status: "success", quotation_number: quotationNumber, id: quotation.id });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
