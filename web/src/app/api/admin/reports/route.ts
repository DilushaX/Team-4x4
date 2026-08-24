import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { decimalToNumber, formatMoney } from "@/lib/money";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const type = request.nextUrl.searchParams.get("type") || "sales";

  try {
    if (type === "sales") {
      const orders = await prisma.order.findMany({
        orderBy: { created_at: "desc" },
        take: 100,
      });
      const totalRevenue = orders.reduce((sum, o) => sum + decimalToNumber(o.total_amount), 0);
      const byStatus: Record<string, number> = {};
      orders.forEach((o) => {
        byStatus[o.status] = (byStatus[o.status] || 0) + 1;
      });
      return NextResponse.json({
        type: "sales",
        summary: { totalOrders: orders.length, totalRevenue, formattedRevenue: formatMoney(totalRevenue) },
        byStatus,
        recentOrders: orders.slice(0, 20).map((o) => ({
          id: o.id,
          customer_name: o.customer_name,
          total_amount: decimalToNumber(o.total_amount),
          status: o.status,
          created_at: o.created_at,
        })),
      });
    }

    if (type === "inventory") {
      const products = await prisma.product.findMany({ orderBy: { title: "asc" } });
      const totalValue = products.reduce((sum, p) => sum + decimalToNumber(p.price) * p.stock, 0);
      const lowStock = products.filter((p) => p.stock <= 5);
      return NextResponse.json({
        type: "inventory",
        summary: { totalProducts: products.length, totalValue, formattedValue: formatMoney(totalValue), lowStockCount: lowStock.length },
        lowStock: lowStock.map((p) => ({ id: p.id, title: p.title, stock: p.stock, price: decimalToNumber(p.price) })),
      });
    }

    if (type === "customers") {
      const customers = await prisma.user.findMany({
        where: { role: "customer" },
        include: { _count: { select: { orders: true } } },
        orderBy: { created_at: "desc" },
      });
      return NextResponse.json({
        type: "customers",
        summary: { totalCustomers: customers.length },
        customers: customers.map((c) => ({ id: c.id, name: c.name, email: c.email, orderCount: c._count.orders, created_at: c.created_at })),
      });
    }

    return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
