'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { KidBottomNav } from '@/components/KidBottomNav';
import { PhoneFrame } from '@/components/PhoneFrame';
import { CompanionBar } from '@/components/CompanionBar';
import { PetAvatar } from '@/components/PetAvatar';
import { getCollectionSummary } from '@/lib/data/rewards';
import { getMapProgress, MapProgress } from '@/lib/actions/map';
import { loadGameState, GameState, DEFAULT_GAME_STATE } from '@/lib/game/state';

const NODE_COUNT = 5;
const BOSS_NODES = new Set([2, 4]);
const QUEST_THEME_NAMES = ['找朋友', '小司機', '恐龍', '植物', '星星章'];

function nodeLabel(index: number) {
  if (index === 0) return '出發點';
  if (index === NODE_COUNT - 1) return '星星章';
  return QUEST_THEME_NAMES[index] ?? `第 ${index + 1} 關`;
}

export default function HomePage() {
  const [collections, setCollections] = useState<Awaited<ReturnType<typeof getCollectionSummary>>>([]);
  const [progress, setProgress] = useState<MapProgress>(() => getMapProgress({ nodeCount: NODE_COUNT }));
  const [mounted, setMounted] = useState(false);
  const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    // Mount guard: avoid accessing localStorage during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getCollectionSummary().then((items) => {
      if (!cancelled) setCollections(items);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    try {
      const state = loadGameState();
      if (!cancelled) setGameState(state);
      if (!cancelled) setTodayCount(state.todayPracticeCount);
    } catch {}
    return () => { cancelled = true; };
  }, [mounted]);

  const ownedTotal = collections.reduce((sum, item) => sum + item.owned, 0) || 0;
  const cardTotal = collections.reduce((sum, item) => sum + item.total, 0) || 1;
  const progressPercent = Math.round((ownedTotal / cardTotal) * 100);

  const completedCount = mounted ? progress.completed.length : 0;
  const activeIndex = mounted ? progress.current : 0;
  const isAllComplete = mounted && completedCount >= NODE_COUNT;

  const quests = Array.from({ length: 5 }, (_, i) => i).map((index) => {
    const done = progress.completed.includes(index);
    const active = mounted && activeIndex === index;
    const status = done ? 'done' : active ? 'active' : 'locked';
    return { id: index + 1, label: nodeLabel(index), status };
  });

  return (
    <PhoneFrame>
      <CompanionBar title="今天出發" rightLabel={`${ownedTotal} 位朋友`} />
      <div className="kid-game-root">
        <div className="kid-sky" aria-hidden="true" />
        <div className="kid-cloud-1" aria-hidden="true" />
        <div className="kid-cloud-2" aria-hidden="true" />
        <div className="kid-cloud-3" aria-hidden="true" />

        <div className="kid-ground" aria-hidden="true" />
        <div className="kid-hill-1" aria-hidden="true" />
        <div className="kid-hill-2" aria-hidden="true" />

        <div className="kid-game-content">
          <section className="kid-hero">
            <div className="kid-status-row">
              <span className="kid-status-pill">第 {todayCount + 1} 天冒險中</span>
              <span className="kid-status-pill">{ownedTotal} 位朋友</span>
            </div>
            <div className="flex justify-center">
              <PetAvatar growthLevel={gameState.growthLevel} />
            </div>
            <h1 className="kid-hero-title">今天出發<br />找星星朋友</h1>
            <p className="kid-hero-sub">完成 5 個小任務，打開今日卡包</p>
            <div className="kid-hero-decor" aria-hidden="true">
              <span className="kid-star-badge" />
              <span className="kid-message-note">!</span>
            </div>
            <Link href="/practice" className="kid-cta">
              <span className="kid-cta-label">開始冒險</span>
            </Link>
          </section>

          <section className="kid-map">
            <div className="kid-map-header">
              <h2 className="kid-map-title">今天 5 題練習</h2>
              <p className="kid-map-sub">跟著小徑前進，一站一站完成</p>
            </div>
            <div className="kid-map-route">
              <div className="kid-route-line" aria-hidden="true" />
              <div className="kid-quests">
                {quests.map((quest) => (
                  <div key={quest.id} className={`kid-quest ${quest.status}`}>
                    <div className="kid-quest-pin">
                      <span className="kid-quest-num">{quest.id}</span>
                    </div>
                    <span className="kid-quest-label">{quest.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {isAllComplete ? (
            <section className="kid-reward">
              <div className="kid-chest" aria-hidden="true">
                <div className="kid-chest-top" />
                <div className="kid-chest-body" />
                <div className="kid-chest-band" />
                <div className="kid-chest-shine" />
              </div>
              <h3 className="kid-reward-title">小徑已經探索完成！</h3>
              <p className="kid-reward-sub">快去打開今天的驚喜吧。</p>
              <Link href="/boss" className="kid-reward-cta">
                前往 Boss 挑戰
              </Link>
            </section>
          ) : (
            <section className="kid-reward">
              <div className="kid-chest" aria-hidden="true">
                <div className="kid-chest-top" />
                <div className="kid-chest-body" />
                <div className="kid-chest-band" />
                <div className="kid-chest-shine" />
              </div>
              <h3 className="kid-reward-title">完成後打開卡包</h3>
              <p className="kid-reward-sub">看看今天會遇見哪位新朋友</p>
              <Link href="/reward" className="kid-reward-cta">
                打開今日卡包
              </Link>
            </section>
          )}

          <section className="kid-collect">
            <div className="kid-collect-header">
              <h3 className="kid-collect-title">我的星星圖鑑</h3>
              <Link href="/collection" className="kid-collect-link">
                查看
              </Link>
            </div>
            <div className="kid-collect-row">
              <div className="kid-collect-icon" aria-hidden="true" />
              <div className="kid-collect-body">
                <div className="kid-collect-label">今天冒險完成度</div>
                <div className="kid-collect-track">
                  <div
                    className="kid-collect-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <span className="kid-collect-percent">{progressPercent}%</span>
            </div>
            <p className="kid-collect-sub">已找到 {ownedTotal} 位朋友</p>
          </section>
        </div>

        <KidBottomNav />
      </div>
    </PhoneFrame>
  );
}
