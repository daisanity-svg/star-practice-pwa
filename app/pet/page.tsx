'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneFrame } from '@/components/PhoneFrame';
import { KidBottomNav } from '@/components/KidBottomNav';
import { CompanionBar } from '@/components/CompanionBar';
import { PetAvatar } from '@/components/PetAvatar';
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

export default function PetPage() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(() => loadGameState());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tierName = game?.growthLevel && game.growthLevel <= 1
    ? '小光蛋'
    : game?.growthLevel && game.growthLevel <= 3
      ? '幼光獸'
      : '守護小光獸';

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
        ? `${tierName}吃飽飽，成長升級到 Lv.${updated.growthLevel}！`
        : `${tierName}吃飽飽，再餵 ${remaining} 次就升級了`,
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
        ? `一起玩耍！親密度升級到 Lv.${updated.intimacyLevel}！${tierName}更喜歡你了！`
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
        <CompanionBar title="我一直在這裡陪你" />
        <div className="kid-game-content" />
        <KidBottomNav />
      </PhoneFrame>
    );
  }

  const growthNeed = getNextGrowthNeed(game.growthLevel);
  const intimacyNeed = getNextIntimacyNeed(game.intimacyLevel);
  const growthPct = Math.min(100, Math.round((game.feedCount / growthNeed) * 100));
  const intimacyPct = Math.min(100, Math.round((game.playCount / intimacyNeed) * 100));

  return (
    <PhoneFrame>
      <CompanionBar title="我一直在這裡陪你" />
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
                {tierName} Lv.{game.growthLevel}
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
            <h2 className="kid-map-title">目前資源</h2>
            <p className="kid-map-sub">看看還剩多少星星幣和能量</p>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <div style={{ flex: 1, borderRadius: 20, background: '#e9f4ff', padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#1766e6' }}>星星幣</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#172033' }}>{game.stars}</div>
            </div>
            <div style={{ flex: 1, borderRadius: 20, background: '#fff8e1', padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#b45f1a' }}>能量</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#172033' }}>{game.energy}</div>
            </div>
          </div>
        </section>

        <section className="kid-soft-panel" style={{ padding: '16px 14px', marginTop: 14 }}>
          <div className="kid-pet-actions">
            <button
              type="button"
              className="kid-pet-btn"
              onClick={handleFeed}
              disabled={busy || game.energy < 2}
              aria-busy={busy}
            >
              餵食（消耗 2 能量）
              <span className="kid-pet-resource"> 能量：{game.energy}</span>
            </button>
            <button
              type="button"
              className="kid-pet-btn"
              onClick={handlePlay}
              disabled={busy || game.stars < 1}
              aria-busy={busy}
            >
              玩耍（消耗 1 星星幣）
              <span className="kid-pet-resource"> 星星幣：{game.stars}</span>
            </button>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, fontWeight: 800, color: '#5f6f89', lineHeight: 1.6 }}>
            <p>星星幣：完成練習一輪 +2；完成冒險任務 +2；Boss 勝利 +2。</p>
            <p>能量：每答對一題 +1（練習、冒險、Boss 都會累積）。</p>
          </div>
        </section>

        <section className="kid-soft-panel" style={{ padding: '16px 14px', marginTop: 14 }}>
          <div className="kid-map-header" style={{ padding: '0 2px' }}>
            <h2 className="kid-map-title">今天的小任務</h2>
            <p className="kid-map-sub">完成練習，養育你的小光獸</p>
          </div>
          <div style={{ marginTop: 10, borderRadius: 20, background: '#f5f9ff', padding: '14px 12px', textAlign: 'center' }}>
            {game.todayPracticeCount > 0 ? (
              <>
                <p className="text-sm font-black text-[#1766e6]">今天已經完成練習了</p>
                <p className="mt-2 text-base font-bold text-[#172033]">
                  小光獸吃得很飽，心情好極了！
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-black text-[#ef4444]">今天還沒練習喔</p>
                <p className="mt-2 text-base font-bold text-[#172033]">
                  快去完成練習，賺星星幣和能量回來照顧小光獸吧！
                </p>
                <button
                  type="button"
                  className="kid-blue-button mt-3 flex min-h-[54px] w-full items-center justify-center rounded-[22px] text-base font-black"
                  onClick={goPractice}
                >
                  去練習
                </button>
              </>
            )}
          </div>
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
