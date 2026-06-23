'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { PhoneFrame } from '@/components/PhoneFrame';
import { KidBottomNav } from '@/components/KidBottomNav';
import { KidTopBar } from '@/components/KidTopBar';
import { DialogBox } from '@/components/DialogBox';
import { CHAPTERS, BOSS_ENCOUNTERS, getDialogsForChapter, getDialogById } from '@/lib/story/data';
import { loadProgress, saveProgress, type StoryProgress } from '@/lib/story/local-storage';
import type { StoryDialog } from '@/lib/story/types';

type BossPhase = 'intro' | 'battle' | 'outro';

function BossContent() {
  const searchParams = useSearchParams();
  const chapterId = searchParams.get('chapter') ?? CHAPTERS[0].id;
  const chapter = CHAPTERS.find((c) => c.id === chapterId) ?? CHAPTERS[0];
  const boss = BOSS_ENCOUNTERS.find((b) => b.chapter === chapter.id);

  const [progress, setProgress] = useState<StoryProgress | null>(() => loadProgress());
  const [phase, setPhase] = useState<BossPhase>('intro');
  const [dialog, setDialog] = useState<StoryDialog | null>(null);

  useEffect(() => {
    const pre = getDialogsForChapter(chapter.id).find((d) => d.id === `${chapter.id}-boss-intro`);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (pre) setDialog(pre);
  }, [chapter.id]);

  const complete = () => {
    if (!progress) return;
    const updated: StoryProgress = {
      ...progress,
      completedChapters: progress.completedChapters.includes(chapter.id)
        ? progress.completedChapters
        : [...progress.completedChapters, chapter.id],
      currentChapter: null,
      currentDialogId: null,
    };
    saveProgress(updated);
    setProgress(updated);
  };

  const handleDialogChoice = (nextId: string) => {
    const next = getDialogById(nextId);
    if (next) {
      setDialog(next);
      if (nextId.endsWith('start')) {
        setPhase('battle');
      }
      if (nextId.endsWith('win')) {
        setPhase('outro');
        const outro = getDialogsForChapter(chapter.id).find((d) => d.id === `${chapter.id}-boss-complete`);
        if (outro) setDialog(outro);
      }
    }
  };

  const startBoss = () => {
    const start = getDialogById(`${chapter.id}-boss-start`);
    if (start) {
      setDialog(start);
      setPhase('battle');
    }
  };

  const battleResult = () => {
    const win = getDialogById(`${chapter.id}-boss-win`);
    if (win) {
      setDialog(win);
      setPhase('outro');
    }
  };

  const outroComplete = () => {
    setDialog(null);
    complete();
  };

  const nextChapter = CHAPTERS.find((c) => c.order === chapter.order + 1);

  return (
    <PhoneFrame>
      <KidTopBar title={boss?.bossName ?? 'Boss'} backHref="/adventure" backLabel="冒險" />
      <div className="kid-game-content">
        <section className="kid-soft-panel" style={{ padding: '14px' }}>
          <div className="kid-map-header">
            <h2 className="kid-map-title">
              {boss?.bossName ?? '未知的守護者'}
            </h2>
            <p className="kid-map-sub">
              {phase === 'intro' && '前方傳來一陣奇異的氣息...'}
              {phase === 'battle' && '戰鬥正在進行中'}
              {phase === 'outro' && '戰役結束了'}
            </p>
          </div>
          <div className="kid-boss-callout" aria-hidden="true">
            {boss?.bossName ?? '???'}
          </div>
          <div className="kid-quest-next" style={{ marginTop: '12px' }}>
            {phase === 'intro' && (
              <button
                type="button"
                className="kid-blue-button flex min-h-[54px] w-full items-center justify-center rounded-[22px] text-base font-black"
                onClick={startBoss}
              >
                開始戰鬥
              </button>
            )}
            {phase === 'battle' && (
              <button
                type="button"
                className="kid-yellow-button flex min-h-[54px] w-full items-center justify-center rounded-[22px] text-base font-black"
                onClick={battleResult}
              >
                用最強的星光攻擊！
              </button>
            )}
            {phase === 'outro' && (
              <div className="kid-quest-next">
                {nextChapter ? `下一章：${nextChapter.title}` : '旅程暫告一段落'}
              </div>
            )}
          </div>
        </section>
        {dialog && phase !== 'outro' && (
          <DialogBox
            dialog={dialog}
            onComplete={complete}
            onChoice={handleDialogChoice}
          />
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
