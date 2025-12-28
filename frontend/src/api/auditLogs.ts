import { api } from "../lib/api";
import type { AuditLog } from "../types/auditLog";

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const res = await api.get("/audit-logs/");
  return res.data;
};
