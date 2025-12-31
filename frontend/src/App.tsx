import { useState, useEffect } from "react";
import { api } from "./lib/api";
import CompaniesPage from "./pages/CompaniesPage";
import ProjectsPage from "./pages/ProjectsPage";
import DocumentsPage from "./pages/DocumentsPage";
import DocumentVersionsPage from "./pages/DocumentVersionsPage";
import AuditLogsPage from "./pages/AuditLogsPage";

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
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
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
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800 mb-4 text-center">
            DocControl
          </h1>

          <div className="space-y-4">
            <input
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-slate-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />

            <input
              type="password"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-slate-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />


            <label className="flex items-center gap-2 text-sm text-slate-600">
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
              <p className="text-sm text-red-600 text-center">{error}</p>
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
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">DocControl</h1>

          {/* Navigation */}
          {/* Navigation */}
          <nav className="relative">
            {/* Desktop nav */}
            <div className="hidden md:flex gap-1">
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
                  className={`text-sm px-3 py-1.5 rounded-md transition
          ${
            page === key
              ? "bg-slate-800 text-white"
              : "text-slate-700 hover:bg-slate-200"
          }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-slate-700 border border-slate-300 rounded-md px-3 py-1.5"
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              ☰
            </button>

            {/* Mobile dropdown */}
            {mobileNavOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-md shadow-md md:hidden">
                {[
                  ["companies", "Companies"],
                  ["projects", "Projects"],
                  ["documents", "Documents"],
                  ["versions", "Versions"],
                  ["auditLogs", "Audit Logs"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setPage(key as Page);
                      setMobileNavOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm
            ${
              page === key
                ? "bg-slate-800 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="py-6">
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
