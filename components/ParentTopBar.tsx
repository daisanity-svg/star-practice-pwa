'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';

type Tab = {
  href: Route;
  label: string;
};

const tabs: Tab[] = [
  { href: '/parent/dashboard', label: '首頁' },
  { href: '/parent/learning', label: '學習' },
  { href: '/parent/cards', label: '卡牌' },
  { href: '/parent/events', label: '活動' },
  { href: '/parent/progress', label: '進度' },
  { href: '/parent/settings', label: '設定' },
];

export default function ParentTopBar() {
  const pathname = usePathname();
  const active = pathname || '/parent/dashboard';

  return (
    <header className="admin-top-bar">
      <div className="admin-top-bar-inner">
        <Link href="/parent/dashboard" className="admin-brand">
          家長後台
        </Link>
        <nav className="admin-tabs">
          {tabs.map((tab) => {
            const selected = active === tab.href || active.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`admin-tab${selected ? ' admin-tab-active' : ''}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-actions">
          <Link href="/" className="admin-chip">小孩端</Link>
        </div>
      </div>
    </header>
  );
}
