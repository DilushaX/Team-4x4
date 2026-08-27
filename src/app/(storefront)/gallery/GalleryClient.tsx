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
    <div className="w-full">
      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="card text-center py-20 text-zinc-400">
          <p className="text-lg font-semibold text-white">No photos available yet.</p>
          <p className="mt-1 text-xs text-zinc-500">Check back soon for new build updates!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {photos.map((photo, idx) => (
            <div
              key={photo.id || idx}
              onClick={() => setSelectedPhotoIndex(idx)}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800/80 shadow-md transition-all duration-300 hover:border-green-500/60 hover:shadow-xl hover:shadow-green-500/10 hover:ring-2 hover:ring-green-500/40"
            >
              <Image
                src={normalizeImagePath(photo.image_path)}
                alt={photo.title || "Team 4x4 Build"}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-106"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Subtle hover overlay */}
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
        <div
          onClick={() => setSelectedPhotoIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 sm:p-6 backdrop-blur-md transition-opacity duration-300"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center max-w-6xl w-full max-h-[95vh]"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute -top-12 right-0 sm:top-2 sm:right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 hover:text-white transition border border-zinc-700/60"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Main Image Container */}
            <div className="relative w-full h-[75vh] sm:h-[80vh] rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950 flex items-center justify-center">
              <Image
                src={normalizeImagePath(photos[selectedPhotoIndex].image_path)}
                alt={photos[selectedPhotoIndex].title || "Team 4x4 Build"}
                fill
                unoptimized
                className="object-contain"
                sizes="100vw"
                priority
              />

              {/* Prev Button Overlay */}
              <button
                type="button"
                onClick={() =>
                  setSelectedPhotoIndex(
                    (selectedPhotoIndex - 1 + photos.length) % photos.length
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-950/70 text-white backdrop-blur-md border border-zinc-700/50 hover:bg-zinc-900 hover:border-green-500 transition"
                aria-label="Previous image"
              >
                ‹
              </button>

              {/* Next Button Overlay */}
              <button
                type="button"
                onClick={() =>
                  setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-950/70 text-white backdrop-blur-md border border-zinc-700/50 hover:bg-zinc-900 hover:border-green-500 transition"
                aria-label="Next image"
              >
                ›
              </button>
            </div>

            {/* Bottom Controls & Count */}
            <div className="mt-3 flex w-full items-center justify-between px-2 text-zinc-400 text-xs sm:text-sm">
              <span className="font-semibold text-zinc-300">
                Photo {selectedPhotoIndex + 1} of {photos.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex(
                      (selectedPhotoIndex - 1 + photos.length) % photos.length
                    )
                  }
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-medium hover:border-green-500 hover:text-white transition"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length)
                  }
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-medium hover:border-green-500 hover:text-white transition"
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
