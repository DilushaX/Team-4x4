import PrintButton from "@/components/admin/PrintButton";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/whatsapp";
import { decimalToNumber, formatMoneyDecimal } from "@/lib/money";
import { MOCK_ORDERS } from "@/lib/mock-data";
import Link from "next/link";

type SearchParams = Promise<{ id?: string }>;

export default async function InvoicePage({ searchParams }: { searchParams: SearchParams }) {
  const { id } = await searchParams;

  if (!id) {
    return (
      <>
        <AdminPageHeader section="orders" title="Invoice" description="Print order invoices" />
        <div className="card text-center text-zinc-400">
          <p>Select an order to print invoice.</p>
          <Link href="/admin/orders" className="btn-primary mt-4 inline-flex">Go to Orders</Link>
        </div>
      </>
    );
  }

  const orderId = parseInt(id, 10);
  let order: {
    id: number;
    customer_name: string;
    phone: string;
    email: string | null;
    address: string | null;
    district: string | null;
    postal_code: string | null;
    vehicle_model: string;
    notes?: string | null;
    fulfillment_type: string;
    delivery_fee: number;
    total_amount: number;
    payment_method: string;
    whatsapp_reference?: string | null;
    status: string;
    created_at: Date | string;
    items: {
      id: number;
      product_title: string;
      quantity: number;
      price: number;
    }[];
  } | null = null;

  try {
    const dbOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (dbOrder) {
      order = {
        ...dbOrder,
        delivery_fee: decimalToNumber(dbOrder.delivery_fee),
        total_amount: decimalToNumber(dbOrder.total_amount),
        items: dbOrder.items.map((i) => ({
          ...i,
          price: decimalToNumber(i.price),
        })),
      };
    }
  } catch {
    /* DB unavailable */
  }

  if (!order) {
    const mock = MOCK_ORDERS.find((o) => o.id === orderId);
    if (mock) {
      order = mock;
    }
  }

  if (!order) {
    return (
      <>
        <AdminPageHeader section="orders" title="Invoice" description="Print order invoices" />
        <div className="card text-center text-red-400">
          <p>Order #{id} not found.</p>
          <Link href="/admin/orders" className="btn-secondary mt-4 inline-flex">Back to Orders</Link>
        </div>
      </>
    );
  }

  const settings = await getSettings();
  const businessName = settings.business_name || "4x4 Defender Parts";
  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <>
      <div className="print:hidden">
        <AdminPageHeader section="orders" title={`Invoice #${order.id}`} description="Print or save this invoice" />
      </div>

      <div className="invoice-print mx-auto max-w-3xl">
        <div className="mb-4 print:hidden">
          <PrintButton />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-zinc-900 shadow-sm print:border-0 print:shadow-none print:p-0">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">{businessName}</h1>
              <p className="mt-1 text-sm text-zinc-600">{settings.address || "Colombo, Sri Lanka"}</p>
              <p className="text-sm text-zinc-600">{settings.phone || "+94 70 393 9459"} · {settings.email || "info@team4x4.com"}</p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded bg-zinc-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-800">
                {order.status}
              </span>
            </div>
          </div>

          <hr className="my-6 border-zinc-200" />

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Invoice #{order.id}</h2>
              <p className="mt-1 text-zinc-600">Date: {new Date(order.created_at).toLocaleDateString()}</p>
              <p className="text-zinc-600">Reference: {order.whatsapp_reference || `ORD-${order.id}`}</p>
            </div>
            <div>
              <h3 className="font-bold text-zinc-900">Bill To:</h3>
              <p className="mt-1 text-zinc-700">
                <span className="font-semibold">{order.customer_name}</span><br />
                Phone: {order.phone}<br />
                {order.email && <>Email: {order.email}<br /></>}
                Vehicle: {order.vehicle_model}
              </p>
              {order.fulfillment_type === "delivery" && order.address && (
                <p className="mt-1 text-xs text-zinc-600">
                  Delivery: {order.address}, {order.district} {order.postal_code}
                </p>
              )}
            </div>
          </div>

          <table className="mt-6 w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-300 bg-zinc-100">
                <th className="p-3 text-left font-semibold text-zinc-800">Item</th>
                <th className="p-3 text-center font-semibold text-zinc-800">Qty</th>
                <th className="p-3 text-right font-semibold text-zinc-800">Unit Price</th>
                <th className="p-3 text-right font-semibold text-zinc-800">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-zinc-200">
                  <td className="p-3 font-medium text-zinc-900">{item.product_title}</td>
                  <td className="p-3 text-center text-zinc-700">{item.quantity}</td>
                  <td className="p-3 text-right text-zinc-700">{formatMoneyDecimal(item.price)}</td>
                  <td className="p-3 text-right font-semibold text-zinc-900">{formatMoneyDecimal(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-1.5 text-sm text-right">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span>{formatMoneyDecimal(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Delivery:</span>
                <span>{order.delivery_fee > 0 ? formatMoneyDecimal(order.delivery_fee) : "Free (Pickup)"}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-300 pt-2 text-base font-bold text-zinc-900">
                <span>Grand Total:</span>
                <span className="text-emerald-700">{formatMoneyDecimal(order.total_amount)}</span>
              </div>
              <p className="pt-2 text-xs text-zinc-500">
                Payment: {order.payment_method}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
