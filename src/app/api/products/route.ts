import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/money";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));
  const search = searchParams.get("search") || searchParams.get("q") || "";
  const category = searchParams.get("category") || searchParams.get("cat") || "";
  const sort = searchParams.get("sort") || "newest";

  try {
    if (id) {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id, 10) },
        include: { images: true, category_rel: true },
      });
      if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({
        product: {
          ...product,
          price: decimalToNumber(product.price),
        },
      });
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

    return NextResponse.json({
      products: products.map((p) => ({ ...p, price: decimalToNumber(p.price) })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
