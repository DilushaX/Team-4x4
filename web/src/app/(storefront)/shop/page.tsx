import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import ShopFiltersWrapper from "@/components/ShopFiltersWrapper";
import PageHero, { PageContent } from "@/components/PageHero";
import Link from "next/link";

type SearchParams = Promise<{ page?: string; q?: string; cat?: string; sort?: string }>;

export const metadata = {
  title: "Shop",
  description: "Browse premium Defender parts — suspension, recovery, lighting, fabrication and more.",
};

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 24;
  const search = params.q || "";
  const category = params.cat || "";
  const sort = params.sort || "newest";

  let categories: { id: number; name: string; slug: string }[] = [];
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let total = 0;

  try {
    categories = await prisma.category.findMany({
      where: { status: 1 },
      orderBy: { sort_order: "asc" },
    });

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

    [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { images: true },
      }),
      prisma.product.count({ where }),
    ]);
  } catch {
    /* empty on DB error */
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <PageHero
        image="/assets/images/suspension.png"
        eyebrow="Parts Catalog"
        title="Defender Parts Shop"
        meta="Premium off-road parts engineered for Land Rover Defender platforms."
      />

      <PageContent wide className="pt-8">
        <ShopFiltersWrapper categories={categories} currentCat={category} currentSort={sort} currentSearch={search} />

        {products.length === 0 ? (
          <div className="card mt-8 text-center">
            <p className="text-zinc-400">No products found. Try adjusting your filters.</p>
            <Link href="/shop" className="btn-primary mt-4 inline-flex">View All Parts</Link>
          </div>
        ) : (
          <>
            <p className="mt-6 text-sm text-zinc-500">{total} part{total !== 1 ? "s" : ""} found</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/shop?page=${page - 1}${search ? `&q=${search}` : ""}${category ? `&cat=${category}` : ""}${sort ? `&sort=${sort}` : ""}`}
                className="btn-secondary text-sm"
              >
                Previous
              </Link>
            )}
            <span className="px-4 text-sm text-zinc-400">Page {page} of {totalPages}</span>
            {page < totalPages && (
              <Link
                href={`/shop?page=${page + 1}${search ? `&q=${search}` : ""}${category ? `&cat=${category}` : ""}${sort ? `&sort=${sort}` : ""}`}
                className="btn-secondary text-sm"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </PageContent>
    </>
  );
}
