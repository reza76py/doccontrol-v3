import { api } from "../lib/api";
import type { Document } from "../types/document";

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export const getDocuments = async (
  projectId?: number,
  page = 1
): Promise<PaginatedResponse<Document>> => {
  const res = await api.get("/documents/", {
    params: { ...(projectId ? { project: projectId } : {}), page },
  });
  return res.data;
};


export const deleteDocument = async (id: number) => {
  await api.delete(`/documents/${id}/`);
};

type DocumentPayload = {
  project: number;
  document_number: string;
  title: string;
  discipline: string;
  doc_type: string;
  status: string;
};

export const createDocument = async (data: DocumentPayload): Promise<Document> => {
  const res = await api.post("/documents/", data);
  return res.data;
};

export const updateDocument = async (id: number, data: Partial<DocumentPayload>): Promise<Document> => {
  const res = await api.put(`/documents/${id}/`, data);
  return res.data;
};