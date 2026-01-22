// import { useEffect, useState } from "react";
// import { getDocuments, deleteDocument } from "../api/documents";
// import type { Document } from "../types/document";

// type DocumentsPageProps = {
//   projectId?: number;
// };

// export default function DocumentsPage({ projectId }: DocumentsPageProps) {
//   const [documents, setDocuments] = useState<Document[]>([]);
//   const [deletingId, setDeletingId] = useState<number | null>(null);
//   const [error, setError] = useState<string>("");

//   useEffect(() => {
//     setError("");
//     getDocuments(projectId).then(setDocuments).catch(() => {
//       setError("Failed to load documents.");
//     });
//   }, [projectId]);

//   const onDelete = async (doc: Document) => {
//     setError("");

//     const ok = window.confirm(
//       `Delete document ${doc.document_number}?\n\nThis cannot be undone.`
//     );
//     if (!ok) return;

//     try {
//       setDeletingId(doc.id);
//       await deleteDocument(doc.id);
//       setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
//     } catch (e: unknown) {
//       // backend will block if versions exist
//       const errorResponse = e as { response?: { data?: { detail?: string; non_field_errors?: string[] } } };
//       const msg =
//         errorResponse?.response?.data?.detail ||
//         errorResponse?.response?.data?.non_field_errors?.[0] ||
//         "Delete failed.";
//       setError(String(msg));
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <div className="mb-6">
//         <h2 className="text-2xl font-semibold text-slate-800">Documents</h2>
//         {projectId && <p className="text-sm text-slate-500">Project ID: {projectId}</p>}
//         {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
//       </div>

//       <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
//         <table className="min-w-full text-sm">
//           <thead className="bg-slate-100 text-slate-600">
//             <tr>
//               <th className="px-4 py-3 text-left font-medium">Document No.</th>
//               <th className="px-4 py-3 text-left font-medium">Title</th>
//               <th className="px-4 py-3 text-left font-medium">Discipline</th>
//               <th className="px-4 py-3 text-left font-medium">Status</th>
//               <th className="px-4 py-3 text-left font-medium">Created By</th>
//               <th className="px-4 py-3 text-right font-medium">Actions</th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-slate-200">
//             {documents.map((d) => (
//               <tr key={d.id} className="hover:bg-slate-50 transition">
//                 <td className="px-4 py-3 font-medium text-slate-800">{d.document_number}</td>
//                 <td className="px-4 py-3 text-slate-700">{d.title}</td>
//                 <td className="px-4 py-3 text-slate-600">{d.discipline}</td>

//                 <td className="px-4 py-3">
//                   <span
//                     className={`text-xs font-medium px-2 py-1 rounded-full
//                       ${
//                         d.status === "DRAFT"
//                           ? "bg-slate-200 text-slate-700"
//                           : d.status === "REVIEW"
//                           ? "bg-amber-100 text-amber-700"
//                           : d.status === "IFC"
//                           ? "bg-emerald-100 text-emerald-700"
//                           : "bg-slate-100 text-slate-500"
//                       }`}
//                   >
//                     {d.status}
//                   </span>
//                 </td>

//                 <td className="px-4 py-3 text-slate-600">{d.created_by_username}</td>

//                 <td className="px-4 py-3 text-right">
//                   <button
//                     onClick={() => onDelete(d)}
//                     disabled={deletingId === d.id}
//                     className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium
//                       ${
//                         deletingId === d.id
//                           ? "bg-slate-200 text-slate-500 cursor-not-allowed"
//                           : "bg-red-600 text-white hover:bg-red-700"
//                       }`}
//                   >
//                     {deletingId === d.id ? "Deleting..." : "Delete"}
//                   </button>
//                 </td>
//               </tr>
//             ))}

//             {documents.length === 0 && (
//               <tr>
//                 <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
//                   No documents found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }







import { useEffect, useState, useCallback } from "react";
import { getDocuments, deleteDocument } from "../api/documents";
import type { Document } from "../types/document";

type DocumentsPageProps = {
  projectId?: number;
};

export default function DocumentsPage({ projectId }: DocumentsPageProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await getDocuments(projectId);
      setDocuments(data);
    } catch {
      setError("Failed to load documents.");
      setDocuments([]);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const onDelete = async (doc: Document) => {
    setError("");

    const ok = window.confirm(
      `Delete document ${doc.document_number}?\n\nThis cannot be undone.`
    );
    if (!ok) return;

    try {
      setDeletingId(doc.id);
      await deleteDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (e: unknown) {
      const errorResponse = e as { response?: { data?: { detail?: string | string[]; non_field_errors?: string[] } } };
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
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Documents</h2>
        {projectId && <p className="text-sm text-slate-500">Project ID: {projectId}</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Document No.</th>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Discipline</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Created By</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {documents.map((d) => {
              const hasVersions = (d.versions_count ?? 0) > 0;
              const isDeleting = deletingId === d.id;

              return (
                <tr key={d.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {d.document_number}
                  </td>

                  <td className="px-4 py-3 text-slate-700">{d.title}</td>

                  <td className="px-4 py-3 text-slate-600">{d.discipline}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full
                        ${
                          d.status === "DRAFT"
                            ? "bg-slate-200 text-slate-700"
                            : d.status === "REVIEW"
                            ? "bg-amber-100 text-amber-700"
                            : d.status === "IFC"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                    >
                      {d.status}
                    </span>

                    {/* Optional: show versions count */}
                    <span className="ml-2 text-xs text-slate-400">
                      v:{d.versions_count ?? 0}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-600">{d.created_by_username}</td>

                  <td className="px-4 py-3 text-right">
                    {hasVersions ? (
                      <span className="text-xs text-slate-400">
                        Has versions
                      </span>
                    ) : (
                      <button
                        onClick={() => onDelete(d)}
                        disabled={isDeleting}
                        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium
                          ${
                            isDeleting
                              ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {documents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No documents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
