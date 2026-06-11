import Link from 'next/link';

type KidTopBarProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  rightLabel?: string;
};

export function KidTopBar({ title, backHref = '/', backLabel = '首頁', rightLabel }: KidTopBarProps) {
  return (
    <div className="sticky top-2 z-20 mb-3 flex min-w-0 items-center gap-2 rounded-[24px] border border-white/80 bg-white/88 p-1.5 shadow-[0_10px_28px_rgba(77,68,111,0.12)] backdrop-blur-xl">
      <Link
        href={backHref}
        className="flex h-11 shrink-0 touch-manipulation items-center justify-center rounded-[20px] bg-[#f4f0ff] px-3 text-sm font-black text-[#5b4be8] active:scale-[0.98]"
      >
        ← {backLabel}
      </Link>
      <div className="min-w-0 flex-1 truncate text-center text-base font-black text-ink">{title}</div>
      <div className="flex h-11 min-w-12 shrink-0 items-center justify-center rounded-[20px] bg-[#fff4c8] px-3 text-lg font-black text-amber-900">
        {rightLabel ?? '⭐'}
      </div>
    </div>
  );
}
