import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import PageHero, { PageContent } from "@/components/PageHero";
import { normalizeImagePath, parseFeatures } from "@/lib/utils";

const fallbackServices: {
  title: string;
  subtitle: string;
  description: string;
  hero_banner: string;
  features: string;
  slug: string;
}[] = [
    { title: "Defender Restoration", subtitle: "Restoration", description: "Frame-off rebuilds, corrosion control and drivetrain restoration.", hero_banner: "assets/images/restoration.png", features: "Full-strip restoration|Corrosion control|Heritage fitment", slug: "restoration" },
    { title: "Suspension Upgrades", subtitle: "Suspension", description: "Off-road geometry tuning and long-travel suspension upgrades.", hero_banner: "assets/images/green-suspension.jpg", features: "Long-travel setup|Payload tuning|Terrain control", slug: "suspension" },
    { title: "Fabrication", subtitle: "Fabrication", description: "Custom bumpers, sliders, armor and protection systems.", hero_banner: "assets/images/fabrication.jpg", features: "Bespoke armor|Custom mounts|Heavy-duty protection", slug: "fabrication" },
    { title: "Recovery Systems", subtitle: "Recovery", description: "Winches, recovery gear and integrated accessory setups.", hero_banner: "assets/images/recovery.jpg", features: "Winch kits|Recovery gear|Secure mounting", slug: "recovery" },
    { title: "Lighting Upgrades", subtitle: "Lighting", description: "High-output LED packages for night driving and trail expeditions.", hero_banner: "assets/images/lighting.jpg", features: "LED lighting|Wiring kits|Off-road visibility", slug: "lighting" },
    { title: "Cushion Works", subtitle: "Cushion Works", description: "Custom leather upholstery, ergonomic seat cushioning, door cards and roof linings.", hero_banner: "assets/images/cushion.jpg", features: "Custom leather|Ergonomic cushions|Roof liners", slug: "cushion-works" },
  ];

export default async function HomePage() {
  let services: typeof fallbackServices = fallbackServices;
  try {
    const dbServices = await prisma.service.findMany({ orderBy: { id: "asc" }, take: 6 });
    if (dbServices.length > 0) {
      services = dbServices.map((s) => ({
        title: s.title,
        subtitle: s.subtitle || "",
        description: s.description || "",
        hero_banner: s.hero_banner || "assets/images/logo.jpg",
        features: s.features || "",
        slug: s.slug,
      }));
    }
  } catch {
    /* use fallback */
  }

  return (
    <>
      <PageHero
        video="/assets/videos/hero.mp4"
        image="/assets/images/hero-bg.jpeg"
        eyebrow="Defender Engineering / Off-Road Specialists"
        title="BUILT FOR THE DEFENDER. BUILT FOR ADVENTURE."
        meta="Premium Defender parts, restoration, fabrication and off-road upgrades engineered for performance, durability and adventure."
        align="center"
        tall
      >
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/shop" className="btn-primary px-8 py-3 text-base">Shop Defender Parts</Link>
          <Link href="/gallery" className="btn-secondary px-8 py-3 text-base">Explore Our Builds</Link>
        </div>
      </PageHero>

      <PageContent wide>
        <div className="text-center">
          <h2 className="section-title">Workshop Services</h2>
          <p className="section-subtitle mx-auto">
            From frame-off restorations to tactical suspension — engineered for Sri Lankan terrain.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/service/${service.slug}`}
              className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition hover:border-green-500/40"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={normalizeImagePath(service.hero_banner)}
                  alt={service.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-green-500">{service.subtitle}</span>
                <h3 className="mt-1 font-display text-lg font-bold text-white group-hover:text-green-400">{service.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{service.description}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {parseFeatures(service.features).slice(0, 3).map((f) => (
                    <li key={f} className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">{f}</li>
                  ))}
                </ul>
              </div>
            </Link>
          ))}
        </div>
      </PageContent>

      <section className="border-y border-zinc-800 bg-zinc-900/30 py-16">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-12 px-4 text-center lg:px-6">
          {[
            { value: "5+", label: "Years Experience" },
            { value: "200+", label: "Builds Completed" },
            { value: "500+", label: "Parts In Stock" },
            { value: "100%", label: "Defender Focused" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-display text-3xl font-bold text-green-400">{stat.value}</div>
              <div className="mt-1 text-sm text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
