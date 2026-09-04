import { prisma } from "@/lib/prisma";
import PageHero, { PageContent } from "@/components/PageHero";
import { getActiveCategories, getActiveProducts } from "@/lib/mock-data";
import { unstable_cache } from "next/cache";
import ShopCatalogClient from "@/components/ShopCatalogClient";
import { decimalToNumber } from "@/lib/money";

export const metadata = {
  title: "Shop Defender Parts",
  description: "Browse premium Defender parts — suspension, recovery, lighting, fabrication and more.",
};

const PRODUCT_SELECT = {
  id: true,
  title: true,
  slug: true,
  sku: true,
  category: true,
  description: true,
  price: true,
  stock: true,
  is_featured: true,
  image_path: true,
  features: true,
  compatibility: true,
} as const;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise,
  ]).catch(() => {
    clearTimeout(timer);
    return fallback;
  });
}

// 1-hour cache for category list to eliminate redundant queries
const getCachedCategories = unstable_cache(
  async () => {
    try {
      const dbCategories = await prisma.category.findMany({
        where: { status: 1 },
        orderBy: { sort_order: "asc" },
        select: { id: true, name: true, slug: true },
      });
      if (dbCategories && dbCategories.length > 0) {
        return dbCategories;
      }
    } catch {
      // Fallback to mock data below
    }
    return getActiveCategories().map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
  },
  ["shop-categories-v2"],
  { revalidate: 3600, tags: ["categories"] }
);

// Cached default view (page 1, newest, all categories) with lean SELECT
const getCachedShopDefaults = unstable_cache(
  async () => {
    try {
      const [categories, products, total] = await Promise.all([
        getCachedCategories(),
        prisma.product.findMany({
          orderBy: { created_at: "desc" },
          take: 24,
          select: PRODUCT_SELECT,
        }),
        prisma.product.count(),
      ]);

      if (products && products.length > 0) {
        return {
          categories,
          products: products.map((p) => ({
            ...p,
            price: decimalToNumber(p.price),
          })),
          total,
        };
      }
      return null;
    } catch {
      return null;
    }
  },
  ["shop-defaults-cache-v3"],
  { revalidate: 120, tags: ["products", "categories"] }
);

type SearchParams = Promise<{ page?: string; q?: string; cat?: string; sort?: string }>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 24;
  const search = (params.q || "").toLowerCase().trim();
  const category = (params.cat || "").toLowerCase().trim();
  const sort = params.sort || "newest";

  const isDefaultView = !search && !category && sort === "newest" && page === 1;

  if (isDefaultView) {
    // 2.5s timeout prevents blocking when DB is cold or suspended
    const cached = await withTimeout(getCachedShopDefaults(), 2500, null);
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
            <ShopCatalogClient
              products={cached.products}
              categories={cached.categories}
              total={cached.total}
              currentPage={page}
              limit={limit}
              currentCat=""
              currentSort="newest"
              currentSearch=""
            />
          </PageContent>
        </>
      );
    }

    // Fast fallback without repeating slow database query
    const activeCategories = getActiveCategories().map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
    const activeProducts = getActiveProducts();
    return (
      <>
        <PageHero
          image="/assets/images/hero-bg.jpeg"
          eyebrow="Parts Catalog"
          title="Defender Parts Shop"
          meta="Premium off-road parts engineered for Land Rover Defender platforms."
        />

        <PageContent wide className="pt-8">
          <ShopCatalogClient
            products={activeProducts.slice(0, limit)}
            categories={activeCategories}
            total={activeProducts.length}
            currentPage={page}
            limit={limit}
            currentCat=""
            currentSort="newest"
            currentSearch=""
          />
        </PageContent>
      </>
    );
  }

  // Non-default view (search, filter, pagination, custom sort)
  const categoriesPromise = getCachedCategories();

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

  const dbPromise = Promise.all([
    categoriesPromise,
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: PRODUCT_SELECT,
    }),
    prisma.product.count({ where }),
  ]);

  const dbResult = await withTimeout(dbPromise, 2500, null);

  let categories = await categoriesPromise;
  let productsToDisplay: any[] = [];
  let total = 0;

  if (dbResult && dbResult[1].length > 0) {
    categories = dbResult[0];
    productsToDisplay = dbResult[1].map((p) => ({
      ...p,
      price: decimalToNumber(p.price),
    }));
    total = dbResult[2];
  } else {
    // Filter mock data as fallback
    const allActive = getActiveProducts();
    let filteredMock = [...allActive];
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
    productsToDisplay = filteredMock.slice((page - 1) * limit, page * limit);
  }

  return (
    <>
      <PageHero
        image="/assets/images/hero-bg.jpeg"
        eyebrow="Parts Catalog"
        title="Defender Parts Shop"
        meta="Premium off-road parts engineered for Land Rover Defender platforms."
      />

      <PageContent wide className="pt-8">
        <ShopCatalogClient
          products={productsToDisplay}
          categories={categories}
          total={total}
          currentPage={page}
          limit={limit}
          currentCat={category}
          currentSort={sort}
          currentSearch={search}
        />
      </PageContent>
    </>
  );
}
