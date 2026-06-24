import Image from 'next/image';
import { getRewardCardDisplayName } from '@/lib/cards/display';
import type { RewardCard } from '@/lib/types';

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
    <div className={isReward ? 'relative w-full max-w-[286px] rounded-[28px] p-3' : 'relative rounded-[24px] p-2'}>
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[24px]">
        {imageUrl ? (
          <Image src={imageUrl} alt={displayName} fill className="object-contain" sizes={isReward ? '300px' : '180px'} unoptimized />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center text-7xl text-slate-400">{getRewardCardFallbackEmoji(card)}</div>
        )}
      </div>

      <div className={variant === 'reward' ? 'mt-3 text-center' : 'mt-2'}>
        <h2 className={variant === 'reward' ? 'truncate text-2xl font-black text-[#172033]' : 'truncate text-base font-black text-[#172033]'}>{displayName}</h2>
      </div>
    </div>
  );
}
