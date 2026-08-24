import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import PageHero, { PageContent } from "@/components/PageHero";
import { normalizeImagePath } from "@/lib/utils";

export const metadata = {
  title: "Gallery",
  description: "Explore Defender restoration builds, suspension upgrades, and custom fabrication projects.",
};

export default async function GalleryPage() {
  let projects: Awaited<ReturnType<typeof prisma.project.findMany>> = [];
  const categories = new Set<string>();

  try {
    projects = await prisma.project.findMany({
      orderBy: { project_order: "asc" },
      include: { _count: { select: { images: true } } },
    });
    projects.forEach((p) => categories.add(p.category));
  } catch {
    /* empty */
  }

  const categoryList = Array.from(categories);

  return (
    <>
      <PageHero
        image="/assets/images/restoration.png"
        eyebrow="Our Work"
        title="Build Gallery"
        meta="Explore our Defender restorations, suspension builds, and custom fabrication projects."
      />

      <PageContent wide className="pt-8">
        {categoryList.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-green-500/15 px-4 py-1.5 text-sm font-medium text-green-400">All</span>
            {categoryList.map((cat) => (
              <span key={cat} className="rounded-full border border-zinc-700 px-4 py-1.5 text-sm text-zinc-400">{cat}</span>
            ))}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="card text-center text-zinc-400">No projects yet. Check back soon!</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.slug}`}
                className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition hover:border-green-500/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={normalizeImagePath(project.featured_image)}
                    alt={project.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-zinc-950/80 px-3 py-1 text-xs font-semibold text-green-400">
                    {project.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-green-400">{project.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </PageContent>
    </>
  );
}
