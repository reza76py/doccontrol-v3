
import { useEffect, useState } from "react";
import { getCompanies } from "../api/companies";
import type { Company } from "../types/company";

type CompaniesPageProps = {
  onSelectCompany: (companyId: number) => void;
};

export default function CompaniesPage({
  onSelectCompany,
}: CompaniesPageProps) {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    getCompanies().then(setCompanies);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">
          Companies
        </h2>
        <p className="text-sm text-slate-500">
          Select a company to view its projects
        </p>
      </div>

      {/* Companies list */}
      <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white">
        {companies.map((c) => (
          <li
            key={c.id}
            className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
          >
            {/* Company name */}
            <div className="text-sm font-medium text-slate-800">
              {c.name}
            </div>

            {/* Action */}
            <button
              onClick={() => onSelectCompany(c.id)}
              className="text-sm font-medium text-slate-700 hover:text-slate-900
                         border border-slate-300 px-3 py-1 rounded-md
                         hover:bg-slate-100 transition"
            >
              View Projects
            </button>
          </li>
        ))}

        {companies.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-slate-500">
            No companies found
          </li>
        )}
      </ul>
    </div>
  );
}
