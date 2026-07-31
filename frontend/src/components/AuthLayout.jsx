import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-basket-cream via-white to-basket-mist px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <Link to="/" className="mb-8 flex justify-center transition hover:opacity-80">
          <Logo withWordmark className="h-11 w-11" wordmarkClassName="text-2xl" />
        </Link>
        <div className="rounded-2xl border border-basket-ink/8 bg-white/80 p-8 shadow-lg shadow-basket-ink/5 backdrop-blur-xl">
          <h1 className="font-display text-2xl font-bold text-basket-ink">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-basket-taupe">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
