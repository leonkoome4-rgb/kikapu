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
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="label-caps text-xs text-basket-taupe">Account</p>
        <h1 className="font-display text-3xl font-extrabold text-basket-ink">Profile</h1>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-basket-green font-display text-xl font-bold text-basket-cream">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-display text-lg font-bold text-basket-ink">{user?.name}</p>
            <p className="label-caps text-[10px] text-basket-gold">{user?.role}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between border-b border-basket-ink/10 pb-3">
            <dt className="text-basket-taupe">Email</dt>
            <dd className="text-basket-ink">{user?.email}</dd>
          </div>
          <div className="flex justify-between border-b border-basket-ink/10 pb-3">
            <dt className="text-basket-taupe">Phone</dt>
            <dd className="text-basket-ink">{user?.phone}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-basket-taupe">Member since</dt>
            <dd className="text-basket-ink">{formatDate(user?.created_at)}</dd>
          </div>
        </dl>
      </Card>

      <div>
        <h2 className="label-caps mb-3 text-xs text-basket-taupe">Baskets I belong to</h2>
        <Card>
          {groups.length === 0 ? (
            <p className="text-sm text-basket-taupe">You haven't joined any baskets yet.</p>
          ) : (
            <ul className="space-y-2">
              {groups.map((g) => (
                <li key={g.id}>
                  <Link to={`/groups/${g.id}`} className="text-sm text-basket-green hover:underline">
                    {g.name}
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
