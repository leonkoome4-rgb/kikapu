import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { getGroup, joinGroup, listMembers } from "../api/groups";
import { groupContributions } from "../api/contributions";
import { groupClaims } from "../api/claims";
import { fundTypeMeta } from "../constants/fundTypes";
import { formatKES, formatDate } from "../utils/format";

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [joining, setJoining] = useState(false);
  const [notAMember, setNotAMember] = useState(false);

  const load = () => {
    setNotAMember(false);
    return Promise.allSettled([getGroup(id), listMembers(id), groupContributions(id), groupClaims(id)]).then(
      ([g, m, c, cl]) => {
        if (g.status === "fulfilled") setGroup(g.value);
        if (m.status === "fulfilled") setMembers(m.value);
        else setNotAMember(true);
        if (c.status === "fulfilled") setContributions(c.value);
        if (cl.status === "fulfilled") setClaims(cl.value);
      }
    );
  };

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [id]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await joinGroup(id);
      await load();
    } finally {
      setJoining(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-basket-green/30 border-t-basket-green" />
      </div>
    );
  if (!group) return <p className="py-20 text-center text-basket-taupe">Fund not found.</p>;

  const meta = fundTypeMeta(group.fund_type);
  const isAdmin = group.admin_id === user?.id;
  const progress = group.goal_amount ? Math.min(100, Math.round((group.balance / group.goal_amount) * 100)) : null;

  const activity = [
    ...contributions.map((c) => ({ type: "contribution", ...c, date: c.created_at })),
    ...claims.map((c) => ({ type: "claim", ...c, date: c.created_at })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/harambee/${group.public_slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-caps inline-flex items-center gap-1.5 rounded-full bg-basket-gold/10 px-3 py-1 text-basket-gold">
            <span>{meta.icon}</span> {meta.label}
          </p>
          <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-basket-ink">{group.name}</h1>
          {group.description && <p className="mt-1.5 max-w-xl leading-relaxed text-basket-taupe">{group.description}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          {notAMember && !isAdmin ? (
            <Button variant="primary" loading={joining} onClick={handleJoin}>
              Join this fund
            </Button>
          ) : (
            <>
              <Link to={`/groups/${group.id}/contribute`}>
                <Button variant="primary">Contribute</Button>
              </Link>
              <Link to={`/groups/${group.id}/claims`}>
                <Button variant="outline">{isAdmin ? "Manage claims" : "File a claim"}</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <Card className="relative overflow-hidden bg-gradient-to-br from-basket-green to-basket-green-dark text-basket-cream">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-basket-cream/5" />
        <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-6 translate-y-6 rounded-full bg-basket-cream/5" />
        <p className="label-caps relative text-basket-gold-light">Fund Balance</p>
        <p className="font-display relative mt-2 text-4xl font-extrabold sm:text-5xl">{formatKES(group.balance)}</p>
        {group.goal_amount && (
          <div className="relative mt-5">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-basket-cream/20">
              <div className="h-full rounded-full bg-basket-gold transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1.5 text-sm text-basket-cream/80">
              {progress}% of {formatKES(group.goal_amount)} goal
            </p>
          </div>
        )}
        {group.public_slug && (
          <div className="relative mt-5 flex flex-wrap items-center gap-3">
            <code className="rounded-lg bg-basket-cream/10 px-3 py-1.5 text-xs backdrop-blur-sm">/harambee/{group.public_slug}</code>
            <button
              onClick={copyLink}
              className="label-caps text-xs text-basket-gold-light transition hover:text-basket-gold"
            >
              {copied ? "Copied!" : "Copy public link"}
            </button>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="label-caps mb-4 text-basket-taupe">Activity</h2>
          <Card>
            {activity.length === 0 ? (
              <p className="py-6 text-center text-sm text-basket-taupe">No activity yet.</p>
            ) : (
              <ul className="divide-y divide-basket-ink/8">
                {activity.map((item) => (
                  <li key={`${item.type}-${item.id}`} className="flex items-center justify-between py-3.5 transition hover:bg-basket-mist/50 first:-mt-1.5 first:rounded-t-lg last:rounded-b-lg">
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

        <div>
          <h2 className="label-caps mb-4 text-basket-taupe">Members ({members.length})</h2>
          <Card>
            {notAMember ? (
              <p className="py-4 text-center text-sm text-basket-taupe">Join this fund to see its members.</p>
            ) : (
              <ul className="space-y-1">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition hover:bg-basket-mist/50">
                    <span className="font-medium text-basket-ink">{m.user.name}</span>
                    <span className="label-caps rounded-full bg-basket-ink/5 px-2.5 py-0.5 text-basket-taupe">{m.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
