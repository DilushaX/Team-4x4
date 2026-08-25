import PageHero, { PageContent } from "@/components/PageHero";
import { DELIVERY_FEES, formatMoney } from "@/lib/money";

export const metadata = { title: "Shipping Info" };

export default function ShippingPage() {
  return (
    <>
      <PageHero
        image="/assets/images/hero-bg.jpeg"
        eyebrow="Delivery"
        title="Shipping & Delivery"
        meta="Garage pickup and islandwide delivery across Sri Lanka."
      />
      <PageContent>
        <div className="space-y-6">
          <div className="card">
            <h2 className="font-display text-lg font-bold text-white">Garage Pickup</h2>
            <p className="mt-2 text-zinc-400">Collect your order from our workshop at no additional charge. We&apos;ll notify you when your order is ready.</p>
          </div>
          <div className="card">
            <h2 className="font-display text-lg font-bold text-white">Islandwide Delivery</h2>
            <p className="mt-2 text-zinc-400">We deliver across Sri Lanka. Delivery fees vary by district:</p>
            <ul className="mt-4 space-y-2">
              {Object.entries(DELIVERY_FEES).map(([district, fee]) => (
                <li key={district} className="flex justify-between border-b border-zinc-800 py-2 text-sm">
                  <span className="text-zinc-300">{district}</span>
                  <span className="font-semibold text-white">{formatMoney(fee)}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-zinc-500">Delivery times typically range from 2–5 business days depending on location and item availability.</p>
        </div>
      </PageContent>
    </>
  );
}
