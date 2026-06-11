import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type KidButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  children: ReactNode;
  tone?: 'primary' | 'mint' | 'butter' | 'sky' | 'white' | 'soft';
  className?: string;
};

const toneClass = {
  primary: 'bg-gradient-to-r from-[#6d5dfc] via-[#7d6dff] to-[#a78bfa] text-white shadow-[0_16px_32px_rgba(109,93,252,0.3)]',
  mint: 'bg-gradient-to-r from-[#c9f7df] to-[#e6fff1] text-emerald-950 shadow-[0_10px_22px_rgba(16,185,129,0.12)]',
  butter: 'bg-gradient-to-r from-[#fff0b8] to-[#fff8dc] text-amber-950 shadow-[0_10px_22px_rgba(245,158,11,0.12)]',
  sky: 'bg-gradient-to-r from-[#dff0ff] to-[#eef7ff] text-blue-950 shadow-[0_10px_22px_rgba(59,130,246,0.12)]',
  white: 'bg-white text-ink border border-white shadow-[0_10px_24px_rgba(15,23,42,0.08)]',
  soft: 'bg-[#f4f0ff] text-[#5b4be8] shadow-[0_10px_24px_rgba(109,93,252,0.1)]'
};

export function KidButton({ href, children, tone = 'primary', className = '', type = 'button', ...buttonProps }: KidButtonProps) {
  const classes = `tap-target flex items-center justify-center gap-2 px-6 text-center text-xl font-black tracking-[-0.02em] active:scale-[0.98] transition ${toneClass[tone]} ${className}`;

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return <button type={type} className={classes} {...buttonProps}>{children}</button>;
}
