import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { getPreferences, listNotifications, updatePreferences } from "../api/notifications";
import { formatDateTime } from "../utils/format";

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-all duration-200 ${checked ? "bg-basket-green" : "bg-basket-ink/15"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200 ${
          checked ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState({ sms_notifications: true, email_notifications: true });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getPreferences(), listNotifications()])
      .then(([p, n]) => {
        setPrefs(p);
        setNotifications(n);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (field, value) => {
    const next = { ...prefs, [field]: value };
    setPrefs(next);
    setSaving(true);
    try {
      await updatePreferences({ [field]: value });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-basket-green/30 border-t-basket-green" /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-in">
      <div>
        <p className="label-caps text-basket-taupe">Settings</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-basket-ink">Notification preferences</h1>
      </div>

      <Card>
        <div className="flex items-center justify-between py-3">
          <div className="pr-4">
            <p className="font-medium text-basket-ink">SMS notifications</p>
            <p className="mt-0.5 text-xs leading-relaxed text-basket-taupe">
              Sent via your configured SMS provider. Carrier SMS rates may apply — typically KES 1–2 per message.
            </p>
          </div>
          <Toggle checked={prefs.sms_notifications} onChange={(v) => toggle("sms_notifications", v)} />
        </div>
        <hr className="border-basket-ink/8" />
        <div className="flex items-center justify-between py-3">
          <div className="pr-4">
            <p className="font-medium text-basket-ink">Email notifications</p>
            <p className="mt-0.5 text-xs leading-relaxed text-basket-taupe">Free — sent for contributions, claim decisions, and password resets.</p>
          </div>
          <Toggle checked={prefs.email_notifications} onChange={(v) => toggle("email_notifications", v)} />
        </div>
        {saving && <p className="mt-4 text-xs text-basket-taupe animate-pulse-soft">Saving…</p>}
      </Card>

      <div>
        <h2 className="label-caps mb-4 text-basket-taupe">Recent notifications</h2>
        <Card>
          {notifications.length === 0 ? (
            <p className="py-6 text-center text-sm text-basket-taupe">No notifications sent yet.</p>
          ) : (
            <ul className="divide-y divide-basket-ink/8">
              {notifications.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-3 py-3.5 transition hover:bg-basket-mist/50 first:-mt-1.5 first:rounded-t-lg last:rounded-b-lg">
                  <div>
                    <p className="text-sm text-basket-ink">{n.message}</p>
                    <p className="mt-0.5 text-xs text-basket-taupe">{n.channel.toUpperCase()} · {formatDateTime(n.sent_at)}</p>
                  </div>
                  <Badge status={n.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
