import Link from 'next/link';

type KidTopBarProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  rightLabel?: string;
};

export function KidTopBar({ title, backHref = '/', backLabel = '首頁', rightLabel }: KidTopBarProps) {
  return (
    <div className="sticky top-2 z-30 flex min-w-0 items-center gap-2 rounded-[28px] border border-white/80 bg-white/86 p-1.5 shadow-[0_12px_30px_rgba(35,135,247,0.14)] backdrop-blur-xl">
      <Link
        href={backHref}
        className="flex h-12 shrink-0 touch-manipulation items-center justify-center rounded-[24px] bg-[#e9f4ff] px-3 text-sm font-black text-[#1675dc] active:scale-[0.98]"
      >
        ← {backLabel}
      </Link>
      <div className="min-w-0 flex-1 truncate text-center text-lg font-black text-ink">{title}</div>
      <div className="flex h-12 min-w-14 shrink-0 items-center justify-center rounded-[24px] bg-[#fff2b7] px-3 text-xl font-black text-amber-900">
        {rightLabel ?? '⭐'}
      </div>
    </div>
  );
}
