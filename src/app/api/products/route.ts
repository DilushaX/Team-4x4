import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/money";
import { getActiveProducts } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));
  const search = (searchParams.get("search") || searchParams.get("q") || "").toLowerCase().trim();
  const category = (searchParams.get("category") || searchParams.get("cat") || "").toLowerCase().trim();
  const sort = searchParams.get("sort") || "newest";

  const allActive = getActiveProducts();

  try {
    if (id) {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id, 10) },
        include: { images: true, category_rel: true },
      });
      if (product) {
        return NextResponse.json({
          product: {
            ...product,
            price: decimalToNumber(product.price),
          },
        });
      }
      const mock = allActive.find((p) => p.id === parseInt(id, 10));
      return NextResponse.json({ product: mock || null });
    }

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }
    if (category) {
      where.OR = [
        { category: { contains: category } },
        { category_rel: { slug: category } },
      ];
    }

    let orderBy: Record<string, string> = { created_at: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "name") orderBy = { title: "asc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { images: true },
      }),
      prisma.product.count({ where }),
    ]);

    if (products && products.length > 0) {
      return NextResponse.json({
        products: products.map((p) => ({ ...p, price: decimalToNumber(p.price) })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }
  } catch {
    /* Fallback to mock store */
  }

  let filtered = [...allActive];
  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search)
    );
  }
  if (category) {
    filtered = filtered.filter(
      (p) =>
        p.category.toLowerCase().includes(category) ||
        p.slug.toLowerCase().includes(category)
    );
  }
  if (sort === "price_asc") filtered.sort((a, b) => a.price - b.price);
  else if (sort === "price_desc") filtered.sort((a, b) => b.price - a.price);
  else if (sort === "name") filtered.sort((a, b) => a.title.localeCompare(b.title));

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    products: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
