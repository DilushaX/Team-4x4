"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { normalizeImagePath } from "@/lib/utils";

type GalleryPhoto = {
  id: number;
  title: string;
  category: string;
  image_path: string;
};

type Props = {
  photos: GalleryPhoto[];
  categories: string[];
};

export default function GalleryClient({ photos, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const filteredPhotos =
    activeCategory === "all"
      ? photos
      : photos.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === "Escape") setSelectedPhotoIndex(null);
      if (e.key === "ArrowRight") {
        setSelectedPhotoIndex((prev) =>
          prev !== null ? (prev + 1) % filteredPhotos.length : null
        );
      }
      if (e.key === "ArrowLeft") {
        setSelectedPhotoIndex((prev) =>
          prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : null
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhotoIndex, filteredPhotos.length]);

  return (
    <div>
      {/* Filter Tabs */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => { setActiveCategory("all"); setSelectedPhotoIndex(null); }}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            activeCategory === "all"
              ? "bg-green-500 text-zinc-950 shadow-lg shadow-green-500/20"
              : "border border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-zinc-500 hover:text-white"
          }`}
        >
          All Photos ({photos.length})
        </button>

        {categories.map((cat) => {
          const count = photos.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
          if (count === 0) return null;
          const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              type="button"
              onClick={() => { setActiveCategory(cat); setSelectedPhotoIndex(null); }}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-green-500 text-zinc-950 shadow-lg shadow-green-500/20"
                  : "border border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-zinc-500 hover:text-white"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="card text-center py-16 text-zinc-400">
          <p className="text-base">No photos found in this category.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {filteredPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhotoIndex(idx)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition-all duration-300 hover:border-green-500/60 hover:shadow-xl hover:shadow-green-500/10"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={normalizeImagePath(photo.image_path)}
                  alt={photo.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-108"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                {/* Badge */}
                <span className="absolute left-3 top-3 rounded-full bg-zinc-950/80 px-3 py-1 text-xs font-semibold text-green-400 backdrop-blur-md border border-zinc-800">
                  {photo.category}
                </span>

                {/* Hover Caption */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="font-display font-bold text-white text-base leading-snug drop-shadow-md">
                    {photo.title}
                  </p>
                  <p className="mt-1 text-xs font-medium text-green-400 flex items-center gap-1">
                    🔍 Click to expand
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhotoIndex !== null && filteredPhotos[selectedPhotoIndex] && (
        <div
          onClick={() => setSelectedPhotoIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md transition-opacity duration-300"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center max-w-5xl w-full max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute -top-12 right-0 rounded-full bg-zinc-900/80 p-2.5 text-white hover:bg-zinc-800 transition"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Main Image Container */}
            <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
              <Image
                src={normalizeImagePath(filteredPhotos[selectedPhotoIndex].image_path)}
                alt={filteredPhotos[selectedPhotoIndex].title}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Bottom Caption & Controls */}
            <div className="mt-4 flex w-full items-center justify-between px-2 text-white">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-green-400">
                  {filteredPhotos[selectedPhotoIndex].category}
                </span>
                <h3 className="font-display text-lg font-bold text-white">
                  {filteredPhotos[selectedPhotoIndex].title}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex(
                      (selectedPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length
                    )
                  }
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-green-500 hover:text-white transition"
                >
                  ← Prev
                </button>
                <span className="text-xs text-zinc-500">
                  {selectedPhotoIndex + 1} / {filteredPhotos.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex((selectedPhotoIndex + 1) % filteredPhotos.length)
                  }
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-green-500 hover:text-white transition"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
