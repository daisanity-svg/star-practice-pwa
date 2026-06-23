'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneFrame } from '@/components/PhoneFrame';
import { KidBottomNav } from '@/components/KidBottomNav';
import { KidTopBar } from '@/components/KidTopBar';
import { CompanionBar } from '@/components/CompanionBar';
import {
  loadGameState,
  saveGameState,
  addStars,
  addEnergy,
  setPetMood,
  feedPet,
  playWithPet,
  getNextGrowthNeed,
  getNextIntimacyNeed,
  type PetMood,
  type GameState,
} from '@/lib/game/state';

const MOOD_LABELS: Record<PetMood, string> = {
  happy: '開心',
  curious: '好奇',
  sleepy: '想睡覺',
  excited: '興奮',
};

const MOOD_COLORS: Record<PetMood, string> = {
  happy: '#ffb800',
  curious: '#2f8cff',
  sleepy: '#a855f7',
  excited: '#ef4444',
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

export default function PetPage() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(() => loadGameState());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => setGame(loadGameState());

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 1800);
  };

  const handleFeed = () => {
    if (!game || busy) return;
    if (game.energy < 2) {
      showFeedback('能量不夠，先去練習賺能量吧！');
      return;
    }
    setBusy(true);
    const before = game.growthLevel;
    feedPet();
    setPetMood('happy');
    refresh();
    const updated = loadGameState();
    const leveled = updated.growthLevel > before;
    const remaining = getNextGrowthNeed(updated.growthLevel) - updated.feedCount;
    showFeedback(
      leveled
        ? `小光獸吃飽飽，成長升級到 Lv.${updated.growthLevel}！`
        : `小光獸吃飽飽，再餵 ${remaining} 次就升級了`,
    );
    setTimeout(() => setBusy(false), 400);
  };

  const handlePlay = () => {
    if (!game || busy) return;
    if (game.stars < 1) {
      showFeedback('星星幣不夠，先去練習賺星星吧！');
      return;
    }
    setBusy(true);
    const before = game.intimacyLevel;
    playWithPet();
    setPetMood('excited');
    refresh();
    const updated = loadGameState();
    const leveled = updated.intimacyLevel > before;
    const remaining = getNextIntimacyNeed(updated.intimacyLevel) - updated.playCount;
    showFeedback(
      leveled
        ? `一起玩耍！親密度升級到 Lv.${updated.intimacyLevel}！小光獸更喜歡你了！`
        : `一起玩耍！親密度 +1，再玩 ${remaining} 次就升級了`,
    );
    setTimeout(() => setBusy(false), 400);
  };

  const goPractice = () => {
    router.push('/practice');
  };

  if (!game) {
    return (
      <PhoneFrame>
        <CompanionBar dialogue="我一直在這裡陪你" />
        <KidTopBar title="小光獸夥伴" backHref="/" backLabel="首頁" />
        <div className="kid-game-content" />
        <KidBottomNav />
      </PhoneFrame>
    );
  }

  const growthNeed = getNextGrowthNeed(game.growthLevel);
  const intimacyNeed = getNextIntimacyNeed(game.intimacyLevel);
  const growthPct = Math.min(100, Math.round((game.feedCount / growthNeed) * 100));
  const intimacyPct = Math.min(100, Math.round((game.playCount / intimacyNeed) * 100));

  const tierName = game.growthLevel <= 1 ? '小光蛋' : game.growthLevel <= 3 ? '幼年小光獸' : '守護小光獸';

  return (
    <PhoneFrame>
      <CompanionBar dialogue="我一直在這裡陪你" />
      <KidTopBar title="小光獸夥伴" backHref="/" backLabel="首頁" />
      <div className="kid-game-content">
        <div className="pet-companion-sticky">
          <section className="kid-soft-panel" style={{ padding: '18px 14px', textAlign: 'center' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="kid-pet-visual">
                <div
                  className="kid-pet-body"
                  style={{
                    width: 100,
                    height: 110,
                    borderRadius: 48,
                    background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), transparent 40%), linear-gradient(180deg, #ffd95a 0%, ${MOOD_COLORS[game.petMood]} 100%)`,
                  }}
                />
              </div>
              <div className="kid-pet-name" style={{ marginTop: 14 }}>
                小光獸 Lv.{game.growthLevel}（{tierName}）
              </div>
              <div className="kid-pet-mood" style={{ color: MOOD_COLORS[game.petMood] }}>
                心情：{MOOD_LABELS[game.petMood]}
              </div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#6b7f98' }}>成長進度</div>
                  <div className="kid-pet-exp-track">
                    <div className="kid-pet-exp-fill" style={{ width: `${growthPct}%` }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#5f6f89', marginTop: 2 }}>
                    餵食 {game.feedCount} / {growthNeed} 次
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#6b7f98' }}>親密度進度</div>
                  <div className="kid-pet-exp-track">
                    <div className="kid-pet-exp-fill" style={{ width: `${intimacyPct}%`, background: '#ff6b6b' }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#5f6f89', marginTop: 2 }}>
                    玩耍 {game.playCount} / {intimacyNeed} 次
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="kid-soft-panel" style={{ padding: '16px 14px', marginTop: 14 }}>
          <div className="kid-map-header" style={{ padding: '0 2px' }}>
            <h2 className="kid-map-title">照顧小光獸</h2>
            <p className="kid-map-sub">互動會消耗星星幣或能量</p>
          </div>
          <div className="kid-pet-actions">
            <button
              type="button"
              className="kid-pet-btn"
              onClick={handleFeed}
              disabled={busy || game.energy < 2}
              aria-busy={busy}
            >
              餵食（消耗 2 能量）
            </button>
            <button
              type="button"
              className="kid-pet-btn"
              onClick={handlePlay}
              disabled={busy || game.stars < 1}
              aria-busy={busy}
            >
              玩耍（消耗 1 星星幣）
            </button>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, fontWeight: 800, color: '#5f6f89', lineHeight: 1.6 }}>
            <p>星星幣：完成練習一輪 +2；完成冒險任務 +2；Boss 勝利 +2。</p>
            <p>能量：每答對一題 +1（練習、冒險、Boss 都會累積）。</p>
          </div>
        </section>

        <section className="kid-soft-panel" style={{ padding: '16px 14px', marginTop: 14 }}>
          <div className="kid-map-header" style={{ padding: '0 2px' }}>
            <h2 className="kid-map-title">想獲得更多星星？</h2>
            <p className="kid-map-sub">完成練習就能賺星星幣和能量，照顧小光獸吧</p>
          </div>
          <button
            type="button"
            className="kid-blue-button flex min-h-[54px] w-full items-center justify-center rounded-[22px] text-base font-black"
            onClick={goPractice}
          >
            去練習獲得星星
          </button>
        </section>

        {feedback && (
          <div className="kid-pet-dialog" style={{ marginTop: 14 }}>
            <div className="kid-pet-dialog-text">{feedback}</div>
          </div>
        )}
      </div>
      <KidBottomNav />
    </PhoneFrame>
  );
}
