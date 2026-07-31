import { NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
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
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-basket-ink/8 bg-basket-cream/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/dashboard" className="shrink-0 transition hover:opacity-80">
          <Logo withWordmark className="h-9 w-9" wordmarkClassName="text-xl" />
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `label-caps rounded-full px-4 py-2 text-xs transition-all duration-200 ${
                  isActive
                    ? "bg-basket-green text-basket-cream shadow-sm shadow-basket-green/20"
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
            className="label-caps rounded-full border border-basket-ink/15 bg-white px-4 py-2 text-xs text-basket-ink transition-all duration-200 hover:border-basket-gold hover:text-basket-gold hover:shadow-sm active:scale-[0.97]"
          >
            Log out
          </button>
        </div>

        <button
          className="rounded-lg p-2 text-basket-ink transition hover:bg-basket-ink/5 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </>
            ) : (
              <>
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div ref={menuRef} className="animate-slide-down border-t border-basket-ink/8 bg-basket-cream/95 backdrop-blur-xl px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `label-caps rounded-lg px-3 py-2.5 text-xs transition ${
                    isActive ? "bg-basket-green text-basket-cream" : "text-basket-taupe hover:bg-basket-ink/5 hover:text-basket-ink"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <hr className="my-2 border-basket-ink/8" />
            <span className="px-3 py-1 text-xs text-basket-taupe">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="label-caps mt-1 rounded-lg border border-basket-ink/15 bg-white px-3 py-2.5 text-left text-xs text-basket-ink transition hover:border-basket-gold hover:text-basket-gold"
            >
              Log out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
