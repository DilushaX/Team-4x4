import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { getSessionUserId } from "@/lib/api-auth";
import { getFormNumber, getFormString } from "@/lib/uploads";
import { decimalToNumber } from "@/lib/money";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [products, movements] = await Promise.all([
    prisma.product.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, stock: true, sku: true, price: true } }),
    prisma.inventoryMovement.findMany({ orderBy: { created_at: "desc" }, take: 50, include: { product: { select: { title: true } } } }),
  ]);

  const lowStock = products.filter((p) => p.stock <= 5);
  const totalValue = products.reduce((sum, p) => sum + decimalToNumber(p.price) * p.stock, 0);

  return NextResponse.json({
    summary: { totalProducts: products.length, lowStockCount: lowStock.length, totalValue },
    products,
    movements,
    lowStock,
  });
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const action = getFormString(formData, "action");

    if (action === "adjust_stock") {
      const id = getFormNumber(formData, "id");
      const qty = getFormNumber(formData, "quantity_changed");
      const reason = getFormString(formData, "reason", "Manual adjustment");
      const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

      const product = await prisma.product.update({
        where: { id },
        data: { stock: { increment: qty } },
      });

      await prisma.inventoryMovement.create({
        data: { product_id: id, quantity_changed: qty, reason, user_id: userId },
      });

      if (product.stock <= 5) {
        await prisma.adminNotification.create({
          data: {
            type: "inventory",
            title: `Low stock: ${product.title}`,
            message: `Stock is now ${product.stock} units.`,
          },
        });
      }

      return NextResponse.json({ status: "success", new_stock: product.stock });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
