'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  type GameState,
} from '@/lib/game/state';

const WORLD_NAMES: Record<string, string> = {
  forest: '森林王國',
  mountain: '高山之城',
  sky: '天空島',
};

const MATCH_QUESTIONS: Record<string, { left: string; right: string[]; correct: string }[]> = {
  ch1: [
    { left: 'ㄅ', right: ['爸爸', '婆婆', '媽媽', '蜜蜂'], correct: '爸爸' },
    { left: 'ㄇ', right: ['蜜蜂', '蝴蝶', '媽媽', '小雞'], correct: '媽媽' },
    { left: 'A', right: ['Apple', 'Ball', 'Cat', 'Dog'], correct: 'Apple' },
    { left: 'B', right: ['Apple', 'Ball', 'Cat', 'Dog'], correct: 'Ball' },
  ],
  ch2: [
    { left: 'ㄆ', right: ['婆婆', '爸爸', '媽媽', '星星'], correct: '婆婆' },
    { left: 'ㄈ', right: ['房子', '蝴蝶', '蜜蜂', '大象'], correct: '房子' },
    { left: 'C', right: ['Apple', 'Ball', 'Cat', 'Dog'], correct: 'Cat' },
    { left: 'D', right: ['Apple', 'Ball', 'Cat', 'Dog'], correct: 'Dog' },
  ],
  ch3: [
    { left: 'ㄇ', right: ['媽媽', '商店', '星星', '貓咪'], correct: '媽媽' },
    { left: 'ㄊ', right: ['兔子', '湯圓', '滑板', '風箏'], correct: '湯圓' },
    { left: 'ㄎ', right: ['喝水', '看書', '喝水', '公園'], correct: '喝水' },
  ],
  ch4: [
    { left: 'ㄈ', right: ['房子', '鳳凰', '花園', '花車'], correct: '房子' },
    { left: 'ㄋ', right: ['牛奶', '芒果', '木馬', '月亮'], correct: '牛奶' },
  ],
  ch5: [
    { left: 'ㄆ', right: ['婆婆', '皮克', '跑車', '蘋果'], correct: '婆婆' },
    { left: 'E', right: ['Elephant', 'Fish', 'Giraffe', 'House'], correct: 'Elephant' },
    { left: 'F', right: ['Elephant', 'Fish', 'Giraffe', 'House'], correct: 'Fish' },
  ],
};

const NODES = [
  { id: 'n1', label: '1', chapterId: 'ch1' },
  { id: 'n2', label: '2', chapterId: 'ch1' },
  { id: 'n3', label: 'Boss', chapterId: 'ch4', isBoss: true },
  { id: 'n4', label: '4', chapterId: 'ch2' },
  { id: 'n5', label: '5', chapterId: 'ch2' },
  { id: 'n6', label: '6', chapterId: 'ch3' },
  { id: 'n7', label: '7', chapterId: 'ch3' },
  { id: 'n8', label: '8', chapterId: 'ch5' },
  { id: 'n9', label: 'Boss', chapterId: 'ch5', isBoss: true },
  { id: 'n10', label: '10', chapterId: 'ch5' },
];

function AdventureContent() {
  const router = useRouter();
  const search = useSearchParams();
  const bossChapter = search.get('chapter');
  const [progress, setProgress] = useState<StoryProgress | null>(() => loadProgress());
  const [game, setGame] = useState<GameState | null>(() => loadGameState());
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const refresh = () => {
    setProgress(loadProgress());
    setGame(loadGameState());
  };

  const isChapterUnlocked = (chapterId: string) => {
    if (!progress) return false;
    return progress.unlockedChapters.includes(chapterId);
  };

  const isChapterCompleted = (chapterId: string) => {
    if (!progress) return false;
    return progress.completedChapters.includes(chapterId);
  };

  const bossForChapter = (chapterId: string) =>
    BOSS_ENCOUNTERS.find((b) => b.chapter === chapterId);

  const startNode = (chapterId: string) => {
    if (!isChapterUnlocked(chapterId)) return;
    setActiveNode(chapterId);
    setSelectedLeft(null);
    setMatched(new Set());
    setMessage(null);
    setFinished(false);
  };

  const currentPairs = activeNode ? MATCH_QUESTIONS[activeNode] ?? [] : [];
  const nextPairIndex = matched.size;

  const handleLeft = (item: string) => {
    if (finished) return;
    setSelectedLeft(item);
    setMessage(null);
  };

  const handleRight = (item: string) => {
    if (!selectedLeft || finished) return;
    const ok = selectedLeft === item;
    if (ok) {
      const next = new Set(matched);
      next.add(selectedLeft);
      setMatched(next);
      setSelectedLeft(null);
      if (next.size >= currentPairs.length) {
        setFinished(true);
        setMessage('配對成功！');
        if (progress && activeNode) {
          const nextProgress: StoryProgress = {
            ...progress,
            completedChapters: progress.completedChapters.includes(activeNode)
              ? progress.completedChapters
              : [...progress.completedChapters, activeNode],
            currentChapter: null,
            currentDialogId: null,
          };
          saveProgress(nextProgress);
          addStars(2);
          addEnergy(1);
        }
      } else {
        setMessage('配對成功，繼續！');
      }
    } else {
      setMessage('再想想看～');
      setSelectedLeft(null);
    }
  };

  const nextChapter = CHAPTERS.find((c) => !isChapterCompleted(c.id));

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

  if (bossChapter) {
    const boss = BOSS_ENCOUNTERS.find((b) => b.chapter === bossChapter);
    if (boss) {
      return (
        <PhoneFrame>
          <CompanionBar dialogue={`Boss：${boss.bossName}`} />
          <KidTopBar title="Boss 戰鬥" backHref="/adventure" backLabel="地圖" />
          <div className="kid-game-content">
            <section className="kid-soft-panel" style={{ padding: '16px 14px', textAlign: 'center' }}>
              <h1 className="practice-question-text" style={{ fontSize: 22 }}>前往 Boss 模式</h1>
              <p className="kid-sidenote" style={{ marginTop: 10 }}>請切換到 Boss 分頁。</p>
              <button
                type="button"
                className="kid-blue-button flex min-h-[54px] w-full items-center justify-center rounded-[22px] text-base font-black"
                onClick={() => router.push(`/boss?chapter=${bossChapter}`)}
              >
                前往 Boss 戰鬥
              </button>
            </section>
          </div>
          <KidBottomNav />
        </PhoneFrame>
      );
    }
    router.replace('/adventure');
    return null;
  }

  if (activeNode) {
    const pair = currentPairs[nextPairIndex];
    return (
      <PhoneFrame>
        <CompanionBar dialogue={`冒險關卡 ${nextPairIndex + 1} / ${currentPairs.length}`} />
        <KidTopBar title="配對闖關" backHref="/adventure" backLabel="地圖" />
        <div className="kid-game-content">
          <section className="kid-soft-panel" style={{ padding: '16px 14px', textAlign: 'center' }}>
            <p className="practice-question-label">配對闖關</p>
            <h1 className="practice-question-text" style={{ fontSize: 22 }}>
              {finished ? '太棒了！這一關完成了！' : `找到：${pair?.left ?? ''}`}
            </h1>

            <div className="practice-options-grid" style={{ marginTop: 14 }}>
              {pair && (
                <>
                  <div className="practice-option" style={{ display: 'inline-flex', minWidth: 80 }}>
                    <span className="practice-option-text">{pair.left}</span>
                  </div>
                  {pair.right.map((item) => {
                    const isSelected = selectedLeft === item;
                    const isMatch = matched.has(item) || (matched.has(pair.correct) && item === pair.correct);
                    return (
                      <button
                        key={`${pair.left}-${item}`}
                        type="button"
                        onClick={() => handleRight(item)}
                        className={`practice-option ${isSelected ? 'is-correct' : ''} ${matched.has(item) ? 'is-correct' : ''}`}
                      >
                        <span className="practice-option-text">{item}</span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            <div className="practice-options-grid" style={{ marginTop: 14 }}>
              {pair?.right.map((item) => {
                const isChosen = matched.has(item);
                return (
                  <button
                    key={`pick-${item}`}
                    type="button"
                    disabled={finished || isChosen}
                    onClick={() => handleLeft(item)}
                    className={`practice-option ${selectedLeft === item ? 'is-correct' : ''}`}
                  >
                    <span className="practice-option-text">{item}</span>
                  </button>
                );
              })}
            </div>

            {message && (
              <div className={`practice-feedback ${finished ? 'is-ok' : 'is-retry'}`} style={{ marginTop: 14 }}>
                <p className="practice-feedback-title">{message}</p>
              </div>
            )}

            {finished && (
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="kid-blue-button flex min-h-[54px] w-full items-center justify-center rounded-[22px] text-base font-black"
                  onClick={() => {
                    setActiveNode(null);
                    setSelectedLeft(null);
                    setMatched(new Set());
                    setMessage(null);
                    setFinished(false);
                    refresh();
                  }}
                >
                  回地圖
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
            <p className="kid-map-sub">跟著露米和小光獸，探索十個關卡</p>
          </div>
          <div className="kid-world-map" />
        </section>

        <section className="kid-soft-panel" style={{ padding: '14px', marginTop: '14px' }}>
          <div className="kid-map-header">
            <h2 className="kid-map-title">關卡</h2>
            <p className="kid-map-sub">完成關卡以解鎖下一關</p>
          </div>
          <div className="kid-chapter-list">
            {NODES.map((node) => {
              const unlocked = isChapterUnlocked(node.chapterId);
              const done = isChapterCompleted(node.chapterId);
              const boss = bossForChapter(node.chapterId);
              return (
                <div
                  key={node.id}
                  className={`kid-chapter-row ${done ? 'done' : unlocked ? '' : 'locked'}`}
                >
                  <div className="kid-chapter-num">{node.isBoss ? '👾' : done ? '✓' : node.label}</div>
                  <div className="kid-chapter-meta">
                    <div className="kid-chapter-title">{WORLD_NAMES[CHAPTERS.find((c) => c.id === node.chapterId)?.world ?? ''] ?? node.chapterId}</div>
                    <div className="kid-chapter-desc">
                      {done ? '已完成' : unlocked ? node.isBoss ? 'Boss 關卡' : '挑戰關卡' : '未解鎖'}
                    </div>
                    {boss && unlocked && !node.isBoss && (
                      <div className="kid-chapter-desc" style={{ color: '#b45309' }}>
                        Boss：{boss.bossName}
                      </div>
                    )}
                  </div>
                  {unlocked && !done && (
                    <button
                      type="button"
                      className="kid-quest-arrow"
                      onClick={() => startNode(node.chapterId)}
                      aria-label={`開始關卡 ${node.label}`}
                    >
                      ▶
                    </button>
                  )}
                  {done && (
                    <button
                      type="button"
                      className="kid-quest-arrow"
                      onClick={() => router.push(boss ? `/boss?chapter=${node.chapterId}` : '/pet')}
                      aria-label="下一關"
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
              onClick={() => startNode(nextChapter.id)}
            >
              開始冒險
            </button>
          </section>
        )}

        <KidBottomNav />
      </div>
    </PhoneFrame>
  );
}

export default function AdventurePage() {
  return (
    <Suspense
      fallback={
        <PhoneFrame>
          <KidTopBar title="冒險" backHref="/" backLabel="首頁" />
          <div className="kid-game-content" />
          <KidBottomNav />
        </PhoneFrame>
      }
    >
      <AdventureContent />
    </Suspense>
  );
}
