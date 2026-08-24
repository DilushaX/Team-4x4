"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { getCart, getCartCount } from "@/lib/cart";
import CartDrawer, { CartIcon } from "@/components/CartDrawer";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/service", label: "Services" },
  { href: "/shop", label: "Shop" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = useCallback(() => {
    setCartCount(getCartCount(getCart()));
  }, []);

  useEffect(() => {
    const openCart = () => setCartOpen(true);
    updateCartCount();
    window.addEventListener("cart-updated", updateCartCount);
    window.addEventListener("open-cart-drawer", openCart);
    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("open-cart-drawer", openCart);
    };
  }, [updateCartCount]);

  const firstName = session?.user?.name?.split(" ")[0]?.toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/assets/images/logo.jpg" alt="4X4 Defender Parts" width={44} height={44} className="rounded-md object-cover" />
            <span className="hidden font-display text-sm font-bold tracking-wide text-white sm:block">
              4X4 DEFENDER PARTS
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname === link.href
                    ? "bg-green-500/15 text-green-400"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative rounded-lg border border-zinc-700 p-2 text-zinc-300 transition hover:border-green-500/50 hover:bg-zinc-800 hover:text-green-400"
              aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
            >
              <CartIcon className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-[10px] font-bold text-zinc-950">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            <div className="hidden items-center gap-2 md:flex">
              {session ? (
                <>
                  {session.user.role === "admin" ? (
                    <Link href="/admin/dashboard" className="btn-primary text-xs">
                      Admin Portal
                    </Link>
                  ) : (
                    <span className="text-xs font-semibold text-zinc-400">HI, {firstName}</span>
                  )}
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-secondary text-xs">
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary text-xs">Login</Link>
                  <Link href="/signup" className="btn-primary text-xs">Sign Up</Link>
                </>
              )}
              <Link href="/contact" className="btn-outline text-xs">Inquire</Link>
            </div>

            <button
              type="button"
              className="rounded-lg border border-zinc-700 p-2 text-zinc-300 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                    pathname === link.href ? "bg-green-500/15 text-green-400" : "text-zinc-300"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2 border-t border-zinc-800 pt-4">
              {session ? (
                <>
                  {session.user.role === "admin" ? (
                    <Link href="/admin/dashboard" className="btn-primary text-center text-xs" onClick={() => setMenuOpen(false)}>
                      Admin Portal
                    </Link>
                  ) : (
                    <div className="text-center text-xs font-bold text-green-400 py-1">
                      HI, {firstName}
                    </div>
                  )}
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-secondary text-xs">
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary text-center text-xs" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link href="/signup" className="btn-primary text-center text-xs" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
