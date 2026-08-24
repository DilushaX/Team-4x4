"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";

function ResetFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed.");
      setStatus("success");
      setMessage(data.message || "Password updated successfully!");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Password reset failed. Please try again.");
    }
  };

  if (!token || !email) {
    return (
      <div className="card mx-auto max-w-md text-center p-8 border border-zinc-800 bg-zinc-900/90">
        <p className="text-sm text-red-400 font-medium">
          Invalid or missing reset token link.
        </p>
        <Link href="/forgot-password" className="btn-primary mt-4 inline-flex text-xs">
          Request New Reset Link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-md space-y-4 border border-zinc-800 bg-zinc-900/90 shadow-2xl p-6 md:p-8">
      <div>
        <label className="label">Account Email</label>
        <input disabled value={email} className="input opacity-60 cursor-not-allowed text-xs font-mono" />
      </div>

      <div>
        <label className="label">New Password (Min. 6 characters) *</label>
        <input
          required
          type="password"
          minLength={6}
          placeholder="••••••••"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="label">Confirm New Password *</label>
        <input
          required
          type="password"
          minLength={6}
          placeholder="••••••••"
          className="input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
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

      {status === "success" ? (
        <Link
          href="/login"
          className="btn-primary block w-full text-center py-3 text-sm font-bold"
        >
          Sign In with New Password →
        </Link>
      ) : (
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary w-full py-3 text-sm font-bold disabled:opacity-50"
        >
          {status === "loading" ? "Updating Password..." : "Set New Password"}
        </button>
      )}

      <div className="text-center pt-2">
        <Link href="/login" className="text-xs text-zinc-400 hover:text-white">
          ← Cancel and Return to Sign In
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<p className="text-center text-zinc-500">Loading form...</p>}>
      <ResetFormInner />
    </Suspense>
  );
}
