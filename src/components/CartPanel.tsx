"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  getCartTotal,
  CHECKOUT_CART_KEY,
  CHECKOUT_SHIPPING_KEY,
  type CartItem,
} from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { normalizeImagePath } from "@/lib/utils";

type CartPanelProps = {
  variant?: "page" | "drawer";
  onClose?: () => void;
};

export default function CartPanel({ variant = "page", onClose }: CartPanelProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const isDrawer = variant === "drawer";

  useEffect(() => {
    setItems(getCart());
    const handler = () => setItems(getCart());
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, []);

  const total = getCartTotal(items);

  const handleCheckout = (method: "pickup" | "delivery") => {
    localStorage.setItem(CHECKOUT_CART_KEY, JSON.stringify(items));
    localStorage.setItem(CHECKOUT_SHIPPING_KEY, JSON.stringify({ method }));
    window.location.href = "/checkout";
  };

  const buildWhatsAppMessage = () => {
    const lines = items.map((i) => `• ${i.title} x${i.quantity} — ${formatMoney(i.price * i.quantity)}`);
    return `Hi, I'd like to order:\n\n${lines.join("\n")}\n\n*Total: ${formatMoney(total)}*\n\nPlease confirm availability.`;
  };

  if (items.length === 0) {
    return (
      <div className={isDrawer ? "flex flex-1 flex-col items-center justify-center px-6 text-center" : "card text-center"}>
        <div className="mb-4 text-zinc-600">
          <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-zinc-400">Your cart is empty.</p>
        <Link
          href="/shop"
          onClick={onClose}
          className="btn-primary mt-6 inline-flex"
        >
          Browse Parts
        </Link>
      </div>
    );
  }

  return (
    <>
      {!isDrawer && (
        <p className="mb-6 text-zinc-400">{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>
      )}

      <div className={`space-y-3 ${isDrawer ? "flex-1 overflow-y-auto px-4 py-4" : "space-y-4"}`}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 ${isDrawer ? "" : "gap-4 p-4"}`}
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
              <Image
                src={normalizeImagePath(item.image)}
                alt={item.title}
                fill
                unoptimized={normalizeImagePath(item.image).startsWith("data:")}
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <Link
                  href={`/product/${item.slug || item.id}`}
                  onClick={onClose}
                  className="line-clamp-2 text-sm font-semibold text-white hover:text-green-400"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-zinc-400">{formatMoney(item.price)} each</p>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center rounded border border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setItems(updateCartQuantity(item.id, item.quantity - 1))}
                    className="px-2 py-0.5 text-sm text-zinc-400 hover:text-white"
                  >
                    −
                  </button>
                  <span className="w-7 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setItems(updateCartQuantity(item.id, item.quantity + 1))}
                    className="px-2 py-0.5 text-sm text-zinc-400 hover:text-white"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setItems(removeFromCart(item.id))}
                  className="text-xs text-red-400 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="shrink-0 text-sm font-semibold text-white">{formatMoney(item.price * item.quantity)}</div>
          </div>
        ))}
      </div>

      <div className={isDrawer ? "border-t border-zinc-800 bg-zinc-950 p-4" : "mt-8 card"}>
        <div className="flex items-center justify-between text-base font-bold">
          <span>Subtotal</span>
          <span className="text-green-400">{formatMoney(total)}</span>
        </div>
        <div className={`flex flex-col gap-2 ${isDrawer ? "mt-4" : "mt-6 flex-wrap sm:flex-row sm:gap-3"}`}>
          <button type="button" onClick={() => setShowModal(true)} className="btn-primary w-full">
            Checkout
          </button>
          <a
            href={`https://wa.me/94703939459?text=${encodeURIComponent(buildWhatsAppMessage())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline w-full text-center"
          >
            WhatsApp Order
          </a>
          {isDrawer && (
            <Link href="/cart" onClick={onClose} className="text-center text-xs text-zinc-500 hover:text-zinc-300">
              View full cart page
            </Link>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6">
            <h2 className="font-display text-xl font-bold text-white">Choose Fulfillment</h2>
            <p className="mt-2 text-sm text-zinc-400">How would you like to receive your order?</p>
            <div className="mt-6 space-y-3">
              <button type="button" onClick={() => handleCheckout("pickup")} className="btn-secondary w-full text-left">
                Garage Pickup (Free)
              </button>
              <button type="button" onClick={() => handleCheckout("delivery")} className="btn-secondary w-full text-left">
                Islandwide Delivery
              </button>
            </div>
            <button type="button" onClick={() => setShowModal(false)} className="mt-4 w-full text-center text-sm text-zinc-500 hover:text-zinc-300">
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
