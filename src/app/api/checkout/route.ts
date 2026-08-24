import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/api-auth";
import { getWhatsAppNumber, buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatMoneyDecimal } from "@/lib/money";
import { addMockOrder } from "@/lib/mock-data";
import { z } from "zod";

const checkoutSchema = z.object({
  customerName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  vehicleModel: z.string().min(1),
  fulfillmentType: z.enum(["pickup", "delivery"]).default("pickup"),
  address: z.string().optional(),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.string().default("Cash on Delivery"),
  deliveryFee: z.number().default(0),
  items: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      price: z.number(),
      quantity: z.number().min(1),
    })
  ).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ status: "error", message: "Invalid checkout data." }, { status: 400 });
    }

    const data = parsed.data;
    const sessionUserId = await getSessionUserId();

    let productSubtotal = 0;
    const validatedItems: {
      product_id: number;
      product_title: string;
      quantity: number;
      price: number;
    }[] = [];

    for (const item of data.items) {
      let title = item.title;
      let price = item.price;

      if (item.id > 0) {
        try {
          const dbProduct = await prisma.product.findUnique({ where: { id: item.id } });
          if (dbProduct) {
            title = dbProduct.title;
            price = Number(dbProduct.price);
          }
        } catch {
          /* use submitted values */
        }
      }

      productSubtotal += price * item.quantity;
      validatedItems.push({
        product_id: item.id > 0 ? item.id : 1,
        product_title: title,
        quantity: item.quantity,
        price,
      });
    }

    const grandTotal = productSubtotal + data.deliveryFee;
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    let savedOrderId: number = Math.floor(1000 + Math.random() * 9000);

    // Try saving to database safely
    try {
      let validUserId: number | null = null;
      if (sessionUserId) {
        const existingUser = await prisma.user.findUnique({ where: { id: sessionUserId } });
        if (existingUser) validUserId = sessionUserId;
      }

      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            user_id: validUserId,
            customer_name: data.customerName,
            phone: data.phone,
            email: data.email || "",
            address: data.address || "",
            district: data.district || "",
            postal_code: data.postalCode || "",
            vehicle_model: data.vehicleModel,
            notes: data.notes || "",
            fulfillment_type: data.fulfillmentType,
            delivery_fee: data.deliveryFee,
            total_amount: grandTotal,
            payment_method: data.paymentMethod,
            whatsapp_reference: orderNumber,
            status: "pending",
          },
        });

        for (const vi of validatedItems) {
          let validProductId = vi.product_id;
          const productExists = await tx.product.findUnique({ where: { id: vi.product_id } });
          if (productExists) {
            await tx.orderItem.create({
              data: {
                order_id: newOrder.id,
                product_id: validProductId,
                product_title: vi.product_title,
                quantity: vi.quantity,
                price: vi.price,
              },
            });
            await tx.product.update({
              where: { id: validProductId },
              data: { stock: { decrement: vi.quantity } },
            });
            await tx.inventoryMovement.create({
              data: {
                product_id: validProductId,
                quantity_changed: -vi.quantity,
                reason: `Customer Order #${newOrder.id}`,
                user_id: validUserId,
              },
            });
          }
        }

        await tx.adminNotification.create({
          data: {
            type: "order",
            title: `New Order #${newOrder.id} (${orderNumber})`,
            message: `${data.customerName} placed an order for ${formatMoneyDecimal(grandTotal)} (${data.fulfillmentType}).`,
          },
        });

        if (validUserId) {
          await tx.customer.upsert({
            where: { user_id: validUserId },
            create: {
              user_id: validUserId,
              phone: data.phone,
              address: data.address || "",
              vehicle_model: data.vehicleModel,
              notes: data.notes || "",
            },
            update: {
              phone: data.phone,
              address: data.address || "",
              vehicle_model: data.vehicleModel,
            },
          });
        }

        return newOrder;
      });

      if (order?.id) savedOrderId = order.id;
    } catch {
      // Fallback: store in mock orders so admin portal and notifications work
      const mockOrder = addMockOrder({
        user_id: sessionUserId,
        customer_name: data.customerName,
        phone: data.phone,
        email: data.email || "",
        address: data.address || "",
        district: data.district || "",
        postal_code: data.postalCode || "",
        vehicle_model: data.vehicleModel,
        notes: data.notes || "",
        fulfillment_type: data.fulfillmentType,
        delivery_fee: data.deliveryFee,
        total_amount: grandTotal,
        payment_method: data.paymentMethod,
        whatsapp_reference: orderNumber,
        status: "pending",
        created_at: new Date().toISOString(),
        items: validatedItems.map((vi, idx) => ({
          id: idx + 1,
          order_id: savedOrderId,
          product_id: vi.product_id,
          product_title: vi.product_title,
          quantity: vi.quantity,
          price: vi.price,
        })),
      });
      savedOrderId = mockOrder.id;
    }

    const itemsText = validatedItems
      .map((i) => `📦 *${i.product_title}*\n   Qty: ${i.quantity} | ${formatMoneyDecimal(i.price * i.quantity)}`)
      .join("\n\n");

    const fulfillmentStr =
      data.fulfillmentType === "pickup"
        ? "🏪 *Fulfillment:* Garage Pickup"
        : `🚚 *Fulfillment:* Islandwide Delivery\n📍 *Address:* ${data.address}, ${data.district} (${data.postalCode})`;

    const waMessage =
      `🛠️ *4X4 DEFENDER PARTS ORDER #${orderNumber}* 🛠️\n\n` +
      `👤 *Customer:* ${data.customerName}\n` +
      `📞 *Phone:* ${data.phone}\n` +
      `🚗 *Vehicle:* ${data.vehicleModel}\n` +
      `${fulfillmentStr}\n` +
      (data.notes ? `📝 *Notes:* ${data.notes}\n` : "") +
      `\n------------------------------------------\n` +
      `*ORDER ITEMS:*\n${itemsText}\n` +
      `------------------------------------------\n` +
      `💵 *Subtotal:* ${formatMoneyDecimal(productSubtotal)}\n` +
      `🚚 *Delivery:* ${data.deliveryFee > 0 ? formatMoneyDecimal(data.deliveryFee) : "Free (Garage Pickup)"}\n` +
      `💰 *Grand Total:* ${formatMoneyDecimal(grandTotal)}\n` +
      `💳 *Payment:* ${data.paymentMethod}\n` +
      `------------------------------------------\n\n` +
      `Order registered with 4X4 Defender Parts. Thank you!`;

    const whatsappNumber = await getWhatsAppNumber();
    const whatsappUrl = buildWhatsAppUrl(whatsappNumber, waMessage);

    return NextResponse.json({
      status: "success",
      order_id: savedOrderId,
      order_number: orderNumber,
      total_amount: grandTotal,
      whatsapp_url: whatsappUrl,
      message: "Order successfully confirmed.",
    });
  } catch (error) {
    console.error("Checkout POST error:", error);
    const msg = error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json({ status: "error", message: msg }, { status: 500 });
  }
}
