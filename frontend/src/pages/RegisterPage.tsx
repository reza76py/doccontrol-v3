import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../lib/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setLoading(true);
    try {
      await authApi.register(username, email, password);
      setSuccess(true);
    } catch (err: unknown) {
      const e = err as {
        response?: {
          data?: {
            email?: string | string[];
            username?: string | string[];
            detail?: string;
          };
        };
      };
      const data = e?.response?.data;
      if (data?.email) {
        setEmailError(Array.isArray(data.email) ? data.email[0] : data.email);
      } else if (data?.username) {
        setError(Array.isArray(data.username) ? data.username[0] : data.username);
      } else {
        setError(data?.detail || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="w-full max-w-sm bg-[#12122a] border border-[#1e1e3a] rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-sm text-slate-400 mb-6">
            Please check your email to verify your account before logging in.
          </p>
          <Link to="/login" className="text-sm text-[#6c63ff] hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
      <div className="w-full max-w-sm bg-[#12122a] border border-[#1e1e3a] rounded-xl p-8">
        <h1 className="text-2xl font-bold text-white mb-1 text-center">Create Account</h1>
        <p className="text-sm text-slate-400 text-center mb-6">Join DocControl</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            className="w-full bg-[#0a0a1a] border border-[#1e1e3a] rounded-md px-3 py-2.5 text-sm
                       text-slate-200 placeholder:text-slate-500
                       focus:outline-none focus:ring-2 focus:ring-[#6c63ff]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            required
          />

          <div>
            <input
              type="email"
              className={`w-full bg-[#0a0a1a] border rounded-md px-3 py-2.5 text-sm
                         text-slate-200 placeholder:text-slate-500
                         focus:outline-none focus:ring-2 focus:ring-[#6c63ff]
                         ${emailError ? "border-red-500" : "border-[#1e1e3a]"}`}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              placeholder="Email"
              autoComplete="email"
              required
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-400">{emailError}</p>
            )}
          </div>

          <input
            type="password"
            className="w-full bg-[#0a0a1a] border border-[#1e1e3a] rounded-md px-3 py-2.5 text-sm
                       text-slate-200 placeholder:text-slate-500
                       focus:outline-none focus:ring-2 focus:ring-[#6c63ff]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 8 characters)"
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
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-[#6c63ff] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
