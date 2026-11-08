"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Field } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";

interface Props {
  settingsMap: Record<string, unknown>;
}

export default function MarketingClient({ settingsMap }: Props) {
  const { success, error } = useToast();
  const [saving, setSaving] = useState<string | null>(null);

  // Marketing & Tracking settings
  const [facebookPixel, setFacebookPixel] = useState(String(settingsMap["facebook_pixel_id"] ?? ""));
  const [googleAnalytics, setGoogleAnalytics] = useState(String(settingsMap["google_analytics_id"] ?? ""));

  const popupSettingsObj = (settingsMap["popup_settings"] ?? {}) as Record<string, unknown>;
  const [popupEnabled, setPopupEnabled] = useState(popupSettingsObj.enabled === true);
  const [popupDelay, setPopupDelay] = useState(String(popupSettingsObj.delay ?? "5"));

  async function saveSetting(key: string, value: unknown, label: string) {
    setSaving(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      success(`${label} saved`);
    } catch (e) {
      error("Save failed", (e as Error).message);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Meta Pixel Card */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <h3 className="font-bold text-lg">Meta Pixel (إعلانات فيسبوك)</h3>
        </div>
        <Field label="رقم Meta Pixel / Dataset ID">
          <input
            type="text"
            className="input-base"
            value={facebookPixel}
            onChange={(e) => setFacebookPixel(e.target.value)}
            placeholder="e.g. 123456789012345"
          />
        </Field>
        <button
          onClick={() => saveSetting("facebook_pixel_id", facebookPixel, "Meta Pixel ID")}
          disabled={saving === "facebook_pixel_id"}
          className="btn-primary text-sm w-full sm:w-auto"
        >
          <Save className="w-4 h-4" />
          {saving === "facebook_pixel_id" ? "Saving..." : "حفظ التعديلات / Save Changes"}
        </button>
      </div>

      {/* Google Analytics Card */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📈</span>
          <h3 className="font-bold text-lg">Google Analytics</h3>
        </div>
        <Field label="معرّف Google Analytics (Measurement ID)">
          <input
            type="text"
            className="input-base"
            value={googleAnalytics}
            onChange={(e) => setGoogleAnalytics(e.target.value)}
            placeholder="e.g. G-XXXXXXXXXX"
          />
        </Field>
        <button
          onClick={() => saveSetting("google_analytics_id", googleAnalytics, "Google Analytics ID")}
          disabled={saving === "google_analytics_id"}
          className="btn-primary text-sm w-full sm:w-auto"
        >
          <Save className="w-4 h-4" />
          {saving === "google_analytics_id" ? "Saving..." : "حفظ التعديلات / Save Changes"}
        </button>
      </div>

      {/* Visitor Popup Card */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <h3 className="font-bold text-lg">popup جمع بيانات الزوار</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="تفعيل popup التسجيل">
            <select
              className="input-base"
              value={popupEnabled ? "true" : "false"}
              onChange={(e) => setPopupEnabled(e.target.value === "true")}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </Field>
          <Field label="التأخير قبل ظهور popup (ثانية)">
            <input
              type="number"
              className="input-base"
              value={popupDelay}
              onChange={(e) => setPopupDelay(e.target.value)}
              placeholder="e.g. 5"
              min="0"
            />
          </Field>
        </div>
        <button
          onClick={() => saveSetting("popup_settings", { enabled: popupEnabled, delay: Number(popupDelay) }, "Popup Settings")}
          disabled={saving === "popup_settings"}
          className="btn-primary text-sm w-full sm:w-auto"
        >
          <Save className="w-4 h-4" />
          {saving === "popup_settings" ? "Saving..." : "حفظ التعديلات / Save Changes"}
        </button>
      </div>
    </div>
  );
}
