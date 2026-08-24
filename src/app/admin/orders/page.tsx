"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { formatMoney } from "@/lib/money";

type Order = {
  id: number;
  customer_name: string;
  phone: string;
  email: string;
  status: string;
  payment_status: string;
  fulfillment_type: string;
  total_amount: number;
  created_at: string;
  items?: { product_title: string; quantity: number; price: number }[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const load = () => fetch("/api/admin/orders").then((r) => r.json()).then((d) => setOrders(d.orders || []));
  useEffect(() => { load(); }, []);

  const viewOrder = async (id: number) => {
    const res = await fetch(`/api/admin/orders?id=${id}`);
    const data = await res.json();
    setSelected(data.order);
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", id, status }),
    });
    load();
    if (selected?.id === id) viewOrder(id);
  };

  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <>
      <AdminPageHeader section="orders" title="Orders" description="Manage customer orders" />
      <div className="mb-4 flex gap-2">
        {["all", "pending", "confirmed", "processing", "completed", "cancelled"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${statusFilter === s ? "bg-green-500/15 text-green-400" : "text-zinc-400 hover:bg-zinc-800"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-2">
          {filtered.map((o) => (
            <div key={o.id} className="card flex cursor-pointer items-center justify-between py-3 transition hover:border-green-500/30" onClick={() => viewOrder(o.id)}>
              <div>
                <p className="font-medium text-white">#{o.id} — {o.customer_name}</p>
                <p className="text-xs text-zinc-500">{new Date(o.created_at).toLocaleString()} · {o.fulfillment_type}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-400">{formatMoney(o.total_amount)}</p>
                <span className="text-xs capitalize text-zinc-400">{o.status}</span>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="card sticky top-6">
            <h2 className="font-display text-lg font-bold text-white">Order #{selected.id}</h2>
            <div className="mt-4 space-y-2 text-sm">
              <p><span className="text-zinc-500">Customer:</span> {selected.customer_name}</p>
              <p><span className="text-zinc-500">Phone:</span> {selected.phone}</p>
              <p><span className="text-zinc-500">Email:</span> {selected.email}</p>
              <p><span className="text-zinc-500">Total:</span> {formatMoney(selected.total_amount)}</p>
            </div>
            {selected.items && (
              <ul className="mt-4 space-y-1 border-t border-zinc-800 pt-4 text-sm">
                {selected.items.map((item, i) => (
                  <li key={i} className="flex justify-between text-zinc-400">
                    <span>{item.product_title} × {item.quantity}</span>
                    <span>{formatMoney(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {["pending", "confirmed", "processing", "completed", "cancelled"].map((s) => (
                <button key={s} type="button" onClick={() => updateStatus(selected.id, s)} className="rounded bg-zinc-800 px-2 py-1 text-xs capitalize text-zinc-300 hover:bg-zinc-700">
                  {s}
                </button>
              ))}
            </div>
            <a href={`/admin/invoice?id=${selected.id}`} target="_blank" className="btn-outline mt-4 block text-center text-xs">Print Invoice</a>
          </div>
        )}
      </div>
    </>
  );
}
