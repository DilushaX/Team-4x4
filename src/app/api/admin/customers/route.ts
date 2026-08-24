import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import {
  getActiveCustomers,
  deleteMockCustomer,
  updateMockCustomer,
} from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = request.nextUrl.searchParams.get("id");
  const search = (request.nextUrl.searchParams.get("search") || "").toLowerCase().trim();

  let customersList = [...getActiveCustomers()];

  try {
    if (id) {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id, 10) },
        include: { customer: true, orders: { orderBy: { created_at: "desc" }, take: 10 } },
      });
      if (user) return NextResponse.json({ customer: user });
    }

    const dbUsers = await prisma.user.findMany({
      where: {
        role: "customer",
        ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}),
      },
      include: { customer: true, _count: { select: { orders: true } } },
      orderBy: { created_at: "desc" },
    });

    if (dbUsers && dbUsers.length > 0) {
      const mapped = dbUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.customer?.phone || "—",
        address: u.customer?.address || "—",
        vehicle_model: u.customer?.vehicle_model || "Defender",
        created_at: u.created_at ? u.created_at.toISOString() : new Date().toISOString(),
        orderCount: u._count.orders,
      }));

      // Merge unique by email
      const existingEmails = new Set(mapped.map((m) => m.email.toLowerCase()));
      for (const mock of customersList) {
        if (!existingEmails.has(mock.email.toLowerCase())) {
          mapped.push({
            id: mock.id,
            name: mock.name,
            email: mock.email,
            role: mock.role || "customer",
            phone: mock.phone || "—",
            address: mock.address || "—",
            vehicle_model: mock.vehicle_model || "Defender",
            created_at: mock.created_at || new Date().toISOString(),
            orderCount: mock.orderCount || 0,
          });
        }
      }
      customersList = mapped;
    }
  } catch {
    /* Fallback to mock store */
  }

  if (search) {
    customersList = customersList.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        (c.phone && c.phone.toLowerCase().includes(search))
    );
  }

  if (id) {
    const single = customersList.find((c) => c.id === parseInt(id, 10));
    return NextResponse.json({ customer: single || null });
  }

  return NextResponse.json({ customers: customersList });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    if (body.action === "delete") {
      try {
        await prisma.user.delete({ where: { id: body.id } });
      } catch {
        /* DB unavailable */
      }
      deleteMockCustomer(body.id);
      return NextResponse.json({ status: "success" });
    }

    if (body.action === "edit") {
      try {
        await prisma.customer.update({
          where: { user_id: body.id },
          data: {
            phone: body.phone,
            address: body.address,
            vehicle_model: body.vehicle_model,
            notes: body.notes,
          },
        });
      } catch {
        /* DB unavailable */
      }
      updateMockCustomer(body.id, {
        phone: body.phone,
        address: body.address,
        vehicle_model: body.vehicle_model,
        notes: body.notes,
      });
      return NextResponse.json({ status: "success" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
