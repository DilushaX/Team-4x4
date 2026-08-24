import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { getFormString, getFormNumber } from "@/lib/uploads";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ suppliers });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { action, id, name, company, phone, email, products_supplied } = body;

    if (action === "delete") {
      await prisma.supplier.delete({ where: { id } });
      return NextResponse.json({ status: "success" });
    }

    const data = { name, company, phone, email, products_supplied };

    if (action === "edit") {
      await prisma.supplier.update({ where: { id }, data });
      return NextResponse.json({ status: "success" });
    }

    const supplier = await prisma.supplier.create({ data });
    return NextResponse.json({ status: "success", id: supplier.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
