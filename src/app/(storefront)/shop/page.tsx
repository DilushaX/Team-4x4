import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import ShopFiltersWrapper from "@/components/ShopFiltersWrapper";
import PageHero, { PageContent } from "@/components/PageHero";
import Link from "next/link";
import { getActiveCategories, getActiveProducts } from "@/lib/mock-data";
import { unstable_cache } from "next/cache";

const getCachedShopDefaults = unstable_cache(
  async () => {
    try {
      const [categories, products, total] = await Promise.all([
        prisma.category.findMany({
          where: { status: 1 },
          orderBy: { sort_order: "asc" },
        }),
        prisma.product.findMany({
          orderBy: { created_at: "desc" },
          take: 24,
          include: { images: true },
        }),
        prisma.product.count(),
      ]);
      if (products.length > 0) {
        return {
          categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
          products,
          total,
        };
      }
      return null;
    } catch {
      return null;
    }
  },
  ["shop-defaults-cache-v1"],
  { revalidate: 60, tags: ["products", "categories"] }
);

type SearchParams = Promise<{ page?: string; q?: string; cat?: string; sort?: string }>;

export const metadata = {
  title: "Shop Defender Parts",
  description: "Browse premium Defender parts — suspension, recovery, lighting, fabrication and more.",
};

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 24;
  const search = (params.q || "").toLowerCase().trim();
  const category = (params.cat || "").toLowerCase().trim();
  const sort = params.sort || "newest";

  const isDefaultView = !search && !category && sort === "newest" && page === 1;

  if (isDefaultView) {
    const cached = await getCachedShopDefaults();
    if (cached) {
      return (
        <>
          <PageHero
            image="/assets/images/hero-bg.jpeg"
            eyebrow="Parts Catalog"
            title="Defender Parts Shop"
            meta="Premium off-road parts engineered for Land Rover Defender platforms."
          />

          <PageContent wide className="pt-8">
            <ShopFiltersWrapper categories={cached.categories} currentCat="" currentSort="newest" currentSearch="" />

            <p className="mt-6 text-sm text-zinc-500">{cached.total} part{cached.total !== 1 ? "s" : ""} found</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cached.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </PageContent>
        </>
      );
    }
  }

  const activeCategories = getActiveCategories();
  const activeProducts = getActiveProducts();

  let categories = activeCategories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
  let total = activeProducts.length;

  try {
    const dbCategories = await prisma.category.findMany({
      where: { status: 1 },
      orderBy: { sort_order: "asc" },
    });
    if (dbCategories && dbCategories.length > 0) {
      categories = dbCategories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
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

    const [dbProducts, dbTotal] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { images: true },
      }),
      prisma.product.count({ where }),
    ]);

    if (dbProducts && dbProducts.length > 0) {
      return (
        <>
          <PageHero
            image="/assets/images/hero-bg.jpeg"
            eyebrow="Parts Catalog"
            title="Defender Parts Shop"
            meta="Premium off-road parts engineered for Land Rover Defender platforms."
          />

          <PageContent wide className="pt-8">
            <ShopFiltersWrapper categories={categories} currentCat={category} currentSort={sort} currentSearch={search} />

            <p className="mt-6 text-sm text-zinc-500">{dbTotal} part{dbTotal !== 1 ? "s" : ""} found</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {dbProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {Math.ceil(dbTotal / limit) > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/shop?page=${page - 1}${search ? `&q=${search}` : ""}${category ? `&cat=${category}` : ""}${sort ? `&sort=${sort}` : ""}`}
                    className="btn-secondary text-sm"
                  >
                    Previous
                  </Link>
                )}
                <span className="px-4 text-sm text-zinc-400">Page {page} of {Math.ceil(dbTotal / limit)}</span>
                {page < Math.ceil(dbTotal / limit) && (
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
  } catch {
    /* Fallback below */
  }

  // Filter dynamic mock products
  let filteredMock = [...activeProducts];
  if (search) {
    filteredMock = filteredMock.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search)
    );
  }
  if (category) {
    filteredMock = filteredMock.filter(
      (p) =>
        p.category.toLowerCase().includes(category) ||
        p.slug.toLowerCase().includes(category)
    );
  }
  if (sort === "price_asc") {
    filteredMock.sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    filteredMock.sort((a, b) => b.price - a.price);
  } else if (sort === "name") {
    filteredMock.sort((a, b) => a.title.localeCompare(b.title));
  }

  total = filteredMock.length;

  return (
    <>
      <PageHero
        image="/assets/images/hero-bg.jpeg"
        eyebrow="Parts Catalog"
        title="Defender Parts Shop"
        meta="Premium off-road parts engineered for Land Rover Defender platforms."
      />

      <PageContent wide className="pt-8">
        <ShopFiltersWrapper categories={categories} currentCat={category} currentSort={sort} currentSearch={search} />

        {filteredMock.length === 0 ? (
          <div className="card mt-8 text-center py-12">
            <p className="text-zinc-400">No products found matching your criteria.</p>
            <Link href="/shop" className="btn-primary mt-4 inline-flex">View All Parts</Link>
          </div>
        ) : (
          <>
            <p className="mt-6 text-sm text-zinc-500">{total} part{total !== 1 ? "s" : ""} found</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredMock.map((product) => (
                <ProductCard key={product.id} product={product as unknown as Parameters<typeof ProductCard>[0]["product"]} />
              ))}
            </div>
          </>
        )}
      </PageContent>
    </>
  );
}
