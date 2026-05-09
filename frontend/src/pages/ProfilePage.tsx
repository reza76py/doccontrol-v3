import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../lib/api";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    authApi
      .profile()
      .then((res) => setProfile(res.data))
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] px-6 py-10">
      <div className="max-w-lg mx-auto">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            ← Back to App
          </button>
          <button
            onClick={logout}
            className="text-sm text-red-400 hover:text-red-300 transition"
          >
            Logout
          </button>
        </div>

        <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>

        {loading && (
          <p className="text-sm text-slate-400">Loading profile…</p>
        )}

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {profile && (
          <div className="bg-[#12122a] border border-[#1e1e3a] rounded-xl p-6 space-y-5">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Username</p>
              <p className="text-sm font-medium text-white">{profile.username}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm text-slate-300">{profile.email || "—"}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Name</p>
              <p className="text-sm text-slate-300">{profile.name || "—"}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Role</p>
              <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full
                               bg-[#6c63ff]/20 text-[#6c63ff]">
                {profile.role}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
