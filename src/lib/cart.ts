export const CART_KEY = "4x4defenderpartsCart";
export const CHECKOUT_CART_KEY = "selectedCheckoutCart";
export const CHECKOUT_SHIPPING_KEY = "checkoutShipping";

export type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
};

export type ShippingMethod = {
  method: "pickup" | "delivery";
};

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      id: Number(item.id),
      title: String(item.title || "Product"),
      price: Number(item.price || 0),
      quantity: Math.max(1, Number(item.quantity || 1)),
      image: item.image || "/assets/images/logo.jpg",
      slug: item.slug || "",
    }));
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("cart-updated"));
  } catch (err) {
    console.error("Failed to save cart to localStorage", err);
  }
}

export function addToCart(item: Omit<CartItem, "quantity">, qty = 1): CartItem[] {
  const cart = getCart();
  const safeQty = Math.max(1, Math.floor(Number(qty) || 1));
  const numId = Number(item.id);
  const existing = cart.find((i) => i.id === numId);

  if (existing) {
    existing.quantity += safeQty;
    if (item.price !== undefined) existing.price = Number(item.price);
    if (item.title) existing.title = item.title;
    if (item.image) existing.image = item.image;
    if (item.slug) existing.slug = item.slug;
  } else {
    cart.push({
      id: numId,
      title: item.title,
      price: Number(item.price || 0),
      image: item.image || "/assets/images/logo.jpg",
      slug: item.slug || "",
      quantity: safeQty,
    });
  }

  saveCart(cart);
  return cart;
}

export function updateCartQuantity(id: number, quantity: number): CartItem[] {
  const numId = Number(id);
  const numQty = Math.floor(Number(quantity));

  if (numQty <= 0) {
    return removeFromCart(numId);
  }

  const cart = getCart().map((i) =>
    i.id === numId ? { ...i, quantity: numQty } : i
  );

  saveCart(cart);
  return cart;
}

export function removeFromCart(id: number): CartItem[] {
  const numId = Number(id);
  const cart = getCart().filter((i) => i.id !== numId);
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(CHECKOUT_CART_KEY);
    localStorage.removeItem(CHECKOUT_SHIPPING_KEY);
    window.dispatchEvent(new Event("cart-updated"));
  } catch (err) {
    console.error("Failed to clear cart", err);
  }
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);
}
