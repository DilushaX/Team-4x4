import PageHero, { PageContent } from "@/components/PageHero";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <>
      <PageHero
        image="/assets/images/fabrication.jpg"
        eyebrow="Legal"
        title="Terms of Service"
        meta="Pricing, fitment, orders, and warranty terms."
      />
      <PageContent>
        <div className="space-y-6 text-zinc-400 leading-relaxed">
          <p>By using 4X4 Defender Parts website and services, you agree to these terms.</p>
          <div>
            <h2 className="font-display text-lg font-bold text-white">Pricing</h2>
            <p className="mt-2">All prices are listed in LKR. Prices may change without notice. Final pricing is confirmed at checkout.</p>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white">Fitment</h2>
            <p className="mt-2">Compatibility information is provided as a guide. Professional installation is recommended. We are not liable for fitment issues on non-listed vehicle configurations.</p>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white">Orders</h2>
            <p className="mt-2">Orders placed via WhatsApp or checkout are subject to stock availability. We reserve the right to cancel orders if items are unavailable.</p>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white">Warranty</h2>
            <p className="mt-2">Product warranties are provided by manufacturers where applicable. Workshop services include workmanship warranty as specified per project.</p>
          </div>
        </div>
      </PageContent>
    </>
  );
}
