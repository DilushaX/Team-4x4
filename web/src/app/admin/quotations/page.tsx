"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { formatMoney } from "@/lib/money";

type Quotation = {
  id: number;
  quotation_number: string;
  customer_name: string;
  email: string;
  total_amount: number;
  status: string;
  created_at: string;
};

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([{ description: "", quantity: 1, price: 0 }]);
  const [form, setForm] = useState({ customer_name: "", email: "", phone: "", vehicle_model: "" });

  const load = () => fetch("/api/admin/quotations").then((r) => r.json()).then((d) => setQuotations(d.quotations || []));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...form, items }),
    });
    setShowForm(false);
    setForm({ customer_name: "", email: "", phone: "", vehicle_model: "" });
    setItems([{ description: "", quantity: 1, price: 0 }]);
    load();
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/admin/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", id, status }),
    });
    load();
  };

  return (
    <>
      <AdminPageHeader section="quotations" title="Quotations" description="Customer quotes" />
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setShowForm(true)} className="btn-primary text-sm">+ New Quote</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 space-y-3">
          <h2 className="font-display font-bold text-white">Create Quotation</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input required placeholder="Customer name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="input" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          </div>
          {items.map((item, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-4">
              <input placeholder="Description" value={item.description} onChange={(e) => { const n = [...items]; n[i].description = e.target.value; setItems(n); }} className="input sm:col-span-2" />
              <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => { const n = [...items]; n[i].quantity = parseInt(e.target.value) || 1; setItems(n); }} className="input" />
              <input type="number" placeholder="Price" value={item.price} onChange={(e) => { const n = [...items]; n[i].price = parseFloat(e.target.value) || 0; setItems(n); }} className="input" />
            </div>
          ))}
          <button type="button" onClick={() => setItems([...items, { description: "", quantity: 1, price: 0 }])} className="text-xs text-green-400">+ Add line item</button>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {quotations.map((q) => (
          <div key={q.id} className="card flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-white">{q.quotation_number} — {q.customer_name}</p>
              <p className="text-xs text-zinc-500">{q.email} · {new Date(q.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-green-400">{formatMoney(q.total_amount)}</span>
              <select value={q.status} onChange={(e) => updateStatus(q.id, e.target.value)} className="input w-auto text-xs">
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
