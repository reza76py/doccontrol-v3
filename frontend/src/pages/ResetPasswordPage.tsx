import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { authApi } from "../lib/api";

export default function ResetPasswordPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!uid || !token) {
      setError("Invalid reset link.");
      return;
    }

    setLoading(true);
    try {
      await authApi.confirmPasswordReset(uid, token, newPassword, confirmPassword);
      setSuccess(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || "Password reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="w-full max-w-sm bg-[#12122a] border border-[#1e1e3a] rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-xl font-bold text-white mb-2">Password Reset</h2>
          <p className="text-sm text-emerald-400 mb-6">
            Your password has been reset successfully.
          </p>
          <Link
            to="/login"
            className="inline-block bg-[#6c63ff] text-white text-sm font-medium
                       px-5 py-2 rounded-md hover:bg-[#5a52e0] transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
      <div className="w-full max-w-sm bg-[#12122a] border border-[#1e1e3a] rounded-xl p-8">
        <h1 className="text-2xl font-bold text-white mb-1 text-center">Reset Password</h1>
        <p className="text-sm text-slate-400 text-center mb-6">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            className="w-full bg-[#0a0a1a] border border-[#1e1e3a] rounded-md px-3 py-2.5 text-sm
                       text-slate-200 placeholder:text-slate-500
                       focus:outline-none focus:ring-2 focus:ring-[#6c63ff]"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            autoComplete="new-password"
            required
          />

          <input
            type="password"
            className="w-full bg-[#0a0a1a] border border-[#1e1e3a] rounded-md px-3 py-2.5 text-sm
                       text-slate-200 placeholder:text-slate-500
                       focus:outline-none focus:ring-2 focus:ring-[#6c63ff]"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
            required
          />

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6c63ff] text-white text-sm font-medium py-2.5 rounded-md
                       hover:bg-[#5a52e0] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
