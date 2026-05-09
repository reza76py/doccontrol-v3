import { useEffect, useState, useCallback } from "react";
import { getProjects, createProject, updateProject, deleteProject } from "../api/projects";
import type { Project } from "../types/project";

type ProjectsPageProps = {
  companyId?: number;
  onSelectProject: (projectId: number) => void;
};

type FormState = {
  name: string;
  code: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
};

const emptyForm = (): FormState => ({
  name: "",
  code: "",
  description: "",
  status: "ACTIVE",
  start_date: "",
  end_date: "",
});

const STATUS_OPTIONS = ["ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED", "CLOSED"] as const;

const statusStyle: Record<string, string> = {
  ACTIVE:    "bg-emerald-100 text-emerald-700",
  ON_HOLD:   "bg-amber-100 text-amber-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-500",
  CLOSED:    "bg-slate-200 text-slate-600",
};

export default function ProjectsPage({ companyId, onSelectProject }: ProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(emptyForm());
  const [creating, setCreating] = useState(false);

  // Edit form
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await getProjects(companyId);
      setProjects(data);
    } catch {
      setError("Failed to load projects.");
      setProjects([]);
    }
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setCreating(true);
    setError("");
    try {
      const created = await createProject({
        company: companyId,
        ...createForm,
      });
      setProjects((prev) => [created, ...prev]);
      setCreateForm(emptyForm());
      setShowCreate(false);
    } catch {
      setError("Failed to create project.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (p: Project) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      code: p.code,
      description: p.description,
      status: p.status,
      start_date: p.start_date ?? "",
      end_date: p.end_date ?? "",
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm());
  };

  const handleUpdate = async (id: number) => {
    if (!companyId) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateProject(id, { company: companyId, ...editForm });
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
    } catch {
      setError("Failed to update project.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Project) => {
    const ok = window.confirm(`Delete project "${p.name}"?\n\nThis cannot be undone.`);
    if (!ok) return;
    setDeletingId(p.id);
    setError("");
    try {
      await deleteProject(p.id);
      setProjects((prev) => prev.filter((x) => x.id !== p.id));
    } catch {
      setError("Failed to delete project.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Projects</h2>
          <p className="text-sm text-slate-500">List of active and closed projects</p>
        </div>
        {!showCreate && (
          <button
            onClick={() => { setShowCreate(true); setError(""); }}
            className="text-sm font-medium text-white bg-slate-800 hover:bg-slate-700
                       px-3 py-1.5 rounded-md transition"
          >
            + New Project
          </button>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mb-4 border border-slate-200 rounded-lg bg-white px-4 py-4 space-y-3"
        >
          <p className="text-sm font-medium text-slate-700">New Project</p>
          <ProjectFormFields form={createForm} onChange={setCreateForm} />
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={creating || !createForm.name.trim() || !createForm.code.trim()}
              className="text-sm font-medium text-white bg-slate-800 hover:bg-slate-700
                         disabled:bg-slate-300 px-3 py-1.5 rounded-md transition"
            >
              {creating ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreate(false); setCreateForm(emptyForm()); }}
              className="text-sm font-medium text-slate-600 hover:text-slate-800
                         border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-100 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white">
        {projects.map((p) => {
          const isEditing = editingId === p.id;
          const isDeleting = deletingId === p.id;

          return (
            <li key={p.id} className="px-4 py-3 hover:bg-slate-50 transition">
              {isEditing ? (
                <div className="space-y-3">
                  <ProjectFormFields form={editForm} onChange={setEditForm} />
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleUpdate(p.id)}
                      disabled={saving || !editForm.name.trim() || !editForm.code.trim()}
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
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{p.code}</div>
                    <div className="text-sm text-slate-600">{p.name}</div>
                    {p.description && (
                      <div className="text-xs text-slate-400 mt-0.5">{p.description}</div>
                    )}
                    {(p.start_date || p.end_date) && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        {p.start_date ?? "—"} → {p.end_date ?? "—"}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full
                        ${statusStyle[p.status] ?? "bg-slate-100 text-slate-500"}`}
                    >
                      {p.status}
                    </span>
                    <button
                      onClick={() => onSelectProject(p.id)}
                      className="text-sm font-medium text-slate-700 hover:text-slate-900
                                 border border-slate-300 px-3 py-1 rounded-md
                                 hover:bg-slate-100 transition"
                    >
                      View Documents
                    </button>
                    <button
                      onClick={() => startEdit(p)}
                      className="text-sm font-medium text-slate-700 hover:text-slate-900
                                 border border-slate-300 px-3 py-1 rounded-md
                                 hover:bg-slate-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={isDeleting}
                      className={`text-sm font-medium px-3 py-1 rounded-md transition
                        ${isDeleting
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"}`}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}

        {projects.length === 0 && !showCreate && (
          <li className="px-4 py-6 text-center text-sm text-slate-500">
            No projects found
          </li>
        )}
      </ul>
    </div>
  );
}

function ProjectFormFields({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (f: FormState) => void;
}) {
  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => onChange({ ...form, [field]: e.target.value });

  const inputCls =
    "w-full text-sm border border-slate-300 rounded-md px-3 py-1.5 " +
    "focus:outline-none focus:ring-2 focus:ring-slate-400";

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-slate-500 mb-1">Name *</label>
        <input autoFocus type="text" value={form.name} onChange={set("name")} className={inputCls} />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Code *</label>
        <input type="text" value={form.code} onChange={set("code")} className={inputCls} />
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-slate-500 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={set("description")}
          rows={2}
          className={inputCls + " resize-none"}
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Status</label>
        <select value={form.status} onChange={set("status")} className={inputCls}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Start date</label>
          <input type="date" value={form.start_date} onChange={set("start_date")} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">End date</label>
          <input type="date" value={form.end_date} onChange={set("end_date")} className={inputCls} />
        </div>
      </div>
    </div>
  );
}
