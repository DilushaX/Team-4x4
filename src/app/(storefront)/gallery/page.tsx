import { prisma } from "@/lib/prisma";
import PageHero, { PageContent } from "@/components/PageHero";
import { getActiveGallery, GalleryItem } from "@/lib/mock-data";
import GalleryClient from "./GalleryClient";

export const metadata = {
  title: "Photo Gallery",
  description: "High-resolution photo gallery of Defender builds, custom upholstery, tactical suspension, and 4x4 engineering.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function GalleryPage() {
  const allPhotos: GalleryItem[] = [];
  const seenPaths = new Set<string>();

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
            category: "Gallery",
            image_path: p.featured_image,
            created_at: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
          });
          seenPaths.add(p.featured_image);
        }
        if (p.images) {
          for (const img of p.images) {
            allPhotos.push({
              id: img.id + 100000,
              title: p.title,
              category: "Gallery",
              image_path: img.image_path,
              created_at: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
            });
            seenPaths.add(img.image_path);
          }
        }
      }
    }
  } catch {
    /* Fallback to getActiveGallery() */
  }

  const mockItems = getActiveGallery();
  for (const m of mockItems) {
    if (!seenPaths.has(m.image_path)) {
      allPhotos.push(m);
      seenPaths.add(m.image_path);
    }
  }

  // Sort latest first
  allPhotos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <>
      <PageHero
        image="/assets/images/hero-bg.jpeg"
        eyebrow="Visual Portfolio"
        title="Photo Gallery"
        meta="High-resolution gallery of Defender restorations, custom upholstery, suspension engineering, and bespoke off-road builds."
        align="center"
      />

      <PageContent wide className="pt-8">
        <GalleryClient photos={allPhotos} />
      </PageContent>
    </>
  );
}
