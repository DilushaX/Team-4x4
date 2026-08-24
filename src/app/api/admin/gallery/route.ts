import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { saveUploadedFile, getFormString, getFormNumber } from "@/lib/uploads";
import {
  getActiveGallery,
  addMockGalleryItem,
  deleteMockGalleryItem,
} from "@/lib/mock-data";

export async function GET() {
  try {
    const dbProjects = await prisma.project.findMany({
      orderBy: { created_at: "desc" },
      include: { images: true },
    });

    if (dbProjects && dbProjects.length > 0) {
      const items: {
        id: number;
        title: string;
        category: string;
        image_path: string;
        created_at: string;
      }[] = [];

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
              title: `${p.title} - View`,
              category: p.category || "Builds",
              image_path: img.image_path,
              created_at: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
            });
          }
        }
      }

      if (items.length > 0) {
        return NextResponse.json({ photos: items });
      }
    }
  } catch {
    /* Fallback below */
  }

  return NextResponse.json({ photos: getActiveGallery() });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const action = getFormString(formData, "action", "add");

    if (action === "delete") {
      const id = getFormNumber(formData, "id");
      try {
        await prisma.project.delete({ where: { id } }).catch(() => null);
      } catch {
        /* DB unavailable */
      }
      deleteMockGalleryItem(id);
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

    const createdItems = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imagePath = await saveUploadedFile(file, "gallery");
      const itemTitle = files.length > 1 ? `${title} (${i + 1})` : title;

      try {
        await prisma.project.create({
          data: {
            title: itemTitle,
            slug: `gallery-${Date.now()}-${i}`,
            category,
            featured_image: imagePath,
            project_order: 1,
          },
        });
      } catch {
        /* DB unavailable */
      }

      const created = addMockGalleryItem({
        title: itemTitle,
        category,
        image_path: imagePath,
      });
      createdItems.push(created);
    }

    return NextResponse.json({ status: "success", count: createdItems.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
