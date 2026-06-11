import Link from 'next/link';

type KidTopBarProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  rightLabel?: string;
};

export function KidTopBar({ title, backHref = '/', backLabel = '首頁', rightLabel }: KidTopBarProps) {
  return (
    <div className="sticky top-2 z-30 flex min-w-0 items-center gap-2 rounded-[26px] border border-white/80 bg-white/90 p-1.5 shadow-[0_12px_30px_rgba(37,99,235,0.12)] backdrop-blur-xl">
      <Link
        href={backHref}
        className="flex h-11 shrink-0 touch-manipulation items-center justify-center rounded-[22px] bg-[#eef6ff] px-3 text-sm font-black text-[#2563eb] active:scale-[0.98]"
      >
        ‹ {backLabel}
      </Link>
      <div className="min-w-0 flex-1 truncate text-center text-[17px] font-black tracking-tight text-[#172033]">{title}</div>
      <div className="flex h-11 min-w-12 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#dbeafe] to-[#fff1b8] px-3 text-xl font-black text-[#1d4ed8]">
        {rightLabel ?? '⭐'}
      </div>
    </div>
  );
}
