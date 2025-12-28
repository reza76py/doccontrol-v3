// import { api } from "../lib/api";
// import type { Project } from "../types/project";

// export const getProjects = async (): Promise<Project[]> => {
//   const res = await api.get("/projects/");
//   return res.data;
// };






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
