import { useState, useEffect } from "react";
import { api } from "./lib/api";
import CompaniesPage from "./pages/CompaniesPage";
import ProjectsPage from "./pages/ProjectsPage";
import DocumentsPage from "./pages/DocumentsPage";
import DocumentVersionsPage from "./pages/DocumentVersionsPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import logo from "./assets/rezteche-logo.png";

type Page = "companies" | "projects" | "documents" | "versions" | "auditLogs";

function App() {
  const [username, setUsername] = useState("doccontrol");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = sessionStorage.getItem("access_token");
    return !!token;
  });
  const [rememberSession, setRememberSession] = useState(true);

  const [error, setError] = useState("");
  const [page, setPage] = useState<Page>("companies");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  const login = async () => {
    setError("");
    try {
      const res = await api.post("/token/", { username, password });
      const access = res.data.access;

      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      if (rememberSession) {
        sessionStorage.setItem("access_token", access);
      }

      setIsAuthenticated(true);
    } catch {
      setError("Login failed");
    }
  };

  /* =======================
     LOGIN SCREEN
     ======================= */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-full max-w-sm bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="RezTeche Logo" className="h-12 w-auto" />
          </div>

          <div className="space-y-4">
            <input
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200
                         placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />

            <input
              type="password"
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200
                         placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />

            <label className="flex items-center gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
              />
              Stay logged in for this session
            </label>

            <button
              onClick={login}
              className="w-full bg-slate-800 text-white text-sm font-medium
                         py-2 rounded-md hover:bg-slate-700 transition"
            >
              Login
            </button>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* =======================
     APP SHELL
     ======================= */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 md:px-6 h-16">
          {/* LOGO */}
          <a
            href="https://www.rezteche.com/"
            className="flex items-center"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={logo}
              alt="RezTeche Logo"
              className="h-10 md:h-11 w-auto object-contain"
            />
          </a>

          {/* Navigation */}
          <nav className="relative">
            {/* Desktop nav */}
            <div className="hidden md:flex gap-6 text-sm text-slate-400">
              {[
                ["companies", "Companies"],
                ["projects", "Projects"],
                ["documents", "Documents"],
                ["versions", "Versions"],
                ["auditLogs", "Audit Logs"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setPage(key as Page)}
                  className={`transition-colors ${
                    page === key
                      ? "text-white"
                      : "hover:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md
                         text-slate-200 hover:bg-slate-800/60 transition"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              <span
                className={`block h-0.5 w-5 bg-slate-200 transition-transform duration-200 ${
                  mobileNavOpen ? "translate-y-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-slate-200 my-1 transition-opacity duration-200 ${
                  mobileNavOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-slate-200 transition-transform duration-200 ${
                  mobileNavOpen ? "-translate-y-1.5 -rotate-45" : ""
                }`}
              />
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
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
          <DocumentsPage projectId={selectedProjectId ?? undefined} />
        )}

        {page === "versions" && <DocumentVersionsPage />}
        {page === "auditLogs" && <AuditLogsPage />}
      </main>
    </div>
  );
}

export default App;
