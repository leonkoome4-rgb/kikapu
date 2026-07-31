import { Link } from "react-router-dom";
import Logo from "../components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-basket-cream px-4 text-center">
      <Logo className="h-14 w-14" />
      <h1 className="font-display text-2xl font-bold text-basket-ink">Page not found</h1>
      <p className="max-w-sm text-sm text-basket-taupe">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="label-caps inline-flex items-center rounded-full bg-basket-green px-5 py-2.5 text-xs text-basket-cream shadow-sm shadow-basket-green/20 transition-all duration-200 hover:bg-basket-green-light hover:shadow-md active:scale-[0.97]">
        Back to home
      </Link>
    </div>
  );
}
