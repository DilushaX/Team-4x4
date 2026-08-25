import PageHero, { PageContent } from "@/components/PageHero";
import CartContent from "@/components/CartContent";

export const metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <>
      <PageHero
        image="/assets/images/hero-bg.jpeg"
        eyebrow="Your Order"
        title="Shopping Cart"
        meta="Review items and proceed to checkout."
      />
      <PageContent wide className="pt-8">
        <CartContent />
      </PageContent>
    </>
  );
}
