export interface Project {
  id: number;
  company: number;
  company_name: string;
  code: string;
  name: string;
  description: string;
  status: "ACTIVE" | "CLOSED";
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}
