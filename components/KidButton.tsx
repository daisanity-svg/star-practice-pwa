import Link from 'next/link';
import type { Route } from 'next';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type KidButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: Route;
  children: ReactNode;
  tone?: 'primary' | 'mint' | 'butter' | 'sky' | 'white' | 'soft';
  className?: string;
};

const toneClass = {
  primary: 'bg-gradient-to-r from-[#5bb8ff] to-[#2387f7] text-white shadow-[0_18px_34px_rgba(35,135,247,0.30)]',
  mint: 'bg-gradient-to-r from-[#a8e6cf] to-[#f1fff8] text-emerald-950 shadow-[0_12px_24px_rgba(16,185,129,0.14)]',
  butter: 'bg-gradient-to-r from-[#ffd66b] to-[#fff3b8] text-amber-950 shadow-[0_12px_24px_rgba(245,158,11,0.16)]',
  sky: 'bg-gradient-to-r from-[#aee4ff] to-[#f4faff] text-blue-950 shadow-[0_12px_24px_rgba(35,135,247,0.15)]',
  white: 'bg-white text-ink border border-[#f1e7d0] shadow-[0_12px_26px_rgba(18,48,79,0.08)]',
  soft: 'bg-[#eaf6ff] text-[#1675dc] shadow-[0_10px_24px_rgba(35,135,247,0.10)]'
};

export function KidButton({ href, children, tone = 'primary', className = '', type = 'button', ...buttonProps }: KidButtonProps) {
  const classes = `tap-target flex touch-manipulation select-none items-center justify-center gap-2 px-6 text-center text-xl font-black tracking-[-0.02em] ring-1 ring-white/70 transition active:scale-[0.98] ${toneClass[tone]} ${className}`;

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return <button type={type} className={classes} {...buttonProps}>{children}</button>;
}
