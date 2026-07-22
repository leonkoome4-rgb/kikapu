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
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Email or phone"
          type="text"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <Button type="submit" loading={loading} className="w-full py-3">
          Log in
        </Button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link to="/forgot-password" className="text-basket-green hover:underline">
          Forgot password?
        </Link>
        <Link to="/register" className="text-basket-taupe hover:text-basket-ink">
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
}
