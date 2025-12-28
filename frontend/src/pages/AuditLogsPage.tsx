import { useEffect, useState } from "react";
import { getAuditLogs } from "../api/auditLogs";
import type { AuditLog } from "../types/auditLog";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    getAuditLogs().then(setLogs);
  }, []);

  return (
    <div>
      <h2>Audit Logs</h2>

      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            [{log.entity_type}] {log.action} (ID: {log.entity_id})
            <br />
            By: {log.performed_by_username}
            <br />
            At: {new Date(log.performed_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
