const ACCENTS = {
  slate: "text-slate-800",
  amber: "text-amber-600",
  green: "text-green-600",
  red: "text-red-600",
} as const;

export default function StatTile({
  label,
  value,
  accent = "slate",
}: {
  label: string;
  value: number;
  accent?: keyof typeof ACCENTS;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-[0_1px_2px_rgb(0,0,0,0.04)]">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${ACCENTS[accent]}`}>{value}</p>
    </div>
  );
}
