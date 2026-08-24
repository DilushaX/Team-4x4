"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { normalizeImagePath, parseFeatures, stockLabel } from "@/lib/utils";
import { addToCart } from "@/lib/cart";
import type { SerializedProduct } from "@/lib/serializers";

type Props = {
  product: SerializedProduct;
  whatsappNumber: string;
};

export default function ProductDetail({ product, whatsappNumber }: Props) {
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(() => normalizeImagePath(product.image_path));
  const [added, setAdded] = useState(false);

  const images = [
    normalizeImagePath(product.image_path),
    ...(product.images || []).map((i) => normalizeImagePath(i.image_path)),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const price = typeof product.price === "number" ? product.price : Number(product.price || 0);
  const stockNum = typeof product.stock === "number" ? product.stock : Number(product.stock ?? 10);
  const isOutOfStock = stockNum <= 0;
  const stock = stockLabel(stockNum);
  const features = parseFeatures(product.features);

  const handleQtyChange = (delta: number) => {
    setQty((prev) => Math.max(1, prev + delta));
  };

  const handleSelectImage = (img: string) => {
    setActiveImage(img);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    const safeQty = Math.max(1, qty);
    addToCart(
      {
        id: Number(product.id),
        title: product.title,
        price,
        image: normalizeImagePath(product.image_path),
        slug: product.slug,
      },
      safeQty
    );
    setAdded(true);
    window.dispatchEvent(new Event("cart-updated"));
    window.dispatchEvent(new Event("open-cart-drawer"));
    setTimeout(() => setAdded(false), 2500);
  };

  const waMessage = `Hi, I'm interested in:\n\n*${product.title}*\nPrice: ${formatMoney(price)}\nQty: ${qty}\n\nPlease confirm availability.`;
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <>
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/shop" className="hover:text-green-400 transition">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-300">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images section */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl">
            <Image
              key={activeImage}
              src={activeImage}
              alt={product.title}
              fill
              className="object-cover transition duration-300"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => handleSelectImage(img)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition duration-200 cursor-pointer ${
                    activeImage === img
                      ? "border-green-500 ring-2 ring-green-500/30 scale-95"
                      : "border-zinc-800 hover:border-zinc-600 opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Action */}
        <div>
          {product.sku && (
            <span className="inline-block rounded bg-zinc-800 px-2.5 py-1 text-xs font-mono text-zinc-400">
              SKU: {product.sku}
            </span>
          )}
          <h1 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
            {product.title}
          </h1>

          <div className="mt-4 flex items-center gap-4">
            <span className="text-3xl font-bold text-green-400">{formatMoney(price)}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stock.className}`}>
              {stock.label}
            </span>
          </div>

          <p className="mt-6 text-zinc-300 leading-relaxed text-sm sm:text-base">
            {product.description}
          </p>

          {/* Quantity Controls & Add to Cart */}
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-zinc-300">Quantity:</label>
              <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-950 p-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleQtyChange(-1);
                  }}
                  disabled={qty <= 1 || isOutOfStock}
                  className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-900 text-lg font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition disabled:opacity-30 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-12 bg-transparent text-center text-base font-bold text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleQtyChange(1);
                  }}
                  disabled={isOutOfStock}
                  className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-900 text-lg font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition disabled:opacity-30 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`btn-primary flex-1 min-w-[160px] py-3.5 text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                  added ? "bg-emerald-400 text-zinc-950" : ""
                }`}
              >
                {added ? `✓ Added ${qty} to Cart!` : isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex-1 min-w-[160px] py-3.5 text-center text-sm font-semibold"
              >
                Order via WhatsApp
              </a>
            </div>
          </div>

          {features.length > 0 && (
            <div className="mt-8 card">
              <h3 className="font-display text-base font-bold text-white mb-3">Key Features</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.compatibility && (
            <div className="mt-6 card">
              <h3 className="font-display text-base font-bold text-white mb-2">Vehicle Compatibility</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">{product.compatibility}</p>
            </div>
          )}

          {product.installation_notes && (
            <div className="mt-6 card">
              <h3 className="font-display text-base font-bold text-white mb-2">Installation & Fitment Notes</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">{product.installation_notes}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
