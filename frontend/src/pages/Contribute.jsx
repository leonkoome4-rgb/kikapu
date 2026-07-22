import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { getGroup } from "../api/groups";
import { createContribution } from "../api/contributions";
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
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    getGroup(id).then(setGroup);
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { contribution } = await createContribution({ group_id: Number(id), amount: Number(amount), phone });
      setSuccess(contribution);
    } catch (err) {
      setError(err.response?.data?.error || "Contribution failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!group) return <p className="text-basket-taupe">Loading…</p>;
  const meta = fundTypeMeta(group.fund_type);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link to={`/groups/${id}`} className="text-xs text-basket-taupe hover:text-basket-ink">
        ← Back to {group.name}
      </Link>

      <Card>
        <span className="text-2xl">{meta.icon}</span>
        <h1 className="font-display mt-2 text-2xl font-extrabold text-basket-ink">Contribute to {group.name}</h1>
        <p className="mt-1 text-sm text-basket-taupe">Current balance: {formatKES(group.balance)}</p>

        <hr className="my-6 border-basket-ink/10" />

        {success ? (
          <div className="text-center">
            <p className="text-lg font-semibold text-basket-green">Asante! Contribution received.</p>
            <p className="mt-1 text-sm text-basket-taupe">Ref: {success.mpesa_ref}</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate(`/groups/${id}`)}>
              Back to fund
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="M-Pesa phone number"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="2547XXXXXXXX"
            />
            <TextField
              label="Amount (KES)"
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {error && <p className="text-sm text-red-700">{error}</p>}
            <Button type="submit" loading={loading} className="w-full py-3">
              Send STK push
            </Button>
            <p className="text-center text-xs text-basket-taupe">
              You'll get a prompt on your phone to enter your M-Pesa PIN (sandbox).
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}
