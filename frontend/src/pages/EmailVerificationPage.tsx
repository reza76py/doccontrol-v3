import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { authApi } from "../lib/api";

type Status = "loading" | "success" | "error";

export default function EmailVerificationPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!uid || !token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    authApi
      .verifyEmail(uid, token)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified successfully.");
      })
      .catch((err: unknown) => {
        const e = err as { response?: { data?: { detail?: string } } };
        setStatus("error");
        setMessage(e?.response?.data?.detail || "Invalid or expired verification link.");
      });
  }, [uid, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
      <div className="w-full max-w-sm bg-[#12122a] border border-[#1e1e3a] rounded-xl p-8 text-center">
        {status === "loading" && (
          <p className="text-slate-400 text-sm">Verifying your email…</p>
        )}

        {status === "success" && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-white mb-2">Email Verified</h2>
            <p className="text-sm text-emerald-400 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-[#6c63ff] text-white text-sm font-medium
                         px-5 py-2 rounded-md hover:bg-[#5a52e0] transition"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-sm text-red-400 mb-6">{message}</p>
            <Link to="/login" className="text-sm text-[#6c63ff] hover:underline">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
