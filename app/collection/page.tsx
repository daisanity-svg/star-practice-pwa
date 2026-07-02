'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { KidBottomNav } from '@/components/KidBottomNav';
import { CompanionBar } from '@/components/CompanionBar';
import { PhoneFrame } from '@/components/PhoneFrame';
import { getRewardCardDisplayName } from '@/lib/cards/display';
import { getChildInventory } from '@/lib/data/rewards';
import { loadGameState, addBossWin } from '@/lib/game/state';
import type { ChildCardInventoryItem, RewardCard } from '@/lib/types';

type CollectionCardRow = {
  id: string;
  quantity: number;
  obtained_at?: string | null;
  card: RewardCard;
};

function cardImageUrl(card: RewardCard) {
  return card.rendered_card_image_url || card.source_image_url || null;
}

function formatDate(value?: string | null) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value ?? '--';
  return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
}

function BossVictoryPlaceholder() {
  const state = loadGameState();
  const wins = state.bossWins || 0;
  return (
    <div className="rounded-[26px] bg-white/80 p-5 text-center shadow-sm">
      <p className="text-sm font-black text-[#1766e6]">Boss 勝利紀念</p>
      <p className="mt-2 text-3xl font-black text-[#172033]">x{wins}</p>
      <p className="mt-2 text-sm font-bold text-[#5f6f89]">你在冒險中擊敗了 {wins} 次 Boss。</p>
    </div>
  );
}

export default function CollectionPage() {
  const [inventory, setInventory] = useState<CollectionCardRow[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getChildInventory().then((items) => {
      if (cancelled) return;
      const rows: CollectionCardRow[] = (items as CollectionCardRow[]).filter(
        (item) => item && item.card && item.card.id
      );
      setInventory(rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return inventory;
    const q = query.trim().toLowerCase();
    return inventory.filter((item) => {
      const name = item.card?.name?.toLowerCase() ?? '';
      const no = item.card?.card_no?.toLowerCase() ?? '';
      return name.includes(q) || no.includes(q);
    });
  }, [inventory, query]);

  const totalQuantity = filtered.reduce((sum, item) => sum + Number(item.quantity ?? 1), 0);

  return (
    <PhoneFrame>
      <CompanionBar title="我的收納包" backHref="/" backLabel="地圖" rightLabel={`${inventory.length} 種卡片`} />
      <section className="kid-hero relative overflow-hidden rounded-[36px] p-5 text-white">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 to-transparent" aria-hidden="true" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-black text-white/80">星星朋友藏寶盒</p>
            <h1 className="mt-1 text-[32px] font-black leading-tight tracking-[-0.04em]">已收藏的朋友</h1>
            <p className="mt-2 text-sm font-bold leading-relaxed text-white/90">
              把冒險找到的朋友收在這裡，蒐齊一整頁吧。
            </p>
          </div>
          <div className="kid-collect-jewel relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[28px] shadow-[0_14px_28px_rgba(31,94,246,0.18)]" aria-hidden="true" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[26px] bg-white/18 p-4 text-center backdrop-blur">
            <p className="text-sm font-black text-white/80">卡片種類</p>
            <p className="mt-1 text-3xl font-black">{inventory.length}</p>
          </div>
          <div className="rounded-[26px] bg-white/18 p-4 text-center backdrop-blur">
            <p className="text-sm font-black text-white/80">總張數</p>
            <p className="mt-1 text-3xl font-black">{totalQuantity}</p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-[calc(env(safe-area-inset-bottom)+120px)]">
        <div className="mx-auto max-w-3xl">
          <div className="mt-5">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜尋卡片名稱或卡號"
              className="mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {loading ? (
            <p className="mt-6 text-center text-base font-bold text-[#5f6f89]">載入收藏中...</p>
          ) : filtered.length === 0 ? (
            <div className="kid-empty-card mt-6 flex min-h-[320px] flex-col items-center justify-center rounded-[28px] bg-white/80 p-6 text-center shadow-sm">
              <div className="kid-empty-orb" aria-hidden="true" />
              <p className="kid-chip">還沒收錄這張</p>
              <h2 className="mt-4 text-[28px] font-black leading-tight text-[#172033]">還沒有符合的卡片</h2>
              <p className="mt-3 text-base font-bold leading-relaxed text-[#5f6f89]">
                試試其他名稱，或者先去練習打開小禮物。
              </p>
              <div className="mt-6 w-full space-y-3">
                <Link href="/practice" className="kid-blue-button flex min-h-[60px] items-center justify-center rounded-[24px] text-lg font-black active:scale-[0.99]">
                  去練習
                </Link>
                <Link href="/reward" className="kid-white-button flex min-h-[58px] items-center justify-center rounded-[24px] text-lg font-black active:scale-[0.99]">
                  看今日獎勵
                </Link>
              </div>
              <div className="mt-8 w-full">
                <BossVictoryPlaceholder />
              </div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              {filtered.map((item) => {
                const card = item.card;
                const imageUrl = cardImageUrl(card);
                const displayName = getRewardCardDisplayName(card);
                const quantity = Number(item.quantity ?? 1);
                return (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-3xl bg-white shadow-sm active:scale-[0.99]"
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt={displayName} className="aspect-[3/4] w-full object-contain" />
                    ) : (
                      <span className="kid-card-placeholder" aria-label={displayName} />
                    )}
                    <p className="truncate px-2 py-2 text-center text-sm font-black text-[#172033]">
                      {displayName}
                    </p>
                    <p className="truncate px-2 pb-2 text-center text-[11px] font-bold text-[#7a8599]">
                      {card.card_no ?? '--'} · {formatDate(item.obtained_at)}
                    </p>
                    {quantity > 1 ? (
                      <span className="absolute right-2 top-2 rounded-full bg-[#1766e6] px-2.5 py-1 text-xs font-black text-white shadow-[0_6px_14px_rgba(23,102,230,0.32)] ring-2 ring-white/90">
                        x{quantity}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <KidBottomNav />
    </PhoneFrame>
  );
}
