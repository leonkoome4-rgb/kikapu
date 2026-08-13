import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/ui/Button";
import { FUND_TYPES } from "../constants/fundTypes";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-basket-cream/80 via-white/40 to-basket-mist/50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <Logo withWordmark className="h-10 w-10" wordmarkClassName="text-2xl" />
        <nav className="flex items-center gap-3">
          <Link to="/browse" className="label-caps text-xs text-basket-taupe transition hover:text-basket-ink">
            Browse Harambees
          </Link>
          <Link to="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary">Get started</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2">
        <div className="text-center lg:text-left animate-fade-in-up">
          <p className="label-caps mb-4 inline-flex items-center gap-2 rounded-full bg-basket-gold/10 px-4 py-1.5 text-basket-gold">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-basket-gold" />
            One basket. Total transparency.
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-basket-ink sm:text-5xl lg:text-6xl">
            Stop tracking your chama <br className="hidden sm:block" />
            through WhatsApp and a notebook.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-basket-taupe lg:mx-0">
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
          <div className="mt-10 flex items-center justify-center gap-8 text-center lg:justify-start">
            <div>
              <p className="font-display text-2xl font-bold text-basket-green">6</p>
              <p className="text-xs text-basket-taupe">fund types</p>
            </div>
            <div className="h-8 w-px bg-basket-ink/10" />
            <div>
              <p className="font-display text-2xl font-bold text-basket-green">M-Pesa</p>
              <p className="text-xs text-basket-taupe">payments</p>
            </div>
            <div className="h-8 w-px bg-basket-ink/10" />
            <div>
              <p className="font-display text-2xl font-bold text-basket-green">Real-time</p>
              <p className="text-xs text-basket-taupe">balances</p>
            </div>
          </div>
        </div>
        <div className="relative animate-fade-in">
          <img
            src="/images/hero-baskets.jpg"
            alt="Handwoven kiondo baskets at a market"
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl shadow-basket-ink/10"
          />
          <div className="absolute -bottom-5 -left-5 hidden animate-scale-in rounded-2xl bg-basket-green px-5 py-4 text-basket-cream shadow-lg shadow-basket-green/20 sm:block">
            <p className="label-caps text-basket-gold-light">Fund Balance</p>
            <p className="font-display text-xl font-extrabold">Ksh 187,300</p>
          </div>
          <div className="absolute -top-4 -right-4 hidden h-24 w-24 rounded-full bg-basket-gold/10 sm:block" />
          <div className="absolute -bottom-6 -right-6 hidden h-16 w-16 rounded-full bg-basket-green/5 sm:block" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="label-caps text-basket-taupe">Six baskets, one platform</h2>
          <p className="mt-2 font-display text-2xl font-bold text-basket-ink">Choose the fund that fits</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FUND_TYPES.map((fund, i) => (
            <div
              key={fund.value}
              className="group overflow-hidden rounded-2xl border border-basket-ink/8 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-basket-ink/5"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="relative h-32 overflow-hidden">
                <img
                  src={fund.image}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow-sm backdrop-blur-sm transition group-hover:scale-110">
                  {fund.icon}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-basket-ink">{fund.label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-basket-taupe">{fund.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-basket-ink/8 bg-basket-green px-8 py-10 text-center sm:flex-row sm:text-left">
          <div>
            <p className="label-caps mb-4 text-basket-gold-light">No smartphone? No problem</p>
            <h2 className="font-display text-2xl font-bold text-basket-cream">Manage your funds over USSD</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-basket-cream/80">
              Dial the code on any phone to browse public funds, contribute with M-Pesa,
              check your balances and file claims — no data bundle needed.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-basket-cream px-7 py-4 font-display text-xl font-extrabold tracking-wider text-basket-green shadow-lg shadow-basket-ink/10">
            *384*100#
          </div>
        </div>
      </section>

      <footer className="border-t border-basket-ink/8 py-10 text-center">
        <Logo withWordmark className="mx-auto h-8 w-8" wordmarkClassName="text-lg" />
        <p className="mt-3 text-xs text-basket-taupe">
          Kikapu — built by Group 7, Moringa School Module 5.
        </p>
      </footer>
    </div>
  );
}
