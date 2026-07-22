import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";
import { FUND_TYPES } from "../constants/fundTypes";
import { createGroup } from "../api/groups";

export default function CreateFund() {
  const navigate = useNavigate();
  const [fundType, setFundType] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selected = FUND_TYPES.find((f) => f.value === fundType);
  const isPublicLocked = selected?.forcePublic;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fundType) {
      setError("Choose a fund type to continue.");
      return;
    }
    setLoading(true);
    try {
      const group = await createGroup({
        name,
        fund_type: fundType,
        description,
        goal_amount: selected?.goalBased && goalAmount ? Number(goalAmount) : null,
        is_public: isPublicLocked ? true : isPublic,
      });
      navigate(`/groups/${group.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Could not create the fund. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="label-caps text-xs text-basket-taupe">New basket</p>
        <h1 className="font-display text-3xl font-extrabold text-basket-ink">Create a fund</h1>
      </div>

      <div>
        <h2 className="label-caps mb-3 text-xs text-basket-taupe">1. Choose a fund type</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FUND_TYPES.map((fund) => (
            <button
              key={fund.value}
              type="button"
              onClick={() => {
                setFundType(fund.value);
                if (fund.forcePublic) setIsPublic(true);
              }}
              className={`rounded-2xl border p-4 text-left transition ${
                fundType === fund.value
                  ? "border-basket-green bg-basket-green/5 ring-2 ring-basket-green/30"
                  : "border-basket-ink/10 bg-white hover:border-basket-green/40"
              }`}
            >
              <span className="text-2xl">{fund.icon}</span>
              <p className="font-display mt-2 font-bold text-basket-ink">{fund.label}</p>
              <p className="mt-1 text-xs text-basket-taupe">{fund.description}</p>
            </button>
          ))}
        </div>
      </div>

      <Card>
        <h2 className="label-caps mb-4 text-xs text-basket-taupe">2. Fund details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Fund name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Umoja Chama"
          />
          <label className="block">
            <span className="label-caps mb-1.5 block text-[11px] text-basket-taupe">Description</span>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-basket-ink/15 bg-white px-3.5 py-2.5 text-basket-ink focus:border-basket-green focus:outline-none focus:ring-2 focus:ring-basket-green/20"
              placeholder="What's this fund for?"
            />
          </label>

          {selected?.goalBased && (
            <TextField
              label="Goal amount (KES)"
              type="number"
              min="1"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              placeholder="e.g. 300000"
            />
          )}

          {selected?.publicOptional && (
            <label className="flex items-center gap-2 text-sm text-basket-ink">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              Make this a public contribution link (no login required to contribute)
            </label>
          )}

          {isPublicLocked && (
            <p className="rounded-lg bg-basket-gold/10 p-3 text-xs text-basket-ink">
              Harambee funds are always public — anyone with the link can contribute without an account.
            </p>
          )}

          {error && <p className="text-sm text-red-700">{error}</p>}
          <Button type="submit" loading={loading} className="w-full py-3">
            Create fund
          </Button>
        </form>
      </Card>
    </div>
  );
}
