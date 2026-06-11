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
    <nav className="kid-bottom-safe fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] px-3">
      <div className="rounded-[32px] border border-[#d8eaff] bg-white/95 p-1.5 shadow-[0_18px_42px_rgba(30,64,175,0.16)] backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-1">
          {items.map((item) => {
            const active = pathname === item.href;
            const itemClass = active
              ? 'bg-gradient-to-br from-[#2f8cff] to-[#1766e6] text-white shadow-[0_10px_22px_rgba(37,99,235,0.30)]'
              : 'text-[#5f6f89] hover:bg-[#f0f7ff] active:bg-[#e5f1ff]';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={'flex min-h-[58px] touch-manipulation select-none flex-col items-center justify-center rounded-[24px] text-[12px] font-black transition active:scale-[0.98] ' + itemClass}
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
