import PageHero, { PageContent } from "@/components/PageHero";

export default function ShopLoading() {
  return (
    <>
      <PageHero
        image="/assets/images/hero-bg.jpeg"
        eyebrow="Parts Catalog"
        title="Defender Parts Shop"
        meta="Premium off-road parts engineered for Land Rover Defender platforms."
      />

      <PageContent wide className="pt-8">
        <div className="space-y-6 animate-pulse">
          {/* Toolbar Skeleton */}
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-xl lg:flex-row lg:items-center lg:justify-between">
            <div className="h-10 flex-1 rounded-lg bg-zinc-800/80" />
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="h-10 w-36 rounded-lg bg-zinc-800/80" />
              <div className="h-10 w-36 rounded-lg bg-zinc-800/80" />
              <div className="h-10 w-24 rounded-lg bg-zinc-800/80" />
            </div>
          </div>

          {/* Stats Bar Skeleton */}
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="h-4 w-40 rounded bg-zinc-800/80" />
          </div>

          {/* Product Cards Grid Skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40"
              >
                {/* Image Aspect Box Skeleton */}
                <div className="aspect-[4/3] bg-zinc-800/60" />
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-3 w-16 rounded bg-zinc-800" />
                    <div className="h-3 w-20 rounded bg-zinc-800" />
                  </div>
                  <div className="h-5 w-3/4 rounded bg-zinc-800" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-full rounded bg-zinc-800/60" />
                    <div className="h-3 w-2/3 rounded bg-zinc-800/60" />
                  </div>
                  <div className="pt-3 border-t border-zinc-800/80 flex justify-between items-center">
                    <div className="h-6 w-24 rounded bg-zinc-800" />
                    <div className="h-8 w-24 rounded-lg bg-zinc-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContent>
    </>
  );
}
