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
  category_id: number | null;
  price: number;
  stock: number;
  is_featured: number;
  image_path: string | null;
  description: string;
  features: string;
  compatibility: string;
  installation_notes: string;
  images?: { id: number; image_path: string }[];
};

type Category = { id: number; name: string; slug: string };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/admin/products").then((r) => r.json()),
        fetch("/api/admin/categories").then((r) => r.json()),
      ]);
      setProducts(pRes.products || []);
      setCategories(cRes.categories || []);
    } catch (e) {
      console.error("Failed to load products", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      formData.set("action", editProduct ? "edit" : "add");
      if (editProduct) formData.set("id", String(editProduct.id));

      const res = await fetch("/api/admin/products", { method: "POST", body: formData });
      if (res.ok) {
        setShowForm(false);
        setEditProduct(null);
        form.reset();
        await load();
      }
    } catch (e) {
      console.error("Failed to save product", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
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
    setEditProduct(p);
    setShowForm(true);
  };

  const openNewForm = () => {
    setEditProduct(null);
    setShowForm(true);
  };

  return (
    <>
      <AdminPageHeader section="products" title="Products" description="Manage parts and off-road catalog" />
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={openNewForm} className="btn-primary text-sm font-semibold">
          + Add New Product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="card my-8 w-full max-w-2xl space-y-4 border border-zinc-700 bg-zinc-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="font-display text-xl font-bold text-white">
                {editProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditProduct(null); }}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="label">Product Title *</label>
              <input
                name="title"
                required
                className="input"
                defaultValue={editProduct?.title || ""}
                placeholder="e.g. Old Man Emu BP-51 Bypass Shocks"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">SKU Code</label>
                <input
                  name="sku"
                  className="input font-mono text-sm"
                  defaultValue={editProduct?.sku || ""}
                  placeholder="e.g. T4X4-SUS-01"
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select
                  name="category_id"
                  className="input"
                  defaultValue={editProduct?.category_id || ""}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Price (LKR) *</label>
                <input
                  name="price"
                  type="number"
                  required
                  min="0"
                  className="input"
                  defaultValue={editProduct?.price || ""}
                  placeholder="380000"
                />
              </div>
              <div>
                <label className="label">Stock Units *</label>
                <input
                  name="stock"
                  type="number"
                  required
                  min="0"
                  className="input"
                  defaultValue={editProduct?.stock ?? 10}
                />
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                rows={3}
                className="input"
                defaultValue={editProduct?.description || ""}
                placeholder="Detailed specifications and build overview..."
              />
            </div>

            <div>
              <label className="label">Features (Pipe-separated |)</label>
              <input
                name="features"
                className="input"
                defaultValue={editProduct?.features || ""}
                placeholder="Internal bypass shocks|Adjustable compression|Corrosion resistant"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Vehicle Compatibility</label>
                <input
                  name="compatibility"
                  className="input"
                  defaultValue={editProduct?.compatibility || ""}
                  placeholder="Defender 90/110/130, LC 70"
                />
              </div>
              <div>
                <label className="label">Installation Notes</label>
                <input
                  name="installation_notes"
                  className="input"
                  defaultValue={editProduct?.installation_notes || ""}
                  placeholder="Direct bolt-on / alignment recommended"
                />
              </div>
            </div>

            {/* Photo Upload Section (Photo 1 & Photo 2) */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                📸 Product Photos (Upload 2 or more photos)
              </h3>
              <p className="text-xs text-zinc-400">
                The main photo will be featured on catalog grids; the 2nd and additional photos will appear as interactive thumbnails on the product page.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div>
                  <label className="label text-xs font-semibold text-green-400">Photo 1 (Main Image)</label>
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    className="input text-xs"
                  />
                  {editProduct?.image_path && (
                    <p className="mt-1 text-[11px] text-zinc-500 truncate">Current: {editProduct.image_path}</p>
                  )}
                </div>

                <div>
                  <label className="label text-xs font-semibold text-green-400">Photo 2 (Second View / Detail)</label>
                  <input
                    name="image_2"
                    type="file"
                    accept="image/*"
                    className="input text-xs"
                  />
                  {editProduct?.images?.[0]?.image_path && (
                    <p className="mt-1 text-[11px] text-zinc-500 truncate">Current: {editProduct.images[0].image_path}</p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <label className="label text-xs text-zinc-400">Additional Photos (Optional - Select multiple)</label>
                <input
                  name="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="input text-xs"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-zinc-800">
              <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5 font-bold">
                {submitting ? "Saving..." : editProduct ? "Update Product" : "Create Product"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditProduct(null); }}
                className="btn-secondary px-6"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-zinc-500">Loading parts catalog...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80">
              <tr>
                <th className="p-3.5 text-zinc-400 font-semibold">Product</th>
                <th className="p-3.5 text-zinc-400 font-semibold">SKU</th>
                <th className="p-3.5 text-zinc-400 font-semibold">Price</th>
                <th className="p-3.5 text-zinc-400 font-semibold">Stock</th>
                <th className="p-3.5 text-zinc-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shrink-0">
                        <Image src={normalizeImagePath(p.image_path)} alt="" fill className="object-cover" sizes="48px" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{p.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.category && <span className="text-xs text-zinc-400">{p.category}</span>}
                          {p.is_featured === 1 && <span className="rounded bg-green-500/20 px-1.5 py-0.5 text-[10px] font-bold text-green-400">Featured</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-xs text-zinc-400">{p.sku || "—"}</td>
                  <td className="p-3.5 font-bold text-white">{formatMoney(p.price)}</td>
                  <td className="p-3.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.stock <= 5 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                      {p.stock} in stock
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-3 text-xs">
                      <button type="button" onClick={() => startEdit(p)} className="font-semibold text-green-400 hover:text-green-300">
                        Edit
                      </button>
                      <button type="button" onClick={() => handleToggleFeatured(p.id)} className="text-zinc-400 hover:text-zinc-200">
                        {p.is_featured ? "Unfeature" : "Feature"}
                      </button>
                      <button type="button" onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300">
                        Delete
                      </button>
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
