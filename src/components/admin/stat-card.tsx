type StatCardProps = {
  label: string;
  value: number;
  hint: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-[27px] font-bold tracking-tight text-slate-900">
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
    </article>
  );
}
