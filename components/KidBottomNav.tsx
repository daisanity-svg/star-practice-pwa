'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: Route;
  label: string;
  icon: string;
};

const items: NavItem[] = [
  { href: '/', label: '首頁', icon: '🏠' },
  { href: '/practice', label: '練習', icon: '✏️' },
  { href: '/collection', label: '收納', icon: '🎒' },
  { href: '/reward', label: '獎勵', icon: '🎁' }
];

export function KidBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="kid-bottom-nav">
      <div className="rounded-[34px] border border-white/80 bg-white/92 p-1.5 shadow-[0_20px_46px_rgba(51,65,85,0.16)] ring-1 ring-[#f1e7d0]/70 backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-1">
          {items.map((item) => {
            const active = pathname === item.href;
            const itemClass = active
              ? 'bg-gradient-to-br from-[#5bb8ff] to-[#2387f7] text-white shadow-[0_10px_22px_rgba(35,135,247,0.30)]'
              : 'text-[#64748b] hover:bg-[#fff8e8] active:bg-[#eaf6ff]';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={'flex min-h-[58px] touch-manipulation select-none flex-col items-center justify-center rounded-[25px] text-[12px] font-black transition active:scale-[0.98] ' + itemClass}
              >
                <span className="text-[22px] leading-none">{item.icon}</span>
                <span className="mt-1 leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
