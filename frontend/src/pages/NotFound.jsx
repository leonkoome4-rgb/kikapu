import { Link } from "react-router-dom";
import Logo from "../components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-basket-cream text-center">
      <Logo className="h-12 w-12" />
      <h1 className="font-display text-2xl font-bold text-basket-ink">Page not found</h1>
      <Link to="/" className="text-basket-green hover:underline">
        Back to home
      </Link>
    </div>
  );
}
