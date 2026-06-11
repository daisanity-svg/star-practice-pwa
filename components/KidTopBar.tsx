import Link from 'next/link';

type KidTopBarProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  rightLabel?: string;
};

export function KidTopBar({ title, backHref = '/', backLabel = '回首頁', rightLabel }: KidTopBarProps) {
  return (
    <div className="sticky top-3 z-20 mb-4 flex items-center justify-between gap-3 rounded-[28px] border border-white/70 bg-white/80 p-2 shadow-[0_14px_35px_rgba(77,68,111,0.12)] backdrop-blur-xl">
      <Link
        href={backHref}
        className="flex min-h-[48px] items-center justify-center rounded-[22px] bg-[#f4f0ff] px-4 text-base font-black text-[#5b4be8] active:scale-[0.98]"
      >
        ← {backLabel}
      </Link>
      <div className="min-w-0 flex-1 text-center text-lg font-black text-ink">{title}</div>
      <div className="flex min-h-[48px] min-w-[70px] items-center justify-center rounded-[22px] bg-[#fff4c8] px-3 text-base font-black text-amber-900">
        {rightLabel ?? '⭐'}
      </div>
    </div>
  );
}
