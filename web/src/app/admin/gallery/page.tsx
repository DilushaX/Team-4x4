"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Link from "next/link";
import Image from "next/image";
import { normalizeImagePath } from "@/lib/utils";

type Project = { id: number; title: string; slug: string; category: string; featured_image: string | null; _count: { images: number } };

export default function AdminGalleryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = () => fetch("/api/admin/gallery").then((r) => r.json()).then((d) => setProjects(d.projects || []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("action", "add");
    await fetch("/api/admin/gallery", { method: "POST", body: formData });
    setShowForm(false);
    e.currentTarget.reset();
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete project?")) return;
    const fd = new FormData();
    fd.set("action", "delete");
    fd.set("id", String(id));
    await fetch("/api/admin/gallery", { method: "POST", body: fd });
    load();
  };

  return (
    <>
      <AdminPageHeader section="gallery" title="Gallery" description="Manage build projects" />
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Add Project</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
          <form onSubmit={handleSubmit} className="card my-8 w-full max-w-lg space-y-3">
            <h2 className="font-display text-lg font-bold text-white">Add Project</h2>
            <div><label className="label">Title</label><input name="title" required className="input" /></div>
            <div><label className="label">Category</label><input name="category" required className="input" placeholder="Restoration, Suspension..." /></div>
            <div><label className="label">Description</label><textarea name="description" rows={3} className="input" /></div>
            <div><label className="label">Modifications (one per line)</label><textarea name="modifications" rows={2} className="input" /></div>
            <div><label className="label">Installed Parts (one per line)</label><textarea name="installed_parts" rows={2} className="input" /></div>
            <div><label className="label">Featured Image</label><input name="featured_image" type="file" accept="image/*" className="input" /></div>
            <div><label className="label">Gallery Images</label><input name="images" type="file" accept="image/*" multiple className="input" /></div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <div key={p.id} className="card overflow-hidden p-0">
            <div className="relative aspect-video bg-zinc-800">
              <Image src={normalizeImagePath(p.featured_image)} alt={p.title} fill className="object-cover" sizes="33vw" />
            </div>
            <div className="p-4">
              <p className="text-xs text-green-400">{p.category}</p>
              <h3 className="font-medium text-white">{p.title}</h3>
              <p className="text-xs text-zinc-500">{p._count.images} photos</p>
              <div className="mt-3 flex gap-2">
                <Link href={`/project/${p.slug}`} target="_blank" className="text-xs text-green-400 hover:underline">View</Link>
                <button type="button" onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
