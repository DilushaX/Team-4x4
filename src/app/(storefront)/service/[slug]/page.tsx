import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSettings, getWhatsAppNumber, buildWhatsAppUrl } from "@/lib/whatsapp";
import PageHero, { PageContent } from "@/components/PageHero";
import { normalizeImagePath, parseFeatures, parseLines } from "@/lib/utils";
import { getActiveServices } from "@/lib/mock-data";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return getActiveServices().map((s) => ({ slug: s.slug }));
}

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  let service = await prisma.service.findUnique({ where: { slug } }).catch(() => null);
  if (!service) {
    service = (getActiveServices().find((s) => s.slug === slug) as unknown as typeof service) || null;
  }
  return { title: service?.seo_title || service?.title || "Service" };
}

export default async function ServicePage({ params }: { params: Params }) {
  const { slug } = await params;
  const targetSlug = slug === "intake" ? "cushion-works" : slug;

  let service = await prisma.service.findUnique({ where: { slug: targetSlug } }).catch(() => null);
  if (!service) {
    service = await prisma.service.findUnique({ where: { slug } }).catch(() => null);
  }
  if (!service) {
    const mock = getActiveServices().find((s) => s.slug === targetSlug || s.slug === slug);
    if (mock) {
      service = mock as unknown as typeof service;
    }
  }

  if (!service) notFound();

  const settings = await getSettings();
  const whatsappNumber = await getWhatsAppNumber();
  const phone = settings.phone || settings.whatsapp || "+94 70 393 9459";

  const features = parseFeatures(service.features);
  const compatibility = parseLines(service.compatibility);

  let faqs: { q: string; a: string }[] = [];
  try {
    if (service.faqs) faqs = JSON.parse(service.faqs);
  } catch {
    /* invalid JSON */
  }

  const otherServices = getActiveServices().filter((s) => s.slug !== slug);

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

      <PageContent wide>
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-400">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link href="/service" className="hover:text-white transition">Services</Link>
          <span>/</span>
          <span className="text-green-400 font-medium">{service.title}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <section className="card">
              <h2 className="font-display text-xl font-bold text-white mb-4">Service Overview</h2>
              <p className="text-base leading-relaxed text-zinc-300">{service.description}</p>

              {service.duration && (
                <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-sm text-zinc-300">
                  <span className="text-green-400 font-semibold">⏱ Estimated Duration:</span>
                  <span>{service.duration}</span>
                </div>
              )}
            </section>

            {features.length > 0 && (
              <section className="card">
                <h2 className="font-display text-xl font-bold text-white mb-4">Key Deliverables & Inclusions</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400 font-bold text-xs">
                        ✓
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {compatibility.length > 0 && (
              <section className="card">
                <h2 className="font-display text-xl font-bold text-white mb-4">Vehicle Compatibility</h2>
                <div className="flex flex-wrap gap-2">
                  {compatibility.map((c) => (
                    <span
                      key={c}
                      className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3.5 py-1.5 text-sm font-medium text-zinc-300"
                    >
                      🛡 {c}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {faqs.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-display text-xl font-bold text-white">Frequently Asked Questions</h2>
                <div className="grid gap-4">
                  {faqs.map((faq) => (
                    <div key={faq.q} className="card">
                      <h3 className="font-semibold text-white text-base">{faq.q}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card sticky top-24 border-green-500/30 bg-zinc-900/90 shadow-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-green-400">Book Workshop Slot</span>
              <h3 className="mt-2 font-display text-2xl font-bold text-white">{service.title}</h3>
              {service.pricing && (
                <div className="mt-3 text-lg font-bold text-green-400">{service.pricing}</div>
              )}
              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                Direct booking via WhatsApp or phone consultation with our Master Tech. Custom quotes available for tailored specifications.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full text-center py-3 text-sm font-semibold"
                >
                  Book via WhatsApp
                </a>
                {phone && (
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="btn-secondary w-full text-center py-3 text-sm font-semibold"
                  >
                    Call {phone}
                  </a>
                )}
                <Link href="/contact" className="btn-outline w-full text-center py-3 text-sm">
                  Send Custom Inquiry
                </Link>
              </div>

              <div className="mt-6 border-t border-zinc-800 pt-4 text-xs text-zinc-400 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> 100% Genuine / High-Grade Parts
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Dedicated Master Technician
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Workshop Warranty Included
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Services */}
        <section className="mt-20 border-t border-zinc-800 pt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Explore Other Services</h2>
              <p className="mt-1 text-sm text-zinc-400">Complete off-road engineering solutions</p>
            </div>
            <Link href="/service" className="btn-secondary text-sm">
              All Services →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {otherServices.slice(0, 3).map((s) => (
              <Link
                key={s.slug}
                href={`/service/${s.slug}`}
                className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition hover:border-green-500/40"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={normalizeImagePath(s.hero_banner)}
                    alt={s.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-green-500">{s.subtitle}</span>
                  <h3 className="mt-1 font-display text-lg font-bold text-white group-hover:text-green-400">{s.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{s.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </PageContent>
    </>
  );
}
