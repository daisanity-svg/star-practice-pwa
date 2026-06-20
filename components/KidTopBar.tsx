'use client';

import Link from 'next/link';
import type { Route } from 'next';

type KidTopBarProps = {
  title: string;
  backHref?: Route;
  backLabel?: string;
  rightLabel?: string;
};

export function KidTopBar({ title, backHref = '/', backLabel = '地圖', rightLabel }: KidTopBarProps) {
  return (
    <div className="kid-game-topbar">
      <Link href={backHref} className="kid-topbar-back" aria-label="回到地圖">
        <span className="kid-topbar-back-icon" aria-hidden="true" />
        <span className="kid-topbar-back-text">{backLabel}</span>
      </Link>
      <div className="kid-topbar-center">
        <span className="kid-topbar-title">{title}</span>
      </div>
      <div className="kid-topbar-right">
        <span className="kid-topbar-badge">{rightLabel}</span>
      </div>
    </div>
  );
}
