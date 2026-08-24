import { NextResponse } from "next/server";
import { getSettings } from "@/lib/whatsapp";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ status: "success", settings });
}
