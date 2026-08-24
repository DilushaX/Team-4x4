import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function saveUploadedFile(
  file: File,
  subdir: "products" | "gallery" | "services" | "categories"
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Use JPG, PNG, or WebP.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("File too large. Max 5MB.");
  }

  const ext = file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg";
  const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return `uploads/${subdir}/${filename}`;
}

export function getFormString(formData: FormData, key: string, fallback = ""): string {
  const val = formData.get(key);
  return val !== null && val !== undefined ? String(val) : fallback;
}

export function getFormNumber(formData: FormData, key: string, fallback = 0): number {
  const val = formData.get(key);
  if (val === null || val === "") return fallback;
  const num = Number(val);
  return Number.isNaN(num) ? fallback : num;
}
