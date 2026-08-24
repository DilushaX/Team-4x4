export const DELIVERY_FEES: Record<string, number> = {
  Colombo: 2500,
  Gampaha: 3000,
  Kandy: 4500,
  Matara: 5000,
  Jaffna: 7500,
};

export function formatMoney(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatMoneyDecimal(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `LKR ${num.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function decimalToNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  return Number(value);
}
