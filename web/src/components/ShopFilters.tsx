"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Category = { id: number; name: string; slug: string };

export default function ShopFilters({
  categories,
  currentCat,
  currentSort,
  currentSearch,
}: {
  categories: Category[];
  currentCat: string;
  currentSort: string;
  currentSearch: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    update("q", search);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 lg:flex-row lg:items-center lg:justify-between">
      <form onSubmit={handleSearch} className="flex flex-1 gap-2">
        <input
          type="search"
          placeholder="Search parts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-1"
        />
        <button type="submit" className="btn-primary shrink-0">Search</button>
      </form>
      <div className="flex flex-wrap gap-2">
        <select
          value={currentCat}
          onChange={(e) => update("cat", e.target.value)}
          className="input w-auto min-w-[140px]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select
          value={currentSort}
          onChange={(e) => update("sort", e.target.value)}
          className="input w-auto min-w-[140px]"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>
    </div>
  );
}
