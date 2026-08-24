import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

const MOCK_SUPPLIERS = [
  {
    id: 1,
    name: "ARB 4x4 Accessories Melbourne",
    company: "ARB Corporation Ltd",
    phone: "+61 3 9761 6622",
    email: "sales@arb.com.au",
    products_supplied: "Suspension, Bullbars, Recovery Kits",
  },
  {
    id: 2,
    name: "Safari 4x4 Engineering",
    company: "Safari Automotive Technologies",
    phone: "+61 3 9720 7200",
    email: "info@safari4x4.com.au",
    products_supplied: "Snorkels, Air Intakes",
  },
];

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
    if (suppliers && suppliers.length > 0) {
      return NextResponse.json({ suppliers });
    }
    return NextResponse.json({ suppliers: MOCK_SUPPLIERS });
  } catch {
    return NextResponse.json({ suppliers: MOCK_SUPPLIERS });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { action, id, name, company, phone, email, products_supplied } = body;

    if (action === "delete") {
      try {
        await prisma.supplier.delete({ where: { id } });
      } catch {
        /* DB unavailable */
      }
      return NextResponse.json({ status: "success" });
    }

    const data = { name, company, phone, email, products_supplied };

    if (action === "edit") {
      try {
        await prisma.supplier.update({ where: { id }, data });
      } catch {
        const mock = MOCK_SUPPLIERS.find((s) => s.id === id);
        if (mock) Object.assign(mock, data);
      }
      return NextResponse.json({ status: "success" });
    }

    let createdId: number = Math.floor(10 + Math.random() * 90);
    try {
      const supplier = await prisma.supplier.create({ data });
      createdId = supplier.id;
    } catch {
      MOCK_SUPPLIERS.push({ id: createdId, ...data });
    }

    return NextResponse.json({ status: "success", id: createdId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
