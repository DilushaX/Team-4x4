import Image from "next/image";

const heroImages: Record<string, string> = {
  dashboard: "/assets/images/hero-bg.jpeg",
  products: "/assets/images/suspension.png",
  categories: "/assets/images/intake.png",
  orders: "/assets/images/recovery.jpg",
  customers: "/assets/images/restoration.png",
  inventory: "/assets/images/fabrication.jpg",
  suppliers: "/assets/images/lighting.jpg",
  gallery: "/assets/images/restoration.png",
  services: "/assets/images/suspension.png",
  quotations: "/assets/images/intake.png",
  messages: "/assets/images/fabrication.jpg",
  reports: "/assets/images/hero-bg.jpeg",
  settings: "/assets/images/recovery.jpg",
  default: "/assets/images/hero-bg.jpeg",
};

type Props = {
  title: string;
  description?: string;
  section?: keyof typeof heroImages | string;
};

export default function AdminPageHeader({ title, description, section = "default" }: Props) {
  const image = heroImages[section] || heroImages.default;

  return (
    <div className="relative mb-8 overflow-hidden rounded-xl border border-zinc-800">
      <div className="relative h-36 sm:h-44">
        <Image src={image} alt="" fill className="object-cover" sizes="100vw" priority={false} />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-5 sm:p-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-400">
            Admin · {title}
          </span>
          <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-zinc-300">{description}</p>}
        </div>
      </div>
    </div>
  );
}
