'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneFrame } from '@/components/PhoneFrame';
import { KidBottomNav } from '@/components/KidBottomNav';
import { KidTopBar } from '@/components/KidTopBar';
import { CompanionBar } from '@/components/CompanionBar';
import { CHAPTERS, getDialogsForChapter, getDialogById, BOSS_ENCOUNTERS } from '@/lib/story/data';
import { loadProgress, saveProgress, type StoryProgress } from '@/lib/story/local-storage';
import type { StoryDialog } from '@/lib/story/types';
import {
  loadGameState,
  saveGameState,
  addStars,
  addEnergy,
  type GameState,
} from '@/lib/game/state';

const WORLD_NAMES: Record<string, string> = {
  forest: '森林王國',
  mountain: '高山之城',
  sky: '天空島',
};

const CHAPTER_QUESTIONS: Record<string, { question: string; options: string[]; answer: string }[]> = {
  ch1: [
    { question: '「ㄅ」是下列哪個詞的聲母？', options: ['葡萄', '爸爸', '貓咪', '小狗'], answer: '爸爸' },
    { question: '「ㄇ」是下列哪個詞的聲母？', options: ['蜜蜂', '蝴蝶', '小雞', '小鴨'], answer: '蜜蜂' },
  ],
  ch2: [
    { question: '高山之城的回聲會說什麼？', options: ['勇氣', '懶惰', '害怕', '悲傷'], answer: '勇氣' },
    { question: '迷霧山脉裡有什麼？', options: ['回聲', '怪獸', '寶藏', '火山'], answer: '回聲' },
  ],
  ch3: [
    { question: '天空島上有什麼？', options: ['水晶宮殿', '海底世界', '沙漠', '冰川'], answer: '水晶宮殿' },
    { question: '星光守護者接受什麼？', options: ['洗禮', '考試', '懲罰', '休息'], answer: '洗禮' },
  ],
  ch4: [
    { question: '迷霧熊王要考驗什麼？', options: [' kindness', '力量', '速度', '智慧'], answer: ' kindness' },
    { question: '熊王讓開了什麼？', options: ['道路', '城門', '橋梁', '山洞'], answer: '道路' },
  ],
  ch5: [
    { question: '誰會幫助我們對抗黑雲龍？', options: ['回聲巨鷹', '小光獸', '露米', '全部'], answer: '全部' },
    { question: '什麼力量驅散了黑暗？', options: ['星光', '雷電', '火焰', '風暴'], answer: '星光' },
  ],
};

export default function AdventurePage() {
  const router = useRouter();
  const [progress, setProgress] = useState<StoryProgress | null>(() => loadProgress());
  const [game, setGame] = useState<GameState | null>(() => loadGameState());

  const [challengeChapter, setChallengeChapter] = useState<string | null>(null);
  const [challengeQIndex, setChallengeQIndex] = useState(0);
  const [challengeSelected, setChallengeSelected] = useState<string | null>(null);
  const [challengeCorrectCount, setChallengeCorrectCount] = useState(0);
  const [challengeTotal, setChallengeTotal] = useState(0);
  const [challengeAnswered, setChallengeAnswered] = useState(false);

  const refresh = () => {
    setProgress(loadProgress());
    setGame(loadGameState());
  };

  const startChapter = (chapterId: string) => {
    const qs = CHAPTER_QUESTIONS[chapterId] ?? [];
    if (!qs.length) return;
    setChallengeChapter(chapterId);
    setChallengeQIndex(0);
    setChallengeSelected(null);
    setChallengeCorrectCount(0);
    setChallengeTotal(qs.length);
    setChallengeAnswered(false);
  };

  const handleChallengeAnswer = (opt: string) => {
    if (!challengeChapter || challengeSelected !== null) return;
    const qs = CHAPTER_QUESTIONS[challengeChapter] ?? [];
    const q = qs[challengeQIndex];
    if (!q) return;
    const ok = opt === q.answer;
    setChallengeSelected(opt);
    setChallengeAnswered(true);
    if (ok) {
      setChallengeCorrectCount((v) => v + 1);
      try { addEnergy(1); } catch {}
    }
  };

  const goNextChallenge = () => {
    if (!challengeChapter) return;
    const qs = CHAPTER_QUESTIONS[challengeChapter] ?? [];
    if (challengeQIndex >= qs.length - 1) {
      finishChallenge(challengeSelected === (qs[challengeQIndex]?.answer));
    } else {
      setChallengeQIndex((v) => v + 1);
      setChallengeSelected(null);
      setChallengeAnswered(false);
    }
  };

  const finishChallenge = (lastCorrect: boolean) => {
    if (!challengeChapter) return;
    const allCorrect = challengeCorrectCount + (lastCorrect ? 1 : 0) === challengeTotal;
    if (allCorrect && progress) {
      const next: StoryProgress = {
        ...progress,
        completedChapters: progress.completedChapters.includes(challengeChapter)
          ? progress.completedChapters
          : [...progress.completedChapters, challengeChapter],
        currentChapter: null,
        currentDialogId: null,
      };
      saveProgress(next);
      addStars(2);
      addEnergy(1);
    }
    setChallengeChapter(null);
    setChallengeSelected(null);
    refresh();
  };

  const isChapterUnlocked = (chapterId: string) => {
    if (!progress) return false;
    return progress.unlockedChapters.includes(chapterId);
  };

  const isChapterCompleted = (chapterId: string) => {
    if (!progress) return false;
    return progress.completedChapters.includes(chapterId);
  };

  const requiredStars = (chapterId: string) => {
    const ch = CHAPTERS.find((c) => c.id === chapterId);
    return ch?.requiredStars ?? 0;
  };

  if (!progress || !game) {
    return (
      <PhoneFrame>
        <CompanionBar dialogue="" />
        <KidTopBar title="冒險地圖" backHref="/" backLabel="首頁" />
        <div className="kid-game-content" />
        <KidBottomNav />
      </PhoneFrame>
    );
  }

  const uniqueWorlds = Array.from(new Set(CHAPTERS.map((c) => c.world)));
  const nextChapter = CHAPTERS.find((c) => !isChapterCompleted(c.id));

  // 互動挑戰模式
  if (challengeChapter) {
    const qs = CHAPTER_QUESTIONS[challengeChapter] ?? [];
    const q = qs[challengeQIndex];
    if (!q) {
      setChallengeChapter(null);
      return null;
    }
    const answered = challengeAnswered;
    const isCorrect = answered && challengeSelected === q.answer;

    return (
      <PhoneFrame>
        <CompanionBar dialogue={`冒險關卡 ${challengeQIndex + 1} / ${qs.length}`} />
        <KidTopBar title="冒險挑戰" backHref="/adventure" backLabel="地圖" />
        <div className="kid-game-content">
          <section className="kid-soft-panel" style={{ padding: '16px 14px', textAlign: 'center' }}>
            <p className="practice-question-label">互動挑戰</p>
            <h1 className="practice-question-text" style={{ fontSize: 22 }}>{q.question}</h1>
            <div className="practice-options-grid" style={{ marginTop: 14 }}>
              {q.options.map((opt) => {
                const showState = answered && (opt === q.answer || opt === challengeSelected);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleChallengeAnswer(opt)}
                    disabled={answered}
                    className={`practice-option ${showState && opt === q.answer ? 'is-correct' : ''} ${showState && challengeSelected === opt && opt !== q.answer ? 'is-wrong' : ''}`}
                  >
                    <span className="practice-option-text">{opt}</span>
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className={`practice-feedback ${isCorrect ? 'is-ok' : 'is-retry'}`} style={{ marginTop: 14 }}>
                <p className="practice-feedback-title">{isCorrect ? '答對了！' : '差一點，繼續加油！'}</p>
              </div>
            )}
            {answered && (
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="kid-blue-button flex min-h-[54px] w-full items-center justify-center rounded-[22px] text-base font-black"
                  onClick={goNextChallenge}
                >
                  {challengeQIndex >= qs.length - 1 ? '完成冒險' : '下一題'}
                </button>
              </div>
            )}
          </section>
        </div>
        <KidBottomNav />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <CompanionBar dialogue="" />
      <KidTopBar
        title="冒險地圖"
        backHref="/"
        backLabel="首頁"
        rightLabel={`${progress.completedChapters.length}/${CHAPTERS.length}`}
      />
      <div className="kid-game-content">
        <section className="kid-soft-panel" style={{ padding: '14px' }}>
          <div className="kid-map-header">
            <h2 className="kid-map-title">星光守護者之旅</h2>
            <p className="kid-map-sub">跟著露米和小光獸，探索三個世界</p>
          </div>
          <div className="kid-world-map">
            {uniqueWorlds.map((world) => {
              const worldChapters = CHAPTERS.filter((c) => c.world === world);
              const unlocked = worldChapters.some((c) => isChapterUnlocked(c.id));
              const completed = worldChapters.filter((c) => isChapterCompleted(c.id)).length;
              return (
                <div key={world} className={`kid-world-chip ${unlocked ? '' : 'locked'}`}>
                  <div className={`kid-world-icon ${world}`} aria-hidden="true" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="kid-world-name">{WORLD_NAMES[world] ?? world}</div>
                    <div className="kid-world-status">
                      {unlocked ? `已開啟 ${completed}/${worldChapters.length} 章` : '尚未開啟'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="kid-soft-panel" style={{ padding: '14px', marginTop: '14px' }}>
          <div className="kid-map-header">
            <h2 className="kid-map-title">章節</h2>
            <p className="kid-map-sub">完成章節以解鎖新世界</p>
          </div>
          <div className="kid-chapter-list">
            {CHAPTERS.map((ch) => {
              const unlocked = isChapterUnlocked(ch.id);
              const done = isChapterCompleted(ch.id);
              const boss = BOSS_ENCOUNTERS.find((b) => b.chapter === ch.id);
              return (
                <div
                  key={ch.id}
                  className={`kid-chapter-row ${done ? 'done' : unlocked ? '' : 'locked'}`}
                >
                  <div className="kid-chapter-num">{done ? '✓' : ch.order}</div>
                  <div className="kid-chapter-meta">
                    <div className="kid-chapter-title">{ch.title}</div>
                    <div className="kid-chapter-desc">
                      {done ? '已完成' : unlocked ? ch.description : `需要 ${requiredStars(ch.id)} 顆星`}
                    </div>
                    {boss && unlocked && (
                      <div className="kid-chapter-desc" style={{ color: '#b45309' }}>
                        Boss：{boss.bossName}
                      </div>
                    )}
                  </div>
                  {unlocked && !done && (
                    <button
                      type="button"
                      className="kid-quest-arrow"
                      onClick={() => startChapter(ch.id)}
                      aria-label={`開始 ${ch.title}`}
                    >
                      ▶
                    </button>
                  )}
                  {done && (
                    <button
                      type="button"
                      className="kid-quest-arrow"
                      onClick={() => router.push(boss ? `/boss?chapter=${ch.id}` : '/pet')}
                      aria-label="前往"
                    >
                      →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="adventure-resources-compact" style={{ marginTop: '14px', textAlign: 'center' }}>
          <div className="kid-map-header" style={{ padding: '0 2px' }}>
            <h2 className="kid-map-title" style={{ fontSize: '18px' }}>小光獸的背包</h2>
            <p className="kid-map-sub">目前擁有</p>
          </div>
          <div className="adventure-resources-grid">
            <div className="adventure-resource-item">
              <div className="adventure-resource-label">星星幣</div>
              <div className="adventure-resource-value">{game.stars}</div>
            </div>
            <div className="adventure-resource-item">
              <div className="adventure-resource-label">能量</div>
              <div className="adventure-resource-value">{game.energy}</div>
            </div>
            <div className="adventure-resource-item">
              <div className="adventure-resource-label">Boss 勝利</div>
              <div className="adventure-resource-value">{game.bossWins}</div>
            </div>
            <div className="adventure-resource-item">
              <div className="adventure-resource-label">夥伴等級</div>
              <div className="adventure-resource-value">{game.growthLevel}</div>
            </div>
          </div>
          <div className="kid-adventure-cta-row">
            <button type="button" className="kid-adventure-cta primary" onClick={() => router.push('/practice')}>
              開始練習
            </button>
            <button
              type="button"
              className="kid-adventure-cta secondary"
              onClick={() => router.push('/pet')}
            >
              去見小光獸
            </button>
          </div>
        </section>

        {nextChapter && (
          <section className="kid-soft-panel" style={{ padding: '14px', marginTop: '14px', textAlign: 'center' }}>
            <div className="kid-map-header" style={{ padding: '0 2px' }}>
              <h2 className="kid-map-title" style={{ fontSize: '18px' }}>下一個任務</h2>
              <p className="kid-map-sub">{nextChapter.title}</p>
            </div>
            <button
              type="button"
              className="kid-blue-button flex min-h-[54px] w-full items-center justify-center rounded-[22px] text-base font-black"
              onClick={() => startChapter(nextChapter.id)}
            >
              開始冒險
            </button>
          </section>
        )}
      </div>

      <KidBottomNav />
    </PhoneFrame>
  );
}
