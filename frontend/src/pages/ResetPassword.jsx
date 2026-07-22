import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";
import { resetPassword } from "../api/auth";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token.trim(), password);
      setDone(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "That reset code is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout title="Password updated">
        <p className="text-sm text-basket-taupe">Taking you to the login page…</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Paste the reset code you were sent, then set a new password.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Reset code"
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste the code from your email/SMS"
        />
        <TextField
          label="New password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Confirm new password"
          type="password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <Button type="submit" loading={loading} className="w-full py-3">
          Update password
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-basket-taupe">
        <Link to="/login" className="text-basket-green hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
