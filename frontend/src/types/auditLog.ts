export interface AuditLog {
  id: number;
  entity_type: "COMPANY" | "PROJECT" | "DOCUMENT" | "VERSION";
  entity_id: number;
  action: "CREATE" | "UPDATE" | "ISSUE" | "CANCEL";
  old_value: unknown | null;
  new_value: unknown | null;
  performed_by: number;
  performed_by_username: string;
  performed_at: string;
}
