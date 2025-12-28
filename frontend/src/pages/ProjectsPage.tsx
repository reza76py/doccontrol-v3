// import { useEffect, useState } from "react";
// import { getProjects } from "../api/projects";
// import type { Project } from "../types/project";

// export default function ProjectsPage() {
//   const [projects, setProjects] = useState<Project[]>([]);

//   useEffect(() => {
//     getProjects().then(setProjects);
//   }, []);

//   return (
//     <div>
//       <h2>Projects</h2>

//       <ul>
//         {projects.map((p) => (
//           <li key={p.id}>
//             <strong>{p.code}</strong> — {p.name}  
//             <br />
//             Company: {p.company_name} | Status: {p.status}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }







// import { useEffect, useState } from "react";
// import { getProjects } from "../api/projects";
// import type { Project } from "../types/project";

// interface Props {
//   companyId?: number;
// }

// export default function ProjectsPage({ companyId }: Props) {
//   const [projects, setProjects] = useState<Project[]>([]);

//   useEffect(() => {
//     getProjects(companyId).then(setProjects);
//   }, [companyId]);

//   return (
//     <div>
//       <h2>Projects {companyId && `(Company ID: ${companyId})`}</h2>

//       <ul>
//         {projects.map((p) => (
//           <li key={p.id}>
//             <strong>{p.code}</strong> — {p.name}
//             <br />
//             Status: {p.status}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }






// import { useEffect, useState } from "react";
// import { getProjects } from "../api/projects";
// import type { Project } from "../types/project";

// type ProjectsPageProps = {
//   companyId?: number;
// };

// export default function ProjectsPage({ companyId }: ProjectsPageProps) {
//   const [projects, setProjects] = useState<Project[]>([]);

//   useEffect(() => {
//     getProjects(companyId).then(setProjects);
//   }, [companyId]);

//   return (
//     <div className="p-6 max-w-5xl mx-auto">
//       {/* Page title */}
//       <div className="mb-6">
//         <h2 className="text-2xl font-semibold text-slate-800">
//           Projects
//         </h2>
//         <p className="text-sm text-slate-500">
//           List of active and closed projects
//         </p>
//       </div>

//       {/* Projects list */}
//       <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white">
//         {projects.map((p) => (
//           <li
//             key={p.id}
//             className="px-4 py-3 hover:bg-slate-50 transition"
//           >
//             <div className="flex items-center justify-between">
//               {/* Left */}
//               <div>
//                 <div className="text-sm font-medium text-slate-800">
//                   {p.code}
//                 </div>
//                 <div className="text-sm text-slate-600">
//                   {p.name}
//                 </div>
//               </div>

//               {/* Right: status */}
//               <span
//                 className={`text-xs font-medium px-2 py-1 rounded-full
//                   ${
//                     p.status === "ACTIVE"
//                       ? "bg-emerald-100 text-emerald-700"
//                       : "bg-slate-200 text-slate-600"
//                   }
//                 `}
//               >
//                 {p.status}
//               </span>
//             </div>
//           </li>
//         ))}

//         {projects.length === 0 && (
//           <li className="px-4 py-6 text-center text-sm text-slate-500">
//             No projects found
//           </li>
//         )}
//       </ul>
//     </div>
//   );
// }











import { useEffect, useState } from "react";
import { getProjects } from "../api/projects";
import type { Project } from "../types/project";

type ProjectsPageProps = {
  companyId?: number;
  onSelectProject: (projectId: number) => void;
};

export default function ProjectsPage({
  companyId,
  onSelectProject,
}: ProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getProjects(companyId).then(setProjects);
  }, [companyId]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Page title */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">
          Projects
        </h2>
        <p className="text-sm text-slate-500">
          List of active and closed projects
        </p>
      </div>

      {/* Projects list */}
      <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white">
        {projects.map((p) => (
          <li
            key={p.id}
            className="px-4 py-3 hover:bg-slate-50 transition"
          >
            <div className="flex items-center justify-between">
              {/* Left */}
              <div>
                <div className="text-sm font-medium text-slate-800">
                  {p.code}
                </div>
                <div className="text-sm text-slate-600">
                  {p.name}
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-3">
                {/* Status */}
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full
                    ${
                      p.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }
                  `}
                >
                  {p.status}
                </span>

                {/* Action */}
                <button
                  onClick={() => onSelectProject(p.id)}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View Documents
                </button>
              </div>
            </div>
          </li>
        ))}

        {projects.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-slate-500">
            No projects found
          </li>
        )}
      </ul>
    </div>
  );
}
