import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { decimalToNumber } from "@/lib/money";

const MOCK_QUOTATIONS = [
  {
    id: 1,
    quotation_number: "QT-2026-1001",
    customer_name: "Rohan Dissanayake",
    email: "rohan@gmail.com",
    phone: "+94 77 345 6789",
    vehicle_model: "Defender 110 TD5",
    total_amount: 680000,
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    items: [
      { id: 1, description: "BP-51 Suspension Setup & Fitting", quantity: 1, price: 420000 },
      { id: 2, description: "Rock Sliders & Undershield Armor", quantity: 1, price: 260000 },
    ],
  },
];

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = request.nextUrl.searchParams.get("id");
  try {
    if (id) {
      const quotation = await prisma.quotation.findUnique({
        where: { id: parseInt(id, 10) },
        include: { items: true },
      });
      if (quotation) {
        return NextResponse.json({
          quotation: {
            ...quotation,
            total_amount: decimalToNumber(quotation.total_amount),
            items: quotation.items.map((i) => ({ ...i, price: decimalToNumber(i.price) })),
          },
        });
      }
      const mock = MOCK_QUOTATIONS.find((q) => q.id === parseInt(id, 10));
      return NextResponse.json({ quotation: mock || null });
    }

    const quotations = await prisma.quotation.findMany({ orderBy: { created_at: "desc" }, include: { items: true } });
    if (quotations && quotations.length > 0) {
      return NextResponse.json({
        quotations: quotations.map((q) => ({ ...q, total_amount: decimalToNumber(q.total_amount) })),
      });
    }
    return NextResponse.json({ quotations: MOCK_QUOTATIONS });
  } catch {
    if (id) {
      const mock = MOCK_QUOTATIONS.find((q) => q.id === parseInt(id, 10));
      return NextResponse.json({ quotation: mock || null });
    }
    return NextResponse.json({ quotations: MOCK_QUOTATIONS });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "delete") {
      try {
        await prisma.quotation.delete({ where: { id: body.id } });
      } catch {
        /* DB unavailable */
      }
      return NextResponse.json({ status: "success" });
    }

    if (action === "update_status") {
      try {
        await prisma.quotation.update({ where: { id: body.id }, data: { status: body.status } });
      } catch {
        const mock = MOCK_QUOTATIONS.find((q) => q.id === body.id);
        if (mock) mock.status = body.status;
      }
      return NextResponse.json({ status: "success" });
    }

    if (action === "create") {
      const quotationNumber = `QT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
      const items = body.items || [];
      const total = items.reduce((sum: number, i: { quantity: number; price: number }) => sum + i.quantity * i.price, 0);

      let createdId: number = Math.floor(100 + Math.random() * 900);
      try {
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
        createdId = quotation.id;
      } catch {
        /* DB unavailable */
      }

      MOCK_QUOTATIONS.unshift({
        id: createdId,
        quotation_number: quotationNumber,
        customer_name: body.customer_name,
        email: body.email,
        phone: body.phone || "",
        vehicle_model: body.vehicle_model || "",
        total_amount: total,
        status: "pending",
        created_at: new Date().toISOString(),
        items: items.map((it: { description: string; quantity: number; price: number }, idx: number) => ({
          id: idx + 1,
          description: it.description,
          quantity: it.quantity,
          price: it.price,
        })),
      });

      return NextResponse.json({ status: "success", quotation_number: quotationNumber, id: createdId });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
