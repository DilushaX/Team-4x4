import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getWhatsAppNumber } from "@/lib/whatsapp";
import { decimalToNumber, formatMoney } from "@/lib/money";
import { serializeProduct } from "@/lib/serializers";
import ProductDetail from "@/components/ProductDetail";
import PageHero, { PageContent } from "@/components/PageHero";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({ where: { slug } }).catch(() => null);
  return { title: product?.title || "Product" };
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

  if (!product) notFound();

  const whatsappNumber = await getWhatsAppNumber();
  const price = formatMoney(decimalToNumber(product.price));

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
