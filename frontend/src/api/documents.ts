import { api } from "../lib/api";
import type { Document } from "../types/document";

export const getDocuments = async (
  projectId?: number
): Promise<Document[]> => {
  const res = await api.get("/documents/", {
    params: projectId ? { project: projectId } : {},
  });
  return res.data;
};
