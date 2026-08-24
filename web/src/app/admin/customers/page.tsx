"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

type Customer = {
  id: number;
  name: string;
  email: string;
  created_at: string;
  customer: { phone: string | null; address: string | null; vehicle_model: string | null } | null;
  _count: { orders: number };
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  const load = (q = "") => fetch(`/api/admin/customers${q ? `?search=${q}` : ""}`).then((r) => r.json()).then((d) => setCustomers(d.customers || []));
  useEffect(() => { load(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete customer?")) return;
    await fetch("/api/admin/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    load(search);
  };

  return (
    <>
      <AdminPageHeader section="customers" title="Customers" description="View registered customers" />
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="input flex-1" />
        <button type="submit" className="btn-primary">Search</button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50">
            <tr>
              <th className="p-3 text-zinc-400">Name</th>
              <th className="p-3 text-zinc-400">Email</th>
              <th className="p-3 text-zinc-400">Phone</th>
              <th className="p-3 text-zinc-400">Orders</th>
              <th className="p-3 text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-zinc-800/50">
                <td className="p-3 text-white">{c.name}</td>
                <td className="p-3 text-zinc-400">{c.email}</td>
                <td className="p-3 text-zinc-400">{c.customer?.phone || "—"}</td>
                <td className="p-3 text-zinc-300">{c._count.orders}</td>
                <td className="p-3">
                  <button type="button" onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
