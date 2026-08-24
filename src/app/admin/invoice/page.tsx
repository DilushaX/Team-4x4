import PrintButton from "@/components/admin/PrintButton";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/whatsapp";
import { decimalToNumber, formatMoneyDecimal } from "@/lib/money";
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

  const order = await prisma.order.findUnique({
    where: { id: parseInt(id, 10) },
    include: { items: true },
  }).catch(() => null);

  if (!order) {
    return (
      <>
        <AdminPageHeader section="orders" title="Invoice" description="Print order invoices" />
        <div className="card text-center text-red-400">Order not found.</div>
      </>
    );
  }

  const settings = await getSettings();
  const businessName = settings.business_name || "Team 4x4";
  const subtotal = order.items.reduce((sum, i) => sum + decimalToNumber(i.price) * i.quantity, 0);

  return (
    <>
      <AdminPageHeader section="orders" title={`Invoice #${order.id}`} description="Print or save this invoice" />

      <div className="invoice-print mx-auto max-w-3xl">
        <div className="mb-4 print:hidden">
          <PrintButton />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-zinc-900 shadow-sm print:border-0 print:shadow-none">
          <h1 className="text-2xl font-bold">{businessName}</h1>
          <p className="text-sm text-zinc-600">{settings.address}</p>
          <p className="text-sm text-zinc-600">{settings.phone} · {settings.email}</p>

          <hr className="my-6 border-zinc-200" />

          <h2 className="text-xl font-semibold">Invoice #{order.id}</h2>
          <p className="text-sm text-zinc-600">Date: {new Date(order.created_at).toLocaleDateString()}</p>
          <p className="text-sm text-zinc-600">Reference: {order.whatsapp_reference || `ORD-${order.id}`}</p>

          <h3 className="mt-6 font-semibold">Bill To</h3>
          <p className="text-sm text-zinc-700">
            {order.customer_name}<br />
            {order.phone}<br />
            {order.email}<br />
            Vehicle: {order.vehicle_model}
          </p>
          {order.fulfillment_type === "delivery" && (
            <p className="mt-2 text-sm text-zinc-700">
              Delivery: {order.address}, {order.district} {order.postal_code}
            </p>
          )}

          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="p-2 text-left">Item</th>
                <th className="p-2 text-left">Qty</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-zinc-100">
                  <td className="p-2">{item.product_title}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">{formatMoneyDecimal(decimalToNumber(item.price))}</td>
                  <td className="p-2">{formatMoneyDecimal(decimalToNumber(item.price) * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 space-y-1 text-sm">
            <p>Subtotal: {formatMoneyDecimal(subtotal)}</p>
            <p>Delivery: {decimalToNumber(order.delivery_fee) > 0 ? formatMoneyDecimal(decimalToNumber(order.delivery_fee)) : "Free"}</p>
            <p className="text-lg font-bold">Grand Total: {formatMoneyDecimal(decimalToNumber(order.total_amount))}</p>
            <p className="text-zinc-600">Payment: {order.payment_method} · Status: {order.status}</p>
          </div>
        </div>
      </div>
    </>
  );
}
