import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { addMockCustomer, getActiveCustomers } from "@/lib/mock-data";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  phone: z.string().optional().default(""),
  vehicle_model: z.string().optional().default(""),
  address: z.string().optional().default(""),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Invalid registration data.";
      return NextResponse.json({ status: "error", message: errorMsg }, { status: 400 });
    }

    const { name, email, password, phone, vehicle_model, address } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if email already exists in mock/disk store
    const existingMock = getActiveCustomers().find(
      (c) => c.email.toLowerCase() === cleanEmail
    );
    if (existingMock) {
      return NextResponse.json(
        { status: "error", message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Try checking existing in Prisma DB
    try {
      const existingDb = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (existingDb) {
        return NextResponse.json(
          { status: "error", message: "An account with this email already exists." },
          { status: 409 }
        );
      }
    } catch {
      /* DB unavailable */
    }

    const hash = await bcrypt.hash(password, 10);
    let createdUserId: number | null = null;

    // Try saving in Prisma DB
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email: cleanEmail,
          password: hash,
          role: "customer",
          customer: {
            create: {
              phone: phone || null,
              address: address || null,
              vehicle_model: vehicle_model || null,
            },
          },
        },
      });
      createdUserId = user.id;
    } catch {
      /* DB unavailable - fallback to persistent disk store below */
    }

    // Save in persistent customer store
    const savedCustomer = addMockCustomer({
      name,
      email: cleanEmail,
      password: hash,
      role: "customer",
      phone: phone || "+94 77 000 0000",
      address: address || "Colombo, Sri Lanka",
      vehicle_model: vehicle_model || "Defender 110",
    });

    return NextResponse.json({
      status: "success",
      message: "Account created successfully.",
      user: {
        id: createdUserId || savedCustomer.id,
        name,
        email: cleanEmail,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { status: "error", message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
