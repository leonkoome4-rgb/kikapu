import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { listPublicGroups } from "../api/groups";
import { fundTypeMeta } from "../constants/fundTypes";
import { formatKES } from "../utils/format";

export default function BrowsePublicFunds() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPublicGroups()
      .then(setGroups)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-basket-cream">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <Link to="/">
          <Logo withWordmark className="h-10 w-10" wordmarkClassName="text-2xl" />
        </Link>
        <Link to="/login" className="label-caps text-xs text-basket-taupe hover:text-basket-ink">
          Log in
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold text-basket-ink">Public harambees &amp; funds</h1>
        <p className="mt-2 max-w-2xl text-basket-taupe">
          Anyone can contribute to these funds via M-Pesa — no Kikapu account required for harambees.
        </p>

        {loading ? (
          <p className="mt-10 text-basket-taupe">Loading…</p>
        ) : groups.length === 0 ? (
          <p className="mt-10 text-basket-taupe">No public funds yet. Check back soon.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
              const meta = fundTypeMeta(group.fund_type);
              const progress = group.goal_amount
                ? Math.min(100, Math.round((group.balance / group.goal_amount) * 100))
                : null;
              return (
                <div
                  key={group.id}
                  className="overflow-hidden rounded-2xl border border-basket-ink/10 bg-white shadow-sm"
                >
                  <div className="relative h-28">
                    <img src={meta.image} alt="" className="h-full w-full object-cover" />
                    <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-basket-cream text-base shadow">
                      {meta.icon}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-bold text-basket-ink">{group.name}</h3>
                    <p className="label-caps mt-1 text-[10px] text-basket-gold">{meta.label}</p>
                    <p className="mt-3 text-2xl font-bold text-basket-green">{formatKES(group.balance)}</p>
                    {group.goal_amount && (
                      <>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-basket-ink/10">
                          <div className="h-full rounded-full bg-basket-gold" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-basket-taupe">
                          {progress}% of {formatKES(group.goal_amount)} goal
                        </p>
                      </>
                    )}
                    {group.public_slug ? (
                      <Link
                        to={`/harambee/${group.public_slug}`}
                        className="label-caps mt-4 inline-flex rounded-full bg-basket-green px-4 py-2 text-xs text-basket-cream"
                      >
                        Contribute now
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        className="label-caps mt-4 inline-flex rounded-full border border-basket-ink/15 px-4 py-2 text-xs text-basket-ink"
                      >
                        Log in to contribute
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
