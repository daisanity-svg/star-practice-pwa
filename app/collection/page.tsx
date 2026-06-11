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

  return (
    <PhoneFrame>
      <KidTopBar title="我的收納包" rightLabel="🎒" />

      <section className="overflow-hidden rounded-[40px] bg-gradient-to-br from-[#6d5dfc] to-[#8f7cff] p-6 text-white shadow-[0_22px_50px_rgba(109,93,252,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="rounded-full bg-white/20 px-4 py-2 text-base font-black inline-flex">Collection</p>
            <h1 className="mt-5 text-4xl font-black leading-tight">星見的卡片圖鑑</h1>
            <p className="mt-3 text-lg font-bold leading-relaxed text-white/80">每天完成練習，就把新的朋友放進這裡。</p>
          </div>
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] bg-white/20 text-5xl">⭐</div>
        </div>
        <div className="mt-6 rounded-[30px] bg-white/15 p-4">
          <div className="flex items-end justify-between">
            <p className="text-base font-black text-white/80">總收藏進度</p>
            <p className="text-3xl font-black">{ownedTotal}/{cardTotal || 0}</p>
          </div>
          <div className="mt-3 h-4 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-[#fff0b8]" style={{ width: `${cardTotal > 0 ? Math.round((ownedTotal / cardTotal) * 100) : 0}%` }} />
          </div>
        </div>
      </section>

      <section className="mt-5 space-y-4">
        {collections.map((collection) => {
          const percent = collection.total > 0 ? Math.round((collection.owned / collection.total) * 100) : 0;

          return (
            <div key={collection.id} className="kid-card overflow-hidden p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-ink">{collection.name}</h2>
                  <p className="mt-1 text-base font-bold text-slate-500">
                    已收集 {collection.owned} / {collection.total}
                  </p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#fff0b8] text-3xl shadow-sm">
                  {collection.name.includes('車') ? '🚗' : collection.name.includes('狗') ? '🐶' : collection.name.includes('植物') ? '🌱' : '⭐'}
                </div>
              </div>

              <div className="mt-4 h-4 overflow-hidden rounded-full bg-white/80">
                <div className="h-full rounded-full bg-gradient-to-r from-[#6d5dfc] to-[#8f7cff]" style={{ width: `${percent}%` }} />
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {Array.from({ length: Math.min(collection.total || 5, 10) }).map((_, index) => (
                  <div
                    key={index}
                    className={`flex aspect-[3/4] items-center justify-center rounded-2xl border text-xl font-black shadow-sm ${
                      index < collection.owned ? 'border-emerald-100 bg-[#d9fae8] text-emerald-700' : 'border-white bg-white/60 text-slate-300'
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

      <section className="mt-5 kid-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-ink">已獲得卡片</h2>
            <p className="mt-1 text-base font-bold text-slate-500">最近拿到的新朋友會排在最前面。</p>
          </div>
          <div className="rounded-full bg-[#f4f0ff] px-4 py-2 text-base font-black text-[#5b4be8]">{inventory.length} 張</div>
        </div>

        {inventory.length ? (
          <div className="mt-5 grid grid-cols-2 gap-4">
            {inventory.map((item) => {
              const card = item.card;
              if (!card) return null;

              return (
                <div key={item.id} className="rounded-[30px] bg-white p-3 shadow-[0_12px_26px_rgba(77,68,111,0.08)]">
                  <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-br from-[#dff0ff] via-[#fff8ec] to-[#fff0b8]">
                    {card.rendered_card_image_url ? (
                      <Image src={card.rendered_card_image_url} alt={card.name} fill className="object-cover" sizes="170px" />
                    ) : (
                      <div className="text-6xl">{card.name.includes('車') ? '🚗' : card.name.includes('狗') ? '🐶' : '⭐'}</div>
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-black text-ink">{card.name}</h3>
                  <p className="mt-1 text-sm font-bold text-slate-500">{card.series?.name ?? '收藏卡'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${rarityStyle[card.rarity] ?? rarityStyle.common}`}>
                      {rarityLabel[card.rarity] ?? card.rarity}
                    </span>
                    <span className="rounded-full bg-[#fff8ec] px-3 py-1 text-xs font-black text-amber-900">持有 {item.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-[30px] bg-[#fff8ec] p-8 text-center">
            <div className="text-6xl">🎁</div>
            <p className="mt-4 text-xl font-black text-ink">還沒有卡片</p>
            <p className="mt-2 text-base font-bold text-slate-500">完成今天的練習，就能拿到第一張卡。</p>
          </div>
        )}
      </section>
      <KidBottomNav />
    </PhoneFrame>
  );
}
