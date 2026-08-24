import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
    }
    if (session.user.role !== "admin") {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), session: null };
    }
    return { error: null, session };
  } catch {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
}

export async function getSessionUserId(): Promise<number | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;
    const id = parseInt(session.user.id, 10);
    return Number.isNaN(id) ? null : id;
  } catch {
    return null;
  }
}
