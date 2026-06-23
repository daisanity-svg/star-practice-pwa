'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CHAPTERS, BOSS_ENCOUNTERS } from '@/lib/story/data';
import { loadProgress, type StoryProgress } from '@/lib/story/local-storage';

export function StoryProgressWidget() {
  const [progress] = useState<StoryProgress | null>(() => loadProgress());

  if (!progress) return null;

  const nextChapter = CHAPTERS.find((c) => !progress.completedChapters.includes(c.id));
  const currentChapter = progress.currentChapter ? CHAPTERS.find((c) => c.id === progress.currentChapter) : null;
  const target = nextChapter ?? currentChapter;

  const bossForTarget = target ? BOSS_ENCOUNTERS.find((b) => b.chapter === target.id) : null;

  return (
    <section className="kid-quest-card">
      <div className="kid-quest-badge" aria-hidden="true">
        {progress.completedChapters.length}/{CHAPTERS.length}
      </div>
      <div className="kid-quest-info">
        <div className="kid-quest-label-lg">
          {target ? `主線任務：${target.title}` : '所有章節已完成'}
        </div>
        <div className="kid-quest-next">
          {target
            ? bossForTarget
              ? `接下來的目標：對抗 ${bossForTarget.bossName}`
              : `接下來的目標：${target.description}`
            : '恭喜你完成了星光守護者之旅！'}
        </div>
      </div>
      <Link href="/adventure" className="kid-quest-arrow" aria-label="前往冒險">
        →
      </Link>
    </section>
  );
}
