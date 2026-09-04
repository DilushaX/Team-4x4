"use client";

import Link from "next/link";
import Image from "next/image";
import { formatMoney, decimalToNumber } from "@/lib/money";
import { normalizeImagePath, parseFeatures, stockLabel } from "@/lib/utils";
import { addToCart } from "@/lib/cart";
import { useState } from "react";
export type ProductCardData = {
  id: number;
  title: string;
  slug: string;
  sku?: string | null;
  category?: string | null;
  description?: string | null;
  price: number | unknown;
  stock: number;
  is_featured?: number | null;
  image_path?: string | null;
  features?: string | null;
  compatibility?: string | null;
  images?: { image_path: string }[];
};

export default function ProductCard({
  product,
  viewMode = "grid",
  priority = false,
}: {
  product: ProductCardData;
  viewMode?: "grid" | "list";
  priority?: boolean;
}) {
  const [added, setAdded] = useState(false);
  const stock = stockLabel(product.stock);
  const image = normalizeImagePath(product.image_path);
  const priceNum = decimalToNumber(product.price);
  const features = parseFeatures(product.features || "");

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      title: product.title,
      price: priceNum,
      image,
      slug: product.slug,
    });
    window.dispatchEvent(new Event("open-cart-drawer"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  /* ================= LIST VIEW (Dense Technical Catalog Strip) ================= */
  if (viewMode === "list") {
    return (
      <article className="group flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 transition-all duration-200 hover:border-green-500/50 hover:bg-zinc-900 hover:shadow-xl hover:shadow-green-500/5">
        {/* Left: Thumbnail & Badges */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Link
            href={`/product/${product.slug}`}
            className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-lg bg-zinc-950 border border-zinc-800"
          >
            <Image
              src={image}
              alt={product.title}
              fill
              priority={priority}
              loading={priority ? undefined : "lazy"}
              unoptimized={image.startsWith("data:")}
              className="object-cover transition duration-300 group-hover:scale-110"
              sizes="112px"
            />
            {product.is_featured === 1 && (
              <span className="absolute left-1.5 top-1.5 rounded bg-green-500 px-1.5 py-0.5 text-[9px] font-black text-zinc-950 uppercase">
                Featured
              </span>
            )}
          </Link>

          {/* Middle: Details, Specs, SKU & Compatibility */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {product.category && (
                <span className="font-bold uppercase tracking-wider text-green-400 text-[11px]">
                  {product.category}
                </span>
              )}
              {product.sku && (
                <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-zinc-700">
                  SKU: {product.sku}
                </span>
              )}
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${stock.className}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {stock.label}
              </span>
              {product.compatibility && (
                <span className="hidden lg:inline-block text-[11px] text-zinc-400 truncate max-w-[240px]">
                  • Fits: {product.compatibility.replace(/\n/g, ", ")}
                </span>
              )}
            </div>

            <Link href={`/product/${product.slug}`} className="block">
              <h3 className="font-display text-base sm:text-lg font-bold text-white transition group-hover:text-green-400 truncate">
                {product.title}
              </h3>
            </Link>

            <p className="line-clamp-1 text-xs text-zinc-400">
              {product.description}
            </p>

            {/* Feature Pills */}
            {features.length > 0 && (
              <div className="hidden sm:flex flex-wrap gap-1.5 pt-1">
                {features.slice(0, 3).map((f) => (
                  <span
                    key={f}
                    className="rounded bg-zinc-950/70 border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300"
                  >
                    ✓ {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Price & Direct Actions */}
        <div className="flex items-center justify-between md:justify-end gap-4 border-t border-zinc-800/80 pt-3 md:border-t-0 md:pt-0 shrink-0">
          <div className="text-left md:text-right">
            <div className="font-display text-xl sm:text-2xl font-black text-white">
              {formatMoney(priceNum)}
            </div>
            <div className="text-[10px] uppercase font-semibold text-zinc-500">LKR • Islandwide Delivery</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`rounded-lg px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-green-500 text-zinc-950 hover:bg-green-400 shadow-lg shadow-green-500/10"
              }`}
            >
              {added ? (
                <>✓ Added</>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>

            <Link
              href={`/product/${product.slug}`}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
            >
              Details →
            </Link>
          </div>
        </div>
      </article>
    );
  }

  /* ================= GRID VIEW (Large Visual Cards) ================= */
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 transition-all duration-300 hover:border-green-500/40 hover:shadow-xl hover:shadow-green-500/5">
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
        <Image
          src={image}
          alt={product.title}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          unoptimized={image.startsWith("data:")}
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${stock.className}`}>
          {stock.label}
        </span>
        {product.is_featured === 1 && (
          <span className="absolute right-3 top-3 rounded-full bg-green-500 px-2.5 py-1 text-xs font-bold text-zinc-950">
            Featured
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          {product.category && (
            <span className="text-xs font-medium uppercase tracking-wider text-green-500/80">{product.category}</span>
          )}
          {product.sku && (
            <span className="font-mono text-[10px] text-zinc-500">SKU: {product.sku}</span>
          )}
        </div>
        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-1 font-display text-base font-bold text-white transition group-hover:text-green-400">
            {product.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-zinc-400">{product.description}</p>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-800/80 pt-3">
          <span className="text-lg font-bold text-white">{formatMoney(priceNum)}</span>
          <button
            type="button"
            onClick={handleQuickAdd}
            className="btn-primary text-xs px-3 py-1.5"
          >
            {added ? "✓ Added" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

