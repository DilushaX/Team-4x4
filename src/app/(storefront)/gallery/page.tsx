import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import PageHero, { PageContent } from "@/components/PageHero";
import { normalizeImagePath } from "@/lib/utils";
import { MOCK_PROJECTS } from "@/lib/mock-data";

export const metadata = {
  title: "Build Gallery",
  description: "Explore Defender restoration builds, suspension upgrades, and custom fabrication projects.",
};

type SearchParams = Promise<{ cat?: string }>;

export default async function GalleryPage({ searchParams }: { searchParams?: SearchParams }) {
  const params = searchParams ? await searchParams : {};
  const currentCategory = params.cat || "all";

  let projects = MOCK_PROJECTS;
  const categories = new Set<string>(["Restoration", "Suspension", "Fabrication", "Recovery", "Lighting"]);

  try {
    const dbProjects = await prisma.project.findMany({
      orderBy: { project_order: "asc" },
      include: { images: true },
    });
    if (dbProjects && dbProjects.length > 0) {
      projects = dbProjects.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        description: p.description || "",
        featured_image: p.featured_image || "assets/images/restoration.png",
        before_image: p.before_image || "",
        after_image: p.after_image || "",
        modifications: p.modifications || "",
        installed_parts: p.installed_parts || "",
        customer_notes: p.customer_notes || "",
        completion_date: p.completion_date ? p.completion_date.toISOString() : "",
        project_order: p.project_order,
        images: p.images || [],
      }));
      dbProjects.forEach((p) => categories.add(p.category));
    }
  } catch {
    /* fallback to MOCK_PROJECTS */
  }

  const categoryList = Array.from(categories);

  const filteredProjects =
    currentCategory === "all" || !currentCategory
      ? projects
      : projects.filter(
          (p) => p.category.toLowerCase() === currentCategory.toLowerCase()
        );

  return (
    <>
      <PageHero
        image="/assets/images/restoration.png"
        eyebrow="Our Work"
        title="Build Gallery"
        meta="Explore our Defender restorations, tactical suspension setups, and custom fabrication builds."
      />

      <PageContent wide className="pt-8">
        {/* Filter Pills */}
        <div className="mb-10 flex flex-wrap items-center gap-2">
          <Link
            href="/gallery"
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              currentCategory === "all"
                ? "bg-green-500 text-zinc-950 font-bold"
                : "border border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-zinc-500"
            }`}
          >
            All Builds
          </Link>
          {categoryList.map((cat) => {
            const isActive = currentCategory.toLowerCase() === cat.toLowerCase();
            return (
              <Link
                key={cat}
                href={`/gallery?cat=${encodeURIComponent(cat.toLowerCase())}`}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-green-500 text-zinc-950 font-bold"
                    : "border border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-zinc-500"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {filteredProjects.length === 0 ? (
          <div className="card text-center text-zinc-400 py-12">
            <p className="text-base">No builds found in this category.</p>
            <Link href="/gallery" className="btn-primary mt-4 inline-flex">
              View All Builds
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/5"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
                  <Image
                    src={normalizeImagePath(project.featured_image)}
                    alt={project.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-80" />
                  <span className="absolute left-3 top-3 rounded-full bg-zinc-950/85 px-3 py-1 text-xs font-semibold text-green-400 backdrop-blur-md border border-zinc-800">
                    {project.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-green-400 transition">
                    {project.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-400">
                    {project.description}
                  </p>
                  <div className="mt-auto pt-4 flex items-center justify-between text-xs text-zinc-400 font-medium">
                    <span>{project.images ? `${project.images.length + 1} Photos` : "View Specs"}</span>
                    <span className="text-green-400 group-hover:translate-x-1 transition-transform">
                      Explore Build →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </PageContent>
    </>
  );
}
