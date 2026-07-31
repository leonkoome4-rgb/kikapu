import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your basket" subtitle="Join or start pooling money with people you trust.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField label="Full name" required value={form.name} onChange={update("name")} placeholder="Jane Wanjiru" />
        <TextField label="Phone number" required value={form.phone} onChange={update("phone")} placeholder="2547XXXXXXXX" />
        <TextField label="Email" type="email" required value={form.email} onChange={update("email")} placeholder="you@example.com" />
        <TextField label="Password" type="password" required minLength={6} value={form.password} onChange={update("password")} placeholder="At least 6 characters" />
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {error}
          </div>
        )}
        <Button type="submit" loading={loading} className="w-full py-3">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-basket-taupe">
        Already have a basket?{" "}
        <Link to="/login" className="font-medium text-basket-green transition hover:text-basket-green-light">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
