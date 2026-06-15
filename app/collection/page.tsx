import Image from 'next/image';
import Link from 'next/link';
import { KidBottomNav } from '@/components/KidBottomNav';
import { KidTopBar } from '@/components/KidTopBar';
import { PhoneFrame } from '@/components/PhoneFrame';
import { getRewardCardDisplayName } from '@/lib/cards/display';
import { getChildInventory } from '@/lib/data/rewards';
import type { RewardCard } from '@/lib/types';

function cardImageUrl(card: RewardCard) {
  return card.rendered_card_image_url || card.source_image_url || null;
}

function cardFallbackEmoji(card: RewardCard) {
  const text = `${getRewardCardDisplayName(card)} ${card.series?.name ?? ''}`;
  if (text.includes('車')) return '🚗';
  if (text.includes('狗') || text.includes('布麗')) return '🐶';
  if (text.includes('植物') || text.includes('皮克')) return '🌱';
  return '⭐';
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

export default async function CollectionPage() {
  const inventory = await getChildInventory();
  const groups = groupInventoryBySeries(inventory);
  const totalQuantity = inventory.reduce((sum, item) => sum + Number(item.quantity ?? 1), 0);

  return (
    <PhoneFrame>
      <KidTopBar title="我的收納包" rightLabel="🎒" />

      <section className="kid-hero-blue relative overflow-hidden rounded-[36px] p-5 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
        <div className="pointer-events-none absolute bottom-2 right-2 text-8xl opacity-20">☁️</div>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-black text-white/80">星見的卡片收納包</p>
            <h1 className="mt-1 text-[32px] font-black leading-tight tracking-[-0.04em]">已收藏的朋友</h1>
            <p className="mt-2 text-sm font-bold leading-relaxed text-white/90">這裡只放已經儲存的卡片；還沒抽到的系列不會先出現。</p>
          </div>
          <div className="learning-orb flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[28px] text-4xl shadow-sm">🎒</div>
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

      {inventory.length ? (
        <section className="space-y-4 pb-[calc(env(safe-area-inset-bottom)+120px)]">
          {groups.map((group) => (
            <div key={group.id} className="kid-card p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#2f8cff]">已儲存系列</p>
                  <h2 className="text-2xl font-black text-[#172033]">{group.name}</h2>
                </div>
                <div className="rounded-full bg-[#e9f4ff] px-3 py-2 text-sm font-black text-[#1766e6]">{group.items.length} 種</div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {group.items.map((item) => {
                  const card = item.card;
                  if (!card) return null;
                  const imageUrl = cardImageUrl(card);
                  const displayName = getRewardCardDisplayName(card);
                  const quantity = Number(item.quantity ?? 1);

                  return (
                    <div key={item.id} className="group relative overflow-hidden rounded-[22px] bg-white/40 shadow-[0_8px_18px_rgba(30,64,175,0.10)] ring-1 ring-[#d8eaff]/70 active:scale-[0.99]">
                      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[22px] bg-[#f5f9ff]">
                        {imageUrl ? (
                          <Image src={imageUrl} alt={displayName} fill className="object-contain" sizes="(max-width: 430px) 45vw, 180px" unoptimized />
                        ) : (
                          <div className="text-6xl" aria-label={displayName}>{cardFallbackEmoji(card)}</div>
                        )}
                      </div>

                      {quantity > 1 ? (
                        <span className="absolute right-2 top-2 rounded-full bg-[#1766e6] px-2.5 py-1 text-xs font-black text-white shadow-[0_6px_14px_rgba(23,102,230,0.32)] ring-2 ring-white/90">
                          x{quantity}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="kid-card-strong flex min-h-[440px] flex-col items-center justify-center p-6 text-center">
          <div className="reward-pack-glow flex h-32 w-32 items-center justify-center rounded-[44px] text-7xl shadow-sm">🎁</div>
          <p className="mt-6 rounded-full bg-[#e9f4ff] px-4 py-2 text-sm font-black text-[#1766e6]">收納包是空的</p>
          <h2 className="mt-4 text-[30px] font-black leading-tight text-[#172033]">還沒有儲存卡片</h2>
          <p className="mt-3 text-base font-bold leading-relaxed text-[#5f6f89]">完成練習、打開小禮物，按「儲存到收納包」後，卡片才會出現在這裡。</p>
          <div className="mt-7 w-full space-y-3">
            <Link href="/practice" className="kid-blue-button flex min-h-[60px] items-center justify-center rounded-[24px] text-lg font-black active:scale-[0.99]">✏️ 去練習</Link>
            <Link href="/reward" className="flex min-h-[58px] items-center justify-center rounded-[24px] border border-[#d8eaff] bg-white text-lg font-black text-[#172033] active:scale-[0.99]">🎁 看今日獎勵</Link>
          </div>
        </section>
      )}

      <KidBottomNav />
    </PhoneFrame>
  );
}
