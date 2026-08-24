"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetFormInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatus("success");
      setMessage(data.message);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Reset failed");
    }
  };

  if (!token || !email) {
    return <p className="text-center text-red-400">Invalid reset link.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-md space-y-4">
      <div>
        <label className="label">New Password</label>
        <input required type="password" minLength={6} className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {message && <p className={`text-sm ${status === "success" ? "text-emerald-400" : "text-red-400"}`}>{message}</p>}
      <button type="submit" disabled={status === "loading"} className="btn-primary w-full">Update Password</button>
      {status === "success" && <Link href="/login" className="btn-secondary block text-center">Go to Login</Link>}
    </form>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense>
      <ResetFormInner />
    </Suspense>
  );
}
