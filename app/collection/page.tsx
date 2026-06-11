import Image from 'next/image';
import { KidBottomNav } from '@/components/KidBottomNav';
import { KidTopBar } from '@/components/KidTopBar';
import { PhoneFrame } from '@/components/PhoneFrame';
import { getChildInventory, getCollectionSummary } from '@/lib/data/rewards';

const rarityLabel: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  super_rare: '超稀有',
  legendary: '傳說'
};

const rarityStyle: Record<string, string> = {
  common: 'bg-slate-100 text-slate-500',
  rare: 'bg-[#dff0ff] text-blue-700',
  super_rare: 'bg-[#f4e8ff] text-purple-700',
  legendary: 'bg-[#fff0b8] text-amber-900'
};

export default async function CollectionPage() {
  const [collections, inventory] = await Promise.all([getCollectionSummary(), getChildInventory()]);
  const ownedTotal = collections.reduce((sum, item) => sum + item.owned, 0);
  const cardTotal = collections.reduce((sum, item) => sum + item.total, 0);
  const totalPercent = cardTotal > 0 ? Math.round((ownedTotal / cardTotal) * 100) : 0;

  return (
    <PhoneFrame>
      <KidTopBar title="我的收納包" rightLabel="🎒" />

      <section className="rounded-[32px] bg-gradient-to-br from-[#6d5dfc] via-[#7b69ff] to-[#9b8cff] p-5 text-white shadow-[0_18px_42px_rgba(109,93,252,0.26)]">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-white/20 text-4xl">🎒</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-white/70">星見的收藏圖鑑</p>
            <h1 className="mt-1 text-[30px] font-black leading-tight">收集新朋友</h1>
            <p className="mt-2 text-sm font-bold leading-relaxed text-white/80">完成練習，卡片會放進這裡。</p>
          </div>
        </div>
        <div className="mt-5 rounded-[26px] bg-white/16 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-white/80">總進度</p>
            <p className="text-2xl font-black">{ownedTotal}/{cardTotal || 0}</p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-[#fff0b8]" style={{ width: `${totalPercent}%` }} />
          </div>
        </div>
      </section>

      <section className="mt-4 space-y-4">
        {collections.map((collection) => {
          const percent = collection.total > 0 ? Math.round((collection.owned / collection.total) * 100) : 0;
          const icon = collection.name.includes('車') ? '🚗' : collection.name.includes('狗') ? '🐶' : collection.name.includes('植物') ? '🌱' : '⭐';

          return (
            <div key={collection.id} className="kid-card overflow-hidden p-4">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-black text-ink">{collection.name}</h2>
                  <p className="mt-1 text-sm font-bold text-slate-500">已收集 {collection.owned} / {collection.total}</p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-[#fff0b8] text-3xl shadow-sm">{icon}</div>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-[#6d5dfc] to-[#8f7cff]" style={{ width: `${percent}%` }} />
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {Array.from({ length: Math.min(collection.total || 5, 10) }).map((_, index) => (
                  <div
                    key={index}
                    className={`flex aspect-[3/4] items-center justify-center rounded-[18px] text-lg font-black shadow-sm ${
                      index < collection.owned ? 'bg-gradient-to-br from-[#d9fae8] to-[#fff8ec] text-emerald-700' : 'bg-white text-slate-300 ring-1 ring-slate-100'
                    }`}
                  >
                    {index < collection.owned ? '✨' : '?'}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-4 kid-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-black text-ink">已獲得卡片</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">最近拿到的新朋友。</p>
          </div>
          <div className="shrink-0 rounded-full bg-[#f4f0ff] px-3 py-2 text-sm font-black text-[#5b4be8]">{inventory.length} 張</div>
        </div>

        {inventory.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {inventory.map((item) => {
              const card = item.card;
              if (!card) return null;

              return (
                <div key={item.id} className="rounded-[26px] bg-white p-2 shadow-[0_10px_22px_rgba(77,68,111,0.08)]">
                  <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br from-[#dff0ff] via-[#fff8ec] to-[#fff0b8]">
                    {card.rendered_card_image_url ? (
                      <Image src={card.rendered_card_image_url} alt={card.name} fill className="object-cover" sizes="170px" />
                    ) : (
                      <div className="text-6xl">{card.name.includes('車') ? '🚗' : card.name.includes('狗') ? '🐶' : '⭐'}</div>
                    )}
                  </div>
                  <h3 className="mt-2 truncate text-base font-black text-ink">{card.name}</h3>
                  <p className="mt-0.5 truncate text-xs font-bold text-slate-500">{card.series?.name ?? '收藏卡'}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-black ${rarityStyle[card.rarity] ?? rarityStyle.common}`}>
                      {rarityLabel[card.rarity] ?? card.rarity}
                    </span>
                    <span className="rounded-full bg-[#fff8ec] px-2 py-1 text-[11px] font-black text-amber-900">x{item.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-[28px] bg-[#fff8ec] p-6 text-center">
            <div className="text-5xl">🎁</div>
            <p className="mt-3 text-xl font-black text-ink">還沒有卡片</p>
            <p className="mt-2 text-sm font-bold text-slate-500">完成今天的練習，就能拿到第一張卡。</p>
          </div>
        )}
      </section>
      <KidBottomNav />
    </PhoneFrame>
  );
}
