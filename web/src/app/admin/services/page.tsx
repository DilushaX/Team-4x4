"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Link from "next/link";

type Service = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  pricing: string | null;
  duration: string | null;
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);

  const load = () => fetch("/api/admin/services").then((r) => r.json()).then((d) => setServices(d.services || []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("action", editing ? "edit" : "add");
    if (editing) formData.set("id", String(editing.id));
    await fetch("/api/admin/services", { method: "POST", body: formData });
    setEditing(null);
    e.currentTarget.reset();
    load();
  };

  return (
    <>
      <AdminPageHeader section="services" title="Services" description="Workshop service pages" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          {services.map((s) => (
            <div key={s.id} className="card flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-white">{s.title}</p>
                <p className="text-xs text-zinc-500">{s.pricing} · {s.duration}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/service/${s.slug}`} target="_blank" className="text-xs text-zinc-400 hover:underline">View</Link>
                <button type="button" onClick={() => setEditing(s)} className="text-xs text-green-400 hover:underline">Edit</button>
              </div>
            </div>
          ))}
        </div>

        {editing && (
          <form onSubmit={handleSubmit} className="card space-y-3">
            <h2 className="font-display font-bold text-white">Edit: {editing.title}</h2>
            <input type="hidden" name="slug" defaultValue={editing.slug} />
            <div><label className="label">Title</label><input name="title" defaultValue={editing.title} className="input" /></div>
            <div><label className="label">Subtitle</label><input name="subtitle" defaultValue={editing.subtitle || ""} className="input" /></div>
            <div><label className="label">Description</label><textarea name="description" rows={3} className="input" /></div>
            <div><label className="label">Features (pipe-separated)</label><input name="features" className="input" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Pricing</label><input name="pricing" defaultValue={editing.pricing || ""} className="input" /></div>
              <div><label className="label">Duration</label><input name="duration" defaultValue={editing.duration || ""} className="input" /></div>
            </div>
            <div><label className="label">Compatibility (one per line)</label><textarea name="compatibility" rows={2} className="input" /></div>
            <div><label className="label">Hero Banner</label><input name="hero_banner" type="file" accept="image/*" className="input" /></div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">Save</button>
              <button type="button" onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
