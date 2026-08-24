import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { getFormNumber, getFormString } from "@/lib/uploads";
import { decimalToNumber } from "@/lib/money";
import { getActiveProducts, updateMockProduct } from "@/lib/mock-data";

const MOCK_MOVEMENTS = [
  {
    id: 1,
    quantity_changed: 10,
    reason: "Initial warehouse shipment",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    product: { title: "Tactical Bull Bar V2" },
  },
  {
    id: 2,
    quantity_changed: -1,
    reason: "Customer Order #1",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    product: { title: "BP-51 Bypass Suspension Kit" },
  },
];

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const [products, movements] = await Promise.all([
      prisma.product.findMany({
        orderBy: { title: "asc" },
        select: { id: true, title: true, stock: true, sku: true, price: true },
      }),
      prisma.inventoryMovement.findMany({
        orderBy: { created_at: "desc" },
        take: 50,
        include: { product: { select: { title: true } } },
      }),
    ]);

    if (products && products.length > 0) {
      const lowStock = products.filter((p) => p.stock <= 5);
      const totalValue = products.reduce((sum, p) => sum + decimalToNumber(p.price) * p.stock, 0);

      return NextResponse.json({
        summary: { totalProducts: products.length, lowStockCount: lowStock.length, totalValue },
        products,
        movements,
        lowStock,
      });
    }
  } catch {
    /* DB unavailable - fallback below */
  }

  const activeProducts = getActiveProducts();
  const lowStock = activeProducts.filter((p) => p.stock <= 5);
  const totalValue = activeProducts.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0), 0);

  return NextResponse.json({
    summary: { totalProducts: activeProducts.length, lowStockCount: lowStock.length, totalValue },
    products: activeProducts.map((p) => ({
      id: p.id,
      title: p.title,
      stock: p.stock,
      sku: p.sku,
      price: p.price,
    })),
    movements: MOCK_MOVEMENTS,
    lowStock: lowStock.map((p) => ({
      id: p.id,
      title: p.title,
      stock: p.stock,
    })),
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

      let newStock = 0;
      try {
        const product = await prisma.product.update({
          where: { id },
          data: { stock: { increment: qty } },
        });
        newStock = product.stock;

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
      } catch {
        const mock = getActiveProducts().find((p) => p.id === id);
        if (mock) {
          mock.stock = Math.max(0, mock.stock + qty);
          newStock = mock.stock;
          MOCK_MOVEMENTS.unshift({
            id: MOCK_MOVEMENTS.length + 1,
            quantity_changed: qty,
            reason,
            created_at: new Date().toISOString(),
            product: { title: mock.title },
          });
        }
      }

      return NextResponse.json({ status: "success", new_stock: newStock });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
