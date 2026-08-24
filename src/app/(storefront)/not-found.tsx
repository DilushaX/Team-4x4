import Link from "next/link";
import PageHero, { PageContent } from "@/components/PageHero";

export default function NotFound() {
  return (
    <>
      <PageHero
        image="/assets/images/suspension.png"
        eyebrow="Error"
        title="404 — Page Not Found"
        meta="The page you're looking for doesn't exist or has been moved."
      />
      <PageContent className="text-center">
        <Link href="/" className="btn-primary inline-flex px-8 py-3">Go Home</Link>
        <Link href="/shop" className="btn-secondary ml-3 inline-flex px-8 py-3">Browse Parts</Link>
      </PageContent>
    </>
  );
}
