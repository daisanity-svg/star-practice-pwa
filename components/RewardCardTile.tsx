import Image from 'next/image';
import { getRewardCardDisplayName } from '@/lib/cards/display';
import type { RewardCard } from '@/lib/types';

const rarityLabel: Record<string, string> = {
  common: '普通',
  rare: '閃亮',
  super_rare: '超稀有',
  legendary: '傳說'
};

const rarityStyle: Record<string, string> = {
  common: 'bg-slate-100 text-slate-600',
  rare: 'bg-[#dbeafe] text-blue-700',
  super_rare: 'bg-[#e0edff] text-[#1766e6]',
  legendary: 'bg-[#fff0b8] text-amber-900'
};

export function getRewardCardImageUrl(card: RewardCard) {
  return card.rendered_card_image_url || card.source_image_url || null;
}

export function getRewardCardFallbackEmoji(card: RewardCard) {
  const text = `${getRewardCardDisplayName(card)} ${card.series?.name ?? ''}`;
  if (text.includes('車')) return '🚗';
  if (text.includes('狗') || text.includes('布麗')) return '🐶';
  if (text.includes('植物') || text.includes('皮克')) return '🌱';
  return '⭐';
}

type RewardCardTileProps = {
  card: RewardCard;
  quantity?: number | null;
  variant?: 'reward' | 'album';
};

export function RewardCardTile({ card, quantity, variant = 'album' }: RewardCardTileProps) {
  const displayName = getRewardCardDisplayName(card);
  const imageUrl = getRewardCardImageUrl(card);
  const isReward = variant === 'reward';

  return (
    <div className={isReward ? 'animate-pack-open relative w-full max-w-[286px] rounded-[34px] bg-white p-3 shadow-[0_24px_52px_rgba(30,64,175,0.18)]' : 'relative rounded-[28px] bg-white p-2 shadow-[0_10px_22px_rgba(30,64,175,0.08)]'}>
      {card.card_no ? <div className="absolute -left-2 top-3 z-10 rounded-full bg-[#ffd95a] px-3 py-1 text-xs font-black text-[#193153] shadow-sm">{card.card_no}</div> : null}
      {quantity && quantity > 1 ? <div className="absolute -right-2 top-3 z-10 rounded-full bg-[#2f8cff] px-3 py-1 text-xs font-black text-white shadow-sm">x{quantity}</div> : null}
      {isReward ? <div className="absolute -right-2 top-3 z-10 rounded-full bg-[#2f8cff] px-3 py-1 text-xs font-black text-white shadow-sm">今日卡片</div> : null}

      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-br from-[#e6f3ff] via-white to-[#fff5c7]">
        {imageUrl ? (
          <Image src={imageUrl} alt={displayName} fill className="object-cover" sizes={isReward ? '300px' : '180px'} unoptimized />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/70 text-7xl shadow-inner">{getRewardCardFallbackEmoji(card)}</div>
        )}
      </div>

      <div className={isReward ? 'mt-3 rounded-[24px] bg-[#f5f9ff] px-4 py-3 text-center' : 'mt-2'}>
        <p className="truncate text-xs font-black text-[#1766e6]">{card.series?.name ?? '收藏卡'}</p>
        <h2 className={isReward ? 'mt-1 truncate text-2xl font-black text-[#172033]' : 'mt-1 truncate text-base font-black text-[#172033]'}>{displayName}</h2>
        <div className="mt-2 flex flex-wrap justify-center gap-1">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${rarityStyle[card.rarity] ?? rarityStyle.common}`}>
            {rarityLabel[card.rarity] ?? card.rarity}
          </span>
          {quantity ? <span className="rounded-full bg-[#fff0b8] px-2.5 py-1 text-[11px] font-black text-amber-900">x{quantity}</span> : null}
        </div>
      </div>
    </div>
  );
}
