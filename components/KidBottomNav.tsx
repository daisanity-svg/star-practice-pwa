'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: '首頁', icon: '🏠' },
  { href: '/practice', label: '練習', icon: '✏️' },
  { href: '/collection', label: '收納', icon: '🎒' },
  { href: '/reward', label: '獎勵', icon: '🎁' }
];

export function KidBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-3 z-30 mt-5 rounded-[30px] border border-white/80 bg-white/85 p-2 shadow-[0_18px_45px_rgba(77,68,111,0.18)] backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[58px] flex-col items-center justify-center rounded-[24px] text-xs font-black transition active:scale-[0.98] ${
                active ? 'bg-[#6d5dfc] text-white shadow-[0_10px_22px_rgba(109,93,252,0.25)]' : 'text-slate-400'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
