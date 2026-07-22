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
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label="Full name" required value={form.name} onChange={update("name")} placeholder="Jane Wanjiru" />
        <TextField
          label="Phone number"
          required
          value={form.phone}
          onChange={update("phone")}
          placeholder="2547XXXXXXXX"
        />
        <TextField
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={update("email")}
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={update("password")}
          placeholder="At least 6 characters"
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <Button type="submit" loading={loading} className="w-full py-3">
          Create account
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-basket-taupe">
        Already have a basket?{" "}
        <Link to="/login" className="text-basket-green hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
