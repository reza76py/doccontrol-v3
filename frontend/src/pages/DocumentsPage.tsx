
import { useEffect, useState } from "react";
import { getDocuments } from "../api/documents";
import type { Document } from "../types/document";

type DocumentsPageProps = {
  projectId?: number;
};

export default function DocumentsPage({ projectId }: DocumentsPageProps) {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    getDocuments(projectId).then(setDocuments);
  }, [projectId]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">
          Documents
        </h2>
        {projectId && (
          <p className="text-sm text-slate-500">
            Project ID: {projectId}
          </p>
        )}
      </div>

      {/* Documents table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                Document No.
              </th>
              <th className="px-4 py-3 text-left font-medium">
                Title
              </th>
              <th className="px-4 py-3 text-left font-medium">
                Discipline
              </th>
              <th className="px-4 py-3 text-left font-medium">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium">
                Created By
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {documents.map((d) => (
              <tr
                key={d.id}
                className="hover:bg-slate-50 transition"
              >
                <td className="px-4 py-3 font-medium text-slate-800">
                  {d.document_number}
                </td>

                <td className="px-4 py-3 text-slate-700">
                  {d.title}
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {d.discipline}
                </td>

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
                      }
                    `}
                  >
                    {d.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {d.created_by_username}
                </td>
              </tr>
            ))}

            {documents.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-slate-500"
                >
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


