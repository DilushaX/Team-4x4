"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/categories", label: "Categories", icon: "🏷️" },
  { href: "/admin/orders", label: "Orders", icon: "🛒" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
  { href: "/admin/inventory", label: "Inventory", icon: "📋" },
  { href: "/admin/suppliers", label: "Suppliers", icon: "🏭" },
  { href: "/admin/gallery", label: "Gallery", icon: "🖼️" },
  { href: "/admin/services", label: "Services", icon: "🔧" },
  { href: "/admin/quotations", label: "Quotations", icon: "📄" },
  { href: "/admin/messages", label: "Messages", icon: "✉️" },
  { href: "/admin/reports", label: "Reports", icon: "📈" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto p-3">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
            pathname === item.href || pathname.startsWith(item.href + "/")
              ? "bg-green-500/15 text-green-400"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          <span>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Desktop sidebar */}
      <aside className="admin-sidebar hidden w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 lg:flex">
        <div className="border-b border-zinc-800 p-4">
          <Link href="/admin/dashboard" className="font-display text-sm font-bold text-green-400">
            4X4 ADMIN
          </Link>
          <Link href="/" className="mt-1 block text-xs text-zinc-500 hover:text-zinc-300">
            ← Back to site
          </Link>
        </div>
        <SidebarNav />
        <div className="border-t border-zinc-800 p-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <aside className="relative flex h-full w-64 flex-col bg-zinc-950 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 p-4">
              <span className="font-display text-sm font-bold text-green-400">4X4 ADMIN</span>
              <button type="button" onClick={() => setMobileOpen(false)} className="text-zinc-400">✕</button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="admin-header sticky top-0 z-40 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-zinc-700 p-2 text-zinc-300 lg:hidden"
              aria-label="Open menu"
            >
              ☰
            </button>
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-green-400 sm:inline">
              Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            {firstName && (
              <span className="hidden text-sm text-zinc-400 sm:inline">
                {session?.user?.name}
              </span>
            )}
            <Link href="/" className="btn-outline text-xs px-3 py-1.5">
              View Site
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
