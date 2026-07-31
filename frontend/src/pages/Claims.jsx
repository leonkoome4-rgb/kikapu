import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import { useAuth } from "../context/AuthContext";
import { getGroup } from "../api/groups";
import { fileClaim, groupClaims, reviewClaim, withdrawClaim } from "../api/claims";
import { fundTypeMeta } from "../constants/fundTypes";
import { formatKES, formatDateTime } from "../utils/format";

export default function Claims() {
  const { id } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => Promise.all([getGroup(id), groupClaims(id)]).then(([g, cl]) => {
    setGroup(g);
    setClaims(cl);
  });

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [id]);

  if (loading || !group)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-basket-green/30 border-t-basket-green" />
      </div>
    );

  const meta = fundTypeMeta(group.fund_type);
  const isAdmin = group.admin_id === user?.id;

  const handleFile = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await fileClaim({ group_id: Number(id), amount_requested: Number(amount), reason });
      setAmount("");
      setReason("");
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not file claim.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (claimId, status) => {
    setBusyId(claimId);
    try {
      await reviewClaim(claimId, status);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const handleWithdraw = async (claimId) => {
    setBusyId(claimId);
    try {
      await withdrawClaim(claimId);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <Link to={`/groups/${id}`} className="inline-flex items-center gap-1 text-xs text-basket-taupe transition hover:text-basket-ink">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
          Back to {group.name}
        </Link>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-basket-ink">Claims</h1>
        {meta.fastTracked && (
          <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-basket-gold/10 px-3 py-1 text-sm text-basket-gold">
            <span>&#9889;</span> {meta.label} claims are fast-tracked — approved automatically for members.
          </p>
        )}
      </div>

      {!isAdmin && (
        <Card>
          <h2 className="label-caps mb-5 text-basket-taupe">File a claim</h2>
          <form onSubmit={handleFile} className="space-y-4">
            <TextField label="Amount requested (KES)" type="number" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)} />
            <label className="block">
              <span className="label-caps mb-1.5 block text-basket-taupe">Reason</span>
              <textarea rows={3} required value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-xl border border-basket-ink/15 bg-white px-4 py-2.5 text-basket-ink placeholder:text-basket-taupe/50 transition-all duration-200 focus:border-basket-green focus:outline-none focus:ring-4 focus:ring-basket-green/15" />
            </label>
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {error}
              </div>
            )}
            <Button type="submit" loading={submitting} className="w-full py-3">
              Submit claim
            </Button>
          </form>
        </Card>
      )}

      <div>
        <h2 className="label-caps mb-4 text-basket-taupe">{isAdmin ? "Review claims" : "All claims"}</h2>
        {claims.length === 0 ? (
          <Card className="py-10 text-center text-basket-taupe">No claims filed yet.</Card>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <Card key={claim.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold text-basket-ink">{formatKES(claim.amount_requested)}</p>
                    <p className="mt-1 text-sm leading-relaxed text-basket-taupe">{claim.reason}</p>
                    <p className="mt-1.5 text-xs text-basket-taupe">Filed {formatDateTime(claim.created_at)}</p>
                  </div>
                  <Badge status={claim.status} />
                </div>
                {isAdmin && claim.status === "pending" && (
                  <div className="mt-5 flex gap-3">
                    <Button variant="primary" loading={busyId === claim.id} onClick={() => handleReview(claim.id, "approved")}>
                      Approve
                    </Button>
                    <Button variant="danger" loading={busyId === claim.id} onClick={() => handleReview(claim.id, "rejected")}>
                      Reject
                    </Button>
                  </div>
                )}
                {!isAdmin && claim.user_id === user?.id && claim.status === "pending" && (
                  <Button variant="outline" className="mt-5" loading={busyId === claim.id} onClick={() => handleWithdraw(claim.id)}>
                    Withdraw claim
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
