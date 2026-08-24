"use client";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold text-white">Something went wrong</h1>
      <p className="mt-2 text-zinc-400">{error.message || "An unexpected error occurred."}</p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">Try again</button>
        <a href="/" className="btn-secondary">Go Home</a>
      </div>
    </div>
  );
}
