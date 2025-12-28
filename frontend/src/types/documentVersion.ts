export interface DocumentVersion {
  id: number;
  document: number;
  version_number: number;
  file: string;
  change_note: string;
  uploaded_by: number;
  uploaded_by_username: string;
  uploaded_at: string;
}
