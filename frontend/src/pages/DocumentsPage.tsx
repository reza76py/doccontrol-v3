import { useEffect, useState, useCallback } from "react";
import { getDocuments, createDocument, updateDocument, deleteDocument } from "../api/documents";
import type { Document } from "../types/document";

type DocumentsPageProps = {
  projectId?: number;
  onSelectDocument?: (documentId: number) => void;
};

type FormState = {
  document_number: string;
  title: string;
  discipline: string;
  doc_type: string;
  status: string;
};

const emptyForm = (): FormState => ({
  document_number: "",
  title: "",
  discipline: "",
  doc_type: "",
  status: "DRAFT",
});

const STATUS_OPTIONS = ["DRAFT", "REVIEW", "IFC", "SUPERSEDED", "CANCELLED"] as const;
const DISCIPLINE_OPTIONS = ["STRUCTURAL", "CIVIL", "ARCHITECTURAL", "MECHANICAL", "ELECTRICAL", "GEOTECHNICAL", "SURVEY", "ENVIRONMENTAL"] as const;
const DOC_TYPE_OPTIONS = ["DRAWING", "SPECIFICATION", "REPORT", "CALCULATION", "METHOD_STATEMENT", "INSPECTION", "TRANSMITTAL", "CORRESPONDENCE"] as const;

const statusStyle: Record<string, string> = {
  DRAFT: "bg-slate-200 text-slate-700",
  REVIEW: "bg-amber-100 text-amber-700",
  IFC: "bg-emerald-100 text-emerald-700",
  SUPERSEDED: "bg-slate-100 text-slate-500",
  CANCELLED: "bg-red-100 text-red-500",
};

export default function DocumentsPage({ projectId, onSelectDocument }: DocumentsPageProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    setError("");
    try {
      const data = await getDocuments(projectId);
      setDocuments(data);
    } catch {
      setError("Failed to load documents.");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setCreating(true);
    setError("");
    try {
      const created = await createDocument({ project: projectId, ...createForm });
      setDocuments((prev) => [created, ...prev]);
      setCreateForm(emptyForm());
      setShowCreate(false);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? "Failed to create document.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (doc: Document) => {
    setEditingId(doc.id);
    setEditForm({
      document_number: doc.document_number,
      title: doc.title,
      discipline: doc.discipline,
      doc_type: doc.doc_type,
      status: doc.status,
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm());
  };

  const handleUpdate = async (id: number) => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateDocument(id, editForm);
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));
      setEditingId(null);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? "Failed to update document.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (doc: Document) => {
    const ok = window.confirm(
      `Delete document ${doc.document_number}?\n\nThis cannot be undone.`
    );
    if (!ok) return;
    setDeletingId(doc.id);
    setError("");
    try {
      await deleteDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { detail?: string | string[]; non_field_errors?: string[] } } };
      const detail = errorResponse?.response?.data?.detail;
      const msg =
        (Array.isArray(detail) ? detail[0] : detail) ||
        errorResponse?.response?.data?.non_field_errors?.[0] ||
        "Delete failed.";
      setError(String(msg));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Documents</h2>
          {projectId && (
            <p className="text-sm text-slate-500">Project ID: {projectId}</p>
          )}
        </div>
        {!showCreate && (
          <button
            onClick={() => { setShowCreate(true); setError(""); }}
            className="text-sm font-medium text-white bg-slate-800 hover:bg-slate-700
                       px-3 py-1.5 rounded-md transition"
          >
            + New Document
          </button>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mb-4 border border-slate-200 rounded-lg bg-white px-4 py-4 space-y-3"
        >
          <p className="text-sm font-medium text-slate-700">New Document</p>
          <DocumentFormFields form={createForm} onChange={setCreateForm} />
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={creating || !createForm.document_number.trim() || !createForm.title.trim()}
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

      {loading ? (
        <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white animate-pulse">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Document No.</th>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Discipline</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Created By</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {[1, 2, 3].map((n) => (
                <tr key={n}>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-5 w-16 bg-slate-200 rounded-full" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-3 text-right"><div className="h-7 w-20 bg-slate-200 rounded-md ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Document No.</th>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Discipline</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Created By</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {documents.map((d) => {
              const isEditing = editingId === d.id;
              const isDeleting = deletingId === d.id;
              const hasVersions = (d.versions_count ?? 0) > 0;

              return (
                <tr key={d.id} className="hover:bg-slate-50 transition">
                  {isEditing ? (
                    <td colSpan={7} className="px-4 py-4">
                      <div className="space-y-3">
                        <DocumentFormFields form={editForm} onChange={setEditForm} />
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleUpdate(d.id)}
                            disabled={saving || !editForm.document_number.trim() || !editForm.title.trim()}
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
                    </td>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {d.document_number}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{d.title}</td>
                      <td className="px-4 py-3 text-slate-600">{d.discipline}</td>
                      <td className="px-4 py-3 text-slate-600">{d.doc_type}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full
                            ${statusStyle[d.status] ?? "bg-slate-100 text-slate-500"}`}
                        >
                          {d.status}
                        </span>
                        <span className="ml-2 text-xs text-slate-400">
                          v:{d.versions_count ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{d.created_by_username}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onSelectDocument && (
                            <button
                              onClick={() => onSelectDocument(d.id)}
                              className="text-sm font-medium text-slate-700 hover:text-slate-900
                                         border border-slate-300 px-3 py-1 rounded-md
                                         hover:bg-slate-100 transition"
                            >
                              View Versions
                            </button>
                          )}
                          <button
                            onClick={() => startEdit(d)}
                            className="text-sm font-medium text-slate-700 hover:text-slate-900
                                       border border-slate-300 px-3 py-1 rounded-md
                                       hover:bg-slate-100 transition"
                          >
                            Edit
                          </button>
                          {hasVersions ? (
                            <span className="text-xs text-slate-400">Has versions</span>
                          ) : (
                            <button
                              onClick={() => handleDelete(d)}
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
                      </td>
                    </>
                  )}
                </tr>
              );
            })}

            {documents.length === 0 && !showCreate && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  No documents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

function DocumentFormFields({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (f: FormState) => void;
}) {
  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => onChange({ ...form, [field]: e.target.value });

  const inputCls =
    "w-full text-sm border border-slate-300 rounded-md px-3 py-1.5 " +
    "focus:outline-none focus:ring-2 focus:ring-slate-400";

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-slate-500 mb-1">Document No. *</label>
        <input autoFocus type="text" value={form.document_number} onChange={set("document_number")} className={inputCls} />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Title *</label>
        <input type="text" value={form.title} onChange={set("title")} className={inputCls} />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Discipline</label>
        <select value={form.discipline} onChange={set("discipline")} className={inputCls}>
          <option value="">— Select —</option>
          {DISCIPLINE_OPTIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Type</label>
        <select value={form.doc_type} onChange={set("doc_type")} className={inputCls}>
          <option value="">— Select —</option>
          {DOC_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Status</label>
        <select value={form.status} onChange={set("status")} className={inputCls}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
