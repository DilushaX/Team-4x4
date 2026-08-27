import { prisma } from "./prisma";

const DEFAULT_WHATSAPP = "94703939459";

export async function getWhatsAppNumber(): Promise<string> {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ["whatsapp", "whatsapp_number"] },
      },
    });
    for (const s of settings) {
      const digits = (s.value ?? "").replace(/\D/g, "");
      if (digits) return digits;
    }
  } catch {
    /* DB unavailable — use default */
  }
  return DEFAULT_WHATSAPP;
}

export function buildWhatsAppUrl(number: string, message: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export async function getWhatsAppUrl(message: string): Promise<string> {
  const number = await getWhatsAppNumber();
  return buildWhatsAppUrl(number, message);
}

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.setting.findMany();
    const settings: Record<string, string> = {};
    for (const row of rows) {
      if (row.value) settings[row.key] = row.value;
    }
    if (settings.whatsapp && !settings.whatsapp_number) {
      settings.whatsapp_number = settings.whatsapp;
    }
    return settings;
  } catch {
    return {
      business_name: "4x4 Defender Parts",
      phone: "+94 70 393 9459",
      whatsapp: "+94 70 393 9459",
      whatsapp_number: "+94 70 393 9459",
      email: "info@team4x4.com",
      address: "No. 42, Industrial Zone Road, Colombo 00200, Sri Lanka",
      facebook: "https://www.facebook.com/share/1G7uc474xT/?mibextid=wwXIfr",
      instagram: "https://www.instagram.com/upulprajath?igsi=MTQ1M2hweTQwYjJ2OQ==",
      tiktok: "https://www.tiktok.com/@upulprajath?_r=1&_t=ZS-99EsjkCNJkS",
    };
  }
}
