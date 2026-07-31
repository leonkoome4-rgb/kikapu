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
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-basket-taupe">
            If an account exists for <strong className="font-semibold text-basket-ink">{email}</strong>, we've sent a reset
            code that's valid for 30 minutes.
          </p>
          <div className="flex items-start gap-3 rounded-xl bg-basket-mist p-4 text-xs leading-relaxed text-basket-taupe">
            <span className="mt-0.5 shrink-0">&#9432;</span>
            <span>
              Running locally with the default console notification provider? The reset code is printed in the
              backend terminal log instead of a real email.
            </span>
          </div>
          <Link to="/reset-password">
            <Button variant="primary" className="w-full py-3">
              I have my reset code
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="We'll send a reset code to your email.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <Button type="submit" loading={loading} className="w-full py-3">
          Send reset code
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
