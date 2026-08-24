"use client";

import Link from "next/link";
import { useState } from "react";
import SocialLinks from "@/components/SocialLinks";

type FooterProps = {
  categories?: { name: string; slug: string }[];
  settings?: Record<string, string>;
};

export default function Footer({ categories = [], settings = {} }: FooterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Subscribed!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Subscription failed.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  const whatsapp = settings.whatsapp || settings.whatsapp_number || "+94 70 393 9459";
  const phone = settings.phone || whatsapp;
  const address = settings.address || "Colombo, Sri Lanka";
  const businessName = settings.business_name || "Team 4x4";
  const facebook = settings.facebook || "https://facebook.com/team4x4";
  const instagram = settings.instagram || "https://instagram.com/team4x4";

  return (
    <footer className="mt-auto border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-4 lg:px-6">
        <div>
          <h3 className="font-display text-lg font-bold text-white">{businessName}</h3>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Premium Defender parts, restoration, fabrication and off-road upgrades engineered for performance and adventure.
          </p>
          <form onSubmit={handleNewsletter} className="mt-4 flex gap-2">
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input flex-1 text-sm"
            />
            <button type="submit" disabled={status === "loading"} className="btn-primary shrink-0 text-xs">
              {status === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
          {message && (
            <p className={`mt-2 text-xs ${status === "success" ? "text-emerald-400" : "text-red-400"}`}>{message}</p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            <li><Link href="/service" className="hover:text-green-400">Workshop Services</Link></li>
            <li><Link href="/shop" className="hover:text-green-400">Shop Parts</Link></li>
            <li><Link href="/gallery" className="hover:text-green-400">Build Gallery</Link></li>
            <li><Link href="/contact" className="hover:text-green-400">Contact Us</Link></li>
            <li><Link href="/shipping" className="hover:text-green-400">Shipping Info</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">Categories</h4>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            {categories.slice(0, 5).map((cat) => (
              <li key={cat.slug}>
                <Link href={`/shop?cat=${cat.slug}`} className="hover:text-green-400">{cat.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">Contact</h4>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            <li>{phone}</li>
            <li>{address}</li>
            <li>
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                WhatsApp Support
              </a>
            </li>
          </ul>
          <SocialLinks facebook={facebook} instagram={instagram} className="mt-5" />
        </div>
      </div>

      <div className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
        <p>
          &copy; {new Date().getFullYear()} {businessName}. All rights reserved.{" "}
          <Link href="/privacy" className="hover:text-zinc-300">Privacy</Link>
          {" · "}
          <Link href="/terms" className="hover:text-zinc-300">Terms</Link>
        </p>
      </div>
    </footer>
  );
}
