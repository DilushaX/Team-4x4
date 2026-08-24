"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

type Message = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  vehicle: string | null;
  service: string | null;
  message: string;
  status: string;
  created_at: string;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);

  const load = () => fetch("/api/admin/messages").then((r) => r.json()).then((d) => setMessages(d.messages || []));
  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_read", id }),
    });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete message?")) return;
    await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setSelected(null);
    load();
  };

  return (
    <>
      <AdminPageHeader section="messages" title="Messages" description="Contact form inquiries" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          {messages.map((m) => (
            <div
              key={m.id}
              onClick={() => { setSelected(m); if (m.status === "unread") markRead(m.id); }}
              className={`card cursor-pointer py-3 transition hover:border-green-500/30 ${m.status === "unread" ? "border-green-500/20" : ""}`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">{m.name}</p>
                {m.status === "unread" && <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">New</span>}
              </div>
              <p className="text-xs text-zinc-500">{m.email} · {new Date(m.created_at).toLocaleString()}</p>
              <p className="mt-1 line-clamp-1 text-sm text-zinc-400">{m.message}</p>
            </div>
          ))}
        </div>

        {selected && (
          <div className="card sticky top-6">
            <h2 className="font-display font-bold text-white">{selected.name}</h2>
            <p className="text-sm text-zinc-400">{selected.email}</p>
            {selected.phone && <p className="text-sm text-zinc-400">{selected.phone}</p>}
            {selected.vehicle && <p className="text-sm text-zinc-400">Vehicle: {selected.vehicle}</p>}
            {selected.service && <p className="text-sm text-zinc-400">Service: {selected.service}</p>}
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">{selected.message}</p>
            <button type="button" onClick={() => handleDelete(selected.id)} className="btn-danger mt-4 text-xs">Delete</button>
          </div>
        )}
      </div>
    </>
  );
}
