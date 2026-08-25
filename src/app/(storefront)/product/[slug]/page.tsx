import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getWhatsAppNumber } from "@/lib/whatsapp";
import { decimalToNumber, formatMoney } from "@/lib/money";
import { serializeProduct } from "@/lib/serializers";
import ProductDetail from "@/components/ProductDetail";
import PageHero, { PageContent } from "@/components/PageHero";
import { getActiveProducts } from "@/lib/mock-data";

type Params = Promise<{ slug: string }>;

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({ select: { slug: true }, take: 50 });
    if (products.length > 0) {
      return products.map((p) => ({ slug: p.slug }));
    }
  } catch {
    /* fallback to mock */
  }
  return getActiveProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  let product = await prisma.product.findFirst({ where: { slug } }).catch(() => null);
  if (!product) {
    product = (getActiveProducts().find((p) => p.slug === slug) as unknown as typeof product) || null;
  }
  return { title: product?.title || "Defender Part" };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  let product = null;
  try {
    product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          { slug: slug },
          { slug: decodedSlug.toLowerCase() },
        ],
      },
      include: { images: true },
    });
  } catch (err) {
    console.error("Product page find error:", err);
  }

  if (!product) {
    const mock = getActiveProducts().find((p) => p.slug === decodedSlug || p.slug === slug);
    if (mock) {
      product = mock as unknown as NonNullable<typeof product>;
    }
  }

  if (!product) notFound();

  const whatsappNumber = await getWhatsAppNumber();
  const price = formatMoney(typeof product.price === "number" ? product.price : decimalToNumber(product.price));

  return (
    <>
      <PageHero
        image="/assets/images/hero-bg.jpeg"
        eyebrow={product.category || "Defender Parts"}
        title={product.title}
        meta={price}
      />
      <PageContent wide className="pt-8">
        <ProductDetail product={serializeProduct(product)} whatsappNumber={whatsappNumber} />
      </PageContent>
    </>
  );
}
