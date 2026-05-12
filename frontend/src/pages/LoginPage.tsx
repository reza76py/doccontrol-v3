import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../lib/api";
import logo from "../assets/rezteche-logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(username, password);
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      navigate("/");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0a0a1a]">

      {/* Corner logo */}
      <a
        href="https://rezteche.com"
        target="_blank"
        rel="noreferrer"
        className="absolute top-4 left-4"
      >
        <img src={logo} alt="RezTeche" className="h-8 w-auto" />
      </a>

      {/* Learn link */}
      <a
        href="https://rezteche.com/apps/document-control"
        target="_blank"
        rel="noreferrer"
        className="mb-4 text-sm text-slate-400 hover:text-[#6c63ff] transition"
      >
        Learn how to use this app →
      </a>

      <div className="w-full max-w-sm bg-[#12122a] border border-[#1e1e3a] rounded-xl p-8">
        <h1 className="text-2xl font-bold text-white mb-1 text-center">Sign In</h1>
        <p className="text-sm text-slate-400 text-center mb-6">Welcome back to DocControl</p>

        <form onSubmit={handleLogin} className="space-y-4">
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

          <input
            type="password"
            className="w-full bg-[#0a0a1a] border border-[#1e1e3a] rounded-md px-3 py-2.5 text-sm
                       text-slate-200 placeholder:text-slate-500
                       focus:outline-none focus:ring-2 focus:ring-[#6c63ff]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
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
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-slate-400">
          <Link to="/forgot-password" className="hover:text-[#6c63ff] transition">
            Forgot your password?
          </Link>
          <span>
            Don't have an account?{" "}
            <Link to="/register" className="text-[#6c63ff] hover:underline">
              Register
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
