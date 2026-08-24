import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { saveUploadedFile, getFormString, getFormNumber } from "@/lib/uploads";
import { slugify } from "@/lib/utils";
import {
  getActiveServices,
  addMockService,
  updateMockService,
  deleteMockService,
} from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = request.nextUrl.searchParams.get("id");
  const slug = request.nextUrl.searchParams.get("slug");

  try {
    if (id) {
      const service = await prisma.service.findUnique({ where: { id: parseInt(id, 10) } });
      if (service) return NextResponse.json({ service });
      const mock = getActiveServices().find((s) => s.id === parseInt(id, 10));
      return NextResponse.json({ service: mock || null });
    }
    if (slug) {
      const service = await prisma.service.findUnique({ where: { slug } });
      if (service) return NextResponse.json({ service });
      const mock = getActiveServices().find((s) => s.slug === slug);
      return NextResponse.json({ service: mock || null });
    }

    const services = await prisma.service.findMany({ orderBy: { id: "asc" } });
    if (services && services.length > 0) {
      return NextResponse.json({ services });
    }
    return NextResponse.json({ services: getActiveServices() });
  } catch {
    if (id) {
      const mock = getActiveServices().find((s) => s.id === parseInt(id, 10));
      return NextResponse.json({ service: mock || null });
    }
    if (slug) {
      const mock = getActiveServices().find((s) => s.slug === slug);
      return NextResponse.json({ service: mock || null });
    }
    return NextResponse.json({ services: getActiveServices() });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const action = getFormString(formData, "action", "edit");

    if (action === "delete") {
      const id = getFormNumber(formData, "id");
      try {
        await prisma.service.delete({ where: { id } });
      } catch {
        /* DB unavailable */
      }
      deleteMockService(id);
      return NextResponse.json({ status: "success" });
    }

    const title = getFormString(formData, "title");
    const data = {
      slug: getFormString(formData, "slug") || slugify(title),
      title,
      subtitle: getFormString(formData, "subtitle"),
      description: getFormString(formData, "description"),
      features: getFormString(formData, "features"),
      pricing: getFormString(formData, "pricing"),
      duration: getFormString(formData, "duration"),
      compatibility: getFormString(formData, "compatibility"),
      faqs: getFormString(formData, "faqs"),
      seo_title: getFormString(formData, "seo_title"),
      seo_description: getFormString(formData, "seo_description"),
    };

    const bannerFile = formData.get("hero_banner") as File | null;
    let heroBanner: string | undefined;
    if (bannerFile && bannerFile.size > 0) {
      heroBanner = await saveUploadedFile(bannerFile, "services");
    }

    if (action === "edit") {
      const id = getFormNumber(formData, "id");
      try {
        await prisma.service.update({
          where: { id },
          data: { ...data, ...(heroBanner ? { hero_banner: heroBanner } : {}) },
        });
      } catch {
        /* DB unavailable */
      }
      updateMockService(id, {
        ...data,
        ...(heroBanner ? { hero_banner: heroBanner } : {}),
      });
      return NextResponse.json({ status: "success" });
    }

    let createdId: number | null = null;
    try {
      const service = await prisma.service.create({
        data: { ...data, hero_banner: heroBanner || null },
      });
      createdId = service.id;
    } catch {
      /* DB unavailable */
    }

    const created = addMockService({
      ...data,
      hero_banner: heroBanner || "assets/images/restoration.png",
    });

    return NextResponse.json({ status: "success", id: createdId || created.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
