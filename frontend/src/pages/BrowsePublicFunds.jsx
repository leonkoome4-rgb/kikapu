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
    <div className="min-h-screen bg-gradient-to-br from-basket-cream/80 via-white/40 to-basket-mist/50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <Link to="/" className="transition hover:opacity-80">
          <Logo withWordmark className="h-10 w-10" wordmarkClassName="text-2xl" />
        </Link>
        <Link to="/login" className="label-caps text-xs text-basket-taupe transition hover:text-basket-ink">
          Log in
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 animate-fade-in">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-basket-ink">Public harambees &amp; funds</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-basket-taupe">
          Anyone can contribute to these funds via M-Pesa — no Kikapu account required for harambees.
        </p>

        {loading ? (
          <div className="mt-16 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-basket-green/30 border-t-basket-green" />
          </div>
        ) : groups.length === 0 ? (
          <p className="mt-16 text-center text-basket-taupe">No public funds yet. Check back soon.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
              const meta = fundTypeMeta(group.fund_type);
              const progress = group.goal_amount
                ? Math.min(100, Math.round((group.balance / group.goal_amount) * 100))
                : null;
              return (
                <div
                  key={group.id}
                  className="group overflow-hidden rounded-2xl border border-basket-ink/8 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-28 overflow-hidden">
                    <img src={meta.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-base shadow-sm backdrop-blur-sm">
                      {meta.icon}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-bold text-basket-ink">{group.name}</h3>
                    <p className="label-caps mt-1 inline-flex rounded-full bg-basket-gold/10 px-2 py-0.5 text-basket-gold">{meta.label}</p>
                    <p className="mt-3 text-2xl font-bold text-basket-green">{formatKES(group.balance)}</p>
                    {group.goal_amount && (
                      <>
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-basket-ink/10">
                          <div className="h-full rounded-full bg-basket-gold transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-basket-taupe">{progress}% of {formatKES(group.goal_amount)} goal</p>
                      </>
                    )}
                    <div className="mt-5">
                      {group.public_slug ? (
                        <Link
                          to={`/harambee/${group.public_slug}`}
                          className="label-caps inline-flex items-center justify-center rounded-full bg-basket-green px-5 py-2.5 text-xs text-basket-cream shadow-sm shadow-basket-green/20 transition-all duration-200 hover:bg-basket-green-light hover:shadow-md active:scale-[0.97]"
                        >
                          Contribute now
                        </Link>
                      ) : (
                        <Link
                          to="/login"
                          className="label-caps inline-flex items-center justify-center rounded-full border border-basket-ink/15 bg-white px-5 py-2.5 text-xs text-basket-ink transition-all duration-200 hover:border-basket-green hover:text-basket-green active:scale-[0.97]"
                        >
                          Log in to contribute
                        </Link>
                      )}
                    </div>
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
