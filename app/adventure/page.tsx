'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PhoneFrame } from '@/components/PhoneFrame';
import { KidBottomNav } from '@/components/KidBottomNav';
import { KidTopBar } from '@/components/KidTopBar';
import { DialogBox } from '@/components/DialogBox';
import { CHAPTERS, getDialogsForChapter, getDialogById, BOSS_ENCOUNTERS } from '@/lib/story/data';
import { loadProgress, saveProgress, type StoryProgress } from '@/lib/story/local-storage';
import type { StoryDialog } from '@/lib/story/types';

const WORLD_NAMES: Record<string, string> = {
  forest: '森林王國',
  mountain: '高山之城',
  sky: '天空島',
};

export default function AdventurePage() {
  const [progress, setProgress] = useState<StoryProgress | null>(() => loadProgress());
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [currentDialog, setCurrentDialog] = useState<StoryDialog | null>(null);

  useEffect(() => {
    const p = loadProgress();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(p);
    if (p.currentChapter && !p.completedChapters.includes(p.currentChapter)) {
      const first = getDialogsForChapter(p.currentChapter)[0];
      if (first) {
        setCurrentDialog(first);
        setActiveChapter(p.currentChapter);
      }
    }
  }, []);

  const startChapter = (chapterId: string) => {
    if (!progress) return;
    const first = getDialogsForChapter(chapterId)[0];
    if (!first) return;
    const next: StoryProgress = {
      ...progress,
      currentChapter: chapterId,
      currentDialogId: first.id,
      unlockedChapters: progress.unlockedChapters.includes(chapterId)
        ? progress.unlockedChapters
        : [...progress.unlockedChapters, chapterId],
    };
    saveProgress(next);
    setProgress(next);
    setActiveChapter(chapterId);
    setCurrentDialog(first);
  };

  const handleDialogChoice = (nextId: string) => {
    const next = getDialogById(nextId);
    if (next) {
      setCurrentDialog(next);
      const p = loadProgress();
      setProgress({ ...p, currentDialogId: nextId });
    }
  };

  const handleDialogComplete = () => {
    if (!progress || !activeChapter) return;
    const next: StoryProgress = {
      ...progress,
      completedChapters: progress.completedChapters.includes(activeChapter)
        ? progress.completedChapters
        : [...progress.completedChapters, activeChapter],
      currentChapter: null,
      currentDialogId: null,
    };
    saveProgress(next);
    setProgress(next);
    setActiveChapter(null);
    setCurrentDialog(null);
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

  if (!progress) {
    return (
      <PhoneFrame>
        <KidTopBar title="冒險地圖" backHref="/" backLabel="首頁" />
        <div className="kid-game-content" />
        <KidBottomNav />
      </PhoneFrame>
    );
  }

  const uniqueWorlds = Array.from(new Set(CHAPTERS.map((c) => c.world)));

  return (
    <PhoneFrame>
      <KidTopBar title="冒險地圖" backHref="/" backLabel="首頁" rightLabel={`${progress.completedChapters.length}/${CHAPTERS.length}`} />
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
              return (
                <div key={world} className={`kid-world-chip ${unlocked ? '' : 'locked'}`}>
                  <div className={`kid-world-icon ${world}`} aria-hidden="true" />
                  <div className="kid-world-name">{WORLD_NAMES[world] ?? world}</div>
                  <div className="kid-world-status">
                    {unlocked ? '已開啟' : '尚未開啟'}
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
                    <Link href={boss ? `/boss?chapter=${ch.id}` : '/pet'} className="kid-quest-arrow" aria-label="前往">
                      →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {currentDialog && (
        <DialogBox
          dialog={currentDialog}
          onComplete={handleDialogComplete}
          onChoice={handleDialogChoice}
        />
      )}

      <KidBottomNav />
    </PhoneFrame>
  );
}
