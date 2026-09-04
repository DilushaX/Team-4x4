"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";
import Link from "next/link";

type Category = { id: number; name: string; slug: string };

type ShopCatalogClientProps = {
  products: ProductCardData[];
  categories: Category[];
  total: number;
  currentPage: number;
  limit: number;
  currentCat: string;
  currentSort: string;
  currentSearch: string;
};

export default function ShopCatalogClient({
  products,
  categories,
  total,
  currentPage,
  limit,
  currentCat,
  currentSort,
  currentSearch,
}: ShopCatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState(currentSearch);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const saved = localStorage.getItem("team4x4_shop_view_mode");
    if (saved === "grid" || saved === "list") {
      setViewMode(saved);
    }
  }, []);

  const changeViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("team4x4_shop_view_mode", mode);
  };

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => {
      router.push(`/shop?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", search);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Top Filter & Toolbar Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between shadow-xl">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <input
              type="search"
              placeholder="Search by part name, SKU, or vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 pr-4 w-full"
            />
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button type="submit" className="btn-primary shrink-0 px-5">
            Search
          </button>
        </form>

        {/* Category, Sort and Grid/List Switch */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={currentCat}
            onChange={(e) => updateParam("cat", e.target.value)}
            className="input w-auto min-w-[150px] text-xs font-medium"
          >
            <option value="">All Categories ({total})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="input w-auto min-w-[140px] text-xs font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center rounded-lg border border-zinc-700/80 bg-zinc-800/80 p-1">
            <button
              type="button"
              onClick={() => changeViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                viewMode === "grid"
                  ? "bg-green-500 text-zinc-950 shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => changeViewMode("list")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                viewMode === "list"
                  ? "bg-green-500 text-zinc-950 shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="List View"
              aria-label="List View"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Pill Bar & Results Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
        <div>
          Showing <span className="font-bold text-white">{products.length}</span> of{" "}
          <span className="font-bold text-white">{total}</span> parts
          {currentCat && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-0.5 text-green-400 border border-green-500/30">
              Category: {categories.find((c) => c.slug === currentCat)?.name || currentCat}
              <button
                type="button"
                onClick={() => updateParam("cat", "")}
                className="hover:text-white font-bold ml-1"
              >
                ×
              </button>
            </span>
          )}
          {currentSearch && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-0.5 text-green-400 border border-green-500/30">
              Search: &quot;{currentSearch}&quot;
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  updateParam("q", "");
                }}
                className="hover:text-white font-bold ml-1"
              >
                ×
              </button>
            </span>
          )}
        </div>
        {(currentCat || currentSearch || currentSort !== "newest") && (
          <Link
            href="/shop"
            className="text-xs text-zinc-400 underline hover:text-green-400 transition"
          >
            Reset all filters
          </Link>
        )}
      </div>

      {/* Products Display with transition indicator */}
      <div className={`transition-opacity duration-200 ${isPending ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
        {products.length === 0 ? (
          <div className="card text-center py-16 border border-zinc-800 bg-zinc-900/40">
            <svg className="mx-auto h-12 w-12 text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-base font-semibold text-white">No products found matching your criteria</p>
            <p className="text-sm text-zinc-400 mt-1">Try selecting another category or clear your search term.</p>
            <Link href="/shop" className="btn-primary mt-6 inline-flex">
              View All Parts
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode="grid"
                priority={idx < 4}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {products.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode="list"
                priority={idx < 4}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2 border-t border-zinc-800/80 pt-8">
          {currentPage > 1 && (
            <Link
              href={`/shop?page=${currentPage - 1}${currentSearch ? `&q=${currentSearch}` : ""}${currentCat ? `&cat=${currentCat}` : ""}${currentSort ? `&sort=${currentSort}` : ""}`}
              className="btn-secondary text-sm px-4 py-2"
            >
              ← Previous
            </Link>
          )}
          <span className="px-4 text-sm text-zinc-400">
            Page <span className="font-bold text-white">{currentPage}</span> of{" "}
            <span className="font-bold text-white">{totalPages}</span>
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/shop?page=${currentPage + 1}${currentSearch ? `&q=${currentSearch}` : ""}${currentCat ? `&cat=${currentCat}` : ""}${currentSort ? `&sort=${currentSort}` : ""}`}
              className="btn-secondary text-sm px-4 py-2"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
