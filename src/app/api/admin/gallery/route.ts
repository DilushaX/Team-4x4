import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { saveUploadedFile, getFormString, getFormNumber } from "@/lib/uploads";
import { slugify } from "@/lib/utils";
import { MOCK_PROJECTS } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = request.nextUrl.searchParams.get("id");
  try {
    if (id) {
      const project = await prisma.project.findUnique({
        where: { id: parseInt(id, 10) },
        include: { images: true },
      });
      if (project) return NextResponse.json({ project });
      const mock = MOCK_PROJECTS.find((p) => p.id === parseInt(id, 10));
      return NextResponse.json({ project: mock || null });
    }

    const projects = await prisma.project.findMany({
      orderBy: { project_order: "asc" },
      include: { _count: { select: { images: true } } },
    });
    if (projects && projects.length > 0) {
      return NextResponse.json({ projects });
    }
    return NextResponse.json({
      projects: MOCK_PROJECTS.map((p) => ({
        ...p,
        _count: { images: p.images.length },
      })),
    });
  } catch {
    if (id) {
      const mock = MOCK_PROJECTS.find((p) => p.id === parseInt(id, 10));
      return NextResponse.json({ project: mock || null });
    }
    return NextResponse.json({
      projects: MOCK_PROJECTS.map((p) => ({
        ...p,
        _count: { images: p.images.length },
      })),
    });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const action = getFormString(formData, "action", "add");

    if (action === "delete") {
      try {
        await prisma.project.delete({ where: { id: getFormNumber(formData, "id") } });
      } catch {
        /* DB unavailable */
      }
      return NextResponse.json({ status: "success" });
    }

    const title = getFormString(formData, "title");
    const data = {
      title,
      slug: getFormString(formData, "slug") || slugify(title),
      category: getFormString(formData, "category"),
      description: getFormString(formData, "description"),
      modifications: getFormString(formData, "modifications"),
      installed_parts: getFormString(formData, "installed_parts"),
      customer_notes: getFormString(formData, "customer_notes"),
      project_order: getFormNumber(formData, "project_order"),
    };

    const imageFields = ["featured_image", "before_image", "after_image"] as const;
    const imagePaths: Record<string, string> = {};
    for (const field of imageFields) {
      const file = formData.get(field) as File | null;
      if (file && file.size > 0) {
        imagePaths[field] = await saveUploadedFile(file, "gallery");
      }
    }

    if (action === "edit") {
      const id = getFormNumber(formData, "id");
      try {
        await prisma.project.update({
          where: { id },
          data: { ...data, ...imagePaths },
        });
        const galleryImages = formData.getAll("images") as File[];
        for (const img of galleryImages) {
          if (img.size > 0) {
            const path = await saveUploadedFile(img, "gallery");
            await prisma.projectImage.create({ data: { project_id: id, image_path: path } });
          }
        }
      } catch {
        /* DB unavailable */
      }
      return NextResponse.json({ status: "success", project_id: id });
    }

    let createdId: number = Math.floor(100 + Math.random() * 900);
    try {
      const project = await prisma.project.create({
        data: { ...data, ...imagePaths },
      });
      createdId = project.id;
      const galleryImages = formData.getAll("images") as File[];
      for (const img of galleryImages) {
        if (img.size > 0) {
          const path = await saveUploadedFile(img, "gallery");
          await prisma.projectImage.create({ data: { project_id: project.id, image_path: path } });
        }
      }
    } catch {
      /* DB unavailable */
    }

    return NextResponse.json({ status: "success", project_id: createdId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
