import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/whatsapp";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  let categories: { name: string; slug: string }[] = [];
  try {
    categories = await prisma.category.findMany({
      where: { status: 1 },
      orderBy: { sort_order: "asc" },
      take: 5,
      select: { name: true, slug: true },
    });
  } catch {
    /* DB unavailable */
  }

  const settings = await getSettings();

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} settings={settings} />
    </>
  );
}
