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
  rare: 'bg-[#dceeff] text-blue-700',
  super_rare: 'bg-[#e9f4ff] text-[#1675dc]',
  legendary: 'bg-[#fff2b7] text-amber-900'
};

function seriesIcon(name: string) {
  if (name.includes('車')) return '🚗';
  if (name.includes('狗')) return '🐶';
  if (name.includes('植物')) return '🌱';
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

      <section className="kid-hero-blue rounded-[32px] p-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-white/72">星見的卡片圖鑑</p>
            <h1 className="mt-1 text-[30px] font-black leading-tight tracking-[-0.04em]">收集新朋友</h1>
            <p className="mt-2 text-sm font-bold leading-relaxed text-white/84">每天完成練習，就把新的朋友放進這裡。</p>
          </div>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[26px] bg-white/20 text-4xl">🎒</div>
        </div>

        <div className="mt-5 rounded-[26px] bg-white/18 p-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-white/82">總收藏進度</p>
            <p className="text-2xl font-black">{ownedTotal}/{cardTotal || 0}</p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-[#ffd95a]" style={{ width: `${totalPercent}%` }} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {collections.map((collection) => {
          const percent = collection.total > 0 ? Math.round((collection.owned / collection.total) * 100) : 0;
          const previewLength = Math.min(collection.total || 5, 10);

          return (
            <div key={collection.id} className="kid-card overflow-hidden p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-2xl font-black text-ink">{collection.name}</h2>
                    <span className="text-2xl">{seriesIcon(collection.name)}</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-slate-500">已收集 {collection.owned} / {collection.total}</p>
                </div>
                <div className="rounded-full bg-[#e9f4ff] px-3 py-2 text-sm font-black text-[#1675dc]">{percent}%</div>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-[#2387f7] to-[#ffd95a]" style={{ width: `${percent}%` }} />
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {Array.from({ length: previewLength }).map((_, index) => {
                  const owned = index < collection.owned;
                  return (
                    <div
                      key={index}
                      className={`flex h-[92px] w-[68px] shrink-0 flex-col items-center justify-center rounded-[18px] border text-lg font-black shadow-sm ${
                        owned
                          ? 'border-[#b9dcff] bg-gradient-to-br from-[#e8f5ff] to-[#fff8df] text-[#1675dc]'
                          : 'border-dashed border-slate-200 bg-white/78 text-slate-300'
                      }`}
                    >
                      <span className="text-2xl">{owned ? seriesIcon(collection.name) : '?'}</span>
                      <span className="mt-1 text-[11px]">{owned ? 'GET' : 'LOCK'}</span>
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
            <p className="text-sm font-black text-[#2387f7]">My Cards</p>
            <h2 className="text-2xl font-black text-ink">已獲得卡片</h2>
          </div>
          <div className="rounded-full bg-[#e9f4ff] px-3 py-2 text-sm font-black text-[#1675dc]">{inventory.length} 張</div>
        </div>

        {inventory.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {inventory.map((item) => {
              const card = item.card;
              if (!card) return null;

              return (
                <div key={item.id} className="rounded-[26px] bg-white p-2 shadow-[0_10px_22px_rgba(18,48,79,0.08)]">
                  <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br from-[#dceeff] via-white to-[#fff2b7]">
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
                    <span className="rounded-full bg-[#fff2b7] px-2 py-1 text-[11px] font-black text-amber-900">x{item.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-[28px] bg-[#f3f9ff] p-6 text-center">
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
