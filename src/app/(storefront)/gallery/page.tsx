import { prisma } from "@/lib/prisma";
import PageHero, { PageContent } from "@/components/PageHero";
import { getActiveGallery, GalleryItem } from "@/lib/mock-data";
import GalleryClient from "./GalleryClient";

export const metadata = {
  title: "Photo Gallery",
  description: "High-resolution photo gallery of Defender builds, custom upholstery, tactical suspension, and 4x4 engineering.",
};

export default async function GalleryPage() {
  let photos: GalleryItem[] = getActiveGallery();

  try {
    const dbProjects = await prisma.project.findMany({
      orderBy: { created_at: "desc" },
      include: { images: true },
    });

    if (dbProjects && dbProjects.length > 0) {
      const items: GalleryItem[] = [];

      for (const p of dbProjects) {
        if (p.featured_image) {
          items.push({
            id: p.id,
            title: p.title,
            category: p.category || "Builds",
            image_path: p.featured_image,
            created_at: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
          });
        }
        if (p.images) {
          for (const img of p.images) {
            items.push({
              id: img.id + 1000,
              title: p.title,
              category: p.category || "Builds",
              image_path: img.image_path,
              created_at: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
            });
          }
        }
      }

      if (items.length > 0) {
        photos = items;
      }
    }
  } catch {
    /* Fallback to getActiveGallery() */
  }

  const categorySet = new Set<string>([
    "Builds",
    "Interior",
    "Suspension",
    "Fabrication",
    "Recovery",
    "Lighting",
  ]);
  photos.forEach((p) => {
    if (p.category) categorySet.add(p.category);
  });

  return (
    <>
      <PageHero
        image="/assets/images/restoration.png"
        eyebrow="Visual Portfolio"
        title="Photo Gallery"
        meta="High-resolution gallery of Defender restorations, custom upholstery, suspension engineering, and bespoke off-road builds."
        align="center"
      />

      <PageContent wide className="pt-8">
        <GalleryClient
          photos={photos}
          categories={Array.from(categorySet)}
        />
      </PageContent>
    </>
  );
}
