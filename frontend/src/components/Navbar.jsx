import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/groups/create", label: "Create a Fund" },
  { to: "/notifications", label: "Notifications" },
  { to: "/profile", label: "Profile" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-basket-ink/10 bg-basket-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/dashboard" className="shrink-0">
          <Logo withWordmark className="h-9 w-9" wordmarkClassName="text-xl" />
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `label-caps rounded-full px-4 py-2 text-xs transition ${
                  isActive
                    ? "bg-basket-green text-basket-cream"
                    : "text-basket-taupe hover:bg-basket-ink/5 hover:text-basket-ink"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <span className="text-sm text-basket-taupe">Hi, {user?.name?.split(" ")[0]}</span>
          <button
            onClick={handleLogout}
            className="label-caps rounded-full border border-basket-ink/15 px-4 py-2 text-xs text-basket-ink transition hover:border-basket-gold hover:text-basket-gold"
          >
            Log out
          </button>
        </div>

        <button
          className="rounded-md p-2 text-basket-ink md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-basket-ink/10 bg-basket-cream px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `label-caps rounded-lg px-3 py-2 text-xs ${
                    isActive ? "bg-basket-green text-basket-cream" : "text-basket-taupe"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="label-caps mt-2 rounded-lg border border-basket-ink/15 px-3 py-2 text-left text-xs text-basket-ink"
            >
              Log out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
