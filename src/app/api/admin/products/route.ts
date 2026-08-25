import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { saveUploadedFile, getFormString, getFormNumber } from "@/lib/uploads";
import { slugify } from "@/lib/utils";
import { decimalToNumber } from "@/lib/money";
import { revalidatePath } from "next/cache";
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
  } catch (e) {
    console.error("Admin products GET error:", e);
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
      } catch (err) {
        console.warn("DB delete skipped or failed:", err);
      }
      deleteMockProduct(id);
      revalidatePath("/shop");
      revalidatePath("/");
      return NextResponse.json({ status: "success" });
    }

    if (action === "toggle_featured") {
      const id = getFormNumber(formData, "id");
      try {
        const product = await prisma.product.findUnique({ where: { id } });
        if (product) {
          await prisma.product.update({ where: { id }, data: { is_featured: product.is_featured ? 0 : 1 } });
        }
      } catch (err) {
        console.warn("DB toggle_featured skipped or failed:", err);
      }
      const mock = getActiveProducts().find((p) => p.id === id);
      if (mock) {
        updateMockProduct(id, { is_featured: mock.is_featured ? 0 : 1 });
      }
      revalidatePath("/shop");
      revalidatePath("/");
      return NextResponse.json({ status: "success" });
    }

    const title = getFormString(formData, "title");
    if (!title) {
      return NextResponse.json({ error: "Product title is required" }, { status: 400 });
    }

    let slug = getFormString(formData, "slug") || slugify(title);
    if (!slug) slug = `part-${Date.now()}`;

    // Verify category_id if provided
    let category_id: number | null = getFormNumber(formData, "category_id") || null;
    if (category_id) {
      try {
        const cat = await prisma.category.findUnique({ where: { id: category_id } });
        if (!cat) category_id = null;
      } catch {
        category_id = null;
      }
    }

    const skuStr = getFormString(formData, "sku");
    const data = {
      title,
      slug,
      sku: skuStr || null,
      category: getFormString(formData, "category") || "General",
      category_id,
      description: getFormString(formData, "description") || "",
      price: getFormNumber(formData, "price"),
      stock: getFormNumber(formData, "stock"),
      is_featured: getFormNumber(formData, "is_featured"),
      features: getFormString(formData, "features") || "",
      compatibility: getFormString(formData, "compatibility") || "",
      installation_notes: getFormString(formData, "installation_notes") || "",
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
      } catch (err) {
        console.error("DB update product error:", err);
      }

      const existingMock = getActiveProducts().find((p) => p.id === id);
      const combinedImages = [
        ...(existingMock?.images || []),
        ...extraPaths.map((p, idx) => ({ id: (existingMock?.images?.length || 0) + idx + 1, product_id: id, image_path: p })),
      ];

      updateMockProduct(id, {
        ...data,
        sku: skuStr || "",
        category_id: data.category_id || 1,
        ...(imagePath ? { image_path: imagePath } : {}),
        images: combinedImages,
      });

      revalidatePath("/shop");
      revalidatePath(`/product/${slug}`);
      revalidatePath("/");

      return NextResponse.json({ status: "success", product_id: id });
    }

    let createdId: number | null = null;
    try {
      // Ensure slug uniqueness
      const existingProduct = await prisma.product.findFirst({ where: { slug } });
      if (existingProduct) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
        data.slug = slug;
      }

      const product = await prisma.product.create({
        data: { ...data, image_path: imagePath || "/assets/images/suspension.png" },
      });
      createdId = product.id;

      for (const p of extraPaths) {
        await prisma.productImage.create({ data: { product_id: product.id, image_path: p } });
      }
    } catch (err) {
      console.error("DB create product error:", err);
    }

    const created = addMockProduct({
      ...data,
      sku: skuStr || "",
      category_id: data.category_id || 1,
      image_path: imagePath || "/assets/images/suspension.png",
      images: extraPaths.map((p, idx) => ({
        id: idx + 1,
        product_id: createdId || 99,
        image_path: p,
      })),
    });

    revalidatePath("/shop");
    revalidatePath(`/product/${slug}`);
    revalidatePath("/");

    return NextResponse.json({ status: "success", product_id: createdId || created.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Operation failed";
    console.error("Failed to process admin product:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
