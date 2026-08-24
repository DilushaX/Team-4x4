import Image from "next/image";
import { normalizeImagePath } from "@/lib/utils";

type PageHeroProps = {
  image: string;
  video?: string;
  eyebrow?: string;
  title: string;
  meta?: string;
  align?: "left" | "center";
  tall?: boolean;
  children?: React.ReactNode;
};

export default function PageHero({
  image,
  video,
  eyebrow,
  title,
  meta,
  align = "left",
  tall = false,
  children,
}: PageHeroProps) {
  const centered = align === "center";

  return (
    <section
      className={`relative flex overflow-hidden ${
        tall ? "min-h-[88vh] items-center justify-center" : "min-h-[50vh] items-end"
      }`}
    >
      {video ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={normalizeImagePath(image)}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={video} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={normalizeImagePath(image)}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      )}
      <div
        className={`absolute inset-0 ${
          tall ? "hero-gradient" : "bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/20"
        }`}
      />
      <div
        className={`relative z-10 mx-auto w-full ${
          centered ? "max-w-4xl px-4 text-center" : "max-w-5xl px-4 pb-12 lg:px-6"
        }`}
      >
        {eyebrow && (
          <span
            className={`text-xs font-semibold uppercase tracking-wider text-green-400 ${
              centered ? "inline-flex items-center gap-3 tracking-[0.2em]" : ""
            }`}
          >
            {centered && <span className="h-px w-8 bg-green-500/60" />}
            {eyebrow}
            {centered && <span className="h-px w-8 bg-green-500/60" />}
          </span>
        )}
        <h1
          className={`font-display font-bold text-white ${
            centered
              ? "mt-6 text-4xl font-extrabold leading-tight md:text-6xl"
              : "mt-2 text-4xl md:text-5xl"
          }`}
        >
          {title}
        </h1>
        {meta && (
          <p
            className={`mt-3 text-lg ${
              centered ? "mx-auto max-w-2xl text-zinc-300" : "text-green-400"
            }`}
          >
            {meta}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

export function PageContent({
  children,
  wide = false,
  className = "",
}: {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto px-4 py-12 lg:px-6 ${wide ? "max-w-7xl" : "max-w-5xl"} ${className}`}
    >
      {children}
    </div>
  );
}
