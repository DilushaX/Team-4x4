"use client";

import Image from "next/image";
import Link from "next/link";

export default function AdminManualPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-16">
      {/* Header with Download & Print Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-green-400">Documentation &amp; Guide</span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
            Admin User Manual &amp; Workshop Operations Guide
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Comprehensive operational guide for Upul Prajath (Owner &amp; Administrator).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/docs/4X4_Defender_Parts_Admin_User_Manual.pdf"
            download="4X4_Defender_Parts_Admin_User_Manual.pdf"
            className="btn-primary flex items-center gap-2 text-xs py-2.5 px-4 font-bold"
          >
            <span>⬇️</span> Download PDF Manual
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-secondary flex items-center gap-2 text-xs py-2.5 px-4 font-bold"
          >
            <span>🖨️</span> Print Guide
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-zinc-950 border border-zinc-700 shrink-0">
            <Image src="/assets/images/logo.jpg" alt="Logo" fill className="object-cover" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">4X4 DEFENDER PARTS — PLATFORM OVERVIEW</h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              High-performance parts catalog, frame-off restorations, tactical suspensions, custom upholstery &amp; order fulfillment.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 pt-2 text-xs">
          <div className="rounded-lg bg-zinc-950/70 border border-zinc-800 p-3">
            <span className="text-zinc-500 block">System Administrator</span>
            <span className="font-bold text-white text-sm">Upul Prajath</span>
          </div>
          <div className="rounded-lg bg-zinc-950/70 border border-zinc-800 p-3">
            <span className="text-zinc-500 block">Database Tier</span>
            <span className="font-bold text-green-400 text-sm">Neon Serverless (100% Free)</span>
          </div>
          <div className="rounded-lg bg-zinc-950/70 border border-zinc-800 p-3">
            <span className="text-zinc-500 block">Hosting Network</span>
            <span className="font-bold text-white text-sm">Vercel Global Edge</span>
          </div>
        </div>
      </div>

      {/* Chapter 1: Admin Login */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 font-bold text-green-400 text-sm">
            01
          </span>
          <h2 className="font-display text-xl font-bold text-white">Admin Login &amp; Portal Access</h2>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Administrative access is reserved for the owner to manage product catalogs, inventory, order statuses, customer data, and quotations.
          </p>

          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 space-y-2 text-xs">
            <div className="font-bold text-green-400 text-sm">Admin Credentials:</div>
            <div className="grid gap-2 sm:grid-cols-2 text-zinc-300 font-mono">
              <div>Email: <span className="text-white font-bold">upulprajath@gmail.com</span></div>
              <div>Password: <span className="text-white font-bold">upulprajath</span> (or <span className="text-white font-bold">upul123</span>)</div>
            </div>
            <p className="text-zinc-400 pt-1">
              💡 <b>Fast Login:</b> On the Login screen, click the <span className="text-green-300 font-semibold">&quot;Admin (Upul Prajath)&quot;</span> badge for 1-click credential auto-fill.
            </p>
          </div>
        </div>
      </section>

      {/* Chapter 2: Product & Catalog Management */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 font-bold text-green-400 text-sm">
            02
          </span>
          <h2 className="font-display text-xl font-bold text-white">Products &amp; Inventory Management (500+ Items)</h2>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            You can add, edit, or remove Defender parts anytime. The shop supports both Grid and List catalog views with instant search.
          </p>

          <div className="space-y-2 text-xs text-zinc-300">
            <h3 className="font-bold text-white text-sm">How to Add a New Part:</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-zinc-400">
              <li>Navigate to <Link href="/admin/products" className="text-green-400 underline font-semibold">Products (/admin/products)</Link> in the admin sidebar.</li>
              <li>Click the green <b>&quot;+ Add New Product&quot;</b> button.</li>
              <li>Enter <b>Title</b>, <b>SKU</b>, <b>Category</b>, <b>Price in LKR</b>, and <b>Stock Quantity</b>.</li>
              <li>Under <b>Features</b>, separate points with vertical bars (e.g. <code className="bg-zinc-800 px-1 py-0.5 rounded text-green-400">6mm Steel|Bolt-on Fitment|TIG Welded</code>).</li>
              <li>Under <b>Compatibility</b>, specify vehicles (e.g. <code className="bg-zinc-800 px-1 py-0.5 rounded text-green-400">Defender 90/110/130 TD5, Puma</code>).</li>
              <li>Select primary and secondary gallery photos and click <b>&quot;Save Product&quot;</b>.</li>
            </ol>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-zinc-800">
              <Image src="/assets/images/green-suspension.jpg" alt="Suspension" fill className="object-cover" />
              <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[11px] font-bold text-green-400">
                Suspension Coilovers
              </div>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-zinc-800">
              <Image src="/assets/images/fabrication.jpg" alt="Fabrication" fill className="object-cover" />
              <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[11px] font-bold text-green-400">
                Custom Bumpers &amp; Armor
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 3: Order Management */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 font-bold text-green-400 text-sm">
            03
          </span>
          <h2 className="font-display text-xl font-bold text-white">Order Processing &amp; WhatsApp Fulfillment</h2>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <p className="text-sm text-zinc-300">
            Every customer order submitted online displays in <Link href="/admin/orders" className="text-green-400 underline font-semibold">Orders (/admin/orders)</Link> with delivery address, phone, vehicle model, and ordered parts.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-zinc-800">
              <thead className="bg-zinc-950 text-zinc-400">
                <tr>
                  <th className="p-2.5 border-b border-zinc-800">Status</th>
                  <th className="p-2.5 border-b border-zinc-800">Meaning</th>
                  <th className="p-2.5 border-b border-zinc-800">Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                <tr>
                  <td className="p-2.5 font-bold text-amber-400">Pending</td>
                  <td className="p-2.5">New order received; awaiting WhatsApp or bank confirmation.</td>
                  <td className="p-2.5">Click WhatsApp icon to confirm with client.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-blue-400">Confirmed</td>
                  <td className="p-2.5">Payment confirmed; parts reserved in workshop inventory.</td>
                  <td className="p-2.5">Prepare parts for courier packing or installation.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-purple-400">Shipped</td>
                  <td className="p-2.5">Dispatched with courier service islandwide.</td>
                  <td className="p-2.5">Send tracking reference to client.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-green-400">Completed</td>
                  <td className="p-2.5">Customer received or picked up parts at workshop.</td>
                  <td className="p-2.5">Order archived.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Chapter 4: Customer Directory & Workshop Services */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 font-bold text-green-400 text-sm">
            04
          </span>
          <h2 className="font-display text-xl font-bold text-white">Customers, Quotations &amp; Restoration Services</h2>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-bold text-white text-sm">👥 Customers Directory</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Registered Defender owners are tracked under <Link href="/admin/customers" className="text-green-400 underline font-semibold">Customers</Link>. Inspect their registered vehicle models, order history, and contact numbers.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-white text-sm">📄 Quotations &amp; Invoices</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generate formal quotations under <Link href="/admin/quotations" className="text-green-400 underline font-semibold">Quotations</Link> for custom fabrications or frame-off builds. Print or export invoices on demand.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-zinc-800">
              <Image src="/assets/images/restoration.png" alt="Restoration" fill className="object-cover" />
              <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[11px] font-bold text-green-400">
                Frame-Off Restorations
              </div>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-zinc-800">
              <Image src="/assets/images/cushion.jpg" alt="Cushion Works" fill className="object-cover" />
              <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[11px] font-bold text-green-400">
                Custom Leather Cushion Works
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
