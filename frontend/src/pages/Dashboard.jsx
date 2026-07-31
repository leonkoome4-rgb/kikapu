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

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-basket-green/30 border-t-basket-green" />
      </div>
    );

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
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="label-caps text-basket-taupe">Welcome back</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-basket-ink">{user?.name}</h1>
      </div>

      <Card className="relative overflow-hidden bg-gradient-to-br from-basket-green to-basket-green-dark text-basket-cream">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-basket-cream/5" />
        <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-6 translate-y-6 rounded-full bg-basket-cream/5" />
        <p className="label-caps relative text-basket-gold-light">Fund Balance (all baskets)</p>
        <p className="font-display relative mt-2 text-4xl font-extrabold sm:text-5xl">{formatKES(totalBalance)}</p>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <Link to="/groups/create">
            <Button variant="gold" className="shadow-lg shadow-basket-ink/20">
              + Create a fund
            </Button>
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card hover>
          <p className="label-caps text-basket-taupe">Baskets joined</p>
          <p className="font-display mt-1.5 text-3xl font-bold text-basket-ink">{groups.length}</p>
        </Card>
        <Card hover>
          <p className="label-caps text-basket-taupe">Total contributed</p>
          <p className="font-display mt-1.5 text-3xl font-bold text-basket-ink">{formatKES(totalContributed)}</p>
        </Card>
        <Card hover>
          <p className="label-caps text-basket-taupe">Pending claims</p>
          <p className="font-display mt-1.5 text-3xl font-bold text-basket-ink">{pendingClaims}</p>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="label-caps text-basket-taupe">My baskets</h2>
          <Link to="/browse" className="text-xs font-medium text-basket-green transition hover:text-basket-green-light">
            Browse public funds &rarr;
          </Link>
        </div>
        {groups.length === 0 ? (
          <Card className="py-10 text-center">
            <p className="text-basket-taupe">
              You haven't joined a basket yet.{" "}
              <Link to="/groups/create" className="font-medium text-basket-green hover:underline">
                Create one now
              </Link>
              .
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
              const meta = fundTypeMeta(group.fund_type);
              return (
                <Link key={group.id} to={`/groups/${group.id}`}>
                  <Card hover className="h-full transition-all duration-200 group">
                    <div className="flex items-start justify-between">
                      <span className="text-2xl transition duration-300 group-hover:scale-110">{meta.icon}</span>
                      <span className="label-caps text-basket-gold">{meta.label}</span>
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
        <h2 className="label-caps mb-4 text-basket-taupe">Recent activity</h2>
        <Card>
          {activity.length === 0 ? (
            <p className="py-6 text-center text-sm text-basket-taupe">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-basket-ink/8">
              {activity.map((item) => (
                <li key={`${item.type}-${item.id}`} className="flex items-center justify-between py-3.5 transition hover:bg-basket-mist/50 first:-mt-1.5 first:rounded-t-lg last:mb-0 last:rounded-b-lg last:pb-3.5">
                  <div>
                    <p className="text-sm font-medium text-basket-ink">
                      {item.type === "contribution" ? "Contribution" : "Claim"} ·{" "}
                      {formatKES(item.amount ?? item.amount_requested)}
                    </p>
                    <p className="mt-0.5 text-xs text-basket-taupe">{formatDate(item.date)}</p>
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
