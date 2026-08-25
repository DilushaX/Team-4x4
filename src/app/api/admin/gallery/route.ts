import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { saveUploadedFile, getFormString, getFormNumber } from "@/lib/uploads";
import { revalidatePath } from "next/cache";
import {
  getActiveGallery,
  addMockGalleryItem,
  deleteMockGalleryItem,
  GalleryItem,
} from "@/lib/mock-data";

export async function GET() {
  const allPhotos: GalleryItem[] = [];
  const seenPaths = new Set<string>();

  // 1. Try DB projects first
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
    console.warn("DB gallery fetch fallback:", err);
  }

  // 2. Add mock / disk items that aren't duplicates
  const mockItems = getActiveGallery();
  for (const m of mockItems) {
    if (!seenPaths.has(m.image_path)) {
      allPhotos.push(m);
      seenPaths.add(m.image_path);
    }
  }

  // Sort latest first
  allPhotos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json({ photos: allPhotos });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const action = getFormString(formData, "action", "add");

    if (action === "delete") {
      const id = getFormNumber(formData, "id");
      if (!id) {
        return NextResponse.json({ error: "Photo ID is required" }, { status: 400 });
      }

      // If id >= 100000, it's a ProjectImage
      if (id >= 100000) {
        const imageId = id - 100000;
        try {
          await prisma.projectImage.delete({ where: { id: imageId } });
        } catch {
          /* DB record missing or offline */
        }
      } else {
        try {
          await prisma.project.delete({ where: { id } });
        } catch {
          /* DB record missing or offline */
        }
      }

      deleteMockGalleryItem(id);

      revalidatePath("/gallery");
      revalidatePath("/admin/gallery");
      revalidatePath("/");

      return NextResponse.json({ status: "success" });
    }

    const title = getFormString(formData, "title") || "Defender Custom Build";
    const category = getFormString(formData, "category") || "Builds";

    // Handle single or multiple image uploads
    const files: File[] = [];
    const single = formData.get("image") as File | null;
    if (single && single.size > 0) files.push(single);

    const multi = formData.getAll("images") as File[];
    for (const f of multi) {
      if (f && f.size > 0) files.push(f);
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one valid photo to upload." },
        { status: 400 }
      );
    }

    const createdItems: GalleryItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let imagePath: string;
      try {
        imagePath = await saveUploadedFile(file, "gallery");
      } catch (err: unknown) {
        console.error("Failed to save uploaded file:", err);
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "Failed to process uploaded file" },
          { status: 400 }
        );
      }

      const itemTitle = files.length > 1 ? `${title} (${i + 1})` : title;
      const timestamp = Date.now();
      const slug = `gallery-${timestamp}-${i}-${Math.random().toString(36).substring(2, 6)}`;

      let dbId: number | null = null;
      try {
        const createdProject = await prisma.project.create({
          data: {
            title: itemTitle,
            slug,
            category,
            featured_image: imagePath,
            project_order: 0,
          },
        });
        dbId = createdProject.id;
      } catch (dbErr) {
        console.warn("DB project create skipped/failed:", dbErr);
      }

      const createdMock = addMockGalleryItem({
        title: itemTitle,
        category,
        image_path: imagePath,
      });

      createdItems.push({
        id: dbId || createdMock.id,
        title: itemTitle,
        category,
        image_path: imagePath,
        created_at: new Date().toISOString(),
      });
    }

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/");

    return NextResponse.json({
      status: "success",
      count: createdItems.length,
      photos: createdItems,
      message: `Successfully uploaded ${createdItems.length} photo${createdItems.length > 1 ? "s" : ""}.`,
    });
  } catch (e: unknown) {
    console.error("Gallery POST error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed unexpectedly" },
      { status: 500 }
    );
  }
}
