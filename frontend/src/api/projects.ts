
import { api } from "../lib/api";
import type { Project } from "../types/project";

export const getProjects = async (
  companyId?: number
): Promise<Project[]> => {
  const res = await api.get("/projects/", {
    params: companyId ? { company: companyId } : {},
  });
  return res.data;
};

type ProjectPayload = {
  company: number;
  code: string;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
};

export const createProject = async (data: ProjectPayload): Promise<Project> => {
  const res = await api.post("/projects/", data);
  return res.data;
};

export const updateProject = async (id: number, data: Partial<ProjectPayload>): Promise<Project> => {
  const res = await api.put(`/projects/${id}/`, data);
  return res.data;
};

export const deleteProject = async (id: number): Promise<void> => {
  await api.delete(`/projects/${id}/`);
};
