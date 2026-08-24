import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHero, { PageContent } from "@/components/PageHero";
import { normalizeImagePath, parseLines } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } }).catch(() => null);
  return { title: project?.title || "Project" };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: { images: true },
  }).catch(() => null);

  if (!project) notFound();

  const modifications = parseLines(project.modifications);
  const parts = parseLines(project.installed_parts);

  return (
    <>
      <PageHero
        image={project.featured_image || "assets/images/restoration.png"}
        eyebrow={project.category}
        title={project.title}
        meta={project.completion_date ? `Completed ${new Date(project.completion_date).toLocaleDateString()}` : undefined}
      />

      <PageContent>
        <nav className="mb-6 text-sm text-zinc-500">
          <Link href="/gallery" className="hover:text-green-400">Gallery</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">{project.title}</span>
        </nav>

        <p className="text-lg leading-relaxed text-zinc-400">{project.description}</p>

        {(project.before_image || project.after_image) && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {project.before_image && (
              <div>
                <p className="mb-2 text-sm font-semibold text-zinc-400">Before</p>
                <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-800">
                  <Image src={normalizeImagePath(project.before_image)} alt="Before" fill className="object-cover" sizes="50vw" />
                </div>
              </div>
            )}
            {project.after_image && (
              <div>
                <p className="mb-2 text-sm font-semibold text-zinc-400">After</p>
                <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-800">
                  <Image src={normalizeImagePath(project.after_image)} alt="After" fill className="object-cover" sizes="50vw" />
                </div>
              </div>
            )}
          </div>
        )}

        {project.images.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {project.images.map((img) => (
              <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg border border-zinc-800">
                <Image src={normalizeImagePath(img.image_path)} alt="" fill className="object-cover" sizes="33vw" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {modifications.length > 0 && (
            <div className="card">
              <h2 className="font-display text-lg font-bold text-white">Modifications</h2>
              <ul className="mt-3 space-y-2">
                {modifications.map((m) => (
                  <li key={m} className="flex gap-2 text-sm text-zinc-400"><span className="text-green-500">→</span>{m}</li>
                ))}
              </ul>
            </div>
          )}
          {parts.length > 0 && (
            <div className="card">
              <h2 className="font-display text-lg font-bold text-white">Installed Parts</h2>
              <ul className="mt-3 space-y-2">
                {parts.map((p) => (
                  <li key={p} className="flex gap-2 text-sm text-zinc-400"><span className="text-green-500">✓</span>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/gallery" className="btn-secondary px-8 py-3">Back to Gallery</Link>
          <Link href="/contact" className="btn-primary px-8 py-3">Start Your Build</Link>
        </div>
      </PageContent>
    </>
  );
}
