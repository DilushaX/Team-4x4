import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { saveUploadedFile, getFormString, getFormNumber } from "@/lib/uploads";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = request.nextUrl.searchParams.get("id");
  const slug = request.nextUrl.searchParams.get("slug");

  if (id) {
    const service = await prisma.service.findUnique({ where: { id: parseInt(id, 10) } });
    return NextResponse.json({ service });
  }
  if (slug) {
    const service = await prisma.service.findUnique({ where: { slug } });
    return NextResponse.json({ service });
  }

  const services = await prisma.service.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json({ services });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const action = getFormString(formData, "action", "edit");

    if (action === "delete") {
      await prisma.service.delete({ where: { id: getFormNumber(formData, "id") } });
      return NextResponse.json({ status: "success" });
    }

    const data = {
      slug: getFormString(formData, "slug"),
      title: getFormString(formData, "title"),
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
      await prisma.service.update({
        where: { id },
        data: { ...data, ...(heroBanner ? { hero_banner: heroBanner } : {}) },
      });
      return NextResponse.json({ status: "success" });
    }

    const service = await prisma.service.create({
      data: { ...data, hero_banner: heroBanner || null },
    });
    return NextResponse.json({ status: "success", id: service.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
