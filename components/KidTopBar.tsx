import Link from 'next/link';

type KidTopBarProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  rightLabel?: string;
};

export function KidTopBar({ title, backHref = '/', backLabel = '首頁', rightLabel }: KidTopBarProps) {
  return (
    <div className="sticky top-2 z-40 flex min-w-0 items-center gap-2 rounded-[26px] border border-[#d7eaff] bg-white/95 p-1.5 shadow-[0_14px_32px_rgba(37,99,235,0.13)] backdrop-blur-xl">
      <Link
        href={backHref}
        className="flex h-10 shrink-0 touch-manipulation items-center justify-center rounded-[20px] bg-[#eef6ff] px-3 text-[13px] font-black text-[#1766e6] active:scale-[0.98]"
      >
        ‹ {backLabel}
      </Link>
      <div className="min-w-0 flex-1 truncate text-center text-[17px] font-black tracking-[-0.03em] text-[#172033]">{title}</div>
      <div className="flex h-10 min-w-11 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#dbeafe] to-[#fff1b8] px-3 text-base font-black text-[#1d4ed8]">
        {rightLabel ?? '⭐'}
      </div>
    </div>
  );
}
