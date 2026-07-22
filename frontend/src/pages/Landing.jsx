import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/ui/Button";
import { FUND_TYPES } from "../constants/fundTypes";

export default function Landing() {
  return (
    <div className="min-h-screen bg-basket-cream">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <Logo withWordmark className="h-10 w-10" wordmarkClassName="text-2xl" />
        <nav className="flex items-center gap-3">
          <Link to="/browse" className="label-caps text-xs text-basket-taupe hover:text-basket-ink">
            Browse Harambees
          </Link>
          <Link to="/login">
            <Button variant="outline">Log in</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary">Get started</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <p className="label-caps mb-4 text-xs text-basket-gold">One basket. Total transparency.</p>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-basket-ink sm:text-6xl">
            Stop tracking your chama through WhatsApp and a notebook.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-basket-taupe lg:mx-0">
            Kikapu is the shared basket for chamas, emergency funds, weddings, trips, matanga and harambee
            fundraisers — pool contributions via M-Pesa, track the balance in real time, and let members
            file and approve claims transparently.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link to="/register">
              <Button variant="primary" className="px-8 py-3 text-sm">
                Create your first fund
              </Button>
            </Link>
            <Link to="/browse">
              <Button variant="outline" className="px-8 py-3 text-sm">
                Explore public harambees
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative">
          <img
            src="/images/hero-baskets.jpg"
            alt="Handwoven kiondo baskets at a market"
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lg"
          />
          <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-basket-green px-5 py-4 text-basket-cream shadow-lg sm:block">
            <p className="label-caps text-[10px] text-basket-gold-light">Fund Balance</p>
            <p className="font-display text-xl font-extrabold">Ksh 187,300</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <h2 className="label-caps mb-6 text-center text-xs text-basket-taupe">Six baskets, one platform</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FUND_TYPES.map((fund) => (
            <div
              key={fund.value}
              className="overflow-hidden rounded-2xl border border-basket-ink/10 bg-white shadow-sm"
            >
              <div className="relative h-32">
                <img src={fund.image} alt="" className="h-full w-full object-cover" />
                <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-basket-cream text-lg shadow">
                  {fund.icon}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-basket-ink">{fund.label}</h3>
                <p className="mt-1 text-sm text-basket-taupe">{fund.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-basket-ink/10 py-8 text-center text-xs text-basket-taupe">
        Kikapu — built by Group 7, Moringa School Module 5.
      </footer>
    </div>
  );
}
