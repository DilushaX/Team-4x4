export function normalizeImagePath(path: string | null | undefined): string {
  if (!path) return "/assets/images/logo.jpg";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path;
  return `/${path}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseFeatures(features: string | null | undefined): string[] {
  if (!features) return [];
  return features.split("|").map((f) => f.trim()).filter(Boolean);
}

export function parseLines(text: string | null | undefined): string[] {
  if (!text) return [];
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

export function stockLabel(stock: number): { label: string; className: string } {
  if (stock <= 0) return { label: "Out of Stock", className: "bg-red-500/20 text-red-400" };
  if (stock <= 5) return { label: "Limited Stock", className: "bg-yellow-500/20 text-yellow-400" };
  return { label: "In Stock", className: "bg-green-500/20 text-green-400" };
}
