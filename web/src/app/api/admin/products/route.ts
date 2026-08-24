import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { saveUploadedFile, getFormString, getFormNumber } from "@/lib/uploads";
import { slugify } from "@/lib/utils";
import { decimalToNumber } from "@/lib/money";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = request.nextUrl.searchParams.get("id");
  try {
    if (id) {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id, 10) },
        include: { images: true, category_rel: true },
      });
      return NextResponse.json({ product: product ? { ...product, price: decimalToNumber(product.price) } : null });
    }
    const products = await prisma.product.findMany({
      orderBy: { created_at: "desc" },
      include: { images: true },
    });
    return NextResponse.json({
      products: products.map((p) => ({ ...p, price: decimalToNumber(p.price) })),
    });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
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
      await prisma.product.delete({ where: { id } });
      return NextResponse.json({ status: "success" });
    }

    if (action === "toggle_featured") {
      const id = getFormNumber(formData, "id");
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await prisma.product.update({ where: { id }, data: { is_featured: product.is_featured ? 0 : 1 } });
      return NextResponse.json({ status: "success" });
    }

    const title = getFormString(formData, "title");
    const slug = getFormString(formData, "slug") || slugify(title);
    const data = {
      title,
      slug,
      sku: getFormString(formData, "sku"),
      category: getFormString(formData, "category"),
      category_id: getFormNumber(formData, "category_id") || null,
      description: getFormString(formData, "description"),
      price: getFormNumber(formData, "price"),
      stock: getFormNumber(formData, "stock"),
      is_featured: getFormNumber(formData, "is_featured"),
      features: getFormString(formData, "features"),
      compatibility: getFormString(formData, "compatibility"),
      installation_notes: getFormString(formData, "installation_notes"),
    };

    const imageFile = formData.get("image") as File | null;
    let imagePath: string | undefined;
    if (imageFile && imageFile.size > 0) {
      imagePath = await saveUploadedFile(imageFile, "products");
    }

    if (action === "edit") {
      const id = getFormNumber(formData, "id");
      await prisma.product.update({
        where: { id },
        data: { ...data, ...(imagePath ? { image_path: imagePath } : {}) },
      });
      const extraImages = formData.getAll("images") as File[];
      for (const img of extraImages) {
        if (img.size > 0) {
          const path = await saveUploadedFile(img, "products");
          await prisma.productImage.create({ data: { product_id: id, image_path: path } });
        }
      }
      return NextResponse.json({ status: "success", product_id: id });
    }

    const product = await prisma.product.create({
      data: { ...data, image_path: imagePath || null },
    });

    const extraImages = formData.getAll("images") as File[];
    for (const img of extraImages) {
      if (img.size > 0) {
        const path = await saveUploadedFile(img, "products");
        await prisma.productImage.create({ data: { product_id: product.id, image_path: path } });
      }
    }

    return NextResponse.json({ status: "success", product_id: product.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
