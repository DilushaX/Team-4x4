import Link from "next/link";
import Image from "next/image";
import { formatMoney, decimalToNumber } from "@/lib/money";
import { normalizeImagePath, stockLabel } from "@/lib/utils";
import type { Product, ProductImage } from "@prisma/client";

type ProductWithImages = Product & { images?: ProductImage[] };

export default function ProductCard({ product }: { product: ProductWithImages }) {
  const stock = stockLabel(product.stock);
  const image = normalizeImagePath(product.image_path);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/5">
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/3] overflow-hidden bg-zinc-800">
        <Image
          src={image}
          alt={product.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 25vw"
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
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wider text-green-500/80">{product.category}</span>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-1 font-display text-base font-bold text-white transition group-hover:text-green-400">
            {product.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-zinc-400">{product.description}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-white">{formatMoney(decimalToNumber(product.price))}</span>
          <Link href={`/product/${product.slug}`} className="btn-primary text-xs">
            View Part
          </Link>
        </div>
      </div>
    </article>
  );
}
