import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type KidButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  children: ReactNode;
  tone?: 'primary' | 'mint' | 'butter' | 'sky' | 'white';
  className?: string;
};

const toneClass = {
  primary: 'bg-gradient-to-r from-[#6d5dfc] to-[#8f7cff] text-white shadow-[0_14px_30px_rgba(109,93,252,0.28)]',
  mint: 'bg-[#d9fae8] text-emerald-900 shadow-[0_10px_22px_rgba(16,185,129,0.12)]',
  butter: 'bg-[#fff0b8] text-amber-950 shadow-[0_10px_22px_rgba(245,158,11,0.12)]',
  sky: 'bg-[#dff0ff] text-blue-950 shadow-[0_10px_22px_rgba(59,130,246,0.12)]',
  white: 'bg-white text-ink border border-slate-200 shadow-[0_10px_22px_rgba(15,23,42,0.06)]'
};

export function KidButton({ href, children, tone = 'primary', className = '', type = 'button', ...buttonProps }: KidButtonProps) {
  const classes = `tap-target flex items-center justify-center gap-2 px-6 text-center text-xl font-black active:scale-[0.98] transition ${toneClass[tone]} ${className}`;

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return <button type={type} className={classes} {...buttonProps}>{children}</button>;
}
