import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_SERVICES, MOCK_PROJECTS } from "../src/lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Admin User (Upul Prajath)
  const adminHashedPassword = await bcrypt.hash("upulprajath", 10);
  const admin = await prisma.user.upsert({
    where: { email: "upulprajath@gmail.com" },
    update: {
      name: "Upul Prajath",
      password: adminHashedPassword,
      role: "admin",
    },
    create: {
      name: "Upul Prajath",
      email: "upulprajath@gmail.com",
      password: adminHashedPassword,
      role: "admin",
    },
  });
  console.log("✅ Admin user seeded:", admin.email);

  // 2. Seed Categories
  const categoryMap = new Map<string, number>();
  for (const cat of MOCK_CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image_path: cat.image_path,
        status: cat.status,
        sort_order: cat.sort_order,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image_path: cat.image_path,
        status: cat.status,
        sort_order: cat.sort_order,
      },
    });
    categoryMap.set(cat.name.toLowerCase(), created.id);
  }
  console.log(`✅ Seeded ${MOCK_CATEGORIES.length} categories.`);

  // 3. Seed Products
  for (const prod of MOCK_PRODUCTS) {
    const categoryId = categoryMap.get(prod.category.toLowerCase()) || null;
    const existing = await prisma.product.findFirst({ where: { slug: prod.slug } });

    if (!existing) {
      const created = await prisma.product.create({
        data: {
          title: prod.title,
          slug: prod.slug,
          sku: prod.sku,
          category: prod.category,
          category_id: categoryId,
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          is_featured: prod.is_featured,
          image_path: prod.image_path,
          features: prod.features,
          compatibility: prod.compatibility,
          installation_notes: prod.installation_notes,
        },
      });

      if (prod.images && prod.images.length > 0) {
        for (const img of prod.images) {
          await prisma.productImage.create({
            data: {
              product_id: created.id,
              image_path: img.image_path,
            },
          });
        }
      }
    }
  }
  console.log(`✅ Seeded ${MOCK_PRODUCTS.length} initial products.`);

  // 4. Seed Services
  for (const s of MOCK_SERVICES) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        title: s.title,
        subtitle: s.subtitle,
        description: s.description,
        features: s.features,
        hero_banner: s.hero_banner,
        pricing: s.pricing,
        duration: s.duration,
        compatibility: s.compatibility,
        faqs: s.faqs,
        seo_title: s.seo_title,
        seo_description: s.seo_description,
      },
      create: {
        slug: s.slug,
        title: s.title,
        subtitle: s.subtitle,
        description: s.description,
        features: s.features,
        hero_banner: s.hero_banner,
        pricing: s.pricing,
        duration: s.duration,
        compatibility: s.compatibility,
        faqs: s.faqs,
        seo_title: s.seo_title,
        seo_description: s.seo_description,
      },
    });
  }
  console.log(`✅ Seeded ${MOCK_SERVICES.length} services.`);

  // 5. Seed Projects
  for (const p of MOCK_PROJECTS) {
    const existing = await prisma.project.findFirst({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.project.create({
        data: {
          title: p.title,
          slug: p.slug,
          category: p.category,
          description: p.description,
          featured_image: p.featured_image,
          before_image: p.before_image,
          after_image: p.after_image,
          modifications: p.modifications,
          installed_parts: p.installed_parts,
          customer_notes: p.customer_notes,
          project_order: p.project_order,
        },
      });
    }
  }
  console.log(`✅ Seeded ${MOCK_PROJECTS.length} project builds.`);

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
