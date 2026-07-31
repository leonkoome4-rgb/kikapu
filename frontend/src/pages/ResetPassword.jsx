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
        <div className="space-y-4 animate-fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <p className="text-center text-sm text-basket-taupe">Taking you to the login page…</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Paste the reset code you were sent, then set a new password.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField label="Reset code" required value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste the code from your email/SMS" />
        <TextField label="New password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        <TextField label="Confirm new password" type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {error}
          </div>
        )}
        <Button type="submit" loading={loading} className="w-full py-3">
          Update password
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-basket-taupe">
        <Link to="/login" className="font-medium text-basket-green transition hover:text-basket-green-light">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
