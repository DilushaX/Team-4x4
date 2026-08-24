import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings, getWhatsAppNumber, buildWhatsAppUrl } from "@/lib/whatsapp";
import PageHero, { PageContent } from "@/components/PageHero";
import { parseFeatures, parseLines } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({ where: { slug } }).catch(() => null);
  return { title: service?.seo_title || service?.title || "Service" };
}

export default async function ServicePage({ params }: { params: Params }) {
  const { slug } = await params;

  const service = await prisma.service.findUnique({ where: { slug } }).catch(() => null);
  if (!service) notFound();

  const settings = await getSettings();
  const whatsappNumber = await getWhatsAppNumber();
  const phone = settings.phone || settings.whatsapp || "";

  const features = parseFeatures(service.features);
  const compatibility = parseLines(service.compatibility);

  let faqs: { q: string; a: string }[] = [];
  try {
    if (service.faqs) faqs = JSON.parse(service.faqs);
  } catch {
    /* invalid JSON */
  }

  const waMessage = `Hi, I'd like to book the *${service.title}* service.\n\nPlease share availability and next steps.`;
  const waUrl = buildWhatsAppUrl(whatsappNumber, waMessage);

  return (
    <>
      <PageHero
        image={service.hero_banner || "assets/images/restoration.png"}
        eyebrow={service.subtitle || "Workshop Service"}
        title={service.title}
        meta={service.pricing || undefined}
      />

      <PageContent>
        <p className="text-lg leading-relaxed text-zinc-400">{service.description}</p>

        <div className="mt-8 flex flex-wrap gap-6 text-sm text-zinc-400">
          {service.duration && <span>⏱ Duration: {service.duration}</span>}
        </div>

        {features.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl font-bold text-white">What&apos;s Included</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-zinc-400"><span className="text-green-500">✓</span>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {compatibility.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl font-bold text-white">Compatible Platforms</h2>
            <ul className="mt-4 space-y-1">
              {compatibility.map((c) => (
                <li key={c} className="text-sm text-zinc-400">{c}</li>
              ))}
            </ul>
          </div>
        )}

        {faqs.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl font-bold text-white">FAQ</h2>
            <div className="mt-4 space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="card">
                  <h3 className="font-semibold text-white">{faq.q}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-4">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-primary px-8 py-3">
            Book This Service
          </a>
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="btn-secondary px-8 py-3">
              Call {phone}
            </a>
          )}
          <Link href="/contact" className="btn-outline px-8 py-3">Send Inquiry</Link>
        </div>
      </PageContent>
    </>
  );
}
