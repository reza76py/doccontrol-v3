import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import CompaniesPage from "./pages/CompaniesPage";
import ProjectsPage from "./pages/ProjectsPage";
import DocumentsPage from "./pages/DocumentsPage";
import DocumentVersionsPage from "./pages/DocumentVersionsPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import logo from "./assets/rezteche-logo.png";

type Page = "companies" | "projects" | "documents" | "versions" | "auditLogs";

// ─── Guard ────────────────────────────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("access_token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ─── Main authenticated shell ─────────────────────────────────────────────────
function MainApp() {
  const navigate = useNavigate();
  const [page, setPage] = useState<Page>("companies");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const navItems: [Page, string][] = [
    ["companies", "Companies"],
    ["projects", "Projects"],
    ["documents", "Documents"],
    ["versions", "Versions"],
    ["auditLogs", "Audit Logs"],
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 md:px-6 h-16">

          {/* Logo */}
          <a
            href="https://www.rezteche.com/"
            className="flex items-center"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={logo}
              alt="RezTeche Logo"
              className="h-28 w-auto object-contain transition-all duration-200"
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            {navItems.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPage(key)}
                className={`transition-colors ${
                  page === key ? "text-white" : "hover:text-slate-200"
                }`}
              >
                {label}
              </button>
            ))}

            <button
              onClick={() => navigate("/profile")}
              className="hover:text-slate-200 transition-colors"
            >
              Profile
            </button>

            <button
              onClick={logout}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Logout
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex flex-col items-center justify-center p-2 rounded-md
                       text-slate-200 hover:bg-slate-800/60 transition"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <span className={`block h-0.5 w-5 bg-slate-200 transition-transform duration-200 ${mobileNavOpen ? "translate-y-1.5 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-slate-200 my-1 transition-opacity duration-200 ${mobileNavOpen ? "opacity-0" : "opacity-100"}`} />
            <span className={`block h-0.5 w-5 bg-slate-200 transition-transform duration-200 ${mobileNavOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden z-50 bg-slate-900 border-t border-slate-800 px-4 py-3 flex flex-col gap-3">
            {navItems.map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setPage(key); setMobileNavOpen(false); }}
                className={`text-sm text-left transition-colors ${
                  page === key ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => { navigate("/profile"); setMobileNavOpen(false); }}
              className="text-sm text-left text-slate-400 hover:text-slate-200 transition-colors"
            >
              Profile
            </button>
            <button
              onClick={logout}
              className="text-sm text-left text-red-400 hover:text-red-300 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* ── Content ── */}
      <main className="pt-20 py-6">
        {page === "companies" && (
          <CompaniesPage
            onSelectCompany={(id) => {
              setSelectedCompanyId(id);
              setPage("projects");
            }}
          />
        )}

        {page === "projects" && (
          <ProjectsPage
            companyId={selectedCompanyId ?? undefined}
            onSelectProject={(projectId) => {
              setSelectedProjectId(projectId);
              setPage("documents");
            }}
          />
        )}

        {page === "documents" && (
          <DocumentsPage
            projectId={selectedProjectId ?? undefined}
            onSelectDocument={(id) => {
              setSelectedDocumentId(id);
              setPage("versions");
            }}
          />
        )}

        {page === "versions" && selectedDocumentId !== null && (
          <DocumentVersionsPage documentId={selectedDocumentId} />
        )}
        {page === "auditLogs" && <AuditLogsPage />}
      </main>
    </div>
  );
}

// ─── Router root ──────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email/:uid/:token" element={<EmailVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <MainApp />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
