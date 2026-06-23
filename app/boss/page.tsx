'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PhoneFrame } from '@/components/PhoneFrame';
import { KidBottomNav } from '@/components/KidBottomNav';
import { KidTopBar } from '@/components/KidTopBar';
import { CompanionBar } from '@/components/CompanionBar';
import { CHAPTERS, BOSS_ENCOUNTERS } from '@/lib/story/data';
import { loadProgress, saveProgress, type StoryProgress } from '@/lib/story/local-storage';
import {
  loadGameState,
  saveGameState,
  addStars,
  addStarlight,
  unlockWorld,
  addBossWin,
  type GameState,
} from '@/lib/game/state';

type BattlePhase = 'idle' | 'battle' | 'victory' | 'defeat';

type BattleQuestion = {
  text: string;
  options: string[];
  answer: string;
};

const BOSS_QUESTIONS: BattleQuestion[] = [
  { text: '哪一個是正確的 A？', options: ['A', 'B', 'C', 'D'], answer: 'A' },
  { text: '哪一個是正確的 B？', options: ['A', 'B', 'C', 'D'], answer: 'B' },
  { text: '哪一個是正確的 C？', options: ['A', 'B', 'C', 'D'], answer: 'C' },
  { text: '哪一個是正確的 D？', options: ['A', 'B', 'C', 'D'], answer: 'D' },
  { text: '星星的「星」通常是什麼顏色？', options: ['黃色', '藍色', '紅色', '綠色'], answer: '黃色' },
  { text: '小光獸通常是什麼顏色？', options: ['黃色', '藍色', '紅色', '綠色'], answer: '黃色' },
  { text: '以下哪一個是英文字母？', options: ['一', '二', 'A', 'ㄅ'], answer: 'A' },
  { text: '森林王國的守護者是？', options: ['小光獸', '黑雲龍', '迷霧熊王', '回聲巨鷹'], answer: '小光獸' },
];

function BossVisual({ name }: { name: string }) {
  const initial = name?.charAt(0) ?? '?';
  return (
    <div className="kid-boss-avatar">
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          fontWeight: 900,
          color: '#1e293b',
          zIndex: 1,
        }}
      >
        {initial}
      </span>
    </div>
  );
}

function BossContent() {
  const searchParams = useSearchParams();
  const chapterId = searchParams.get('chapter') ?? CHAPTERS[0].id;
  const chapter = CHAPTERS.find((c) => c.id === chapterId) ?? CHAPTERS[0];
  const boss = BOSS_ENCOUNTERS.find((b) => b.chapter === chapter.id);

  const [progress, setProgress] = useState<StoryProgress | null>(() => loadProgress());
  const [game, setGame] = useState<GameState | null>(() => loadGameState());
  const [phase, setPhase] = useState<BattlePhase>('idle');
  const [questions] = useState<BattleQuestion[]>(() => {
    const shuffled = [...BOSS_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [bossHp, setBossHp] = useState(100);
  const [playerEnergy, setPlayerEnergy] = useState(100);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'retry'; text: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = () => {
    setProgress(loadProgress());
    setGame(loadGameState());
  };

  const startBattle = () => {
    setPhase('battle');
    setQIndex(0);
    setSelected(null);
    setBossHp(100);
    setPlayerEnergy(100);
    setFeedback(null);
    setMessage(null);
  };

  const current = questions[qIndex];

  const handleAnswer = (opt: string) => {
    if (selected) return;
    if (!current) return;

    const ok = opt === current.answer;
    setSelected(opt);

    if (ok) {
      setFeedback({ type: 'ok', text: '答對了！Boss 受到傷害！' });
      setBossHp((v) => Math.max(0, v - 34));
      setTimeout(() => {
        setFeedback(null);
        if (qIndex >= questions.length - 1 || Math.max(0, bossHp - 34) <= 0) {
          finishBattle(true);
        } else {
          setQIndex((v) => v + 1);
          setSelected(null);
        }
      }, 700);
    } else {
      setFeedback({ type: 'retry', text: '差一點，再仔細想想！' });
      setPlayerEnergy((v) => Math.max(0, v - 20));
      setTimeout(() => {
        setFeedback(null);
        if (playerEnergy <= 20) {
          finishBattle(false);
        } else {
          setSelected(null);
        }
      }, 700);
    }
  };

  const finishBattle = (won: boolean) => {
    if (won) {
      setPhase('victory');
      const updated = addStars(5);
      addStarlight(2);
      addBossWin();

      if (boss) {
        const nextWorld = CHAPTERS.find((c) => c.order === chapter.order + 1)?.world;
        if (nextWorld) unlockWorld(nextWorld);
      }

      if (progress && boss) {
        const next: StoryProgress = {
          ...progress,
          completedChapters: progress.completedChapters.includes(chapter.id)
            ? progress.completedChapters
            : [...progress.completedChapters, chapter.id],
          currentChapter: null,
          currentDialogId: null,
        };
        saveProgress(next);
      }
      refresh();
      setMessage('勝利！獲得 5 星星幣與 2 星光碎片');
    } else {
      setPhase('defeat');
      setMessage('能量耗盡了，先去練習補充能量吧！');
    }
  };

  const retry = () => {
    startBattle();
  };

  const goPractice = () => {
    window.location.href = '/practice';
  };

  const nextChapter = CHAPTERS.find((c) => c.order === chapter.order + 1);

  return (
    <PhoneFrame>
      <CompanionBar dialogue="守護者出現了，一起挑戰" />
      <KidTopBar title={boss?.bossName ?? 'Boss'} backHref="/adventure" backLabel="冒險" />
      <div className="kid-game-content">
        {phase === 'idle' && (
          <section className="kid-soft-panel" style={{ padding: '18px 14px', textAlign: 'center' }}>
            <div className="kid-boss-companion-hint">
              <span className="kid-pet-antenna" style={{ position: 'relative', top: 0, left: 0, width: 3, height: 10, background: '#ffb800', borderRadius: 999 }} />
              小光獸：一起保護森林。
            </div>
            <BossVisual name={boss?.bossName ?? '???'} />
            <div className="kid-boss-title" style={{ marginTop: 14 }}>{boss?.bossName ?? '未知的守護者'}</div>
            <div className="kid-boss-sub">這個守護者等著你的挑戰</div>
            <div className="kid-quest-next" style={{ marginTop: 12 }}>
              答對 3 題就能獲勝，準備好了嗎？
            </div>
            <button
              type="button"
              className="kid-blue-button flex min-h-[54px] w-full items-center justify-center rounded-[22px] text-base font-black"
              onClick={startBattle}
              style={{ marginTop: 14 }}
            >
              開始戰鬥
            </button>
          </section>
        )}

        {(phase === 'battle') && current && (
          <div className="kid-boss-stage">
            <div className="kid-boss-header">
              <BossVisual name={boss?.bossName ?? '???'} />
              <div className="kid-boss-meta">
                <div className="kid-boss-title">{boss?.bossName ?? '未知守護者'}</div>
                <div className="kid-boss-sub">
                  第 {qIndex + 1} 題 / 共 {questions.length} 題
                </div>
                <div className="kid-bar-track">
                  <div className="kid-bar-fill" style={{ width: `${Math.max(0, bossHp)}%` }} />
                </div>
                <div className="kid-bar-track" style={{ marginTop: 8 }}>
                  <div className="kid-bar-fill player" style={{ width: `${Math.max(0, playerEnergy)}%` }} />
                </div>
              </div>
            </div>

            <section className="kid-soft-panel" style={{ padding: '16px 14px', textAlign: 'center' }}>
              <p className="practice-question-label">戰鬥題目</p>
              <h1 className="practice-question-text" style={{ fontSize: 22 }}>{current.text}</h1>
              <div className="practice-options-grid" style={{ marginTop: 14 }}>
                {current.options.map((opt) => {
                  const isSelected = selected === opt;
                  const correct = opt === current.answer;
                  const showState = selected !== null && (isSelected || correct);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleAnswer(opt)}
                      disabled={selected !== null}
                      className={`practice-option ${showState && correct ? 'is-correct' : ''} ${showState && isSelected && !correct ? 'is-wrong' : ''}`}
                    >
                      <span className="practice-option-text">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {feedback && (
              <div className={`kid-boss-feedback ${feedback.type}`}>
                <p className="kid-boss-feedback-title">{feedback.text}</p>
              </div>
            )}
          </div>
        )}

        {phase === 'victory' && (
          <section className="kid-soft-panel" style={{ padding: '22px 16px', textAlign: 'center' }}>
            <div className="kid-pet-dialog" style={{ marginBottom: 12 }}>
              <div className="kid-pet-dialog-text">小光獸：太厲害了，我們贏了！</div>
            </div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#124a3a' }}>勝利</div>
            <p className="kid-boss-sub" style={{ marginTop: 8 }}>{message}</p>
            <div style={{ marginTop: 14 }}>
              {nextChapter ? `下一章：${nextChapter.title}` : '旅程暫告一段落'}
            </div>
            <button
              type="button"
              className="kid-blue-button flex min-h-[54px] w-full items-center justify-center rounded-[22px] text-base font-black"
              onClick={() => (window.location.href = '/adventure')}
              style={{ marginTop: 14 }}
            >
              返回冒險
            </button>
          </section>
        )}

        {phase === 'defeat' && (
          <section className="kid-soft-panel" style={{ padding: '22px 16px', textAlign: 'center' }}>
            <div className="kid-pet-dialog" style={{ marginBottom: 12 }}>
              <div className="kid-pet-dialog-text">小光獸：別氣餒，我們再練習一次！</div>
            </div>
            <div style={{ fontSize: 44, fontWeight: 900, color: '#5c3a04' }}>挑戰失敗</div>
            <p className="kid-boss-sub" style={{ marginTop: 8 }}>{message}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                type="button"
                className="kid-blue-button flex min-h-[54px] flex-1 items-center justify-center rounded-[22px] text-base font-black"
                onClick={retry}
              >
                再挑戰一次
              </button>
              <button
                type="button"
                className="kid-yellow-button flex min-h-[54px] flex-1 items-center justify-center rounded-[22px] text-base font-black"
                onClick={goPractice}
              >
                去練習
              </button>
            </div>
          </section>
        )}
      </div>
      <KidBottomNav />
    </PhoneFrame>
  );
}

export default function BossPage() {
  return (
    <Suspense
      fallback={
        <PhoneFrame>
          <KidTopBar title="Boss 戰鬥" backHref="/adventure" backLabel="冒險" />
          <div className="kid-game-content" />
          <KidBottomNav />
        </PhoneFrame>
      }
    >
      <BossContent />
    </Suspense>
  );
}
