import { prisma } from "@/lib/prisma";
import { getActiveGallery, GalleryItem } from "@/lib/mock-data";

const PLACEHOLDER_PATHS = new Set([
  "assets/images/cushion.jpg",
  "assets/images/green-suspension.jpg",
  "assets/images/restoration.png",
  "assets/images/fabrication.jpg",
  "assets/images/recovery.jpg",
  "assets/images/lighting.jpg",
]);

export async function getUnifiedGalleryPhotos(): Promise<GalleryItem[]> {
  const allPhotos: GalleryItem[] = [];
  const seenPaths = new Set<string>();

  // 1. Fetch from Database
  try {
    const dbProjects = await prisma.project.findMany({
      orderBy: { created_at: "desc" },
      include: { images: true },
    });

    if (dbProjects && dbProjects.length > 0) {
      for (const p of dbProjects) {
        if (p.featured_image && !seenPaths.has(p.featured_image)) {
          allPhotos.push({
            id: p.id,
            title: p.title,
            category: p.category || "Gallery",
            image_path: p.featured_image,
            created_at: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
          });
          seenPaths.add(p.featured_image);
        }
        if (p.images) {
          for (const img of p.images) {
            if (img.image_path && !seenPaths.has(img.image_path)) {
              allPhotos.push({
                id: img.id + 100000,
                title: p.title,
                category: p.category || "Gallery",
                image_path: img.image_path,
                created_at: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
              });
              seenPaths.add(img.image_path);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("DB gallery fetch fallback:", err);
  }

  // 2. Fetch from active mock/disk store gallery (custom uploaded items)
  const mockItems = getActiveGallery();
  const customMockItems = mockItems.filter((m) => !PLACEHOLDER_PATHS.has(m.image_path));

  // If we have custom items from DB or disk store, only use custom items (no old placeholder flash)
  const sourceMockList = (allPhotos.length > 0 || customMockItems.length > 0) ? customMockItems : mockItems;

  for (const m of sourceMockList) {
    if (m.image_path && !seenPaths.has(m.image_path)) {
      allPhotos.push(m);
      seenPaths.add(m.image_path);
    }
  }

  // Sort newest first
  allPhotos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return allPhotos;
}
