export interface ServiceData {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  features: string;
  hero_banner: string;
  pricing: string;
  duration: string;
  compatibility: string;
  faqs: string;
  seo_title: string;
  seo_description: string;
}

export interface ProjectData {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  featured_image: string;
  before_image: string;
  after_image: string;
  modifications: string;
  installed_parts: string;
  customer_notes: string;
  completion_date: string;
  project_order: number;
  images: { id: number; project_id: number; image_path: string }[];
}

export interface CategoryData {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_path: string;
  status: number;
  sort_order: number;
}

export interface ProductData {
  id: number;
  title: string;
  slug: string;
  sku: string;
  category: string;
  category_id: number;
  description: string;
  price: number;
  stock: number;
  is_featured: number;
  image_path: string;
  features: string;
  compatibility: string;
  installation_notes: string;
  images: { id: number; product_id: number; image_path: string }[];
}

export const MOCK_SERVICES: ServiceData[] = [
  {
    id: 1,
    slug: "restoration",
    title: "Frame-Off Restoration",
    subtitle: "Restoration Service",
    description:
      "Comprehensive rebuilds returning classic hardware to factory-plus specifications, incorporating modern materials while preserving original tactical aesthetics.",
    features:
      "Chassis reinforcement & corrosion control|Engine rebuild prep + performance calibration|High-strength suspension mounting points|Modern protection and finish coating",
    hero_banner: "assets/images/restoration.png",
    pricing: "LKR 280,000 - 420,000",
    duration: "4-8 weeks",
    compatibility:
      "Land Rover Defender 90/110/130\nToyota Land Cruiser 70/80 Series\nJeep Wrangler & Classic 4x4 platforms",
    faqs: JSON.stringify([
      {
        q: "Do you use original replacement parts?",
        a: "Yes, we source authentic OEM parts or high-performance aftermarket components as per project requirements.",
      },
      {
        q: "Do you provide a warranty on frame work?",
        a: "Yes, all structural welding and frame powder-coatings include a 3-year rust-through warranty.",
      },
      {
        q: "How often will I get updates during the build?",
        a: "We provide weekly high-resolution photo logs and WhatsApp progress updates at every major milestone.",
      },
    ]),
    seo_title: "Team 4x4 | Frame-Off Restoration",
    seo_description:
      "Precision rebuilds restore heritage rigs to factory-plus condition with full chassis, drivetrain, and finish work.",
  },
  {
    id: 2,
    slug: "suspension",
    title: "Tactical Suspension",
    subtitle: "Suspension Service",
    description:
      "Advanced damping systems and geometry correction for extreme terrain dominance. Engineered for payload capacity and high-speed stability.",
    features:
      "Long-Travel Coilover Conversion|Adjustable Panhard Rods|Polyurethane Bushings Kit|Stabilizer Bar Quick Disconnects",
    hero_banner: "assets/images/suspension.png",
    pricing: "LKR 180,000 - 320,000",
    duration: "2-4 weeks",
    compatibility:
      "Toyota Land Cruiser\nLand Rover Defender\nHilux, D-Max & common 4x4 pickups",
    faqs: JSON.stringify([
      {
        q: "What is internal bypass damping?",
        a: "Bypass damping allows progressive damping levels that increase in stiffness as the shock reaches its compression limit, preventing bottoming out.",
      },
      {
        q: "Will this lift my vehicle?",
        a: "Yes, our tactical suspension packages typically provide a 2 to 3-inch functional lift while maintaining correct caster angles and road manners.",
      },
    ]),
    seo_title: "Team 4x4 | Tactical Suspension Coilovers",
    seo_description:
      "High-performance coilovers and bypass shocks custom-tuned for extreme Sri Lankan terrains.",
  },
  {
    id: 3,
    slug: "fabrication",
    title: "Armor & Fabrication",
    subtitle: "Fabrication Service",
    description:
      "Bespoke rock sliders, bumpers, and skid plates TIG welded from high-tensile steel and aluminium. Maximum protection with zero compromise.",
    features:
      "Bespoke bumper mounting|CNC cut mild-steel skid plates|High-tensile hardware configurations|Corrosion-resistant textured finishes",
    hero_banner: "assets/images/fabrication.jpg",
    pricing: "LKR 80,000 - 150,000",
    duration: "1-2 weeks",
    compatibility: "Defender 90/110, Wrangler, Land Cruiser, Hilux, D-Max",
    faqs: JSON.stringify([
      {
        q: "Are skid plates aluminum or steel?",
        a: "We offer both: 6mm CNC-bent marine-grade aluminum for lightweight shielding, or 4mm mild steel for maximum rock protection.",
      },
      {
        q: "Can I request custom winch mount dimensions?",
        a: "Yes, all our bumpers and armor can be tailor-built to suit your specific winch model and auxiliary lighting setup.",
      },
    ]),
    seo_title: "Team 4x4 | Custom Off-road Armor & Fabrication",
    seo_description:
      "Heavy-duty front bumpers, rock sliders, and roll cages handcrafted in our workshop.",
  },
  {
    id: 4,
    slug: "lighting",
    title: "High-Output Lumens",
    subtitle: "Lighting Service",
    description:
      "Surgical illumination for zero-light environments. Military-grade LED systems designed for maximum visibility and long-range beam projection.",
    features:
      "50-inch arc LED bars|KC HiLiTES FLEX ERA auxiliary pods|Custom dash switch controllers|Waterproof relay wiring harnesses",
    hero_banner: "assets/images/lighting.jpg",
    pricing: "LKR 45,000 - 95,000",
    duration: "1-3 days",
    compatibility: "All vehicles / Universal 12V-24V fitment",
    faqs: JSON.stringify([
      {
        q: "Do auxiliary lights drain the battery?",
        a: "We install dual-battery isolation systems or high-output relays if the lighting load exceeds standard battery capacities.",
      },
      {
        q: "Are the wiring harnesses water-sealed?",
        a: "Yes, all connections use IP68/IP69K Deutsch connectors with flame-retardant conduit looms.",
      },
    ]),
    seo_title: "Team 4x4 | High-Output Lumens & Trail Lighting",
    seo_description:
      "Surgical trail illumination kits and wiring arrays for expedition rigs.",
  },
  {
    id: 5,
    slug: "recovery",
    title: "Winch Systems & Recovery",
    subtitle: "Recovery Service",
    description:
      "Extreme-duty winching solutions for self-recovery in the most hostile environments. Built for reliability when everything else fails.",
    features:
      "12,000lb winch integration|Recovery point reinforcement|Snatch block and rigging kit|Heavy-duty wireless control switches",
    hero_banner: "assets/images/recovery.jpg",
    pricing: "LKR 170,000 - 300,000",
    duration: "1-3 weeks",
    compatibility: "4x4 pickups, Defender, Land Cruiser, Patrol, SUVs",
    faqs: JSON.stringify([
      {
        q: "Should I get steel or synthetic winch line?",
        a: "We recommend synthetic line (like Spydura) because it is safer, significantly lighter, and does not store lethal kinetic energy under tension.",
      },
      {
        q: "Do you install hidden winch mounts?",
        a: "Yes, we fabricate discrete behind-the-bumper winch cradles that preserve factory lines while delivering full pulling strength.",
      },
    ]),
    seo_title: "Team 4x4 | Heavy-Duty Winches & Recovery Systems",
    seo_description:
      "Professional recovery setups including high-draw winches and reinforced chassis tow hooks.",
  },
  {
    id: 6,
    slug: "intake",
    title: "Elevated Air Intakes",
    subtitle: "Intake Service",
    description:
      "Deep-water fording and dust filtration systems. Ensure your engine breathes clean, cool air regardless of the terrain conditions.",
    features:
      "Safari snorkel air induction|High-flow washable filters|Sealed intake box plumbing|Water separator valves",
    hero_banner: "assets/images/intake.png",
    pricing: "LKR 38,000 - 68,000",
    duration: "1-2 days",
    compatibility: "Hilux, Land Cruiser, Defender, Wrangler, D-Max",
    faqs: JSON.stringify([
      {
        q: "Does a snorkel increase engine performance?",
        a: "Snorkels provide cooler ram-air from roof height which can improve fuel efficiency and air charge densities in hot climates.",
      },
      {
        q: "Is the airbox fully sealed for deep water crossings?",
        a: "Yes, our installation includes pressure-testing the intake airbox and silicon-sealing all factory joints.",
      },
    ]),
    seo_title: "Team 4x4 | Snorkel Air Intakes & Filtration",
    seo_description:
      "Water-fording snorkels and sealed engine intakes engineered for extreme environments.",
  },
];

export const MOCK_PROJECTS: ProjectData[] = [
  {
    id: 1,
    slug: "defender-restoration",
    title: "Defender 110 Heritage Rebuild",
    category: "Restoration",
    description:
      "A complete frame-off restoration of a classic Land Rover Defender 110, blending heritage aesthetics with advanced modern off-road performance.",
    featured_image: "assets/images/restoration.png",
    before_image: "assets/images/restoration.png",
    after_image: "assets/images/restoration.png",
    modifications:
      "Galvanized Chassis Upgrade\nPuma Bonnet & Dashboard Conversion\nBespoke Soundproofing & Thermal Insulation\nHeavy-Duty Suspension Geometry",
    installed_parts:
      "Land Rover 2.4 TDCi Engine Overhaul\nLT77 Gearbox Rebuild Kit\nHeavy Duty Coil Springs & Polyurethane Bushings",
    customer_notes:
      "Customer requested a classic aesthetic with modern drivability and absolute reliability for island-wide touring.",
    completion_date: "2026-03-15",
    project_order: 1,
    images: [
      { id: 1, project_id: 1, image_path: "assets/images/restoration.png" },
      { id: 2, project_id: 1, image_path: "assets/images/fabrication.jpg" },
      { id: 3, project_id: 1, image_path: "assets/images/suspension.png" },
    ],
  },
  {
    id: 2,
    slug: "tactical-suspension-upgrade",
    title: "Defender 90 Tactical Suspension",
    category: "Suspension",
    description:
      "Advanced long-travel suspension geometry engineered for extreme off-road terrain stability and maximum wheel articulation.",
    featured_image: "assets/images/suspension.png",
    before_image: "assets/images/suspension.png",
    after_image: "assets/images/suspension.png",
    modifications:
      "Long-Travel Coilover Conversion\nAdjustable Heavy-Duty Panhard Rods\nPolyurethane Bushings Kit\nStabilizer Bar Quick Disconnects",
    installed_parts:
      "Old Man Emu BP-51 Bypass Shocks\nARB Adjustable Upper Control Arms\nExtended Steel-Braided Brake Lines",
    customer_notes:
      "Prepared specifically for high-speed trail driving and extreme rock crawling competitions.",
    completion_date: "2026-04-20",
    project_order: 2,
    images: [
      { id: 4, project_id: 2, image_path: "assets/images/suspension.png" },
      { id: 5, project_id: 2, image_path: "assets/images/recovery.jpg" },
      { id: 6, project_id: 2, image_path: "assets/images/lighting.jpg" },
    ],
  },
  {
    id: 3,
    slug: "custom-armor-build",
    title: "Expedition Armor & Sliders",
    category: "Fabrication",
    description:
      "Bespoke heavy-duty external protection, carefully engineered and welded to provide bulletproof defense in hostile rock and forest terrains.",
    featured_image: "assets/images/fabrication.jpg",
    before_image: "assets/images/fabrication.jpg",
    after_image: "assets/images/fabrication.jpg",
    modifications:
      "Custom Tube Front Bumper with Winch Mount\nHeavy-Duty Chassis-Mounted Rock Sliders\nFull Underbody 6mm Skid Plates",
    installed_parts:
      "6mm CNC Cut Mild Steel & Aluminum Plates\nHigh-Tensile Grade 10.9 Mounting Hardware\nTextured Matte Black Powder Coating",
    customer_notes:
      "Fully sandblasted and powder-coated in matte black textured finish for extreme scratch and corrosion resistance.",
    completion_date: "2026-02-10",
    project_order: 3,
    images: [
      { id: 7, project_id: 3, image_path: "assets/images/fabrication.jpg" },
      { id: 8, project_id: 3, image_path: "assets/images/restoration.png" },
      { id: 9, project_id: 3, image_path: "assets/images/recovery.jpg" },
    ],
  },
  {
    id: 4,
    slug: "interior-restoration",
    title: "Overland Interior Re-Engineering",
    category: "Restoration",
    description:
      "Luxury meets raw utility. A complete interior redesign featuring premium marine-grade leather, sound insulation, and modern off-road navigation systems.",
    featured_image: "assets/images/intake.png",
    before_image: "assets/images/intake.png",
    after_image: "assets/images/intake.png",
    modifications:
      "Hand-Stitched Leather Dashboard\nAlcantara Roof Lining\nHeavy-Duty Waterproof Rubber Floor Liners",
    installed_parts:
      "Custom Recaro Orthoped Seats\nGarmin Overlander GPS Navigation Dock\nFocal Off-Road Audio Acoustic Insulation",
    customer_notes:
      "Designed to handle heavy mud and dust while offering a premium luxury feel inside the cabin.",
    completion_date: "2026-05-01",
    project_order: 4,
    images: [
      { id: 10, project_id: 4, image_path: "assets/images/intake.png" },
      { id: 11, project_id: 4, image_path: "assets/images/suspension.png" },
      { id: 12, project_id: 4, image_path: "assets/images/lighting.jpg" },
    ],
  },
  {
    id: 5,
    slug: "winch-installation",
    title: "Tactical Winch & Self-Recovery Setup",
    category: "Recovery",
    description:
      "Integrated recovery systems with massive pulling power, custom synthetic line setups, and wireless control units for reliable field operations.",
    featured_image: "assets/images/recovery.jpg",
    before_image: "assets/images/recovery.jpg",
    after_image: "assets/images/recovery.jpg",
    modifications:
      "Hidden Winch Mount Chassis Bracket\nWireless Remote Control Integration\nDual Battery Split-Charge Isolation System",
    installed_parts:
      "Warn Zeon 12-S Platinum Winch\nSpydura Synthetic Winch Rope (30m)\nFactor 55 FlatLink Winch Shackle Mount",
    customer_notes:
      "Crucial upgrade for solo overland expeditions where self-recovery capability is non-negotiable.",
    completion_date: "2025-11-18",
    project_order: 5,
    images: [
      { id: 13, project_id: 5, image_path: "assets/images/recovery.jpg" },
      { id: 14, project_id: 5, image_path: "assets/images/fabrication.jpg" },
      { id: 15, project_id: 5, image_path: "assets/images/lighting.jpg" },
    ],
  },
  {
    id: 6,
    slug: "led-lighting-upgrade",
    title: "High-Lumen Trail Lighting Rig",
    category: "Lighting",
    description:
      "High-output tactical lighting arrays engineered for daytime-level visibility in complete darkness, with custom dash switch control.",
    featured_image: "assets/images/lighting.jpg",
    before_image: "assets/images/lighting.jpg",
    after_image: "assets/images/lighting.jpg",
    modifications:
      "Roof Rack Arc Lightbar Mounting\nCustom Auxiliary Dash Switch Pod\nWaterproof Relay Box Integration",
    installed_parts:
      "Baja Designs 50\" OnX6 Arc LED Light Bar\nKC HiLiTES FLEX ERA 4 Auxiliary Pod Lights\nAuxbeam 8-Gang Switch Panel",
    customer_notes:
      "Positioned and aimed precisely to eliminate glare on the hood and maximize peripheral forest visibility.",
    completion_date: "2026-01-22",
    project_order: 6,
    images: [
      { id: 16, project_id: 6, image_path: "assets/images/lighting.jpg" },
      { id: 17, project_id: 6, image_path: "assets/images/intake.png" },
      { id: 18, project_id: 6, image_path: "assets/images/recovery.jpg" },
    ],
  },
];

export const MOCK_CATEGORIES: CategoryData[] = [
  { id: 1, name: "Performance", slug: "performance", description: "High-performance tuning, suspension coilovers, and cooling systems.", image_path: "assets/images/suspension.png", status: 1, sort_order: 1 },
  { id: 2, name: "Exterior", slug: "exterior", description: "Custom bumpers, body armor, and roll cages built to order.", image_path: "assets/images/fabrication.jpg", status: 1, sort_order: 2 },
  { id: 3, name: "Interior", slug: "interior", description: "Marine-grade leather seating, premium soundproofing, and custom navigations.", image_path: "assets/images/intake.png", status: 1, sort_order: 3 },
  { id: 4, name: "Lighting", slug: "lighting", description: "Military-grade LED bars and off-road illumination units.", image_path: "assets/images/lighting.jpg", status: 1, sort_order: 4 },
  { id: 5, name: "Recovery", slug: "recovery", description: "Winch systems, kinetic ropes, and recovery hardware.", image_path: "assets/images/recovery.jpg", status: 1, sort_order: 5 },
  { id: 6, name: "Intake", slug: "intake", description: "Elevated snorkels and high-flow air filters.", image_path: "assets/images/intake.png", status: 1, sort_order: 6 },
  { id: 7, name: "Suspension", slug: "suspension", description: "Heavy duty coils, leaf springs, and performance shocks.", image_path: "assets/images/suspension.png", status: 1, sort_order: 7 },
];

export const MOCK_PRODUCTS: ProductData[] = [
  {
    id: 1,
    title: "Tactical Bull Bar V2",
    slug: "tactical-bull-bar-v2",
    sku: "T4X4-BBV2",
    category: "Exterior",
    category_id: 2,
    description:
      "Heavy-duty steel bumper designed to offer maximum protection and winching capabilities in off-road excursions.",
    price: 125000,
    stock: 10,
    is_featured: 1,
    image_path: "assets/images/fabrication.jpg",
    features: "Heavy-duty steel construction|Integrated winch mount|D-Ring recovery points|Textured powder coat finish",
    compatibility: "Defender 90 / 110 / 130 / Universal",
    installation_notes: "Bolt-on fitment; professional installation by certified technicians recommended.",
    images: [
      { id: 1, product_id: 1, image_path: "assets/images/fabrication.jpg" },
      { id: 2, product_id: 1, image_path: "assets/images/restoration.png" },
    ],
  },
  {
    id: 2,
    title: "BP-51 Bypass Suspension Kit",
    slug: "bp-51-suspension-kit",
    sku: "T4X4-BP51",
    category: "Suspension",
    category_id: 7,
    description:
      "Old Man Emu high-performance internal bypass shocks offering peak articulation and rebound damping configuration.",
    price: 380000,
    stock: 5,
    is_featured: 1,
    image_path: "assets/images/suspension.png",
    features: "Internal bypass shocks|Adjustable compression & rebound|Vehicle-specific valving|Corrosion resistant bodies",
    compatibility: "Land Cruiser 70/80/100, Defender 110/130",
    installation_notes: "Requires professional alignment after installation.",
    images: [
      { id: 3, product_id: 2, image_path: "assets/images/suspension.png" },
      { id: 4, product_id: 2, image_path: "assets/images/recovery.jpg" },
    ],
  },
  {
    id: 3,
    title: "Heavy-Duty Rock Sliders",
    slug: "heavy-duty-rock-sliders",
    sku: "T4X4-RS01",
    category: "Exterior",
    category_id: 2,
    description:
      "Dual-tube chassis-mounted side rock armor designed for serious rock sliders and threshold safety.",
    price: 75000,
    stock: 8,
    is_featured: 1,
    image_path: "assets/images/fabrication.jpg",
    features: "Chassis-mounted design|Dual outer rail protection|Non-slip step plates|Gloss black powder coat",
    compatibility: "Defender 90 / 110 / 130",
    installation_notes: "Bolt-on to factory chassis outriggers.",
    images: [
      { id: 5, product_id: 3, image_path: "assets/images/fabrication.jpg" },
    ],
  },
  {
    id: 4,
    title: "Warn Zeon 12-S Winch",
    slug: "warn-zeon-12-s-winch",
    sku: "T4X4-WZ12",
    category: "Recovery",
    category_id: 5,
    description:
      "Warn professional recovery winching kit containing 12,000 lbs pull index and Spydura synthetic rope.",
    price: 285000,
    stock: 4,
    is_featured: 1,
    image_path: "assets/images/recovery.jpg",
    features: "12,000 lbs pull capacity|Spydura synthetic rope|IP68 waterproof rating|Wireless remote control",
    compatibility: "All steel bumpers / Universal",
    installation_notes: "Requires minimum 650 CCA battery; dual battery system recommended.",
    images: [
      { id: 6, product_id: 4, image_path: "assets/images/recovery.jpg" },
    ],
  },
  {
    id: 5,
    title: "Baja Designs LED Light Bar",
    slug: "baja-designs-led-light-bar",
    sku: "T4X4-LB50",
    category: "Lighting",
    category_id: 4,
    description:
      "50-inch arc LED light bar providing daytime-level Peripheral forest sight paths in complete pitch darkness.",
    price: 165000,
    stock: 12,
    is_featured: 1,
    image_path: "assets/images/lighting.jpg",
    features: "50\" curved double row LED|22,000 raw lumens|IP69K ingress protection|Combo spot/flood optic",
    compatibility: "Roof rack mounts / Universal",
    installation_notes: "Includes wiring loom, relay, fuse, and switch.",
    images: [
      { id: 7, product_id: 5, image_path: "assets/images/lighting.jpg" },
    ],
  },
  {
    id: 6,
    title: "Safari Snorkel Air Intake",
    slug: "safari-snorkel-air-intake",
    sku: "T4X4-SN01",
    category: "Intake",
    category_id: 6,
    description:
      "Elevated high-flow air induction system protecting engine combustion from mud, sand, and water ingress.",
    price: 48000,
    stock: 15,
    is_featured: 0,
    image_path: "assets/images/intake.png",
    features: "Elevated air intake|UV stable polyethylene|High-flow air grid|Decreased engine dust loading",
    compatibility: "Defender 300Tdi/Td5/Puma",
    installation_notes: "Requires template cutting on side fender.",
    images: [
      { id: 8, product_id: 6, image_path: "assets/images/intake.png" },
    ],
  },
];
