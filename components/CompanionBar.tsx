'use client';

import { useState } from 'react';
import { loadGameState, type GameState, getNextGrowthNeed, getNextIntimacyNeed } from '@/lib/game/state';

const MOOD_LABELS: Record<string, string> = {
  happy: '開心',
  curious: '好奇',
  sleepy: '想睡覺',
  excited: '興奮',
};

function PetAvatar({ growthLevel }: { growthLevel: number }) {
  const tier = growthLevel <= 1 ? 'egg' : growthLevel <= 3 ? 'young' : 'guardian';
  return (
    <div className="companion-bar-avatar" aria-hidden="true">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        {tier === 'egg' ? (
          <>
            <ellipse cx="18" cy="20" rx="12" ry="14" fill="url(#eggGrad)" />
            <circle cx="14" cy="17" r="2" fill="#1f5ef6" />
            <circle cx="24" cy="17" r="2" fill="#1f5ef6" />
            <path d="M15 24 Q18 28 21 24" stroke="#ffb800" strokeWidth="2" strokeLinecap="round" fill="none" />
            <defs>
              <linearGradient id="eggGrad" x1="0" y1="0" x2="36" y2="36">
                <stop offset="0%" stopColor="#ffd95a" />
                <stop offset="100%" stopColor="#ffb800" />
              </linearGradient>
            </defs>
          </>
        ) : tier === 'young' ? (
          <>
            <circle cx="18" cy="18" r="14" fill="url(#youngGrad)" />
            <circle cx="12" cy="16" r="2.5" fill="#1f5ef6" />
            <circle cx="24" cy="16" r="2.5" fill="#1f5ef6" />
            <path d="M14 24 Q18 28 22 24" stroke="#ffb800" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M6 12 L2 8" stroke="#ffd95a" strokeWidth="2" strokeLinecap="round" />
            <path d="M30 12 L34 8" stroke="#ffd95a" strokeWidth="2" strokeLinecap="round" />
            <defs>
              <linearGradient id="youngGrad" x1="0" y1="0" x2="36" y2="36">
                <stop offset="0%" stopColor="#ffd95a" />
                <stop offset="100%" stopColor="#ffb800" />
              </linearGradient>
            </defs>
          </>
        ) : (
          <>
            <circle cx="18" cy="18" r="16" fill="url(#guardGrad)" />
            <circle cx="12" cy="16" r="3" fill="#1f5ef6" />
            <circle cx="24" cy="16" r="3" fill="#1f5ef6" />
            <path d="M13 25 Q18 30 23 25" stroke="#ffb800" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M4 10 L0 4" stroke="#ffd95a" strokeWidth="3" strokeLinecap="round" />
            <path d="M32 10 L36 4" stroke="#ffd95a" strokeWidth="3" strokeLinecap="round" />
            <path d="M10 6 L8 2" stroke="#ffd95a" strokeWidth="2" strokeLinecap="round" />
            <path d="M26 6 L28 2" stroke="#ffd95a" strokeWidth="2" strokeLinecap="round" />
            <defs>
              <linearGradient id="guardGrad" x1="0" y1="0" x2="36" y2="36">
                <stop offset="0%" stopColor="#ffd95a" />
                <stop offset="100%" stopColor="#ffb800" />
              </linearGradient>
            </defs>
          </>
        )}
      </svg>
    </div>
  );
}

export function CompanionBar({ dialogue }: { dialogue: string }) {
  const [game] = useState<GameState | null>(() => {
    if (typeof window === 'undefined') return null;
    return loadGameState();
  });

  if (!game) {
    return (
      <div className="companion-bar">
        <div className="companion-bar-avatar" />
        <div className="companion-bar-info">
          <div className="companion-bar-name">載入中...</div>
        </div>
        <div className="companion-bar-dialogue">{dialogue}</div>
      </div>
    );
  }

  const growthNeed = getNextGrowthNeed(game.growthLevel);
  const intimacyNeed = getNextIntimacyNeed(game.intimacyLevel);
  const growthPct = Math.min(100, Math.round((game.energy / growthNeed) * 100));
  const intimacyPct = Math.min(100, Math.round((game.intimacyPoints / intimacyNeed) * 100));

  return (
    <div className="companion-bar">
      <PetAvatar growthLevel={game.growthLevel} />
      <div className="companion-bar-info">
        <div className="companion-bar-name">
          小光獸 Lv.{game.growthLevel}
        </div>
        <div className="companion-bar-meta">
          {MOOD_LABELS[game.petMood] ?? game.petMood} • 親密度 Lv.{game.intimacyLevel}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          <span className="kid-resource-chip">星星幣 {game.stars}</span>
          <span className="kid-resource-chip">能量 {game.energy}</span>
          <span className="kid-resource-chip">親密度 Lv.{game.intimacyLevel}</span>
        </div>
      </div>
      <div className="companion-bar-dialogue">{dialogue}</div>
    </div>
  );
}
