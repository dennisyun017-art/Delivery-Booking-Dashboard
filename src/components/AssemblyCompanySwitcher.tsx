"use client";

import { useRouter } from "next/navigation";

export default function AssemblyCompanySwitcher({
  companies,
  currentId,
}: {
  companies: { id: string; company_name: string }[];
  currentId: string;
}) {
  const router = useRouter();

  return (
    <select
      value={currentId}
      onChange={(e) => router.push(`/admin/assembly/${e.target.value}`)}
      className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
    >
      {companies.map((c) => (
        <option key={c.id} value={c.id}>
          {c.company_name}
        </option>
      ))}
    </select>
  );
}
