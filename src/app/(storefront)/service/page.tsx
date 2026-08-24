import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import PageHero, { PageContent } from "@/components/PageHero";
import { normalizeImagePath, parseFeatures } from "@/lib/utils";
import { getActiveServices } from "@/lib/mock-data";

export const metadata = {
  title: "Workshop Services",
  description:
    "Expert Defender restoration, tactical suspension, custom fabrication, winching systems, high-output lighting, and custom cushion & upholstery works.",
};

export default async function ServicesIndexPage() {
  let services = getActiveServices();
  try {
    const dbServices = await prisma.service.findMany({ orderBy: { id: "asc" } });
    if (dbServices && dbServices.length > 0) {
      services = dbServices.map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        subtitle: s.subtitle || "Workshop Service",
        description: s.description || "",
        features: s.features || "",
        hero_banner: s.hero_banner || "assets/images/restoration.png",
        pricing: s.pricing || "",
        duration: s.duration || "",
        compatibility: s.compatibility || "",
        faqs: s.faqs || "[]",
        seo_title: s.seo_title || s.title,
        seo_description: s.seo_description || "",
      }));
    }
  } catch {
    /* use fallback */
  }

  return (
    <>
      <PageHero
        image="/assets/images/hero-bg.jpeg"
        eyebrow="Specialized Engineering"
        title="Workshop Services"
        meta="From complete frame-off restorations to tactical suspension and armor fabrication — precision engineered for extreme terrain."
      />

      <PageContent wide className="pt-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="section-title">Engineered For The Demanding</h2>
          <p className="section-subtitle">
            Every build is handled by specialized 4x4 technicians using precision tooling, OEM parts, and high-tensile custom fabrication.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const features = parseFeatures(service.features);
            return (
              <div
                key={service.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm transition-all duration-300 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/5"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={normalizeImagePath(service.hero_banner)}
                    alt={service.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                  <span className="absolute bottom-3 left-3 rounded-md bg-green-500/20 px-2.5 py-1 text-xs font-bold text-green-400 backdrop-blur-md">
                    {service.subtitle}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-bold text-white transition group-hover:text-green-400">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400 line-clamp-2">
                    {service.description}
                  </p>

                  {features.length > 0 && (
                    <ul className="mt-4 space-y-1.5 border-t border-zinc-800/80 pt-4 text-xs text-zinc-300">
                      {features.slice(0, 3).map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-auto pt-6 flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400">{service.pricing}</span>
                    <Link
                      href={`/service/${service.slug}`}
                      className="btn-primary text-xs px-4 py-2"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Consultation CTA */}
        <section className="mt-16 rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-950 p-8 sm:p-12 text-center">
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Have a Custom Build or Unique Platform?
          </h3>
          <p className="mt-3 text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
            We build bespoke setups for Land Rover Defender, Land Cruiser, Patrol, Hilux, and specialty expedition platforms.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-primary px-8 py-3 text-sm">
              Schedule Consultation
            </Link>
            <Link href="/gallery" className="btn-secondary px-8 py-3 text-sm">
              View Completed Builds
            </Link>
          </div>
        </section>
      </PageContent>
    </>
  );
}
