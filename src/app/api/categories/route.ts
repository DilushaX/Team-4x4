import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveCategories } from "@/lib/mock-data";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { status: 1 },
      orderBy: { sort_order: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (categories && categories.length > 0) {
      return NextResponse.json({
        categories: categories.map((c) => ({
          ...c,
          product_count: c._count.products,
        })),
      });
    }
  } catch {
    /* Fallback */
  }

  const active = getActiveCategories().filter((c) => c.status === 1);
  return NextResponse.json({
    categories: active.map((c) => ({
      ...c,
      product_count: 0,
    })),
  });
}
