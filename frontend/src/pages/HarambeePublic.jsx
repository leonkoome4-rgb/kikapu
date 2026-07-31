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

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-basket-green/30 border-t-basket-green" />
      </div>
    );
  if (notFound)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-basket-taupe">This harambee link doesn't exist or is no longer public.</p>
        <Link to="/browse" className="font-medium text-basket-green transition hover:text-basket-green-light">
          Browse public funds &rarr;
        </Link>
      </div>
    );

  const meta = fundTypeMeta(group.fund_type);
  const progress = group.goal_amount ? Math.min(100, Math.round((group.balance / group.goal_amount) * 100)) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-basket-cream via-white to-basket-mist px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-lg animate-fade-in-up">
        <Link to="/" className="mb-6 flex justify-center transition hover:opacity-80">
          <Logo withWordmark className="h-9 w-9" wordmarkClassName="text-xl" />
        </Link>

        <div className="overflow-hidden rounded-2xl border border-basket-ink/8 bg-white shadow-lg shadow-basket-ink/5">
          <div className="relative h-36 overflow-hidden">
            <img src={meta.image} alt="" className="h-full w-full object-cover" />
            <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lg shadow-sm backdrop-blur-sm">
              {meta.icon}
            </span>
          </div>
          <div className="p-6">
            <p className="label-caps inline-flex rounded-full bg-basket-gold/10 px-2.5 py-1 text-basket-gold">{meta.label} · No login required</p>
            <h1 className="font-display mt-2 text-2xl font-extrabold tracking-tight text-basket-ink">{group.name}</h1>
            {group.description && <p className="mt-2 text-sm leading-relaxed text-basket-taupe">{group.description}</p>}

            <p className="label-caps mt-6 text-basket-taupe">Fund balance</p>
            <p className="font-display text-3xl font-extrabold text-basket-green">{formatKES(group.balance)}</p>
            {group.goal_amount && (
              <>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-basket-ink/10">
                  <div className="h-full rounded-full bg-basket-gold transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-basket-taupe">{progress}% of {formatKES(group.goal_amount)} goal</p>
              </>
            )}

            <hr className="my-6 border-basket-ink/8" />

            {contribution?.status === "completed" ? (
              <div className="py-4 text-center animate-scale-in">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <p className="text-lg font-semibold text-basket-green">Asante! Your contribution was received.</p>
                <button onClick={() => setContribution(null)} className="label-caps mt-4 text-xs text-basket-taupe transition hover:text-basket-ink">
                  Contribute again
                </button>
              </div>
            ) : contribution?.status === "failed" ? (
              <div className="py-4 text-center animate-scale-in">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                </div>
                <p className="text-lg font-semibold text-red-700">Transaction didn't go through</p>
                <p className="mt-1 text-sm text-basket-taupe">{statusDetail}</p>
                <button onClick={() => setContribution(null)} className="label-caps mt-4 text-xs text-basket-taupe transition hover:text-basket-ink">
                  Try again
                </button>
              </div>
            ) : contribution ? (
              <div className="py-4 text-center animate-scale-in">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-basket-green/20 border-t-basket-green" />
                <p className="text-lg font-semibold text-basket-ink">Check your phone</p>
                <p className="mt-1 text-sm text-basket-taupe">{statusDetail || "Enter your M-Pesa PIN to complete this contribution."}</p>
                {!polling && (
                  <Button variant="outline" className="mt-5" onClick={handleCheckNow}>
                    Check status now
                  </Button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="label-caps text-basket-taupe">Contribute via M-Pesa</h2>
                <TextField label="Your name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                <TextField label="M-Pesa phone number" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="2547XXXXXXXX" />
                <TextField label="Amount (KES)" type="number" min="1" required value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {error}
                  </div>
                )}
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
