"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mb-5 rounded bg-zinc-800 px-4 py-2 text-sm text-white print:hidden"
    >
      Print Invoice
    </button>
  );
}
