'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';

type CompanionBarProps = {
  title?: string;
  rightLabel?: string;
  backHref?: Route;
  backLabel?: string;
};

export function CompanionBar({ title, rightLabel, backHref, backLabel = '地圖' }: CompanionBarProps) {
  const pathname = usePathname();
  const isRoot = pathname === '/';
  const showBack = backHref && !isRoot;

  return (
    <header className="companion-bar" aria-label="小光獸資訊列">
      <div className="companion-shell">
        <div className="companion-left">
          {showBack ? (
            <Link href={backHref} className="companion-back" aria-label={backLabel}>
              <span className="companion-back-icon" aria-hidden="true" />
              <span className="companion-back-text">{backLabel}</span>
            </Link>
          ) : (
            <span className="companion-brand" aria-hidden="true">
              <span className="companion-orb" />
              <span className="companion-name">小光獸</span>
            </span>
          )}
        </div>

        {title ? (
          <div className="companion-center">
            <span className="companion-title">{title}</span>
          </div>
        ) : (
          <div className="companion-center">
            <span className="companion-chip">第 3 天冒險中</span>
          </div>
        )}

        <div className="companion-right">
          {rightLabel ? <span className="companion-meta">{rightLabel}</span> : null}
          <Link href="/parent/dashboard" className="companion-settings" aria-label="家長後台">
            <span className="companion-settings-icon" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
