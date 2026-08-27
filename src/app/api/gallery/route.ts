import { NextResponse } from "next/server";
import { getUnifiedGalleryPhotos } from "@/lib/gallery-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const photos = await getUnifiedGalleryPhotos();
  return NextResponse.json({ photos });
}
