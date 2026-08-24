import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { saveUploadedFile, getFormString, getFormNumber } from "@/lib/uploads";
import { slugify } from "@/lib/utils";
import { decimalToNumber } from "@/lib/money";
import {
  getActiveProducts,
  addMockProduct,
  updateMockProduct,
  deleteMockProduct,
} from "@/lib/mock-data";

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
      if (product) {
        return NextResponse.json({
          product: { ...product, price: decimalToNumber(product.price) },
        });
      }
      const mock = getActiveProducts().find((p) => p.id === parseInt(id, 10));
      return NextResponse.json({ product: mock || null });
    }

    const products = await prisma.product.findMany({
      orderBy: { created_at: "desc" },
      include: { images: true },
    });
    if (products && products.length > 0) {
      return NextResponse.json({
        products: products.map((p) => ({ ...p, price: decimalToNumber(p.price) })),
      });
    }
    return NextResponse.json({ products: getActiveProducts() });
  } catch {
    if (id) {
      const mock = getActiveProducts().find((p) => p.id === parseInt(id, 10));
      return NextResponse.json({ product: mock || null });
    }
    return NextResponse.json({ products: getActiveProducts() });
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
        await prisma.product.delete({ where: { id } });
      } catch {
        /* DB unavailable */
      }
      deleteMockProduct(id);
      return NextResponse.json({ status: "success" });
    }

    if (action === "toggle_featured") {
      const id = getFormNumber(formData, "id");
      try {
        const product = await prisma.product.findUnique({ where: { id } });
        if (product) {
          await prisma.product.update({ where: { id }, data: { is_featured: product.is_featured ? 0 : 1 } });
        }
      } catch {
        /* DB unavailable */
      }
      const mock = getActiveProducts().find((p) => p.id === id);
      if (mock) {
        updateMockProduct(id, { is_featured: mock.is_featured ? 0 : 1 });
      }
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

    // Primary image (Photo 1)
    const imageFile = formData.get("image") as File | null;
    let imagePath: string | undefined;
    if (imageFile && imageFile.size > 0) {
      imagePath = await saveUploadedFile(imageFile, "products");
    }

    // Secondary images (Photo 2 and multiple images)
    const extraPaths: string[] = [];
    const image2File = formData.get("image_2") as File | null;
    if (image2File && image2File.size > 0) {
      const path2 = await saveUploadedFile(image2File, "products");
      extraPaths.push(path2);
    }

    const extraImages = formData.getAll("images") as File[];
    for (const img of extraImages) {
      if (img && img.size > 0) {
        const path = await saveUploadedFile(img, "products");
        extraPaths.push(path);
      }
    }

    if (action === "edit") {
      const id = getFormNumber(formData, "id");
      try {
        await prisma.product.update({
          where: { id },
          data: { ...data, ...(imagePath ? { image_path: imagePath } : {}) },
        });
        for (const p of extraPaths) {
          await prisma.productImage.create({ data: { product_id: id, image_path: p } });
        }
      } catch {
        /* DB unavailable */
      }

      const existingMock = getActiveProducts().find((p) => p.id === id);
      const combinedImages = [
        ...(existingMock?.images || []),
        ...extraPaths.map((p, idx) => ({ id: (existingMock?.images?.length || 0) + idx + 1, product_id: id, image_path: p })),
      ];

      updateMockProduct(id, {
        ...data,
        category_id: data.category_id || 1,
        ...(imagePath ? { image_path: imagePath } : {}),
        images: combinedImages,
      });
      return NextResponse.json({ status: "success", product_id: id });
    }

    let createdId: number | null = null;
    try {
      const product = await prisma.product.create({
        data: { ...data, image_path: imagePath || null },
      });
      createdId = product.id;
      for (const p of extraPaths) {
        await prisma.productImage.create({ data: { product_id: product.id, image_path: p } });
      }
    } catch {
      /* DB unavailable */
    }

    const created = addMockProduct({
      ...data,
      category_id: data.category_id || 1,
      image_path: imagePath || "assets/images/suspension.png",
      images: extraPaths.map((p, idx) => ({
        id: idx + 1,
        product_id: createdId || 99,
        image_path: p,
      })),
    });

    return NextResponse.json({ status: "success", product_id: createdId || created.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
