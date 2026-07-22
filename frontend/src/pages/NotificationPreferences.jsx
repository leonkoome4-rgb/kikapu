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
      className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-basket-green" : "bg-basket-ink/15"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
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

  if (loading) return <p className="text-basket-taupe">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="label-caps text-xs text-basket-taupe">Settings</p>
        <h1 className="font-display text-3xl font-extrabold text-basket-ink">Notification preferences</h1>
      </div>

      <Card>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-basket-ink">SMS notifications</p>
            <p className="text-xs text-basket-taupe">
              Sent via your configured SMS provider. Carrier SMS rates may apply — typically KES 1–2 per message.
            </p>
          </div>
          <Toggle checked={prefs.sms_notifications} onChange={(v) => toggle("sms_notifications", v)} />
        </div>
        <hr className="border-basket-ink/10" />
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-basket-ink">Email notifications</p>
            <p className="text-xs text-basket-taupe">Free — sent for contributions, claim decisions, and password resets.</p>
          </div>
          <Toggle checked={prefs.email_notifications} onChange={(v) => toggle("email_notifications", v)} />
        </div>
        {saving && <p className="mt-3 text-xs text-basket-taupe">Saving…</p>}
      </Card>

      <div>
        <h2 className="label-caps mb-3 text-xs text-basket-taupe">Recent notifications</h2>
        <Card>
          {notifications.length === 0 ? (
            <p className="text-sm text-basket-taupe">No notifications sent yet.</p>
          ) : (
            <ul className="divide-y divide-basket-ink/10">
              {notifications.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm text-basket-ink">{n.message}</p>
                    <p className="mt-1 text-xs text-basket-taupe">
                      {n.channel.toUpperCase()} · {formatDateTime(n.sent_at)}
                    </p>
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
