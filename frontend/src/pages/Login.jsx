import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(identifier, password);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Unable to log in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to check your fund balance and activity.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField label="Email or phone" type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@example.com" />
        <TextField label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" />
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {error}
          </div>
        )}
        <Button type="submit" loading={loading} className="w-full py-3">
          Log in
        </Button>
      </form>
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link to="/forgot-password" className="font-medium text-basket-green transition hover:text-basket-green-light">
          Forgot password?
        </Link>
        <Link to="/register" className="text-basket-taupe transition hover:text-basket-ink">
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
}
