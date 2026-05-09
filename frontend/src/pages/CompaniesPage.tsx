
import { useEffect, useState } from "react";
import { getCompanies, createCompany, updateCompany, deleteCompany } from "../api/companies";
import type { Company } from "../types/company";

type CompaniesPageProps = {
  onSelectCompany: (companyId: number) => void;
  role: string;
};

export default function CompaniesPage({ onSelectCompany, role }: CompaniesPageProps) {
  const canCreate = role === "ADMIN" || role === "PROJECT_MANAGER";
  const canEdit   = role === "ADMIN" || role === "PROJECT_MANAGER";
  const canDelete = role === "ADMIN";
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit form
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    getCompanies()
      .then(setCompanies)
      .catch(() => setError("Failed to load companies."))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = createName.trim();
    if (!name) return;
    setCreating(true);
    setError("");
    try {
      const created = await createCompany(name);
      setCompanies((prev) => [...prev, created]);
      setCreateName("");
      setShowCreate(false);
    } catch {
      setError("Failed to create company.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (c: Company) => {
    setEditingId(c.id);
    setEditName(c.name);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleUpdate = async (id: number) => {
    const name = editName.trim();
    if (!name) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateCompany(id, name);
      setCompanies((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
    } catch {
      setError("Failed to update company.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Company) => {
    const ok = window.confirm(`Delete company "${c.name}"?\n\nThis cannot be undone.`);
    if (!ok) return;
    setDeletingId(c.id);
    setError("");
    try {
      await deleteCompany(c.id);
      setCompanies((prev) => prev.filter((x) => x.id !== c.id));
    } catch {
      setError("Failed to delete company.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Companies</h2>
          <p className="text-sm text-slate-500">Select a company to view its projects</p>
        </div>
        {canCreate && !showCreate && (
          <button
            onClick={() => { setShowCreate(true); setError(""); }}
            className="text-sm font-medium text-white bg-slate-800 hover:bg-slate-700
                       px-3 py-1.5 rounded-md transition"
          >
            + New Company
          </button>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mb-4 flex items-center gap-2 border border-slate-200 rounded-lg bg-white px-4 py-3"
        >
          <input
            autoFocus
            type="text"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Company name"
            className="flex-1 text-sm border border-slate-300 rounded-md px-3 py-1.5
                       focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <button
            type="submit"
            disabled={creating || !createName.trim()}
            className="text-sm font-medium text-white bg-slate-800 hover:bg-slate-700
                       disabled:bg-slate-300 px-3 py-1.5 rounded-md transition"
          >
            {creating ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            onClick={() => { setShowCreate(false); setCreateName(""); }}
            className="text-sm font-medium text-slate-600 hover:text-slate-800
                       border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-100 transition"
          >
            Cancel
          </button>
        </form>
      )}

      {loading ? (
        <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white animate-pulse">
          {[1, 2, 3].map((n) => (
            <li key={n} className="px-4 py-3 flex items-center justify-between">
              <div className="h-4 w-40 bg-slate-200 rounded" />
              <div className="h-8 w-24 bg-slate-200 rounded-md" />
            </li>
          ))}
        </ul>
      ) : (
      <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white">
        {companies.map((c) => {
          const isEditing = editingId === c.id;
          const isDeleting = deletingId === c.id;

          return (
            <li
              key={c.id}
              className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
            >
              {isEditing ? (
                <div className="flex items-center gap-2 flex-1 mr-4">
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Escape") cancelEdit(); }}
                    className="flex-1 min-w-0 text-sm border border-slate-300 rounded-md px-3 py-1.5
                               focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                  <button
                    onClick={() => handleUpdate(c.id)}
                    disabled={saving || !editName.trim()}
                    className="text-sm font-medium text-white bg-slate-800 hover:bg-slate-700
                               disabled:bg-slate-300 px-3 py-1.5 rounded-md transition"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-sm font-medium text-slate-600 hover:text-slate-800
                               border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="text-sm font-medium text-slate-800">{c.name}</div>
              )}

              {!isEditing && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onSelectCompany(c.id)}
                    className="text-sm font-medium text-slate-700 hover:text-slate-900
                               border border-slate-300 px-3 py-1 rounded-md
                               hover:bg-slate-100 transition"
                  >
                    View Projects
                  </button>
                  {canEdit && (
                  <button
                    onClick={() => startEdit(c)}
                    className="text-sm font-medium text-slate-700 hover:text-slate-900
                               border border-slate-300 px-3 py-1 rounded-md
                               hover:bg-slate-100 transition"
                  >
                    Edit
                  </button>
                  )}
                  {canDelete && (
                  <button
                    onClick={() => handleDelete(c)}
                    disabled={isDeleting}
                    className={`text-sm font-medium px-3 py-1 rounded-md transition
                      ${isDeleting
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"}`}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                  )}
                </div>
              )}
            </li>
          );
        })}

        {companies.length === 0 && !showCreate && (
          <li className="px-4 py-6 text-center text-sm text-slate-500">
            No companies found
          </li>
        )}
      </ul>
      )}
    </div>
  );
}
