type ProgressPillProps = {
  label: string;
  value: string;
};

export function ProgressPill({ label, value }: ProgressPillProps) {
  return (
    <div className="rounded-3xl bg-white/80 px-4 py-3 text-center shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-grape">{value}</p>
    </div>
  );
}
