export interface Document {
  id: number;
  project: number;
  document_number: string;
  title: string;
  discipline: string;
  doc_type: string;
  status: "DRAFT" | "REVIEW" | "IFC" | "SUPERSEDED" | "CANCELLED";
  created_by: number;
  created_by_username: string;
  created_at: string;
  versions_count: number;
}