import type { Product, ProductImage } from "@prisma/client";
import { decimalToNumber } from "./money";

export type SerializedProduct = Omit<Product, "price" | "created_at"> & {
  price: number;
  created_at: string;
  images: ProductImage[];
};

export function serializeProduct(product: (Product | any) & { images?: ProductImage[] }): SerializedProduct {
  let createdAtStr = new Date().toISOString();
  if (product.created_at) {
    if (typeof product.created_at === "string") {
      createdAtStr = product.created_at;
    } else if (typeof product.created_at.toISOString === "function") {
      createdAtStr = product.created_at.toISOString();
    }
  }

  return {
    ...product,
    price: typeof product.price === "number" ? product.price : decimalToNumber(product.price),
    created_at: createdAtStr,
    images: product.images ?? [],
  };
}

export function serializeProducts(products: (Product & { images?: ProductImage[] })[]): SerializedProduct[] {
  return products.map(serializeProduct);
}
