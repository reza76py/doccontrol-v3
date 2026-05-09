import { useEffect, useState, useCallback, useRef } from "react";
import { getDocumentVersions, uploadVersion } from "../api/documentVersions";
import type { DocumentVersion } from "../types/documentVersion";

type DocumentVersionsPageProps = {
  documentId: number;
};

export default function DocumentVersionsPage({ documentId }: DocumentVersionsPageProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  // Upload form
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [changeNote, setChangeNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [documentId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDocumentVersions(documentId, currentPage);
      setVersions(data.results);
      setTotalCount(data.count);
      setHasNext(data.next !== null);
    } catch {
      setError("Failed to load versions.");
      setVersions([]);
    } finally {
      setLoading(false);
    }
  }, [documentId, currentPage]);

  useEffect(() => {
    load();
  }, [load]);

  const resetUploadForm = () => {
    setFile(null);
    setChangeNote("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const created = await uploadVersion(documentId, file, changeNote);
      setVersions((prev) => [created, ...prev]);
      resetUploadForm();
      setShowUpload(false);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? "Failed to upload version.");
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Document Versions</h2>
          <p className="text-sm text-slate-500">Document ID: {documentId}</p>
        </div>
        {!showUpload && (
          <button
            onClick={() => { setShowUpload(true); setError(""); }}
            className="text-sm font-medium text-white bg-slate-800 hover:bg-slate-700
                       px-3 py-1.5 rounded-md transition"
          >
            + Upload Version
          </button>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {showUpload && (
        <form
          onSubmit={handleUpload}
          className="mb-4 border border-slate-200 rounded-lg bg-white px-4 py-4 space-y-3"
        >
          <p className="text-sm font-medium text-slate-700">Upload New Version</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">File *</label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-slate-700 border border-slate-300 rounded-md px-3 py-1.5
                           file:mr-3 file:text-xs file:font-medium file:border-0
                           file:bg-slate-100 file:text-slate-700 file:rounded file:px-2 file:py-1
                           focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Change Note</label>
              <input
                type="text"
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
                placeholder="Optional"
                className="w-full text-sm border border-slate-300 rounded-md px-3 py-1.5
                           focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={uploading || !file}
              className="text-sm font-medium text-white bg-slate-800 hover:bg-slate-700
                         disabled:bg-slate-300 px-3 py-1.5 rounded-md transition"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <button
              type="button"
              onClick={() => { setShowUpload(false); resetUploadForm(); }}
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
                <th className="px-4 py-3 text-left font-medium">Version</th>
                <th className="px-4 py-3 text-left font-medium">File</th>
                <th className="px-4 py-3 text-left font-medium">Change Note</th>
                <th className="px-4 py-3 text-left font-medium">Uploaded By</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {[1, 2, 3].map((n) => (
                <tr key={n}>
                  <td className="px-4 py-3"><div className="h-4 w-8 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
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
              <th className="px-4 py-3 text-left font-medium">Version</th>
              <th className="px-4 py-3 text-left font-medium">File</th>
              <th className="px-4 py-3 text-left font-medium">Change Note</th>
              <th className="px-4 py-3 text-left font-medium">Uploaded By</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {versions.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-medium text-slate-800">
                  v{v.version_number}
                </td>
                <td className="px-4 py-3">
                  {v.file ? (
                    <a
                      href={v.file}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-700 hover:text-slate-900 underline underline-offset-2"
                    >
                      {v.file.split("/").pop()}
                    </a>
                  ) : (
                    <span className="text-slate-400">No file</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {v.change_note || <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3 text-slate-600">{v.uploaded_by_username}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(v.uploaded_at)}</td>
              </tr>
            ))}

            {versions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No versions uploaded yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {!loading && totalCount > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-md border border-slate-300 font-medium
                       text-slate-700 hover:bg-slate-100 transition
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-slate-500">
            Page {currentPage} of {Math.ceil(totalCount / 20)}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={!hasNext}
            className="px-3 py-1.5 rounded-md border border-slate-300 font-medium
                       text-slate-700 hover:bg-slate-100 transition
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
