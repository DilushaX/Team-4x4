"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    setResetUrl("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed.");
      setStatus("success");
      setMessage(data.message || "Password reset link generated.");
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Request failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-md space-y-5 border border-zinc-800 bg-zinc-900/90 shadow-2xl p-6 md:p-8">
      <div>
        <label className="label">Registered Email Address</label>
        <input
          required
          type="email"
          placeholder="your.email@example.com"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="mt-1 text-xs text-zinc-400">
          Enter your account email to receive your password reset authorization.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg p-3 text-xs font-medium border ${
            status === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      {resetUrl && (
        <div className="rounded-xl border border-green-500/40 bg-zinc-950 p-4 space-y-3">
          <p className="text-xs font-semibold text-zinc-300">
            Authorization Token Verified! Click below to create your new password:
          </p>
          <Link
            href={resetUrl}
            className="btn-primary block w-full text-center py-2.5 text-sm font-bold"
          >
            Proceed to Set New Password →
          </Link>
        </div>
      )}

      {!resetUrl && (
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary w-full py-3 text-sm font-bold disabled:opacity-50"
        >
          {status === "loading" ? "Verifying Email..." : "Generate Reset Link"}
        </button>
      )}

      <div className="pt-2 text-center text-sm">
        <Link href="/login" className="text-zinc-400 hover:text-white transition">
          ← Back to Sign In
        </Link>
      </div>
    </form>
  );
}
