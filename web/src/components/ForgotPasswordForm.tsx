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
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatus("success");
      setMessage(data.message);
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Request failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-md space-y-4">
      <div>
        <label className="label">Email</label>
        <input required type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {message && <p className={`text-sm ${status === "success" ? "text-emerald-400" : "text-red-400"}`}>{message}</p>}
      {resetUrl && (
        <p className="break-all text-xs text-zinc-500">
          Dev reset link: <Link href={resetUrl} className="text-green-400">{resetUrl}</Link>
        </p>
      )}
      <button type="submit" disabled={status === "loading"} className="btn-primary w-full">Send Reset Link</button>
      <Link href="/login" className="block text-center text-sm text-zinc-400 hover:text-white">Back to login</Link>
    </form>
  );
}
