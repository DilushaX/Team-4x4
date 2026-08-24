"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CHECKOUT_CART_KEY,
  CHECKOUT_SHIPPING_KEY,
  clearCart,
  getCartTotal,
  type CartItem,
  type ShippingMethod,
} from "@/lib/cart";
import { DELIVERY_FEES, formatMoney } from "@/lib/money";

const DISTRICTS = Object.keys(DELIVERY_FEES);

export default function CheckoutContent() {
  const { data: session } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [shipping, setShipping] = useState<ShippingMethod>({ method: "pickup" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ orderNumber: string; whatsappUrl: string } | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    vehicleModel: "",
    address: "",
    district: "",
    postalCode: "",
    notes: "",
    paymentMethod: "Cash on Delivery",
  });

  useEffect(() => {
    const cartRaw = localStorage.getItem(CHECKOUT_CART_KEY) || localStorage.getItem("4x4defenderpartsCart");
    const shipRaw = localStorage.getItem(CHECKOUT_SHIPPING_KEY);
    if (cartRaw) setItems(JSON.parse(cartRaw));
    if (shipRaw) setShipping(JSON.parse(shipRaw));
  }, []);

  useEffect(() => {
    if (session?.user) {
      setForm((f) => ({
        ...f,
        customerName: session.user.name || f.customerName,
        email: session.user.email || f.email,
      }));
    }
  }, [session]);

  const subtotal = getCartTotal(items);
  const deliveryFee = shipping.method === "delivery" ? (DELIVERY_FEES[form.district] ?? 0) : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fulfillmentType: shipping.method,
          deliveryFee,
          items: items.map((i) => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Checkout failed");

      clearCart();
      setSuccess({ orderNumber: data.order_number, whatsappUrl: data.whatsapp_url });
      window.open(data.whatsapp_url, "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !success) {
    return (
      <div className="card text-center">
        <p className="text-zinc-400">No items to checkout.</p>
        <Link href="/shop" className="btn-primary mt-6 inline-flex">Browse Parts</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card mx-auto max-w-lg text-center">
        <div className="text-4xl">✓</div>
        <h2 className="mt-4 font-display text-2xl font-bold text-white">Order Placed!</h2>
        <p className="mt-2 text-zinc-400">Order #{success.orderNumber} has been saved.</p>
        <a href={success.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6 inline-flex">
          Open WhatsApp
        </a>
        <Link href="/shop" className="btn-secondary mt-3 inline-flex">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-8 text-zinc-400">
        {shipping.method === "pickup" ? "Garage pickup — free" : "Islandwide delivery"}
      </p>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <div className="card space-y-4">
            <h2 className="font-display text-lg font-bold text-white">Customer Details</h2>
            <div>
              <label className="label">Full Name *</label>
              <input required className="input" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Phone *</label>
                <input required className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Vehicle Model *</label>
              <input required className="input" placeholder="e.g. Defender 110" value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} />
            </div>
            {shipping.method === "delivery" && (
              <>
                <div>
                  <label className="label">Address *</label>
                  <textarea required className="input" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">District *</label>
                    <select required className="input" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                      <option value="">Select district</option>
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d} — {formatMoney(DELIVERY_FEES[d])}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Postal Code</label>
                    <input className="input" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="label">Notes</label>
              <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select className="input" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                <option>Cash on Delivery</option>
                <option>Bank Transfer</option>
                {shipping.method === "pickup" && <option>Pay at Garage</option>}
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card sticky top-24">
            <h2 className="font-display text-lg font-bold text-white">Order Summary</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between text-zinc-400">
                  <span>{i.title} × {i.quantity}</span>
                  <span>{formatMoney(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-zinc-700 pt-4 text-sm">
              <div className="flex justify-between"><span className="text-zinc-400">Subtotal</span><span>{formatMoney(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Delivery</span><span>{deliveryFee > 0 ? formatMoney(deliveryFee) : "Free"}</span></div>
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-green-400">{formatMoney(grandTotal)}</span></div>
            </div>
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary mt-6 w-full disabled:opacity-50">
              {loading ? "Processing..." : "Confirm Order"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
