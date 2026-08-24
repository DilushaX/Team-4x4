"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Image from "next/image";
import { normalizeImagePath } from "@/lib/utils";

type GalleryPhoto = {
  id: number;
  title: string;
  category: string;
  image_path: string;
  created_at: string;
};

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch (e) {
      console.error("Failed to load gallery photos", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      formData.set("action", "add");

      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setShowUpload(false);
        form.reset();
        await load();
      }
    } catch (e) {
      console.error("Upload error", e);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    const fd = new FormData();
    fd.set("action", "delete");
    fd.set("id", String(id));
    await fetch("/api/admin/gallery", { method: "POST", body: fd });
    load();
  };

  return (
    <>
      <AdminPageHeader
        section="gallery"
        title="Photo Gallery"
        description="Upload and manage customer build and workshop photos"
      />

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          Total Photos: <span className="font-bold text-white">{photos.length}</span>
        </p>
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="btn-primary text-sm font-semibold shadow-lg shadow-green-500/10"
        >
          + Upload New Photos
        </button>
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="card my-8 w-full max-w-lg space-y-4 border border-zinc-700 bg-zinc-900 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="font-display text-xl font-bold text-white">Upload Photos to Gallery</h2>
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="label">Photo Title / Caption (Optional)</label>
              <input
                name="title"
                className="input"
                placeholder="e.g. Defender 110 Custom Upholstery / Suspension Upgrade"
              />
            </div>

            <div>
              <label className="label">Category Tag</label>
              <select name="category" className="input" defaultValue="Builds">
                <option value="Builds">Builds & Restorations</option>
                <option value="Interior">Interior & Cushion</option>
                <option value="Suspension">Suspension & Brakes</option>
                <option value="Fabrication">Fabrication & Armor</option>
                <option value="Recovery">Recovery & Winch</option>
                <option value="Lighting">Lighting & Electrical</option>
              </select>
            </div>

            <div className="rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-400 text-xl font-bold">
                📷
              </div>
              <label className="block text-sm font-medium text-white mb-1">
                Select Photo(s) to Upload
              </label>
              <p className="text-xs text-zinc-400 mb-4">
                You can select multiple photos at once (JPG, PNG, WebP)
              </p>
              <input
                name="images"
                type="file"
                accept="image/*"
                multiple
                required
                className="input text-xs file:mr-4 file:rounded-md file:border-0 file:bg-green-500 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-zinc-950 hover:file:bg-green-400"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={uploading}
                className="btn-primary flex-1 py-2.5 font-bold"
              >
                {uploading ? "Uploading..." : "Upload Photos"}
              </button>
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="btn-secondary px-6"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-zinc-500">Loading gallery photos...</p>
      ) : photos.length === 0 ? (
        <div className="card text-center py-12 text-zinc-400">
          <p>No photos uploaded yet.</p>
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="btn-primary mt-4 inline-flex text-sm"
          >
            Upload First Photo
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow transition hover:border-green-500/50"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950">
                <Image
                  src={normalizeImagePath(photo.image_path)}
                  alt={photo.title}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <span className="absolute left-2 top-2 rounded bg-zinc-950/80 px-2 py-0.5 text-[10px] font-bold text-green-400 backdrop-blur-sm border border-zinc-800">
                  {photo.category}
                </span>
              </div>
              <div className="p-3">
                <p className="font-medium text-xs text-white truncate" title={photo.title}>
                  {photo.title}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>{new Date(photo.created_at).toLocaleDateString()}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id)}
                    className="text-red-400 hover:text-red-300 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
