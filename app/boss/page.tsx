'use client';

import { useEffect, useRef, useState } from 'react';
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
  addEnergy,
  addBossWin,
  unlockWorld,
  setPetMood,
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
  const isMistBear = name === '迷霧熊王';
  const isBlackDragon = name === '黑雲龍';
  return (
    <div className="kid-boss-avatar">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {isMistBear ? (
          <>
            <circle cx="60" cy="58" r="40" fill="#8B5E3C" />
            <circle cx="60" cy="58" r="40" fill="url(#bearGrad)" />
            <circle cx="44" cy="50" r="5" fill="#1f5ef6" />
            <circle cx="76" cy="50" r="5" fill="#1f5ef6" />
            <circle cx="44" cy="50" r="2" fill="#fff" />
            <circle cx="76" cy="50" r="2" fill="#fff" />
            <ellipse cx="60" cy="66" rx="8" ry="5" fill="#3b2314" />
            <path d="M52 74 Q60 82 68 74" stroke="#3b2314" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="30" cy="40" r="10" fill="#8B5E3C" />
            <circle cx="90" cy="40" r="10" fill="#8B5E3C" />
            <circle cx="30" cy="40" r="10" fill="url(#bearEar)" />
            <circle cx="90" cy="40" r="10" fill="url(#bearEar)" />
            <defs>
              <linearGradient id="bearGrad" x1="0" y1="0" x2="120" y2="120">
                <stop offset="0%" stopColor="#D4A373" />
                <stop offset="100%" stopColor="#8B5E3C" />
              </linearGradient>
              <linearGradient id="bearEar" x1="0" y1="0" x2="60" y2="60">
                <stop offset="0%" stopColor="#D4A373" />
                <stop offset="100%" stopColor="#8B5E3C" />
              </linearGradient>
            </defs>
          </>
        ) : isBlackDragon ? (
          <>
            <path d="M60 10 L80 30 L100 50 L95 80 L75 100 L45 100 L25 80 L20 50 L40 30 Z" fill="#2d3748" />
            <path d="M60 10 L80 30 L100 50 L95 80 L75 100 L45 100 L25 80 L20 50 L40 30 Z" fill="url(#dragonGrad)" />
            <circle cx="50" cy="45" r="4" fill="#ef4444" />
            <circle cx="70" cy="45" r="4" fill="#ef4444" />
            <circle cx="45" cy="28" r="6" fill="#2d3748" />
            <circle cx="75" cy="28" r="6" fill="#2d3748" />
            <path d="M55 70 L60 85 L65 70" fill="#1a202c" />
            <path d="M20 50 L5 40" stroke="#2d3748" strokeWidth="4" strokeLinecap="round" />
            <path d="M100 50 L115 40" stroke="#2d3748" strokeWidth="4" strokeLinecap="round" />
            <defs>
              <linearGradient id="dragonGrad" x1="0" y1="0" x2="120" y2="120">
                <stop offset="0%" stopColor="#4a5568" />
                <stop offset="100%" stopColor="#1a202c" />
              </linearGradient>
            </defs>
          </>
        ) : (
          <>
            <circle cx="60" cy="55" r="35" fill="#4a5568" />
            <circle cx="60" cy="55" r="35" fill="url(#bossGrad)" />
            <circle cx="45" cy="48" r="4" fill="#ef4444" />
            <circle cx="75" cy="48" r="4" fill="#ef4444" />
            <circle cx="60" cy="62" r="5" fill="#1a202c" />
            <path d="M50 72 Q60 80 70 72" stroke="#1a202c" strokeWidth="3" strokeLinecap="round" fill="none" />
            <defs>
              <linearGradient id="bossGrad" x1="0" y1="0" x2="120" y2="120">
                <stop offset="0%" stopColor="#718096" />
                <stop offset="100%" stopColor="#4a5568" />
              </linearGradient>
            </defs>
          </>
        )}
      </svg>
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
  const [questionIndex, setQuestionIndex] = useState(0);
  // eslint-disable-next-line react-hooks/purity
  const questionStartedAtRef = useRef(Date.now());
  const fastAnswerCountRef = useRef(0);

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
    setQuestionIndex(0);
    questionStartedAtRef.current = Date.now();
    fastAnswerCountRef.current = 0;
  };

  const current = questions[qIndex];

  const handleAnswer = (opt: string) => {
    if (selected) return;
    if (!current) return;

    const ok = opt === current.answer;
    // eslint-disable-next-line react-hooks/purity
    const isFast = Date.now() - questionStartedAtRef.current <= 3000;
    setSelected(opt);

    if (ok) {
      setFeedback({ type: 'ok', text: '答對了！Boss 受到傷害！' });
      setBossHp((v) => Math.max(0, v - 34));
      try { addEnergy(1); } catch {}
      if (isFast) {
        fastAnswerCountRef.current += 1;
      }
      setTimeout(() => {
        setFeedback(null);
        if (qIndex >= questions.length - 1 || Math.max(0, bossHp - 34) <= 0) {
          finishBattle(true);
        } else {
          setQIndex((v) => v + 1);
          setSelected(null);
          setQuestionIndex((v) => v + 1);
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
      const fastCount = fastAnswerCountRef.current;
      addStars(2 + fastCount);
      addEnergy(questions.length + fastCount);
      addBossWin();
      setPetMood('excited');

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
      const rewardParts = ['勝利！'];
      if (fastCount > 0) {
        rewardParts.push(`超快反應獎勵 +${fastCount} 星星幣、+${fastCount} 能量`);
      }
      rewardParts.push('獲得 2 星星幣與能量！');
      setMessage(rewardParts.join(' '));
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
              答對 {questions.length} 題就能獲勝，準備好了嗎？
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
