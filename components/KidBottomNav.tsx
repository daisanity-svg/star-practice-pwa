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
    <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-24px)] max-w-[402px] rounded-[30px] border border-[#d8eaff] bg-white/94 p-1.5 shadow-[0_18px_42px_rgba(30,64,175,0.16)] backdrop-blur-xl">
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
              className={'flex min-h-[56px] touch-manipulation select-none flex-col items-center justify-center rounded-[23px] text-[12px] font-black transition active:scale-[0.98] ' + itemClass}
            >
              <span className="text-[21px] leading-none">{item.icon}</span>
              <span className="mt-1 leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
