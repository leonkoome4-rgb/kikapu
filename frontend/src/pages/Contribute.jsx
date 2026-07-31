import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { getGroup } from "../api/groups";
import { createContribution } from "../api/contributions";
import { useContributionPolling } from "../hooks/useContributionPolling";
import { fundTypeMeta } from "../constants/fundTypes";
import { formatKES } from "../utils/format";

export default function Contribute() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contribution, setContribution] = useState(null);
  const { polling, statusDetail, start, stop, checkOnce } = useContributionPolling();

  useEffect(() => {
    getGroup(id).then(setGroup);
    return () => stop();
  }, [id, stop]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { contribution: created } = await createContribution({
        group_id: Number(id),
        amount: Number(amount),
        phone,
      });
      setContribution(created);
      if (created.status === "pending") {
        start(created.id, {
          onResolved: (result) => setContribution((c) => ({ ...c, status: result.state })),
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Contribution failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckNow = async () => {
    const result = await checkOnce(contribution.id);
    if (result.state !== "pending") {
      stop();
      setContribution((c) => ({ ...c, status: result.state }));
    }
  };

  if (!group) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-basket-green/30 border-t-basket-green" /></div>;
  const meta = fundTypeMeta(group.fund_type);

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-in">
      <Link to={`/groups/${id}`} className="inline-flex items-center gap-1 text-xs text-basket-taupe transition hover:text-basket-ink">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
        Back to {group.name}
      </Link>

      <Card>
        <span className="text-2xl">{meta.icon}</span>
        <h1 className="font-display mt-2 text-2xl font-extrabold tracking-tight text-basket-ink">Contribute to {group.name}</h1>
        <p className="mt-1 text-sm text-basket-taupe">Current balance: {formatKES(group.balance)}</p>

        <hr className="my-6 border-basket-ink/8" />

        {contribution?.status === "completed" ? (
          <div className="py-4 text-center animate-scale-in">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <p className="text-lg font-semibold text-basket-green">Asante! Contribution received.</p>
            {contribution.mpesa_ref && <p className="mt-1 text-sm text-basket-taupe">Ref: {contribution.mpesa_ref}</p>}
            <Button variant="outline" className="mt-5" onClick={() => navigate(`/groups/${id}`)}>
              Back to fund
            </Button>
          </div>
        ) : contribution?.status === "failed" ? (
          <div className="py-4 text-center animate-scale-in">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            </div>
            <p className="text-lg font-semibold text-red-700">Transaction didn't go through</p>
            <p className="mt-1 text-sm text-basket-taupe">{statusDetail}</p>
            <Button variant="outline" className="mt-5" onClick={() => { setContribution(null); setError(""); }}>
              Try again
            </Button>
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
            <TextField label="M-Pesa phone number" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="2547XXXXXXXX" />
            <TextField label="Amount (KES)" type="number" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)} />
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {error}
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full py-3">
              Send STK push
            </Button>
            <p className="text-center text-xs text-basket-taupe">You'll get a prompt on your phone to enter your M-Pesa PIN (sandbox).</p>
          </form>
        )}
      </Card>
    </div>
  );
}
