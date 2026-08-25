"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const justRegistered = searchParams.get("registered") === "1";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please check your credentials.");
        setLoading(false);
        return;
      }

      window.location.href = callbackUrl;
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-md space-y-4 border border-zinc-800 bg-zinc-900/90 shadow-2xl p-6 md:p-8">
      {justRegistered && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-xs text-green-400 font-semibold text-center">
          ✓ Account created successfully! Please sign in below.
        </div>
      )}

      <div>
        <label className="label">Email Address</label>
        <input
          required
          type="email"
          placeholder="your.email@example.com"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="label">Password</label>
          <Link href="/forgot-password" className="text-xs text-green-400 hover:underline">
            Forgot password?
          </Link>
        </div>
        <input
          required
          type="password"
          placeholder="••••••••"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 font-medium">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 text-sm font-bold disabled:opacity-50 mt-1"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      {/* Quick Demo Access Badges */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 text-xs text-zinc-400 space-y-2">
        <p className="font-semibold text-zinc-300">Quick Demo Accounts:</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fillCredentials("upulprajath@gmail.com", "upulprajath")}
            className="rounded bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-green-400 hover:bg-zinc-700 transition"
          >
            Admin (Upul Prajath)
          </button>
          <button
            type="button"
            onClick={() => fillCredentials("kasun@email.lk", "customer")}
            className="rounded bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700 transition"
          >
            Customer (kasun@email.lk)
          </button>
        </div>
      </div>

      <div className="pt-2 text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-green-400 font-semibold hover:underline">
          Create Account
        </Link>
      </div>
    </form>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<p className="text-center text-zinc-500">Loading...</p>}>
      <LoginFormInner />
    </Suspense>
  );
}
