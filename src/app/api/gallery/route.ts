import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveGallery, GalleryItem } from "@/lib/mock-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const allPhotos: GalleryItem[] = [];
  const seenPaths = new Set<string>();

  // 1. Try DB projects
  try {
    const dbProjects = await prisma.project.findMany({
      orderBy: { created_at: "desc" },
      include: { images: true },
    });

    if (dbProjects && dbProjects.length > 0) {
      for (const p of dbProjects) {
        if (p.featured_image) {
          allPhotos.push({
            id: p.id,
            title: p.title,
            category: p.category || "Builds",
            image_path: p.featured_image,
            created_at: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
          });
          seenPaths.add(p.featured_image);
        }
        if (p.images) {
          for (const img of p.images) {
            allPhotos.push({
              id: img.id + 100000,
              title: `${p.title} - View`,
              category: p.category || "Builds",
              image_path: img.image_path,
              created_at: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
            });
            seenPaths.add(img.image_path);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Public gallery fetch error:", err);
  }

  // 2. Add mock/disk storage items
  const mockItems = getActiveGallery();
  for (const m of mockItems) {
    if (!seenPaths.has(m.image_path)) {
      allPhotos.push(m);
      seenPaths.add(m.image_path);
    }
  }

  allPhotos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json({ photos: allPhotos });
}
