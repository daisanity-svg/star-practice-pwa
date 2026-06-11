import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type KidButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  children: ReactNode;
  tone?: 'primary' | 'mint' | 'butter' | 'sky' | 'white' | 'soft';
  className?: string;
};

const toneClass = {
  primary: 'bg-gradient-to-r from-[#2387f7] to-[#1167d8] text-white shadow-[0_16px_32px_rgba(35,135,247,0.28)]',
  mint: 'bg-gradient-to-r from-[#dff8ef] to-[#f1fff8] text-emerald-950 shadow-[0_10px_22px_rgba(16,185,129,0.12)]',
  butter: 'bg-gradient-to-r from-[#ffdf68] to-[#fff3b8] text-amber-950 shadow-[0_10px_22px_rgba(245,158,11,0.14)]',
  sky: 'bg-gradient-to-r from-[#dceeff] to-[#f4faff] text-blue-950 shadow-[0_10px_22px_rgba(35,135,247,0.14)]',
  white: 'bg-white text-ink border border-[#dceeff] shadow-[0_10px_24px_rgba(18,48,79,0.08)]',
  soft: 'bg-[#e9f4ff] text-[#1675dc] shadow-[0_10px_24px_rgba(35,135,247,0.1)]'
};

export function KidButton({ href, children, tone = 'primary', className = '', type = 'button', ...buttonProps }: KidButtonProps) {
  const classes = `tap-target flex touch-manipulation select-none items-center justify-center gap-2 px-6 text-center text-xl font-black tracking-[-0.02em] transition active:scale-[0.98] ${toneClass[tone]} ${className}`;

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return <button type={type} className={classes} {...buttonProps}>{children}</button>;
}
