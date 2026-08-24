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
  const [activeImage, setActiveImage] = useState(normalizeImagePath(product.image_path));
  const [added, setAdded] = useState(false);

  const images = [
    normalizeImagePath(product.image_path),
    ...product.images.map((i) => normalizeImagePath(i.image_path)),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const price = product.price;
  const stock = stockLabel(product.stock);
  const features = parseFeatures(product.features);

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addToCart(
      { id: product.id, title: product.title, price, image: normalizeImagePath(product.image_path), slug: product.slug },
      qty
    );
    setAdded(true);
    window.dispatchEvent(new Event("open-cart-drawer"));
    setTimeout(() => setAdded(false), 2000);
  };

  const waMessage = `Hi, I'm interested in:\n\n*${product.title}*\nPrice: ${formatMoney(price)}\nQty: ${qty}\n\nPlease confirm availability.`;
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <>
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/shop" className="hover:text-green-400">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-300">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            <Image src={activeImage} alt={product.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {images.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${activeImage === img ? "border-green-500" : "border-zinc-700"}`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.sku && <p className="text-sm text-zinc-500">SKU: {product.sku}</p>}
          <div className="mt-2 flex items-center gap-3">
            <span className="text-3xl font-bold text-white">{formatMoney(price)}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stock.className}`}>{stock.label}</span>
          </div>

          <p className="mt-6 text-zinc-400 leading-relaxed">{product.description}</p>

          <div className="mt-8 flex items-center gap-4">
            <label className="text-sm text-zinc-400">Qty</label>
            <div className="flex items-center rounded-lg border border-zinc-700">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-zinc-400 hover:text-white">−</button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button type="button" onClick={() => setQty(qty + 1)} className="px-3 py-2 text-zinc-400 hover:text-white">+</button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="btn-primary flex-1 min-w-[140px] disabled:opacity-50"
            >
              {added ? "Added!" : product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-outline flex-1 min-w-[140px] text-center">
              Order via WhatsApp
            </a>
          </div>

          {features.length > 0 && (
            <div className="mt-8">
              <h3 className="font-display text-lg font-bold text-white">Features</h3>
              <ul className="mt-3 space-y-2">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="mt-1 text-green-500">✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.compatibility && (
            <div className="mt-6">
              <h3 className="font-display text-lg font-bold text-white">Compatibility</h3>
              <p className="mt-2 text-sm text-zinc-400">{product.compatibility}</p>
            </div>
          )}

          {product.installation_notes && (
            <div className="mt-6">
              <h3 className="font-display text-lg font-bold text-white">Installation</h3>
              <p className="mt-2 text-sm text-zinc-400">{product.installation_notes}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
