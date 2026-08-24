import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getWhatsAppNumber } from "@/lib/whatsapp";
import { decimalToNumber, formatMoney } from "@/lib/money";
import { serializeProduct } from "@/lib/serializers";
import ProductDetail from "@/components/ProductDetail";
import PageHero, { PageContent } from "@/components/PageHero";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  let product = await prisma.product.findFirst({ where: { slug } }).catch(() => null);
  if (!product) {
    product = (MOCK_PRODUCTS.find((p) => p.slug === slug) as unknown as typeof product) || null;
  }
  return { title: product?.title || "Defender Part" };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;

  let product = null;
  try {
    product = await prisma.product.findFirst({
      where: { slug },
      include: { images: true },
    });
  } catch {
    /* DB error */
  }

  if (!product) {
    const mock = MOCK_PRODUCTS.find((p) => p.slug === slug);
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
        image={product.image_path || "assets/images/suspension.png"}
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
