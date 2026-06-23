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
  consumeEnergy,
  addIntimacyPoints,
  setPetMood,
  incrementPracticeCount,
  tryGrowPet,
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

function PetVisual({ mood, growthLevel }: { mood: PetMood; growthLevel: number }) {
  const moodColor = MOOD_COLORS[mood];
  const tier = growthLevel <= 1 ? 'egg' : growthLevel <= 3 ? 'young' : 'guardian';
  return (
    <div className="kid-pet-visual">
      {tier === 'egg' ? (
        <div
          className="kid-pet-body"
          style={{
            width: 100,
            height: 110,
            borderRadius: 48,
            background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), transparent 40%), linear-gradient(180deg, #ffd95a 0%, ${moodColor} 100%)`,
          }}
        />
      ) : tier === 'young' ? (
        <div
          className="kid-pet-body"
          style={{
            width: 110,
            height: 100,
            borderRadius: 36,
            background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), transparent 40%), linear-gradient(180deg, #ffd95a 0%, ${moodColor} 100%)`,
          }}
        >
          <div className="kid-pet-wing-left" />
          <div className="kid-pet-wing-right" />
        </div>
      ) : (
        <div
          className="kid-pet-body"
          style={{
            width: 120,
            height: 110,
            borderRadius: 32,
            background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), transparent 40%), linear-gradient(180deg, #ffd95a 0%, ${moodColor} 100%)`,
          }}
        >
          <div className="kid-pet-wing-left" />
          <div className="kid-pet-wing-right" />
          <div className="kid-pet-horn-left" />
          <div className="kid-pet-horn-right" />
        </div>
      )}
      <div className="kid-pet-eye left" />
      <div className="kid-pet-eye right" />
      <div className="kid-pet-antenna left" />
      <div className="kid-pet-antenna right" />
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
    if (game.stars < 5) {
      showFeedback('星星幣不夠，先去練習賺星星吧！');
      return;
    }
    setBusy(true);
    addStars(-5);
    addIntimacyPoints(5);
    setPetMood('happy');
    refresh();
    const newLevel = loadGameState().intimacyLevel;
    const leveled = newLevel > game.intimacyLevel;
    showFeedback(
      leveled
        ? `小光獸吃飽飽，親密度升級到 Lv.${newLevel}！小光獸更喜歡你了！`
        : '小光獸吃飽飽，親密度 +5',
    );
    setTimeout(() => setBusy(false), 400);
  };

  const handlePlay = () => {
    if (!game || busy) return;
    if (game.energy < 1) {
      showFeedback('能量不足，去休息一下吧！');
      return;
    }
    setBusy(true);
    consumeEnergy(1);
    addIntimacyPoints(3);
    setPetMood('excited');
    refresh();
    const newLevel = loadGameState().intimacyLevel;
    const leveled = newLevel > game.intimacyLevel;
    showFeedback(
      leveled
        ? `一起玩耍！親密度升級到 Lv.${newLevel}！小光獸更喜歡你了！`
        : '一起玩耍！親密度 +3',
    );
    setTimeout(() => setBusy(false), 400);
  };

  const handleGrow = () => {
    if (!game || busy) return;
    const need = getNextGrowthNeed(game.growthLevel);
    if (game.energy < need) {
      showFeedback(`能量不足，成長還差 ${need - game.energy} 能量`);
      return;
    }
    setBusy(true);
    const updated = tryGrowPet();
    setPetMood('excited');
    refresh();
    if (updated.growthLevel > game.growthLevel) {
      showFeedback(`成長升級！小光獸來到 Lv.${updated.growthLevel}！`);
    } else {
      showFeedback('成長中...');
    }
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
  const growthPct = Math.min(100, Math.round((game.energy / growthNeed) * 100));
  const intimacyPct = Math.min(100, Math.round((game.intimacyPoints / intimacyNeed) * 100));

  const tierName = game.growthLevel <= 1 ? '小光蛋' : game.growthLevel <= 3 ? '幼年小光獸' : '守護小光獸';

  return (
    <PhoneFrame>
      <CompanionBar dialogue="我一直在這裡陪你" />
      <KidTopBar title="小光獸夥伴" backHref="/" backLabel="首頁" />
      <div className="kid-game-content">
        <div className="pet-companion-sticky">
          <section className="kid-soft-panel" style={{ padding: '18px 14px', textAlign: 'center' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <PetVisual mood={game.petMood} growthLevel={game.growthLevel} />
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
                    能量 {game.energy} / 需要 {growthNeed}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#6b7f98' }}>親密度進度</div>
                  <div className="kid-pet-exp-track">
                    <div className="kid-pet-exp-fill" style={{ width: `${intimacyPct}%`, background: '#ff6b6b' }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#5f6f89', marginTop: 2 }}>
                    親密度點數 {game.intimacyPoints} / 需要 {intimacyNeed}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="kid-soft-panel" style={{ padding: '16px 14px', marginTop: 14 }}>
          <div className="kid-map-header" style={{ padding: '0 2px' }}>
            <h2 className="kid-map-title">照顧小光獸</h2>
            <p className="kid-map-sub">互動會消耗星星幣或能量，也會提升好感度</p>
          </div>
          <div className="kid-pet-actions">
            <button
              type="button"
              className="kid-pet-btn"
              onClick={handleFeed}
              disabled={busy || game.stars < 5}
              aria-busy={busy}
            >
              餵食（消耗 5 星星幣）
            </button>
            <button
              type="button"
              className="kid-pet-btn"
              onClick={handlePlay}
              disabled={busy || game.energy < 1}
              aria-busy={busy}
            >
              玩耍（消耗 1 能量）
            </button>
            <button
              type="button"
              className="kid-pet-btn"
              onClick={handleGrow}
              disabled={busy || game.energy < growthNeed}
              aria-busy={busy}
            >
              使用能量成長（需要 {growthNeed}）
            </button>
          </div>
        </section>

        <section className="kid-soft-panel" style={{ padding: '16px 14px', marginTop: 14 }}>
          <div className="kid-map-header" style={{ padding: '0 2px' }}>
            <h2 className="kid-map-title">資源說明</h2>
            <p className="kid-map-sub">星星幣與能量怎麼取得？</p>
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#2f3a4d', lineHeight: 1.7 }}>
            <p>星星幣：完成練習一輪 +2；完成冒險任務 +2；Boss 勝利 +2。</p>
            <p>能量：每答對一題 +1（練習、冒險、Boss 都會累積）。</p>
            <p>餵食：消耗 5 星星幣，親密度 +5。</p>
            <p>玩耍：消耗 1 能量，親密度 +3。</p>
            <p>成長：消耗能量提升成長等級，等級越高需要越多能量。</p>
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
