"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

type Category = { id: number; name: string; slug: string; description: string | null; status: number; sort_order: number };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = () => fetch("/api/admin/categories").then((r) => r.json()).then((d) => setCategories(d.categories || []));
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("action", "add");
    fd.set("name", name);
    fd.set("description", description);
    await fetch("/api/admin/categories", { method: "POST", body: fd });
    setName("");
    setDescription("");
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete category?")) return;
    const fd = new FormData();
    fd.set("action", "delete");
    fd.set("id", String(id));
    await fetch("/api/admin/categories", { method: "POST", body: fd });
    load();
  };

  const handleToggle = async (id: number) => {
    const fd = new FormData();
    fd.set("action", "toggle_status");
    fd.set("id", String(id));
    await fetch("/api/admin/categories", { method: "POST", body: fd });
    load();
  };

  return (
    <>
      <AdminPageHeader section="categories" title="Categories" description="Organize your product catalog" />
      <form onSubmit={handleAdd} className="card mb-6 flex flex-wrap gap-3">
        <input required placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} className="input flex-1 min-w-[200px]" />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="input flex-1 min-w-[200px]" />
        <button type="submit" className="btn-primary">Add Category</button>
      </form>
      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="card flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-white">{c.name}</p>
              <p className="text-xs text-zinc-500">{c.slug} · Order: {c.sort_order}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${c.status ? "text-emerald-400" : "text-zinc-500"}`}>{c.status ? "Active" : "Inactive"}</span>
              <button type="button" onClick={() => handleToggle(c.id)} className="text-xs text-green-400 hover:underline">Toggle</button>
              <button type="button" onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
