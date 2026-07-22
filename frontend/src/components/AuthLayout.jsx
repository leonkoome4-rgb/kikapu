import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-basket-cream px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center">
          <Logo withWordmark className="h-10 w-10" wordmarkClassName="text-2xl" />
        </Link>
        <div className="rounded-2xl border border-basket-ink/10 bg-white p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold text-basket-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-basket-taupe">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
