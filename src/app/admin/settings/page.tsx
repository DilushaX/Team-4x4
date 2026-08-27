"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

const SETTING_FIELDS = [
  { key: "business_name", label: "Business Name" },
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address" },
  { key: "facebook", label: "Facebook URL" },
  { key: "instagram", label: "Instagram URL" },
  { key: "tiktok", label: "TikTok URL" },
  { key: "youtube", label: "YouTube URL" },
  { key: "business_hours", label: "Business Hours" },
  { key: "delivery_charges", label: "Default Delivery Charge (LKR)" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => setSettings(d.settings || {}));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <AdminPageHeader section="settings" title="Settings" description="Site configuration" />
      <form onSubmit={handleSave} className="card max-w-xl space-y-4">
        {SETTING_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input
              className="input"
              value={settings[key] || ""}
              onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
            />
          </div>
        ))}
        <button type="submit" className="btn-primary">Save Settings</button>
        {saved && <p className="text-sm text-emerald-400">Settings saved!</p>}
      </form>
    </>
  );
}
