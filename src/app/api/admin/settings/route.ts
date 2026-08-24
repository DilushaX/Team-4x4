import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { getSettings } from "@/lib/whatsapp";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const entries = Object.entries(body).filter(([k]) => k !== "action");

    for (const [key, value] of entries) {
      await prisma.setting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      });
    }

    if (body.whatsapp && !body.whatsapp_number) {
      await prisma.setting.upsert({
        where: { key: "whatsapp_number" },
        create: { key: "whatsapp_number", value: String(body.whatsapp) },
        update: { value: String(body.whatsapp) },
      });
    }

    return NextResponse.json({ status: "success" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
