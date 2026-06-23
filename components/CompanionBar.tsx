'use client';

import { useState } from 'react';
import { loadGameState, type GameState } from '@/lib/game/state';

const MOOD_LABELS: Record<string, string> = {
  happy: '開心',
  curious: '好奇',
  sleepy: '想睡覺',
  excited: '興奮',
};

function PetAvatar() {
  return (
    <div className="companion-bar-avatar" aria-hidden="true">
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="18" cy="18" r="16" fill="url(#petGrad)" />
        <circle cx="12" cy="16" r="2.5" fill="#1f5ef6" />
        <circle cx="24" cy="16" r="2.5" fill="#1f5ef6" />
        <path
          d="M14 24 Q18 28 22 24"
          stroke="#ffb800"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <defs>
          <linearGradient id="petGrad" x1="0" y1="0" x2="36" y2="36">
            <stop offset="0%" stopColor="#ffd95a" />
            <stop offset="100%" stopColor="#ffb800" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function CompanionBar({ dialogue }: { dialogue: string }) {
  const [game] = useState<GameState | null>(() => {
    if (typeof window === 'undefined') return null;
    return loadGameState();
  });

  return (
    <div className="companion-bar">
      <PetAvatar />
      <div className="companion-bar-info">
        <div className="companion-bar-name">小光獸 Lv.{game?.petLevel ?? 1}</div>
        <div className="companion-bar-meta">
          {game
            ? `${MOOD_LABELS[game.petMood] ?? game.petMood} • 能量 ${game.petEnergy}`
            : '載入中...'}
        </div>
      </div>
      <div className="companion-bar-dialogue">{dialogue}</div>
    </div>
  );
}
