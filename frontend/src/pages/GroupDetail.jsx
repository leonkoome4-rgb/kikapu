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

  if (loading) return <p className="text-basket-taupe">Loading fund…</p>;
  if (!group) return <p className="text-basket-taupe">Fund not found.</p>;

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
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-caps text-xs text-basket-gold">{meta.icon} {meta.label}</p>
          <h1 className="font-display text-3xl font-extrabold text-basket-ink">{group.name}</h1>
          {group.description && <p className="mt-1 max-w-xl text-basket-taupe">{group.description}</p>}
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

      <Card className="bg-basket-green text-basket-cream">
        <p className="label-caps text-xs text-basket-gold-light">Fund Balance</p>
        <p className="font-display mt-2 text-4xl font-extrabold sm:text-5xl">{formatKES(group.balance)}</p>
        {group.goal_amount && (
          <>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-basket-cream/20">
              <div className="h-full rounded-full bg-basket-gold" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-sm text-basket-cream/80">
              {progress}% of {formatKES(group.goal_amount)} goal
            </p>
          </>
        )}
        {group.public_slug && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <code className="rounded bg-basket-cream/10 px-2 py-1 text-xs">/harambee/{group.public_slug}</code>
            <button onClick={copyLink} className="label-caps text-xs text-basket-gold-light hover:underline">
              {copied ? "Copied!" : "Copy public link"}
            </button>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="label-caps mb-3 text-xs text-basket-taupe">Activity</h2>
          <Card>
            {activity.length === 0 ? (
              <p className="text-sm text-basket-taupe">No activity yet.</p>
            ) : (
              <ul className="divide-y divide-basket-ink/10">
                {activity.map((item) => (
                  <li key={`${item.type}-${item.id}`} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-basket-ink">
                        {item.type === "contribution" ? "Contribution" : "Claim"} ·{" "}
                        {formatKES(item.amount ?? item.amount_requested)}
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

        <div>
          <h2 className="label-caps mb-3 text-xs text-basket-taupe">Members ({members.length})</h2>
          <Card>
            {notAMember ? (
              <p className="text-sm text-basket-taupe">Join this fund to see its members.</p>
            ) : (
              <ul className="space-y-3">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-sm">
                    <span className="text-basket-ink">{m.user.name}</span>
                    <span className="label-caps text-[10px] text-basket-taupe">{m.role}</span>
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
