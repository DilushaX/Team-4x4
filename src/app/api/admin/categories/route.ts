import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { getFormString, getFormNumber, saveUploadedFile } from "@/lib/uploads";
import { slugify } from "@/lib/utils";
import {
  getActiveCategories,
  addMockCategory,
  updateMockCategory,
  deleteMockCategory,
} from "@/lib/mock-data";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const categories = await prisma.category.findMany({ orderBy: { sort_order: "asc" } });
    if (categories && categories.length > 0) {
      return NextResponse.json({ categories });
    }
    return NextResponse.json({ categories: getActiveCategories() });
  } catch {
    return NextResponse.json({ categories: getActiveCategories() });
  }
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
        await prisma.category.delete({ where: { id } });
      } catch {
        /* DB unavailable */
      }
      deleteMockCategory(id);
      return NextResponse.json({ status: "success" });
    }

    if (action === "toggle_status") {
      const id = getFormNumber(formData, "id");
      try {
        const cat = await prisma.category.findUnique({ where: { id } });
        if (cat) {
          await prisma.category.update({ where: { id }, data: { status: cat.status ? 0 : 1 } });
        }
      } catch {
        /* DB unavailable */
      }
      const mock = getActiveCategories().find((c) => c.id === id);
      if (mock) {
        updateMockCategory(id, { status: mock.status ? 0 : 1 });
      }
      return NextResponse.json({ status: "success" });
    }

    const name = getFormString(formData, "name");
    const data = {
      name,
      slug: getFormString(formData, "slug") || slugify(name),
      description: getFormString(formData, "description"),
      sort_order: getFormNumber(formData, "sort_order") || 0,
      status: 1,
    };

    const imageFile = formData.get("image") as File | null;
    let imagePath: string | undefined;
    if (imageFile && imageFile.size > 0) {
      imagePath = await saveUploadedFile(imageFile, "categories");
    }

    if (action === "edit") {
      const id = getFormNumber(formData, "id");
      try {
        await prisma.category.update({
          where: { id },
          data: { ...data, ...(imagePath ? { image_path: imagePath } : {}) },
        });
      } catch {
        /* DB unavailable */
      }
      updateMockCategory(id, {
        ...data,
        ...(imagePath ? { image_path: imagePath } : {}),
      });
      return NextResponse.json({ status: "success" });
    }

    let createdId: number | null = null;
    try {
      const category = await prisma.category.create({
        data: { ...data, image_path: imagePath || null },
      });
      createdId = category.id;
    } catch {
      /* DB unavailable */
    }

    const created = addMockCategory({
      ...data,
      image_path: imagePath || "assets/images/suspension.png",
    });

    return NextResponse.json({ status: "success", id: createdId || created.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
