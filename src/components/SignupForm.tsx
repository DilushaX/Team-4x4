"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    vehicle_model: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      // Auto sign-in upon registration
      const signinRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signinRes?.error) {
        window.location.href = "/login?registered=1";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-lg space-y-4 border border-zinc-800 bg-zinc-900/90 shadow-2xl p-6 md:p-8">
      <div>
        <label className="label">Full Name *</label>
        <input
          required
          placeholder="Kasun Silva"
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div>
        <label className="label">Email Address *</label>
        <input
          required
          type="email"
          placeholder="kasun@email.lk"
          className="input"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      <div>
        <label className="label">Password (Minimum 6 characters) *</label>
        <input
          required
          type="password"
          minLength={6}
          placeholder="••••••••"
          className="input"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Phone / WhatsApp (Optional)</label>
          <input
            type="tel"
            placeholder="+94 77 123 4567"
            className="input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Defender / 4x4 Model (Optional)</label>
          <input
            placeholder="Defender 110 TD5"
            className="input"
            value={form.vehicle_model}
            onChange={(e) => setForm({ ...form, vehicle_model: e.target.value })}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 font-medium">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 text-sm font-bold disabled:opacity-50 mt-2"
      >
        {loading ? "Creating Account..." : "Create Customer Account"}
      </button>

      <p className="text-center text-sm text-zinc-400 pt-2">
        Already have an account?{" "}
        <Link href="/login" className="text-green-400 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
