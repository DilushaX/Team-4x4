import type { Product, ProductImage } from "@prisma/client";
import { decimalToNumber } from "./money";

export type SerializedProduct = Omit<Product, "price" | "created_at"> & {
  price: number;
  created_at: string;
  images: ProductImage[];
};

export function serializeProduct(product: Product & { images?: ProductImage[] }): SerializedProduct {
  return {
    ...product,
    price: decimalToNumber(product.price),
    created_at: product.created_at.toISOString(),
    images: product.images ?? [],
  };
}

export function serializeProducts(products: (Product & { images?: ProductImage[] })[]): SerializedProduct[] {
  return products.map(serializeProduct);
}
