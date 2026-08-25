import PageHero, { PageContent } from "@/components/PageHero";
import CheckoutContent from "@/components/CheckoutContent";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <>
      <PageHero
        image="/assets/images/hero-bg.jpeg"
        eyebrow="Complete Order"
        title="Checkout"
        meta="Enter your details and confirm your Defender parts order."
      />
      <PageContent wide className="pt-8">
        <CheckoutContent />
      </PageContent>
    </>
  );
}
