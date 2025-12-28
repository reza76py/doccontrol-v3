import { api } from "../lib/api";
import type { DocumentVersion } from "../types/documentVersion";

export const getDocumentVersions = async (): Promise<DocumentVersion[]> => {
  const res = await api.get("/document-versions/");
  return res.data;
};
