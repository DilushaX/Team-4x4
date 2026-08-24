"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { formatMoney } from "@/lib/money";
import { normalizeImagePath } from "@/lib/utils";
import Image from "next/image";

type Product = {
  id: number;
  title: string;
  slug: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  is_featured: number;
  image_path: string | null;
};

type Category = { id: number; name: string; slug: string };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [pRes, cRes] = await Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]);
    setProducts(pRes.products || []);
    setCategories(cRes.categories || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("action", editId ? "edit" : "add");
    if (editId) formData.set("id", String(editId));

    await fetch("/api/admin/products", { method: "POST", body: formData });
    setShowForm(false);
    setEditId(null);
    form.reset();
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    const fd = new FormData();
    fd.set("action", "delete");
    fd.set("id", String(id));
    await fetch("/api/admin/products", { method: "POST", body: fd });
    load();
  };

  const handleToggleFeatured = async (id: number) => {
    const fd = new FormData();
    fd.set("action", "toggle_featured");
    fd.set("id", String(id));
    await fetch("/api/admin/products", { method: "POST", body: fd });
    load();
  };

  const startEdit = (p: Product) => {
    setEditId(p.id);
    setShowForm(true);
  };

  return (
    <>
      <AdminPageHeader section="products" title="Products" description="Manage your parts catalog" />
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => { setShowForm(true); setEditId(null); }} className="btn-primary text-sm">
          + Add Product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
          <form onSubmit={handleSubmit} className="card my-8 w-full max-w-lg space-y-3">
            <h2 className="font-display text-lg font-bold text-white">{editId ? "Edit" : "Add"} Product</h2>
            {editId && products.filter((p) => p.id === editId).map((p) => (
              <div key={p.id}>
                <input type="hidden" name="title" defaultValue={p.title} />
              </div>
            ))}
            <div><label className="label">Title</label><input name="title" required className="input" defaultValue={editId ? products.find((p) => p.id === editId)?.title : ""} /></div>
            <div><label className="label">SKU</label><input name="sku" className="input" defaultValue={editId ? products.find((p) => p.id === editId)?.sku : ""} /></div>
            <div><label className="label">Category</label>
              <select name="category_id" className="input" defaultValue={editId ? "" : ""}>
                <option value="">Select</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Price (LKR)</label><input name="price" type="number" required className="input" defaultValue={editId ? products.find((p) => p.id === editId)?.price : 0} /></div>
              <div><label className="label">Stock</label><input name="stock" type="number" className="input" defaultValue={editId ? products.find((p) => p.id === editId)?.stock : 0} /></div>
            </div>
            <div><label className="label">Description</label><textarea name="description" rows={3} className="input" /></div>
            <div><label className="label">Features (pipe-separated)</label><input name="features" className="input" placeholder="Feature 1|Feature 2" /></div>
            <div><label className="label">Compatibility</label><input name="compatibility" className="input" /></div>
            <div><label className="label">Main Image</label><input name="image" type="file" accept="image/*" className="input" /></div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary flex-1">Save</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-zinc-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                <th className="p-3 text-zinc-400">Product</th>
                <th className="p-3 text-zinc-400">SKU</th>
                <th className="p-3 text-zinc-400">Price</th>
                <th className="p-3 text-zinc-400">Stock</th>
                <th className="p-3 text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded bg-zinc-800">
                        <Image src={normalizeImagePath(p.image_path)} alt="" fill className="object-cover" sizes="40px" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{p.title}</p>
                        {p.is_featured === 1 && <span className="text-xs text-green-400">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-zinc-400">{p.sku}</td>
                  <td className="p-3 text-white">{formatMoney(p.price)}</td>
                  <td className="p-3"><span className={p.stock <= 5 ? "text-green-400" : "text-zinc-300"}>{p.stock}</span></td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEdit(p)} className="text-xs text-green-400 hover:underline">Edit</button>
                      <button type="button" onClick={() => handleToggleFeatured(p.id)} className="text-xs text-zinc-400 hover:underline">Toggle Featured</button>
                      <button type="button" onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
