import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { listMyGroups } from "../api/groups";
import { formatDate } from "../utils/format";

export default function Profile() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    listMyGroups().then(setGroups);
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-in">
      <div>
        <p className="label-caps text-basket-taupe">Account</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-basket-ink">Profile</h1>
      </div>

      <Card>
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-basket-green to-basket-green-dark font-display text-2xl font-bold text-basket-cream shadow-md">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-display text-xl font-bold text-basket-ink">{user?.name}</p>
            <p className="label-caps mt-0.5 inline-flex rounded-full bg-basket-gold/10 px-2.5 py-0.5 text-basket-gold">{user?.role}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-basket-mist/50 px-4 py-3">
            <dt className="text-basket-taupe">Email</dt>
            <dd className="font-medium text-basket-ink">{user?.email}</dd>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-basket-mist/50 px-4 py-3">
            <dt className="text-basket-taupe">Phone</dt>
            <dd className="font-medium text-basket-ink">{user?.phone}</dd>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-basket-mist/50 px-4 py-3">
            <dt className="text-basket-taupe">Member since</dt>
            <dd className="font-medium text-basket-ink">{formatDate(user?.created_at)}</dd>
          </div>
        </dl>
      </Card>

      <div>
        <h2 className="label-caps mb-4 text-basket-taupe">Baskets I belong to</h2>
        <Card>
          {groups.length === 0 ? (
            <p className="py-4 text-center text-sm text-basket-taupe">You haven't joined any baskets yet.</p>
          ) : (
            <ul className="space-y-1">
              {groups.map((g) => (
                <li key={g.id}>
                  <Link to={`/groups/${g.id}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-basket-green transition hover:bg-basket-mist/50">
                    {g.name}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
