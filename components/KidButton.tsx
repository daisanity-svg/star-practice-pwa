import Link from 'next/link';
import type { ReactNode } from 'react';

type KidButtonProps = {
  href?: string;
  children: ReactNode;
  tone?: 'primary' | 'mint' | 'butter' | 'sky' | 'white';
  className?: string;
};

const toneClass = {
  primary: 'bg-grape text-white shadow-soft',
  mint: 'bg-mint text-emerald-900',
  butter: 'bg-butter text-amber-900',
  sky: 'bg-skysoft text-blue-900',
  white: 'bg-white text-ink border border-slate-100'
};

export function KidButton({ href, children, tone = 'primary', className = '' }: KidButtonProps) {
  const classes = `tap-target flex items-center justify-center px-6 text-center text-xl font-bold active:scale-[0.98] transition ${toneClass[tone]} ${className}`;

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return <button className={classes}>{children}</button>;
}
