import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Logo from "../components/Logo";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";
import { getPublicGroupBySlug } from "../api/groups";
import { createContribution } from "../api/contributions";
import { useContributionPolling } from "../hooks/useContributionPolling";
import { fundTypeMeta } from "../constants/fundTypes";
import { formatKES } from "../utils/format";

export default function HarambeePublic() {
  const { slug } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);
  const [contribution, setContribution] = useState(null);
  const [error, setError] = useState("");
  const { polling, statusDetail, start, stop, checkOnce } = useContributionPolling();

  useEffect(() => {
    getPublicGroupBySlug(slug)
      .then(setGroup)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    return () => stop();
  }, [slug, stop]);

  const refreshBalance = () => getPublicGroupBySlug(slug).then(({ balance }) => setGroup((g) => ({ ...g, balance })));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { contribution: created } = await createContribution({ group_id: group.id, ...form });
      setContribution(created);
      if (created.status === "completed") {
        await refreshBalance();
      } else if (created.status === "pending") {
        start(created.id, {
          onResolved: async (result) => {
            setContribution((c) => ({ ...c, status: result.state }));
            if (result.state === "completed") await refreshBalance();
          },
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckNow = async () => {
    const result = await checkOnce(contribution.id);
    if (result.state !== "pending") {
      stop();
      setContribution((c) => ({ ...c, status: result.state }));
      if (result.state === "completed") await refreshBalance();
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center text-basket-taupe">Loading…</div>;
  if (notFound)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="text-basket-taupe">This harambee link doesn't exist or is no longer public.</p>
        <Link to="/browse" className="text-basket-green hover:underline">
          Browse public funds
        </Link>
      </div>
    );

  const meta = fundTypeMeta(group.fund_type);
  const progress = group.goal_amount ? Math.min(100, Math.round((group.balance / group.goal_amount) * 100)) : null;

  return (
    <div className="min-h-screen bg-basket-cream px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <Link to="/" className="mb-6 flex justify-center">
          <Logo withWordmark className="h-9 w-9" wordmarkClassName="text-xl" />
        </Link>

        <div className="overflow-hidden rounded-2xl border border-basket-ink/10 bg-white shadow-sm">
        <div className="relative h-36">
          <img src={meta.image} alt="" className="h-full w-full object-cover" />
          <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-basket-cream text-lg shadow">
            {meta.icon}
          </span>
        </div>
        <div className="p-6">
          <p className="label-caps text-[10px] text-basket-gold">{meta.label} · No login required</p>
          <h1 className="font-display mt-1 text-2xl font-extrabold text-basket-ink">{group.name}</h1>
          {group.description && <p className="mt-2 text-sm text-basket-taupe">{group.description}</p>}

          <p className="label-caps mt-5 text-[11px] text-basket-taupe">Fund balance</p>
          <p className="font-display text-3xl font-extrabold text-basket-green">{formatKES(group.balance)}</p>
          {group.goal_amount && (
            <>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-basket-ink/10">
                <div className="h-full rounded-full bg-basket-gold" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-xs text-basket-taupe">
                {progress}% of {formatKES(group.goal_amount)} goal
              </p>
            </>
          )}

          <hr className="my-6 border-basket-ink/10" />

          {contribution?.status === "completed" ? (
            <div className="text-center">
              <p className="text-lg font-semibold text-basket-green">Asante! Your contribution was received.</p>
              <button
                onClick={() => setContribution(null)}
                className="label-caps mt-4 text-xs text-basket-taupe hover:text-basket-ink"
              >
                Contribute again
              </button>
            </div>
          ) : contribution?.status === "failed" ? (
            <div className="text-center">
              <p className="text-lg font-semibold text-red-700">Transaction didn't go through</p>
              <p className="mt-1 text-sm text-basket-taupe">{statusDetail}</p>
              <button
                onClick={() => setContribution(null)}
                className="label-caps mt-4 text-xs text-basket-taupe hover:text-basket-ink"
              >
                Try again
              </button>
            </div>
          ) : contribution ? (
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-basket-green/30 border-t-basket-green" />
              <p className="text-lg font-semibold text-basket-ink">Check your phone</p>
              <p className="mt-1 text-sm text-basket-taupe">
                {statusDetail || "Enter your M-Pesa PIN to complete this contribution."}
              </p>
              {!polling && (
                <Button variant="outline" className="mt-4" onClick={handleCheckNow}>
                  Check status now
                </Button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="label-caps text-xs text-basket-taupe">Contribute via M-Pesa</h2>
              <TextField
                label="Your name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <TextField
                label="M-Pesa phone number"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="2547XXXXXXXX"
              />
              <TextField
                label="Amount (KES)"
                type="number"
                min="1"
                required
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
              {error && <p className="text-sm text-red-700">{error}</p>}
              <Button type="submit" loading={submitting} className="w-full py-3">
                Send STK push
              </Button>
            </form>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
