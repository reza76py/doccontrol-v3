import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.requestPasswordReset(email);
    } finally {
      setLoading(false);
      setSubmitted(true); // always show success — avoids user enumeration
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
      <div className="w-full max-w-sm bg-[#12122a] border border-[#1e1e3a] rounded-xl p-8">
        <h1 className="text-2xl font-bold text-white mb-1 text-center">Forgot Password</h1>
        <p className="text-sm text-slate-400 text-center mb-6">
          Enter your email and we'll send you a reset link.
        </p>

        {submitted ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-emerald-400">
              If that email is registered, a password reset link has been sent.
            </p>
            <Link to="/login" className="text-sm text-[#6c63ff] hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              className="w-full bg-[#0a0a1a] border border-[#1e1e3a] rounded-md px-3 py-2.5 text-sm
                         text-slate-200 placeholder:text-slate-500
                         focus:outline-none focus:ring-2 focus:ring-[#6c63ff]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6c63ff] text-white text-sm font-medium py-2.5 rounded-md
                         hover:bg-[#5a52e0] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending…" : "Send Reset Link"}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-slate-400 hover:text-[#6c63ff] transition">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
