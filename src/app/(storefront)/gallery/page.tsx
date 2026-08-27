import { getUnifiedGalleryPhotos } from "@/lib/gallery-service";
import PageHero, { PageContent } from "@/components/PageHero";
import GalleryClient from "./GalleryClient";

export const metadata = {
  title: "Photo Gallery",
  description: "High-resolution photo gallery of Defender builds, custom upholstery, tactical suspension, and 4x4 engineering.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function GalleryPage() {
  const allPhotos = await getUnifiedGalleryPhotos();

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
