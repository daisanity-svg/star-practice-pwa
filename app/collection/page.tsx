import Image from 'next/image';
import { KidBottomNav } from '@/components/KidBottomNav';
import { KidTopBar } from '@/components/KidTopBar';
import { PhoneFrame } from '@/components/PhoneFrame';
import { getChildInventory, getCollectionSummary } from '@/lib/data/rewards';
import type { RewardCard } from '@/lib/types';

const rarityLabel: Record<string, string> = {
  common: '普通',
  rare: '閃亮',
  super_rare: '超稀有',
  legendary: '傳說'
};

const rarityStyle: Record<string, string> = {
  common: 'bg-slate-100 text-slate-500',
  rare: 'bg-[#dbeafe] text-blue-700',
  super_rare: 'bg-[#e0edff] text-[#1766e6]',
  legendary: 'bg-[#fff0b8] text-amber-900'
};

function seriesIcon(name: string) {
  if (name.includes('車')) return '🚗';
  if (name.includes('狗') || name.includes('布麗')) return '🐶';
  if (name.includes('植物') || name.includes('皮克')) return '🌱';
  return '⭐';
}

function cardImageUrl(card: RewardCard) {
  return card.rendered_card_image_url || card.source_image_url || null;
}

function cardFallbackEmoji(card: RewardCard) {
  const text = `${card.name} ${card.series?.name ?? ''}`;
  if (text.includes('車')) return '🚗';
  if (text.includes('狗') || text.includes('布麗')) return '🐶';
  if (text.includes('植物') || text.includes('皮克')) return '🌱';
  return '⭐';
}

export default async function CollectionPage() {
  const [collections, inventory] = await Promise.all([getCollectionSummary(), getChildInventory()]);
  const ownedTotal = collections.reduce((sum, item) => sum + item.owned, 0);
  const cardTotal = collections.reduce((sum, item) => sum + item.total, 0);
  const totalPercent = cardTotal > 0 ? Math.round((ownedTotal / cardTotal) * 100) : 0;

  return (
    <PhoneFrame>
      <KidTopBar title="我的收納包" rightLabel="🎒" />

      <section className="kid-hero-blue relative overflow-hidden rounded-[36px] p-5 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
        <div className="pointer-events-none absolute bottom-2 right-2 text-8xl opacity-20">☁️</div>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-black text-white/80">星見的卡片圖鑑</p>
            <h1 className="mt-1 text-[32px] font-black leading-tight tracking-[-0.04em]">收集新朋友</h1>
            <p className="mt-2 text-sm font-bold leading-relaxed text-white/90">每天完成練習，就把新的朋友放進這裡。</p>
          </div>
          <div className="learning-orb flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[28px] text-4xl shadow-sm">🎒</div>
        </div>

        <div className="mt-5 rounded-[28px] bg-white/18 p-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-white/84">總收藏進度</p>
            <p className="text-2xl font-black">{ownedTotal}/{cardTotal || 0}</p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-[#ffd95a]" style={{ width: `${totalPercent}%` }} />
          </div>
          <p className="mt-3 text-center text-sm font-bold text-white/88">完成度 {totalPercent}%</p>
        </div>
      </section>

      <section className="space-y-4">
        {collections.map((collection) => {
          const percent = collection.total > 0 ? Math.round((collection.owned / collection.total) * 100) : 0;
          const previewLength = Math.min(Math.max(collection.total || 5, 5), 10);

          return (
            <div key={collection.id} className="kid-card overflow-hidden p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-2xl font-black text-[#172033]">{collection.name}</h2>
                    <span className="text-2xl">{seriesIcon(collection.name)}</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#5f6f89]">已收集 {collection.owned} / {collection.total}</p>
                </div>
                <div className="rounded-full bg-[#e9f4ff] px-3 py-2 text-sm font-black text-[#1766e6]">{percent}%</div>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#e6eef9]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#2f8cff] to-[#ffd95a]" style={{ width: `${percent}%` }} />
              </div>

              <div className="card-grid-soft mt-4">
                {Array.from({ length: previewLength }).map((_, index) => {
                  const owned = index < collection.owned;
                  return (
                    <div
                      key={index}
                      className={`relative flex aspect-[3/4] min-h-[82px] flex-col items-center justify-center overflow-hidden rounded-[20px] text-lg font-black shadow-sm ${
                        owned
                          ? 'bg-gradient-to-br from-[#e6f3ff] to-[#fff5c7] text-[#1766e6] ring-1 ring-[#b9dcff]'
                          : 'bg-white/75 text-[#aab4c2] ring-1 ring-dashed ring-[#d6e3f2]'
                      }`}
                    >
                      {owned ? <span className="absolute right-1.5 top-1 text-xs">✨</span> : null}
                      <span className="text-2xl">{owned ? seriesIcon(collection.name) : '?'}</span>
                      <span className="mt-1 text-[10px] tracking-wide">{owned ? 'GET' : 'LOCK'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <section className="kid-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-[#2f8cff]">已獲得卡片</p>
            <h2 className="text-2xl font-black text-[#172033]">我的卡片牆</h2>
          </div>
          <div className="rounded-full bg-[#e9f4ff] px-3 py-2 text-sm font-black text-[#1766e6]">{inventory.length} 張</div>
        </div>

        {inventory.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {inventory.map((item) => {
              const card = item.card;
              if (!card) return null;
              const imageUrl = cardImageUrl(card);

              return (
                <div key={item.id} className="rounded-[28px] bg-white p-2 shadow-[0_10px_22px_rgba(30,64,175,0.08)] active:scale-[0.99]">
                  <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-br from-[#e6f3ff] via-white to-[#fff5c7]">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={card.name} fill className="object-cover" sizes="170px" unoptimized />
                    ) : (
                      <div className="text-6xl">{cardFallbackEmoji(card)}</div>
                    )}
                  </div>
                  <h3 className="mt-2 truncate text-base font-black text-[#172033]">{card.name}</h3>
                  <p className="mt-0.5 truncate text-xs font-bold text-[#7b8aa3]">{card.series?.name ?? '收藏卡'}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-black ${rarityStyle[card.rarity] ?? rarityStyle.common}`}>
                      {rarityLabel[card.rarity] ?? card.rarity}
                    </span>
                    <span className="rounded-full bg-[#fff0b8] px-2 py-1 text-[11px] font-black text-amber-900">x{item.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-[30px] bg-[#f5f9ff] p-6 text-center">
            <div className="text-5xl">🎁</div>
            <p className="mt-3 text-xl font-black text-[#172033]">還沒有卡片</p>
            <p className="mt-2 text-sm font-bold text-[#5f6f89]">完成今天的練習，就能拿到第一張卡。</p>
          </div>
        )}
      </section>

      <KidBottomNav />
    </PhoneFrame>
  );
}
