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
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item: Omit<CartItem, "quantity">, qty = 1): CartItem[] {
  const cart = getCart();
  const existing = cart.find((i) => i.id === item.id);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...item, quantity: qty });
  }
  saveCart(cart);
  return cart;
}

export function updateCartQuantity(id: number, quantity: number): CartItem[] {
  const cart = getCart()
    .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))
    .filter((i) => i.quantity > 0);
  saveCart(cart);
  return cart;
}

export function removeFromCart(id: number): CartItem[] {
  const cart = getCart().filter((i) => i.id !== id);
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(CHECKOUT_CART_KEY);
  localStorage.removeItem(CHECKOUT_SHIPPING_KEY);
  window.dispatchEvent(new Event("cart-updated"));
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
