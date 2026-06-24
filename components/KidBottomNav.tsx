'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: Route;
  label: string;
  key: string;
};

const items: NavItem[] = [
  { href: '/' as any, label: '首頁', key: 'home' },
  { href: '/practice' as any, label: '練習', key: 'practice' },
  { href: '/adventure' as any, label: '冒險', key: 'adventure' },
  { href: '/pet' as any, label: '夥伴', key: 'pet' },
  { href: '/reward' as any, label: '獎勵', key: 'reward' },
  { href: '/collection' as any, label: '收納', key: 'collection' },
  { href: '/parent/dashboard' as any, label: '家長', key: 'parent' },
];

function NavIcon({ active, keyName }: { active: boolean; keyName: string }) {
  const color = active ? '#1a5df8' : '#6b7f98';
  const fill = active ? '#ffffff' : '#f4f7fb';

  if (keyName === 'home') {
    return (
      <span className="nav-icon-box">
        <span className="nav-house" />
      </span>
    );
  }

  if (keyName === 'practice') {
    return (
      <span className="nav-icon-box">
        <span className="nav-pencil" />
      </span>
    );
  }

  if (keyName === 'collection') {
    return (
      <span className="nav-icon-box">
        <span className="nav-bookmark" />
      </span>
    );
  }

  if (keyName === 'adventure') {
    return (
      <span className="nav-icon-box">
        <span className="nav-star" />
      </span>
    );
  }

  if (keyName === 'pet') {
    return (
      <span className="nav-icon-box">
        <span className="nav-pet-icon" />
      </span>
    );
  }

  if (keyName === 'boss') {
    return (
      <span className="nav-icon-box">
        <span className="nav-boss-icon" />
      </span>
    );
  }

  if (keyName === 'reward') {
    return (
      <span className="nav-icon-box">
        <span className="nav-reward-icon" />
      </span>
    );
  }

  if (keyName === 'parent') {
    return (
      <span className="nav-icon-box">
        <span className="nav-parent-icon" />
      </span>
    );
  }

  return (
    <span className="nav-icon-box">
      <span className="nav-star" />
    </span>
  );
}

export function KidBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="kid-bottom-nav">
      <div className="kid-nav-shell">
        <div className="kid-nav-track">
          {items.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`kid-nav-item${active ? ' kid-nav-item-active' : ''}`}
              >
                {active && <span className="kid-nav-pill" />}
                <NavIcon active={active} keyName={item.key} />
                <span className="kid-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
