"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

type Supplier = { id: number; name: string; company: string | null; phone: string | null; email: string | null; products_supplied: string | null };

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState({ name: "", company: "", phone: "", email: "", products_supplied: "" });

  const load = () => fetch("/api/admin/suppliers").then((r) => r.json()).then((d) => setSuppliers(d.suppliers || []));
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", ...form }),
    });
    setForm({ name: "", company: "", phone: "", email: "", products_supplied: "" });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete supplier?")) return;
    await fetch("/api/admin/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    load();
  };

  return (
    <>
      <AdminPageHeader section="suppliers" title="Suppliers" description="Vendor directory" />
      <form onSubmit={handleAdd} className="card mb-6 grid gap-3 sm:grid-cols-2">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input" />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
        <input placeholder="Products supplied" value={form.products_supplied} onChange={(e) => setForm({ ...form, products_supplied: e.target.value })} className="input sm:col-span-2" />
        <button type="submit" className="btn-primary sm:col-span-2">Add Supplier</button>
      </form>
      <div className="space-y-2">
        {suppliers.map((s) => (
          <div key={s.id} className="card flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-white">{s.name}</p>
              <p className="text-xs text-zinc-500">{s.company} · {s.phone} · {s.email}</p>
              {s.products_supplied && <p className="text-xs text-zinc-400">{s.products_supplied}</p>}
            </div>
            <button type="button" onClick={() => handleDelete(s.id)} className="text-xs text-red-400 hover:underline">Delete</button>
          </div>
        ))}
      </div>
    </>
  );
}
