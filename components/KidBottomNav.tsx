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
    <nav className="sticky bottom-3 z-30 mt-5 rounded-[34px] border border-white/80 bg-white/90 p-2 shadow-[0_18px_45px_rgba(77,68,111,0.18)] backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          const itemClass = active
            ? 'bg-gradient-to-br from-[#6d5dfc] to-[#8f7cff] text-white shadow-[0_10px_22px_rgba(109,93,252,0.25)]'
            : 'text-slate-400 hover:bg-[#fff8ec]';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={'flex min-h-[62px] flex-col items-center justify-center rounded-[26px] text-xs font-black transition active:scale-[0.98] ' + itemClass}
            >
              <span className="text-2xl leading-none">{item.icon}</span>
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
