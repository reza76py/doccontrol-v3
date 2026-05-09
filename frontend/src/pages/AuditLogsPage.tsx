import { useEffect, useState } from "react";
import { getAuditLogs } from "../api/auditLogs";
import type { AuditLog } from "../types/auditLog";

const ACTION_OPTIONS = ["CREATE", "UPDATE", "ISSUE", "CANCEL", "DELETE"] as const;
const ENTITY_OPTIONS = ["COMPANY", "PROJECT", "DOCUMENT", "VERSION"] as const;

const actionStyle: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-amber-100 text-amber-700",
  ISSUE:  "bg-blue-100 text-blue-700",
  CANCEL: "bg-red-100 text-red-500",
  DELETE: "bg-red-200 text-red-700",
};

const entityStyle: Record<string, string> = {
  COMPANY:  "bg-purple-100 text-purple-700",
  PROJECT:  "bg-slate-200 text-slate-700",
  DOCUMENT: "bg-sky-100 text-sky-700",
  VERSION:  "bg-teal-100 text-teal-700",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");
  const [filterEntity, setFilterEntity] = useState("");

  useEffect(() => {
    setLoading(true);
    getAuditLogs()
      .then(setLogs)
      .catch(() => setError("Failed to load audit logs."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(
    (l) =>
      (filterAction === "" || l.action === filterAction) &&
      (filterEntity === "" || l.entity_type === filterEntity)
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const selectCls =
    "text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-slate-400";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Audit Logs</h2>
          <p className="text-sm text-slate-500">
            {filtered.length} of {logs.length} entries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className={selectCls}
          >
            <option value="">All actions</option>
            {ACTION_OPTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className={selectCls}
          >
            <option value="">All entity types</option>
            {ENTITY_OPTIONS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>

          {(filterAction || filterEntity) && (
            <button
              onClick={() => { setFilterAction(""); setFilterEntity(""); }}
              className="text-sm font-medium text-slate-600 hover:text-slate-800
                         border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-100 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white animate-pulse">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
                <th className="px-4 py-3 text-left font-medium">Entity Type</th>
                <th className="px-4 py-3 text-left font-medium">Entity ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {[1, 2, 3].map((n) => (
                <tr key={n}>
                  <td className="px-4 py-3"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-5 w-16 bg-slate-200 rounded-full" /></td>
                  <td className="px-4 py-3"><div className="h-5 w-20 bg-slate-200 rounded-full" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-8 bg-slate-200 rounded" /></td>
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
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
              <th className="px-4 py-3 text-left font-medium">Entity Type</th>
              <th className="px-4 py-3 text-left font-medium">Entity ID</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {formatDate(log.performed_at)}
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {log.performed_by_username}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full
                      ${actionStyle[log.action] ?? "bg-slate-100 text-slate-500"}`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full
                      ${entityStyle[log.entity_type] ?? "bg-slate-100 text-slate-500"}`}
                  >
                    {log.entity_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{log.entity_id}</td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  {logs.length === 0 ? "No audit logs found" : "No entries match the current filters"}
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
