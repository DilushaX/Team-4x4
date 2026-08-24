import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatMoney } from "@/lib/money";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Link from "next/link";
import { getActiveProducts, MOCK_ORDERS } from "@/lib/mock-data";

export default async function AdminDashboard() {
  let stats = {
    products: 0,
    orders: 0,
    customers: 2,
    messages: 0,
    revenue: 0,
    pendingOrders: 0,
  };
  let recentOrders: {
    id: number;
    customer_name: string;
    status: string;
    total_amount: number;
  }[] = [];
  let lowStock: { id: number; title: string; stock: number }[] = [];

  try {
    const [products, orders, customers, messages, revenueAgg, pending, recent, lowStockProducts] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: "customer" } }),
      prisma.message.count({ where: { status: "unread" } }),
      prisma.order.aggregate({ _sum: { total_amount: true } }),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.findMany({ orderBy: { created_at: "desc" }, take: 5 }),
      prisma.product.findMany({ where: { stock: { lte: 5 } }, orderBy: { stock: "asc" }, take: 5 }),
    ]);

    if (products > 0 || orders > 0) {
      stats = {
        products,
        orders,
        customers: Math.max(2, customers),
        messages,
        revenue: decimalToNumber(revenueAgg._sum.total_amount),
        pendingOrders: pending,
      };
      recentOrders = recent.map((o) => ({
        id: o.id,
        customer_name: o.customer_name,
        status: o.status,
        total_amount: decimalToNumber(o.total_amount),
      }));
      lowStock = lowStockProducts.map((p) => ({ id: p.id, title: p.title, stock: p.stock }));
    }
  } catch {
    /* DB unavailable */
  }

  // Fallback to active mock store if DB has 0 items
  if (stats.products === 0 && recentOrders.length === 0) {
    const allProducts = getActiveProducts();
    const allOrders = MOCK_ORDERS;
    const totalRev = allOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const pendingCount = allOrders.filter((o) => o.status === "pending").length;

    stats = {
      products: allProducts.length,
      orders: allOrders.length,
      customers: 2,
      messages: 0,
      revenue: totalRev,
      pendingOrders: pendingCount,
    };
    recentOrders = allOrders.slice(0, 5).map((o) => ({
      id: o.id,
      customer_name: o.customer_name,
      status: o.status,
      total_amount: o.total_amount,
    }));
    lowStock = allProducts
      .filter((p) => p.stock <= 5)
      .map((p) => ({ id: p.id, title: p.title, stock: p.stock }));
  }

  const statCards = [
    { label: "Products", value: stats.products, href: "/admin/products" },
    { label: "Orders", value: stats.orders, href: "/admin/orders" },
    { label: "Customers", value: stats.customers, href: "/admin/customers" },
    { label: "Unread Messages", value: stats.messages, href: "/admin/messages" },
    { label: "Total Revenue", value: formatMoney(stats.revenue), href: "/admin/reports" },
    { label: "Pending Orders", value: stats.pendingOrders, href: "/admin/orders" },
  ];

  return (
    <>
      <AdminPageHeader section="dashboard" title="Dashboard" description="Overview of your store performance" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="card transition hover:border-green-500/30">
            <p className="text-sm text-zinc-400">{card.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-display text-lg font-bold text-white">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No orders yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between border-b border-zinc-800 pb-3 text-sm">
                  <div>
                    <Link href={`/admin/orders?id=${order.id}`} className="font-medium text-white hover:text-green-400">
                      #{order.id} — {order.customer_name}
                    </Link>
                    <p className="text-zinc-500 capitalize">{order.status}</p>
                  </div>
                  <span className="font-semibold text-green-400">{formatMoney(order.total_amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="font-display text-lg font-bold text-white">Low Stock Alerts</h2>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">All products well stocked.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <Link href={`/admin/products?id=${p.id}`} className="text-white hover:text-green-400">{p.title}</Link>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.stock <= 0 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
