"use client";

import { useEffect, useState, useRef } from "react";
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

type FilePreview = {
  file: File;
  previewUrl: string;
  name: string;
  size: string;
};

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>("" );

  // Upload Form states
  const [title, setTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Lightbox
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/gallery");
      if (!res.ok) {
        throw new Error(`Failed to load gallery (HTTP ${res.status})`);
      }
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch (e) {
      console.error("Failed to load gallery photos", e);
      setErrorMessage("Could not load gallery photos. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFiles = (files: FileList | File[]) => {
    const validFiles: FilePreview[] = [];
    const maxSizeBytes = 8 * 1024 * 1024; // 8MB

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setErrorMessage(`"${file.name}" is not a supported image file.`);
        return;
      }
      if (file.size > maxSizeBytes) {
        setErrorMessage(`"${file.name}" exceeds the 8MB limit.`);
        return;
      }
      validFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        size: formatFileSize(file.size),
      });
    });

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setErrorMessage(null);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  const clearForm = () => {
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setSelectedFiles([]);
    setTitle("");
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCloseModal = () => {
    if (!uploading) {
      clearForm();
      setShowUpload(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (selectedFiles.length === 0) {
      setErrorMessage("Please choose at least one photo to upload.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.set("action", "add");
      formData.set("title", title);
      formData.set("category", "Gallery");

      selectedFiles.forEach((item) => {
        formData.append("images", item.file);
      });

      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Upload failed with status ${res.status}`);
      }

      setSuccessMessage(data.message || `Successfully added ${selectedFiles.length} photo(s)!`);
      clearForm();
      setShowUpload(false);
      await load();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (e: unknown) {
      console.error("Upload error", e);
      setErrorMessage(e instanceof Error ? e.message : "Failed to upload photos. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this photo?")) return;
    setDeletingId(id);
    setErrorMessage(null);
    try {
      const fd = new FormData();
      fd.set("action", "delete");
      fd.set("id", String(id));

      const res = await fetch("/api/admin/gallery", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete photo");
      }
      setSuccessMessage("Photo removed successfully.");
      await load();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: unknown) {
      console.error("Delete error", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete photo.");
    } finally {
      setDeletingId(null);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Filtered photos based only on search
  const filteredPhotos = photos.filter((photo) => {
    if (!searchQuery) return true;
    return photo.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <>
      <AdminPageHeader
        section="gallery"
        title="Photo Gallery"
        description="Upload and manage customer build and workshop portfolio photos"
      />

      {/* Global Alerts */}
      {successMessage && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-green-500/30 bg-green-950/40 p-4 text-sm text-green-300 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-green-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {errorMessage && !showUpload && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-300 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search photos by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 text-xs"
            />
            <span className="absolute left-3 top-2.5 text-zinc-500 text-xs">🔍</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-xs text-zinc-400 hidden sm:inline">
            Total: <span className="font-bold text-white">{photos.length}</span> photos
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            clearForm();
            setShowUpload(true);
          }}
          className="btn-primary flex items-center justify-center gap-2 text-sm font-semibold shadow-lg shadow-green-500/10"
        >
          <span>📷</span>
          <span>Upload Photos</span>
        </button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
          <form
            onSubmit={handleSubmit}
            className="card relative my-8 w-full max-w-xl space-y-4 border border-zinc-700 bg-zinc-900 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="font-display text-lg font-bold text-white">Upload Photos to Gallery</h2>
                <p className="text-xs text-zinc-400">Add photos to show in the customer photo gallery</p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={uploading}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-red-500/40 bg-red-950/50 p-3 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="label">Photo Title / Caption (Optional)</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Defender 110 Custom Build"
                className="input text-sm"
                disabled={uploading}
              />
              <p className="mt-1 text-[11px] text-zinc-500">
                Optional. If blank, a default title is assigned automatically.
              </p>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
                dragActive
                  ? "border-green-400 bg-green-950/20"
                  : "border-zinc-700 bg-zinc-950/60 hover:border-zinc-500 hover:bg-zinc-950"
              }`}
            >
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-xl font-bold text-green-400">
                📷
              </div>
              <p className="text-sm font-semibold text-white">
                Click to browse or drag & drop photo(s) here
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Supports JPG, PNG, WebP (Max 8MB each)
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFiles(e.target.files);
                  }
                }}
                className="hidden"
                disabled={uploading}
              />
            </div>

            {/* Selected Image Previews */}
            {selectedFiles.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">
                    Selected Photos ({selectedFiles.length})
                  </label>
                  <button
                    type="button"
                    onClick={clearForm}
                    disabled={uploading}
                    className="text-[11px] text-red-400 hover:underline disabled:opacity-50"
                  >
                    Clear all
                  </button>
                </div>

                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {selectedFiles.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-xs"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-zinc-900 border border-zinc-800">
                          <Image
                            src={item.previewUrl}
                            alt="preview"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="truncate">
                          <p className="truncate font-medium text-white">{item.name}</p>
                          <p className="text-[11px] text-zinc-500">{item.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        disabled={uploading}
                        className="p-1 text-zinc-500 hover:text-red-400 disabled:opacity-50"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-3 border-t border-zinc-800">
              <button
                type="submit"
                disabled={uploading || selectedFiles.length === 0}
                className="btn-primary flex-1 py-2.5 font-bold disabled:opacity-50"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin text-base">⏳</span> Uploading {selectedFiles.length} photo(s)...
                  </span>
                ) : (
                  `Upload ${selectedFiles.length > 0 ? `${selectedFiles.length} ` : ""}Photo${selectedFiles.length !== 1 ? "s" : ""}`
                )}
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={uploading}
                className="btn-secondary px-6 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lightbox / Preview Modal */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full flex flex-col items-center"
          >
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-10 right-0 rounded-full bg-zinc-800 p-2 text-white hover:bg-zinc-700"
            >
              ✕
            </button>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
              <Image
                src={normalizeImagePath(previewPhoto.image_path)}
                alt={previewPhoto.title}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <div className="mt-3 flex w-full items-center justify-between text-white">
              <p className="font-semibold text-sm">{previewPhoto.title}</p>
              <span className="text-xs text-zinc-500">
                {new Date(previewPhoto.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Photos Grid */}
      {loading ? (
        <div className="card text-center py-16 text-zinc-500">
          <p className="animate-pulse text-sm">Loading gallery photos...</p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="card text-center py-16 text-zinc-400">
          <p className="text-base font-semibold text-white">No photos found</p>
          <p className="mt-1 text-xs text-zinc-500">
            {searchQuery
              ? "Try adjusting your search query."
              : "No gallery photos uploaded yet. Upload your first photo!"}
          </p>
          <button
            type="button"
            onClick={() => {
              clearForm();
              setShowUpload(true);
            }}
            className="btn-primary mt-4 inline-flex items-center gap-2 text-xs font-semibold"
          >
            <span>+</span> Upload First Photo
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70 shadow-md transition-all duration-300 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/5"
            >
              {/* Image Preview Container */}
              <div
                onClick={() => setPreviewPhoto(photo)}
                className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-zinc-950"
              >
                <Image
                  src={normalizeImagePath(photo.image_path)}
                  alt={photo.title}
                  fill
                  unoptimized
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                  <span className="rounded-full bg-zinc-900/90 px-3 py-1 text-xs font-bold text-white border border-zinc-700 shadow">
                    🔍 View Full
                  </span>
                </div>
              </div>

              {/* Photo Details */}
              <div className="p-3">
                <p
                  className="font-medium text-xs text-white truncate"
                  title={photo.title}
                >
                  {photo.title}
                </p>
                <div className="mt-2.5 flex items-center justify-between border-t border-zinc-800/80 pt-2 text-[11px] text-zinc-500">
                  <span>{new Date(photo.created_at).toLocaleDateString()}</span>
                  <button
                    type="button"
                    disabled={deletingId === photo.id}
                    onClick={() => handleDelete(photo.id)}
                    className="font-semibold text-red-400 transition hover:text-red-300 disabled:opacity-50"
                  >
                    {deletingId === photo.id ? "Deleting..." : "Delete"}
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
