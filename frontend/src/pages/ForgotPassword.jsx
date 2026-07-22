import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";
import { forgotPassword } from "../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your inbox">
        <p className="text-sm text-basket-taupe">
          If an account exists for <strong className="text-basket-ink">{email}</strong>, we've sent a reset
          code that's valid for 30 minutes.
        </p>
        <p className="mt-3 rounded-lg bg-basket-cream p-3 text-xs text-basket-taupe">
          Running locally with the default console notification provider? The reset code is printed in the
          backend terminal log instead of a real email.
        </p>
        <Link to="/reset-password" className="mt-6 block">
          <Button variant="primary" className="w-full py-3">
            I have my reset code
          </Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="We'll send a reset code to your email.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Button type="submit" loading={loading} className="w-full py-3">
          Send reset code
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
