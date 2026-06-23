import Link from 'next/link';
import type { Route } from 'next';
import { KidBottomNav } from '@/components/KidBottomNav';
import { KidTopBar } from '@/components/KidTopBar';
import { PhoneFrame } from '@/components/PhoneFrame';
import { CompanionBar } from '@/components/CompanionBar';
import { StoryProgressWidget } from '@/components/StoryProgressWidget';
import { getRewardCardDisplayName } from '@/lib/cards/display';
import { getChildInventory } from '@/lib/data/rewards';
import type { RewardCard } from '@/lib/types';
import { loadGameState } from '@/lib/game/state';

function cardImageUrl(card: RewardCard) {
  return card.rendered_card_image_url || card.source_image_url || null;
}

function groupInventoryBySeries(inventory: Awaited<ReturnType<typeof getChildInventory>>) {
  const map = new Map<string, { id: string; name: string; items: typeof inventory }>();

  for (const item of inventory) {
    const card = item.card;
    if (!card) continue;
    const id = card.series?.id ?? 'saved-cards';
    const name = card.series?.name ?? '我的收藏卡';
    const group = map.get(id) ?? { id, name, items: [] as typeof inventory };
    group.items.push(item);
    map.set(id, group);
  }

  return Array.from(map.values());
}

function getTodayPracticeCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem('star-game-v5-state');
    if (!raw) return 0;
    const state = JSON.parse(raw) as { todayPracticeCount?: number; lastPracticeDate?: string | null };
    const today = new Date().toISOString().slice(0, 10);
    if (state.lastPracticeDate !== today) return 0;
    return Number(state.todayPracticeCount ?? 0);
  } catch {
    return 0;
  }
}

function isChapterUnlocked(chapterId: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem('star-game-v5-state');
    if (!raw) return true;
    const state = JSON.parse(raw) as { unlockedWorlds?: string[] };
    // V5: all chapters unlocked for MVP; safe fallback
    return true;
  } catch {
    return true;
  }
}

export default async function HomePage() {
  const inventory = await getChildInventory();
  const collections = groupInventoryBySeries(inventory);
  const ownedTotal = inventory.reduce((sum, item) => sum + Number(item.quantity ?? 1), 0);
  const cardTotal = collections.reduce((sum, item) => sum + item.items.length, 0) || 1;
  const progressPercent = Math.min(100, Math.round((ownedTotal / Math.max(1, cardTotal)) * 100));
  const game = typeof window !== 'undefined' ? loadGameState() : null;

  const todayCount = typeof window !== 'undefined' ? getTodayPracticeCount() : 0;
  const hasPracticedToday = todayCount > 0;
  const canDrawToday = game ? game.lastDrawDate !== new Date().toISOString().slice(0, 10) : true;

  let primaryHref: Route = '/practice';
  let primaryLabel = '開始練習';
  if (hasPracticedToday && !canDrawToday) {
    primaryHref = '/adventure';
    primaryLabel = '開始今天的冒險';
  } else if (hasPracticedToday && canDrawToday) {
    primaryHref = '/reward';
    primaryLabel = '打開今日卡包';
  }

  const mapNodes = [
    { id: 'n1', label: '1', type: 'chapter' as const, chapterId: 'ch1' },
    { id: 'n2', label: '2', type: 'chapter' as const, chapterId: 'ch1' },
    { id: 'n3', label: 'Boss', type: 'boss' as const, chapterId: 'ch4' },
    { id: 'n4', label: '4', type: 'chapter' as const, chapterId: 'ch2' },
    { id: 'n5', label: '5', type: 'chapter' as const, chapterId: 'ch2' },
    { id: 'n6', label: '6', type: 'chapter' as const, chapterId: 'ch3' },
    { id: 'n7', label: '7', type: 'chapter' as const, chapterId: 'ch3' },
    { id: 'n8', label: '8', type: 'chapter' as const, chapterId: 'ch5' },
    { id: 'n9', label: 'Boss', type: 'boss' as const, chapterId: 'ch5' },
    { id: 'n10', label: '10', type: 'chapter' as const, chapterId: 'ch5' },
  ];

  return (
    <PhoneFrame>
      <CompanionBar dialogue="今天也要一起冒險" />
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
              <span className="kid-status-pill">第 3 天冒險中</span>
              <span className="kid-status-pill">{ownedTotal} 位朋友</span>
            </div>
            <h1 className="kid-hero-title">跟小光獸<br />開始今天的冒險</h1>
            <p className="kid-hero-sub">完成任務，一起收集星星朋友</p>
            <div className="kid-hero-decor" aria-hidden="true">
              <span className="kid-star-badge" />
              <span className="kid-message-note">!</span>
            </div>
            <Link href={primaryHref} className="kid-cta">
              <span className="kid-cta-label">{primaryLabel}</span>
            </Link>
          </section>

          {game && (
            <section className="kid-soft-panel" style={{ padding: '14px', marginTop: 14, textAlign: 'center' }}>
              <div className="kid-map-header" style={{ padding: '0 2px' }}>
                <h2 className="kid-map-title" style={{ fontSize: '18px' }}>我的資源</h2>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <span className="kid-resource-chip">星星幣 {game.stars}</span>
                <span className="kid-resource-chip">能量 {game.energy}</span>
                <span className="kid-resource-chip">成長 Lv.{game.growthLevel}</span>
                <span className="kid-resource-chip">親密度 Lv.{game.intimacyLevel}</span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#5f6f89', marginTop: 8 }}>
                星星幣用來和夥伴互動，能量用來讓夥伴成長
              </p>
            </section>
          )}

          <StoryProgressWidget />

          <section className="kid-map">
            <div className="kid-map-header">
              <h2 className="kid-map-title">今天 10 關冒險</h2>
              <p className="kid-map-sub">跟著小徑前進，一站一站完成</p>
            </div>
            <div className="kid-map-route">
              <div className="kid-route-line" aria-hidden="true" />
              <div className="kid-quests">
                {mapNodes.map((node) => (
                  <div key={node.id} className={`kid-quest ${node.type === 'boss' ? 'boss' : ''}`}>
                    <div className="kid-quest-pin">
                      <span className="kid-quest-num">{node.label}</span>
                    </div>
                    <span className="kid-quest-label">{node.type === 'boss' ? 'Boss' : node.chapterId.replace('ch', '章 ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

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
                <div className="kid-collect-label">今日圖鑑進度</div>
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
            <div className="kid-parent-entry">
              <Link href="/parent/dashboard" className="kid-parent-btn">
                家長後台
              </Link>
            </div>
          </section>
        </div>

        <KidBottomNav />

        <div style={{ textAlign: 'center', fontSize: '10px', opacity: 0.5, padding: '8px 0' }}>
          V5.1 · {typeof process !== 'undefined' && process.env.NEXT_PUBLIC_COMMIT_HASH ? process.env.NEXT_PUBLIC_COMMIT_HASH : 'local'}
        </div>
      </div>
    </PhoneFrame>
  );
}
