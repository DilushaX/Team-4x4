"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  vehicle_model?: string | null;
  created_at: string;
  orderCount?: number;
  customer?: {
    phone: string | null;
    address: string | null;
    vehicle_model: string | null;
  } | null;
  _count?: { orders: number };
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (q = "") => {
    try {
      const res = await fetch(`/api/admin/customers${q ? `?search=${encodeURIComponent(q)}` : ""}`);
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (e) {
      console.error("Failed to load customers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    await fetch("/api/admin/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    load(search);
  };

  return (
    <>
      <AdminPageHeader
        section="customers"
        title="Registered Customers"
        description="View and manage registered clients and account profiles"
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex flex-1 max-w-md gap-2">
          <input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1 text-sm"
          />
          <button type="submit" className="btn-primary text-sm">
            Search
          </button>
        </form>

        <p className="text-sm text-zinc-400">
          Total Customers: <span className="font-bold text-white">{customers.length}</span>
        </p>
      </div>

      {loading ? (
        <p className="text-zinc-500">Loading registered customers...</p>
      ) : customers.length === 0 ? (
        <div className="card text-center py-12 text-zinc-400">
          <p>No customers found matching your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40 shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80">
              <tr>
                <th className="p-3.5 text-zinc-400 font-semibold">Customer</th>
                <th className="p-3.5 text-zinc-400 font-semibold">Contact Info</th>
                <th className="p-3.5 text-zinc-400 font-semibold">Vehicle</th>
                <th className="p-3.5 text-zinc-400 font-semibold">Joined Date</th>
                <th className="p-3.5 text-zinc-400 font-semibold">Orders</th>
                <th className="p-3.5 text-zinc-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const phone = c.phone || c.customer?.phone || "—";
                const vehicle = c.vehicle_model || c.customer?.vehicle_model || "Defender 110";
                const orders = c.orderCount ?? c._count?.orders ?? 0;
                return (
                  <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/60 transition">
                    <td className="p-3.5">
                      <div className="font-medium text-white">{c.name}</div>
                      <div className="text-xs text-zinc-400">{c.email}</div>
                    </td>
                    <td className="p-3.5 text-zinc-300 font-mono text-xs">
                      {phone}
                    </td>
                    <td className="p-3.5 text-zinc-300 text-xs">
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-200">
                        {vehicle}
                      </span>
                    </td>
                    <td className="p-3.5 text-xs text-zinc-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      <span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-semibold text-green-400">
                        {orders} {orders === 1 ? "order" : "orders"}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="text-xs font-semibold text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
