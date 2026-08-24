"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { formatMoney } from "@/lib/money";

export default function AdminReportsPage() {
  const [type, setType] = useState("sales");
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`/api/admin/reports?type=${type}`).then((r) => r.json()).then(setData);
  }, [type]);

  const summary = data?.summary as Record<string, unknown> | undefined;

  return (
    <>
      <AdminPageHeader section="reports" title="Reports" description="Sales, inventory and customer analytics" />
      <div className="mb-6 flex gap-2">
        {["sales", "inventory", "customers"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-lg px-4 py-2 text-sm capitalize ${type === t ? "bg-green-500/15 text-green-400" : "text-zinc-400 hover:bg-zinc-800"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {!data ? (
        <p className="text-zinc-500">Loading...</p>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {Object.entries(summary || {}).map(([key, value]) => (
              <div key={key} className="card">
                <p className="text-sm capitalize text-zinc-400">{key.replace(/([A-Z])/g, " $1")}</p>
                <p className="text-2xl font-bold text-white">
                  {typeof value === "number" && (key.toLowerCase().includes("revenue") || key.toLowerCase().includes("value"))
                    ? formatMoney(value)
                    : String(value)}
                </p>
              </div>
            ))}
          </div>

          {type === "sales" && Array.isArray(data.recentOrders) && (
            <div className="card">
              <h2 className="font-display font-bold text-white">Recent Orders</h2>
              <ul className="mt-4 space-y-2">
                {(data.recentOrders as { id: number; customer_name: string; total_amount: number; status: string }[]).map((o) => (
                  <li key={o.id} className="flex justify-between text-sm">
                    <span className="text-zinc-300">#{o.id} {o.customer_name}</span>
                    <span className="text-green-400">{formatMoney(o.total_amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {type === "inventory" && Array.isArray(data.lowStock) && (
            <div className="card">
              <h2 className="font-display font-bold text-white">Low Stock Items</h2>
              <ul className="mt-4 space-y-2">
                {(data.lowStock as { id: number; title: string; stock: number }[]).map((p) => (
                  <li key={p.id} className="flex justify-between text-sm">
                    <span className="text-zinc-300">{p.title}</span>
                    <span className="text-green-400">{p.stock} left</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </>
  );
}
