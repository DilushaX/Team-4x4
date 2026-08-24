import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { getFormString, getFormNumber, saveUploadedFile } from "@/lib/uploads";
import { slugify } from "@/lib/utils";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const categories = await prisma.category.findMany({ orderBy: { sort_order: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const action = getFormString(formData, "action", "add");

    if (action === "delete") {
      await prisma.category.delete({ where: { id: getFormNumber(formData, "id") } });
      return NextResponse.json({ status: "success" });
    }

    if (action === "toggle_status") {
      const id = getFormNumber(formData, "id");
      const cat = await prisma.category.findUnique({ where: { id } });
      if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await prisma.category.update({ where: { id }, data: { status: cat.status ? 0 : 1 } });
      return NextResponse.json({ status: "success" });
    }

    const name = getFormString(formData, "name");
    const data = {
      name,
      slug: getFormString(formData, "slug") || slugify(name),
      description: getFormString(formData, "description"),
      sort_order: getFormNumber(formData, "sort_order"),
    };

    const imageFile = formData.get("image") as File | null;
    let imagePath: string | undefined;
    if (imageFile && imageFile.size > 0) {
      imagePath = await saveUploadedFile(imageFile, "categories");
    }

    if (action === "edit") {
      const id = getFormNumber(formData, "id");
      await prisma.category.update({
        where: { id },
        data: { ...data, ...(imagePath ? { image_path: imagePath } : {}) },
      });
      return NextResponse.json({ status: "success" });
    }

    const category = await prisma.category.create({
      data: { ...data, image_path: imagePath || null },
    });
    return NextResponse.json({ status: "success", id: category.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
