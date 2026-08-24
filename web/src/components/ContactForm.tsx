"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ContactForm() {
  const { data: session } = useSession();
  const [form, setForm] = useState({ name: "", email: "", phone: "", vehicle: "", service: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => setSettings(d.settings || {})).catch(() => {});
  }, []);

  useEffect(() => {
    if (session?.user) {
      setForm((f) => ({
        ...f,
        name: session.user.name || f.name,
        email: session.user.email || f.email,
      }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setForm({ name: "", email: "", phone: "", vehicle: "", service: "", message: "" });
      } else {
        setStatus("error");
        setMessage(data.message);
      }
    } catch {
      setStatus("error");
      setMessage("Network error.");
    }
  };

  const whatsapp = settings.whatsapp || settings.whatsapp_number || "+94 70 393 9459";

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="card space-y-4">
        <h2 className="font-display text-lg font-bold text-white">Workshop Info</h2>
        <p className="text-sm text-zinc-400">{settings.address || "Colombo, Sri Lanka"}</p>
        <p className="text-sm text-zinc-400">{settings.phone || whatsapp}</p>
        <p className="text-sm text-zinc-400">{settings.email || "info@team4x4.com"}</p>
        <p className="text-sm text-zinc-400">{settings.business_hours || "Mon–Sat"}</p>
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex mt-2"
        >
          WhatsApp Support
        </a>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="font-display text-lg font-bold text-white">Send Inquiry</h2>
        <div>
          <label className="label">Name *</label>
          <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Email *</label>
            <input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Vehicle</label>
            <input className="input" placeholder="Defender 110" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} />
          </div>
          <div>
            <label className="label">Service</label>
            <input className="input" placeholder="Restoration, Suspension..." value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Message *</label>
          <textarea required rows={4} className="input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
        {message && (
          <p className={`text-sm ${status === "success" ? "text-emerald-400" : "text-red-400"}`}>{message}</p>
        )}
        <button type="submit" disabled={status === "loading"} className="btn-primary w-full disabled:opacity-50">
          {status === "loading" ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
