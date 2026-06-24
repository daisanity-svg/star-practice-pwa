'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { PetAvatar } from '@/components/PetAvatar';
import { loadGameState, type PetMood } from '@/lib/game/state';

type CompanionBarProps = {
  title?: string;
  rightLabel?: string;
  backHref?: Route;
  backLabel?: string;
};

const MOOD_LABELS: Record<PetMood, string> = {
  happy: '開心',
  curious: '好奇',
  sleepy: '想睡覺',
  excited: '興奮',
};

export function CompanionBar({ title, rightLabel, backHref, backLabel = '地圖' }: CompanionBarProps) {
  const pathname = usePathname();
  const isRoot = pathname === '/';
  const showBack = backHref && !isRoot;

  const game = loadGameState();
  const petLabel =
    title ??
    (game ? `${MOOD_LABELS[game.petMood] || '冒險中'} Lv.${game.growthLevel}` : '第 3 天冒險中');

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
              <PetAvatar growthLevel={game.growthLevel} />
              <span className="companion-name">小光獸</span>
            </span>
          )}
        </div>

        <div className="companion-center">
          <span className="companion-title">{petLabel}</span>
        </div>

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
