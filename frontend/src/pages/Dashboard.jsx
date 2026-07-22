import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { listMyGroups } from "../api/groups";
import { myContributions } from "../api/contributions";
import { myClaims } from "../api/claims";
import { fundTypeMeta } from "../constants/fundTypes";
import { formatKES, formatDate } from "../utils/format";

export default function Dashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listMyGroups(), myContributions(), myClaims()])
      .then(([g, c, cl]) => {
        setGroups(g);
        setContributions(c);
        setClaims(cl);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-basket-taupe">Loading your baskets…</p>;

  const totalBalance = groups.reduce((sum, g) => sum + Number(g.balance || 0), 0);
  const totalContributed = contributions
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const pendingClaims = claims.filter((c) => c.status === "pending").length;

  const activity = [
    ...contributions.map((c) => ({ type: "contribution", ...c, date: c.created_at })),
    ...claims.map((c) => ({ type: "claim", ...c, date: c.created_at })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <p className="label-caps text-xs text-basket-taupe">Welcome back</p>
        <h1 className="font-display text-3xl font-extrabold text-basket-ink">{user?.name}</h1>
      </div>

      <Card className="bg-basket-green text-basket-cream">
        <p className="label-caps text-xs text-basket-gold-light">Fund Balance (all baskets)</p>
        <p className="font-display mt-2 text-4xl font-extrabold sm:text-5xl">{formatKES(totalBalance)}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/groups/create">
            <Button variant="gold">+ Create a fund</Button>
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="label-caps text-[11px] text-basket-taupe">Baskets joined</p>
          <p className="font-display mt-1 text-3xl font-bold text-basket-ink">{groups.length}</p>
        </Card>
        <Card>
          <p className="label-caps text-[11px] text-basket-taupe">Total contributed</p>
          <p className="font-display mt-1 text-3xl font-bold text-basket-ink">{formatKES(totalContributed)}</p>
        </Card>
        <Card>
          <p className="label-caps text-[11px] text-basket-taupe">Pending claims</p>
          <p className="font-display mt-1 text-3xl font-bold text-basket-ink">{pendingClaims}</p>
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="label-caps text-xs text-basket-taupe">My baskets</h2>
          <Link to="/browse" className="text-xs text-basket-green hover:underline">
            Browse public funds
          </Link>
        </div>
        {groups.length === 0 ? (
          <Card className="text-center text-basket-taupe">
            You haven't joined a basket yet.{" "}
            <Link to="/groups/create" className="text-basket-green hover:underline">
              Create one now
            </Link>
            .
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
              const meta = fundTypeMeta(group.fund_type);
              return (
                <Link key={group.id} to={`/groups/${group.id}`}>
                  <Card className="h-full transition hover:border-basket-green">
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{meta.icon}</span>
                      <span className="label-caps text-[10px] text-basket-gold">{meta.label}</span>
                    </div>
                    <h3 className="font-display mt-2 text-lg font-bold text-basket-ink">{group.name}</h3>
                    <p className="mt-2 text-2xl font-bold text-basket-green">{formatKES(group.balance)}</p>
                    <p className="mt-1 text-xs text-basket-taupe">{group.member_count} members</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="label-caps mb-3 text-xs text-basket-taupe">Recent activity</h2>
        <Card>
          {activity.length === 0 ? (
            <p className="text-sm text-basket-taupe">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-basket-ink/10">
              {activity.map((item) => (
                <li key={`${item.type}-${item.id}`} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-basket-ink">
                      {item.type === "contribution" ? "Contribution" : "Claim"} · {formatKES(item.amount ?? item.amount_requested)}
                    </p>
                    <p className="text-xs text-basket-taupe">{formatDate(item.date)}</p>
                  </div>
                  <Badge status={item.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
