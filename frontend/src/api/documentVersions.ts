import { api } from "../lib/api";
import type { DocumentVersion } from "../types/documentVersion";
import type { PaginatedResponse } from "./documents";

export const getDocumentVersions = async (
  documentId: number,
  page = 1
): Promise<PaginatedResponse<DocumentVersion>> => {
  const res = await api.get("/document-versions/", {
    params: { document: documentId, page },
  });
  return res.data;
};

export const uploadVersion = async (
  documentId: number,
  file: File,
  changeNote: string
): Promise<DocumentVersion> => {
  const form = new FormData();
  form.append("file", file);
  form.append("change_note", changeNote);
  const res = await api.post(`/documents/${documentId}/upload-version/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
