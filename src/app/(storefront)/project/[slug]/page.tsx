import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHero, { PageContent } from "@/components/PageHero";
import { normalizeImagePath, parseLines } from "@/lib/utils";
import { MOCK_PROJECTS } from "@/lib/mock-data";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return MOCK_PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  let project = await prisma.project.findUnique({ where: { slug } }).catch(() => null);
  if (!project) {
    project = (MOCK_PROJECTS.find((p) => p.slug === slug) as unknown as typeof project) || null;
  }
  return { title: project?.title || "Build Project" };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;

  let project = await prisma.project
    .findUnique({
      where: { slug },
      include: { images: true },
    })
    .catch(() => null);

  if (!project) {
    const mock = MOCK_PROJECTS.find((p) => p.slug === slug);
    if (mock) {
      project = mock as unknown as typeof project;
    }
  }

  if (!project) notFound();

  const modifications = parseLines(project.modifications);
  const parts = parseLines(project.installed_parts);
  const otherProjects = MOCK_PROJECTS.filter((p) => p.slug !== slug);

  return (
    <>
      <PageHero
        image={project.featured_image || "assets/images/restoration.png"}
        eyebrow={project.category}
        title={project.title}
        meta={
          project.completion_date
            ? `Completed ${new Date(project.completion_date).toLocaleDateString()}`
            : undefined
        }
      />

      <PageContent wide>
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-400">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link href="/gallery" className="hover:text-white transition">Build Gallery</Link>
          <span>/</span>
          <span className="text-green-400 font-medium">{project.title}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main Build Details */}
          <div className="lg:col-span-2 space-y-10">
            <section className="card">
              <h2 className="font-display text-xl font-bold text-white mb-4">Build Overview</h2>
              <p className="text-base leading-relaxed text-zinc-300">{project.description}</p>
              {project.customer_notes && (
                <div className="mt-6 border-l-2 border-green-500 bg-zinc-950/40 p-4 rounded-r-lg">
                  <span className="text-xs font-bold uppercase tracking-wider text-green-400">Client Brief</span>
                  <p className="mt-1 text-sm text-zinc-300 italic">&ldquo;{project.customer_notes}&rdquo;</p>
                </div>
              )}
            </section>

            {/* Gallery Images */}
            {project.images && project.images.length > 0 && (
              <section className="card">
                <h2 className="font-display text-xl font-bold text-white mb-4">Project Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {project.images.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
                    >
                      <Image
                        src={normalizeImagePath(img.image_path)}
                        alt={project.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Before and After if different */}
            {(project.before_image || project.after_image) && (
              <section className="card">
                <h2 className="font-display text-xl font-bold text-white mb-4">Transformation</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {project.before_image && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Initial State</span>
                      </div>
                      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-zinc-800">
                        <Image
                          src={normalizeImagePath(project.before_image)}
                          alt="Before build"
                          fill
                          className="object-cover"
                          sizes="50vw"
                        />
                      </div>
                    </div>
                  )}
                  {project.after_image && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-green-400">Completed Build</span>
                      </div>
                      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-green-500/30">
                        <Image
                          src={normalizeImagePath(project.after_image)}
                          alt="After build"
                          fill
                          className="object-cover"
                          sizes="50vw"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Modifications and Installed Parts */}
            <div className="grid gap-6 sm:grid-cols-2">
              {modifications.length > 0 && (
                <section className="card">
                  <h3 className="font-display text-lg font-bold text-white mb-4">Custom Modifications</h3>
                  <ul className="space-y-2.5">
                    {modifications.map((m) => (
                      <li key={m} className="flex items-start gap-2.5 text-sm text-zinc-300">
                        <span className="text-green-400 font-bold">→</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {parts.length > 0 && (
                <section className="card">
                  <h3 className="font-display text-lg font-bold text-white mb-4">Installed Parts & Kits</h3>
                  <ul className="space-y-2.5">
                    {parts.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-zinc-300">
                        <span className="text-green-400 font-bold">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>

          {/* Sidebar CTA */}
          <div className="space-y-6">
            <div className="card sticky top-24 border-green-500/30 bg-zinc-900/90 shadow-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-green-400">Custom Engineering</span>
              <h3 className="mt-2 font-display text-xl font-bold text-white">Inspired by this build?</h3>
              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                Our workshop can reproduce, tailor, or engineer an entirely custom package for your vehicle platform.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <Link href="/contact" className="btn-primary w-full text-center py-3 text-sm">
                  Start Your Build Project
                </Link>
                <Link href="/gallery" className="btn-secondary w-full text-center py-3 text-sm">
                  Back to Build Gallery
                </Link>
              </div>

              <div className="mt-6 border-t border-zinc-800 pt-4 text-xs text-zinc-400 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Full CAD Design & Precision Welding
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> High-Tensile Material Certification
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Stage-by-Stage Build Documentation
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More Projects */}
        <section className="mt-20 border-t border-zinc-800 pt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">More Completed Builds</h2>
              <p className="mt-1 text-sm text-zinc-400">Explore other custom fabrications and restorations</p>
            </div>
            <Link href="/gallery" className="btn-secondary text-sm">
              All Builds →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {otherProjects.slice(0, 3).map((p) => (
              <Link
                key={p.slug}
                href={`/project/${p.slug}`}
                className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition hover:border-green-500/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={normalizeImagePath(p.featured_image)}
                    alt={p.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-zinc-950/80 px-3 py-1 text-xs font-semibold text-green-400">
                    {p.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-green-400">{p.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{p.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </PageContent>
    </>
  );
}
