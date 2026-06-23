'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneFrame } from '@/components/PhoneFrame';
import { KidBottomNav } from '@/components/KidBottomNav';
import { KidTopBar } from '@/components/KidTopBar';
import {
  loadGameState,
  saveGameState,
  addStars,
  addPetIntimacy,
  consumePetEnergy,
  addPetExp,
  setPetMood,
  incrementPracticeCount,
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

function PetVisual({ mood }: { mood: PetMood }) {
  const moodColor = MOOD_COLORS[mood];
  return (
    <div className="kid-pet-visual">
      <div className="kid-pet-body" style={{ background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), transparent 40%), linear-gradient(180deg, #ffd95a 0%, ${moodColor} 100%)` }} />
      <div className="kid-pet-wing-left" />
      <div className="kid-pet-wing-right" />
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
    setTimeout(() => setFeedback(null), 1600);
  };

  const handleFeed = () => {
    if (!game || busy) return;
    if (game.stars < 5) {
      showFeedback('星星幣不夠，先去練習賺星星吧！');
      return;
    }
    setBusy(true);
    const updated = addStars(-5);
    addPetExp(5);
    setPetMood('happy');
    saveGameState({ ...updated });
    refresh();
    showFeedback('小光獸吃飽飽，+5 經驗');
    setTimeout(() => setBusy(false), 400);
  };

  const handlePlay = () => {
    if (!game || busy) return;
    if (game.petEnergy < 1) {
      showFeedback('體力不足，去休息一下吧！');
      return;
    }
    setBusy(true);
    consumePetEnergy(1);
    addPetIntimacy(3);
    addPetExp(2);
    setPetMood('excited');
    saveGameState(loadGameState());
    refresh();
    showFeedback('一起玩耍！親密度 +3，+2 經驗');
    setTimeout(() => setBusy(false), 400);
  };

  const handleEncourage = () => {
    if (!game || busy) return;
    setBusy(true);
    addPetExp(3);
    setPetMood('curious');
    saveGameState(loadGameState());
    refresh();
    showFeedback('小光獸獲得鼓勵，+3 經驗');
    setTimeout(() => setBusy(false), 400);
  };

  const goPractice = () => {
    router.push('/practice');
  };

  if (!game) {
    return (
      <PhoneFrame>
        <KidTopBar title="小光獸夥伴" backHref="/" backLabel="首頁" />
        <div className="kid-game-content" />
        <KidBottomNav />
      </PhoneFrame>
    );
  }

  const expForNext = game.petLevel * 20;

  return (
    <PhoneFrame>
      <KidTopBar title="小光獸夥伴" backHref="/" backLabel="首頁" />
      <div className="kid-game-content">
        <section className="kid-soft-panel" style={{ padding: '18px 14px' }}>
          <div style={{ textAlign: 'center' }}>
            <PetVisual mood={game.petMood} />
            <div className="kid-pet-name" style={{ marginTop: 14 }}>小光獸</div>
            <div className="kid-pet-mood" style={{ color: MOOD_COLORS[game.petMood] }}>
              心情：{MOOD_LABELS[game.petMood]}
            </div>
          </div>

          <div className="kid-pet-stats">
            <div className="kid-pet-stat">
              <div className="kid-pet-stat-label">星星幣</div>
              <div className="kid-pet-stat-value">{game.stars}</div>
            </div>
            <div className="kid-pet-stat">
              <div className="kid-pet-stat-label">星光碎片</div>
              <div className="kid-pet-stat-value">{game.starlight}</div>
            </div>
            <div className="kid-pet-stat">
              <div className="kid-pet-stat-label">親密度</div>
              <div className="kid-pet-stat-value">{game.petIntimacy}</div>
            </div>
            <div className="kid-pet-stat">
              <div className="kid-pet-stat-label">能量</div>
              <div className="kid-pet-stat-value">{game.petEnergy}</div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="kid-pet-stat-label">等級 {game.petLevel}</span>
              <span className="kid-pet-stat-label">{game.petExp} / {expForNext} 經驗</span>
            </div>
            <div className="kid-pet-exp-track">
              <div
                className="kid-pet-exp-fill"
                style={{ width: `${Math.min(100, (game.petExp / expForNext) * 100)}%` }}
              />
            </div>
          </div>
        </section>

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
              disabled={busy || game.petEnergy < 1}
              aria-busy={busy}
            >
              玩耍（消耗 1 能量）
            </button>
            <button
              type="button"
              className="kid-pet-btn"
              onClick={handleEncourage}
              disabled={busy}
              aria-busy={busy}
            >
              鼓勵練習
            </button>
          </div>
        </section>

        <section className="kid-soft-panel" style={{ padding: '16px 14px', marginTop: 14 }}>
          <div className="kid-map-header" style={{ padding: '0 2px' }}>
            <h2 className="kid-map-title">想獲得更多星星？</h2>
            <p className="kid-map-sub">完成練習就能赚星星幣和星光碎片，照顧小光獸吧</p>
          </div>
          <button
            type="button"
            className="kid-blue-button flex min-h-[54px] w-full items-center justify-center rounded-[22px] text-base font-black"
            onClick={goPractice}
          >
            去練習獲得星光
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
