"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { normalizeImagePath } from "@/lib/utils";

type GalleryPhoto = {
  id: number;
  title: string;
  category?: string;
  image_path: string;
  created_at?: string;
};

type Props = {
  photos: GalleryPhoto[];
};

export default function GalleryClient({ photos: initialPhotos }: Props) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  // Sync state if initialPhotos changes
  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  // Fetch latest photos client-side to ensure instant updates
  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.photos && Array.isArray(data.photos)) {
          setPhotos(data.photos);
        }
      })
      .catch((err) => console.warn("Live gallery refresh notice:", err));
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === "Escape") setSelectedPhotoIndex(null);
      if (e.key === "ArrowRight") {
        setSelectedPhotoIndex((prev) =>
          prev !== null ? (prev + 1) % photos.length : null
        );
      }
      if (e.key === "ArrowLeft") {
        setSelectedPhotoIndex((prev) =>
          prev !== null ? (prev - 1 + photos.length) % photos.length : null
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhotoIndex, photos.length]);

  return (
    <div>
      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="card text-center py-16 text-zinc-400">
          <p className="text-base font-semibold text-white">No photos available yet.</p>
          <p className="mt-1 text-xs text-zinc-500">Check back soon for new build updates!</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhotoIndex(idx)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition-all duration-300 hover:border-green-500/60 hover:shadow-xl hover:shadow-green-500/10"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
                <Image
                  src={normalizeImagePath(photo.image_path)}
                  alt={photo.title || "Gallery photo"}
                  fill
                  unoptimized
                  className="object-cover transition duration-500 group-hover:scale-108"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Hover Caption */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {photo.title && (
                    <p className="font-display font-bold text-white text-base leading-snug drop-shadow-md">
                      {photo.title}
                    </p>
                  )}
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
      {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
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
                src={normalizeImagePath(photos[selectedPhotoIndex].image_path)}
                alt={photos[selectedPhotoIndex].title || "Gallery photo"}
                fill
                unoptimized
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Bottom Caption & Controls */}
            <div className="mt-4 flex w-full items-center justify-between px-2 text-white">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  {photos[selectedPhotoIndex].title || "Defender Custom Build"}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex(
                      (selectedPhotoIndex - 1 + photos.length) % photos.length
                    )
                  }
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-green-500 hover:text-white transition"
                >
                  ← Prev
                </button>
                <span className="text-xs text-zinc-500">
                  {selectedPhotoIndex + 1} / {photos.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length)
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
