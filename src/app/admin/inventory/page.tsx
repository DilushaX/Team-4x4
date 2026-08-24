"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { formatMoney } from "@/lib/money";

type InventoryData = {
  summary: { totalProducts: number; lowStockCount: number; totalValue: number };
  products: { id: number; title: string; stock: number; sku: string | null }[];
  movements: { id: number; quantity_changed: number; reason: string; created_at: string; product: { title: string } }[];
  lowStock: { id: number; title: string; stock: number }[];
};

export default function AdminInventoryPage() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [adjustId, setAdjustId] = useState("");
  const [adjustQty, setAdjustQty] = useState("");
  const [reason, setReason] = useState("Manual adjustment");

  const load = async () => {
    try {
      const res = await fetch("/api/admin/inventory");
      if (!res.ok) return;
      const json = await res.json();
      if (json && json.summary) setData(json);
    } catch (e) {
      console.error("Failed to load inventory:", e);
    }
  };
  useEffect(() => { load(); }, []);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("action", "adjust_stock");
    fd.set("id", adjustId);
    fd.set("quantity_changed", adjustQty);
    fd.set("reason", reason);
    await fetch("/api/admin/inventory", { method: "POST", body: fd });
    setAdjustId("");
    setAdjustQty("");
    load();
  };

  if (!data) return <p className="text-zinc-500">Loading...</p>;

  return (
    <>
      <AdminPageHeader section="inventory" title="Inventory" description="Stock levels and movement history" />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card"><p className="text-sm text-zinc-400">Total Products</p><p className="text-2xl font-bold text-white">{data.summary.totalProducts}</p></div>
        <div className="card"><p className="text-sm text-zinc-400">Low Stock</p><p className="text-2xl font-bold text-green-400">{data.summary.lowStockCount}</p></div>
        <div className="card"><p className="text-sm text-zinc-400">Inventory Value</p><p className="text-2xl font-bold text-white">{formatMoney(data.summary.totalValue)}</p></div>
      </div>

      <form onSubmit={handleAdjust} className="card mb-6 flex flex-wrap gap-3">
        <select required value={adjustId} onChange={(e) => setAdjustId(e.target.value)} className="input min-w-[200px]">
          <option value="">Select product</option>
          {data.products.map((p) => <option key={p.id} value={p.id}>{p.title} ({p.stock})</option>)}
        </select>
        <input required type="number" placeholder="Qty change (+/-)" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} className="input w-32" />
        <input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} className="input flex-1 min-w-[160px]" />
        <button type="submit" className="btn-primary">Adjust Stock</button>
      </form>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-display font-bold text-white">Low Stock</h2>
          <ul className="mt-3 space-y-2">
            {data.lowStock.map((p) => (
              <li key={p.id} className="flex justify-between text-sm">
                <span className="text-zinc-300">{p.title}</span>
                <span className="text-green-400">{p.stock} left</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="font-display font-bold text-white">Recent Movements</h2>
          <ul className="mt-3 space-y-2">
            {data.movements.slice(0, 15).map((m) => (
              <li key={m.id} className="text-sm">
                <span className={m.quantity_changed > 0 ? "text-emerald-400" : "text-red-400"}>{m.quantity_changed > 0 ? "+" : ""}{m.quantity_changed}</span>
                {" "}<span className="text-zinc-300">{m.product.title}</span>
                <span className="block text-xs text-zinc-500">{m.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
