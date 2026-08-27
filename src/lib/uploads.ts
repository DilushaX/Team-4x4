import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

import sharp from "sharp";

export async function saveUploadedFile(
  file: File,
  subdir: "products" | "gallery" | "services" | "categories"
): Promise<string> {
  if (file.size > MAX_SIZE) {
    throw new Error("File too large. Maximum size is 8MB.");
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer());

  // Optimize and compress with sharp to WebP (max 1600px, 80 quality)
  let buffer = rawBuffer;
  let mimeType = file.type || "image/jpeg";
  let ext = ".jpg";

  try {
    buffer = await sharp(rawBuffer)
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();
    mimeType = "image/webp";
    ext = ".webp";
  } catch {
    // If sharp fails on non-standard format, fallback to raw
    ext = file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg";
  }

  // In production / Vercel Serverless environment, file systems are read-only.
  // Save as high-performance, compressed self-contained Data URI.
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
  }

  try {
    const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", subdir);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);
    return `uploads/${subdir}/${filename}`;
  } catch {
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
  }
}

export function getFormString(formData: FormData, key: string, fallback = ""): string {
  const val = formData.get(key);
  return val !== null && val !== undefined ? String(val).trim() : fallback;
}

export function getFormNumber(formData: FormData, key: string, fallback = 0): number {
  const val = formData.get(key);
  if (val === null || val === "" || val === undefined) return fallback;
  const num = Number(val);
  return Number.isNaN(num) ? fallback : num;
}
