import Link from 'next/link';
import type { Route } from 'next';

type KidTopBarProps = {
  title: string;
  backHref?: Route;
  backLabel?: string;
  rightLabel?: string;
};

export function KidTopBar({ title, backHref = '/', backLabel = '首頁', rightLabel }: KidTopBarProps) {
  return (
    <div className="kid-topbar">
      <Link
        href={backHref}
        className="flex h-10 shrink-0 touch-manipulation items-center justify-center rounded-[21px] bg-[#eaf6ff] px-3 text-[13px] font-black text-[#1766e6] shadow-sm active:scale-[0.98]"
      >
        ‹ {backLabel}
      </Link>
      <div className="min-w-0 flex-1 truncate text-center text-[17px] font-black tracking-[-0.03em] text-[#172033]">{title}</div>
      <div className="flex h-10 min-w-11 shrink-0 items-center justify-center rounded-[21px] bg-gradient-to-br from-[#aee4ff] to-[#fff1b8] px-3 text-base font-black text-[#1d4ed8] shadow-sm">
        {rightLabel ?? '⭐'}
      </div>
    </div>
  );
}
