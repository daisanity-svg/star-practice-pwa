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
  return '?';
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
    <div className={isReward ? 'relative w-full max-w-[286px] rounded-[28px] bg-white p-3' : 'relative rounded-[24px] bg-white p-2'}>
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-br from-[#e6f3ff] via-white to-[#fff5c7]">
        {imageUrl ? (
          <Image src={imageUrl} alt={displayName} fill className="object-cover" sizes={isReward ? '300px' : '180px'} unoptimized />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center text-7xl text-slate-400">{getRewardCardFallbackEmoji(card)}</div>
        )}
      </div>

      <div className={isReward ? 'mt-3 text-center' : 'mt-2'}>
        <h2 className={isReward ? 'truncate text-2xl font-black text-[#172033]' : 'truncate text-base font-black text-[#172033]'}>{displayName}</h2>
      </div>
    </div>
  );
}
