import Link from "next/link";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
        <p className="mt-4 text-sm text-zinc-500">Loading...</p>
      </div>
    </div>
  );
}
