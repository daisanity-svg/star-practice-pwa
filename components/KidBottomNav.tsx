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
    <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-24px)] max-w-[406px] rounded-[30px] border border-white/90 bg-white/92 p-1.5 shadow-[0_16px_40px_rgba(77,68,111,0.22)] backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          const itemClass = active
            ? 'bg-gradient-to-br from-[#6d5dfc] to-[#8f7cff] text-white shadow-[0_8px_18px_rgba(109,93,252,0.24)]'
            : 'text-slate-500 active:bg-[#fff8ec]';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={'flex min-h-[58px] touch-manipulation flex-col items-center justify-center rounded-[24px] text-[12px] font-black transition active:scale-[0.98] ' + itemClass}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="mt-1 leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
