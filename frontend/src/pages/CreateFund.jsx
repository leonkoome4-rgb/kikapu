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
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-in">
      <div>
        <p className="label-caps text-basket-taupe">New basket</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-basket-ink">Create a fund</h1>
      </div>

      <div>
        <h2 className="label-caps mb-4 text-basket-taupe">1. Choose a fund type</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FUND_TYPES.map((fund) => (
            <button
              key={fund.value}
              type="button"
              onClick={() => {
                setFundType(fund.value);
                if (fund.forcePublic) setIsPublic(true);
              }}
              className={`overflow-hidden rounded-2xl border text-left transition-all duration-200 ${
                fundType === fund.value
                  ? "border-basket-green bg-basket-green/5 ring-2 ring-basket-green/30 shadow-md"
                  : "border-basket-ink/10 bg-white shadow-sm hover:border-basket-green/40 hover:shadow-md"
              }`}
            >
              <div className="relative h-20 overflow-hidden">
                <img src={fund.image} alt="" className="h-full w-full object-cover" />
                <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-base shadow-sm backdrop-blur-sm">
                  {fund.icon}
                </span>
              </div>
              <div className="p-4">
                <p className="font-display font-bold text-basket-ink">{fund.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-basket-taupe">{fund.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Card>
        <h2 className="label-caps mb-5 text-basket-taupe">2. Fund details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Fund name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Umoja Chama"
          />
          <label className="block">
            <span className="label-caps mb-1.5 block text-basket-taupe">Description</span>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-basket-ink/15 bg-white px-4 py-2.5 text-basket-ink placeholder:text-basket-taupe/50 transition-all duration-200 focus:border-basket-green focus:outline-none focus:ring-4 focus:ring-basket-green/15"
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
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-basket-ink/10 bg-white p-4 text-sm text-basket-ink transition hover:border-basket-green/40">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-basket-ink/20 text-basket-green focus:ring-basket-green/30"
              />
              <span>Make this a public contribution link (no login required to contribute)</span>
            </label>
          )}

          {isPublicLocked && (
            <div className="flex items-start gap-3 rounded-xl bg-basket-gold/10 p-4 text-sm text-basket-ink">
              <span className="mt-0.5 shrink-0 text-basket-gold">&#9432;</span>
              <p>Harambee funds are always public — anyone with the link can contribute without an account.</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
          <Button type="submit" loading={loading} className="w-full py-3">
            Create fund
          </Button>
        </form>
      </Card>
    </div>
  );
}
