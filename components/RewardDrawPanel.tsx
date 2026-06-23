'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState } from 'react';
import { drawDailyRewardFromState, saveDrawnRewardFromState } from '@/lib/actions/draw-reward-state';
import { getRewardCardDisplayName } from '@/lib/cards/display';
import type { RewardDrawResult, RewardCard, SaveRewardResult } from '@/lib/types';
import { CompanionBar } from '@/components/CompanionBar';

type RewardDrawPanelProps = {
  practiceRecordId?: string;
  initialResult?: RewardDrawResult | null;
};

function getCardImageUrl(card: RewardCard) {
  return card.rendered_card_image_url || card.source_image_url || null;
}

function buildCardPlaceholder(name: string) {
  return (
    <span className="kid-reward-placeholder" aria-label={name}>
      <span className="kid-reward-placeholder-bg" aria-hidden="true" />
    </span>
  );
}

function RewardCardPreview({ card }: { card: RewardCard }) {
  const cardImageUrl = getCardImageUrl(card);
  const displayName = getRewardCardDisplayName(card);

  return (
    <div className="animate-pack-open relative flex w-full justify-center">
      {cardImageUrl ? (
        <div className="relative aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-[20px] shadow-[0_18px_42px_rgba(30,64,175,0.16)] sm:max-w-[300px]">
          <Image src={cardImageUrl} alt={displayName} fill className="object-contain" sizes="300px" unoptimized />
        </div>
      ) : (
        <div className="kid-reward-placeholder-frame">{buildCardPlaceholder(displayName)}</div>
      )}
    </div>
  );
}

export function RewardDrawPanel({ practiceRecordId, initialResult = null }: RewardDrawPanelProps) {
  const [drawResult, drawFormAction, isDrawing] = useActionState<RewardDrawResult | null, FormData>(drawDailyRewardFromState, initialResult);
  const [saveResult, saveFormAction, isSaving] = useActionState<SaveRewardResult | null, FormData>(saveDrawnRewardFromState, null);

  const card = saveResult?.card ?? drawResult?.card;
  const drawLogId = drawResult?.draw_log_id;
  const saved = Boolean((drawResult?.saved_to_inventory || saveResult?.saved_to_inventory));

  const isFreshDraw = Boolean(drawResult?.drawn_now && drawResult?.ok);
  const isAlreadyDrawn = Boolean(drawResult?.ok && !drawResult?.drawn_now);
  const cantDraw = Boolean(drawResult && !drawResult?.ok);

  if (drawResult || saveResult) {
    return (
      <section className="kid-reward-stage relative flex min-h-[auto] flex-col overflow-hidden p-4 pb-[calc(env(safe-area-inset-bottom)+156px)] text-center">
        <div className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-80 w-80 rounded-full bg-[#dbeafe] opacity-70 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute left-8 top-24 text-3xl confetti-sparkle" aria-hidden="true" />
        <div className="pointer-events-none absolute right-8 top-36 text-3xl confetti-sparkle" aria-hidden="true" />
        <div className="pointer-events-none absolute left-10 bottom-32 text-3xl confetti-sparkle" aria-hidden="true" />

        <p className="relative z-10 self-center rounded-full bg-[#e9f4ff] px-4 py-2 text-sm font-black text-[#1766e6]">今日獎勵</p>
        <h1 className="relative z-10 mt-3 text-[28px] font-black leading-tight text-[#172033]">
          {isFreshDraw ? '你找到新朋友了' : isAlreadyDrawn ? '今天已經找到這位朋友了' : cantDraw ? '今天卡包正在準備中' : ''}
        </h1>

        <div className="relative z-10 mt-4 flex flex-col items-center justify-center">
          <div className="reward-compact-actions">
            {card ? (
              <div className="animate-pack-open relative flex w-full justify-center">
                <div className="relative aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-[24px] shadow-[0_24px_50px_rgba(30,64,175,0.22)] ring-4 ring-[#e0f0ff]">
                  {getCardImageUrl(card) ? (
                    <Image src={getCardImageUrl(card)!} alt={getRewardCardDisplayName(card)} fill className="object-contain" sizes="260px" unoptimized />
                  ) : (
                    <div className="kid-reward-placeholder-frame">{buildCardPlaceholder(getRewardCardDisplayName(card))}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-[34px] bg-white p-8 text-6xl shadow-sm">?</div>
            )}
            {typeof drawResult?.remaining_stock === 'number' ? (
              <p className="mt-4 rounded-full bg-[#fff7e0] px-4 py-2 text-sm font-black text-[#b45309]">這包還剩：{drawResult.remaining_stock} 張</p>
            ) : null}
            <p className="mt-5 text-base font-black leading-relaxed text-[#5f6f89]">
              {saved ? '收藏成功！這是你今天找到的新朋友。' : saveResult?.message ?? drawResult?.message}
            </p>
          </div>
        </div>

        <div className="reward-compact-actions">
          <Link href="/collection" className="reward-compact-primary">
            去看圖鑑
          </Link>
          <Link href="/" className="reward-compact-secondary">
            回冒險
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="kid-reward-stage relative flex min-h-[auto] flex-col items-center justify-center overflow-hidden p-4 pb-[calc(env(safe-area-inset-bottom)+156px)] text-center">
      <div className="pointer-events-none absolute inset-x-0 top-20 mx-auto h-72 w-72 rounded-full bg-[#dbeafe] opacity-80 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute left-8 top-20 text-3xl confetti-sparkle" aria-hidden="true" />
      <div className="pointer-events-none absolute right-8 top-28 text-3xl confetti-sparkle" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-36 left-10 text-3xl confetti-sparkle" aria-hidden="true" />

      <div className="reward-pack-glow relative z-10 flex h-32 w-32 items-center justify-center rounded-[42px] text-7xl shadow-[0_24px_48px_rgba(37,99,235,0.16)] animate-bounce-soft">
        <span className="kid-reward-glyph" aria-hidden="true" />
      </div>
      <p className="relative z-10 mt-5 rounded-full bg-[#e9f4ff] px-4 py-2 text-sm font-black text-[#1766e6]">恭喜完成今天練習</p>
      <h1 className="relative z-10 mt-3 text-[30px] font-black leading-tight text-[#172033]">打開小禮物</h1>
      <p className="relative z-10 mt-3 text-base font-bold leading-relaxed text-[#5f6f89]">按一下小禮物，翻出今天抽到的收藏卡。</p>
      {!practiceRecordId ? (
        <p className="relative z-10 mt-5 rounded-[24px] bg-[#f5f9ff] px-4 py-3 text-sm font-bold leading-relaxed text-[#7b8aa3] shadow-sm">
          測試模式可以直接抽卡；正式模式會要求先完成練習。
        </p>
      ) : null}
      <form action={drawFormAction} className="relative z-10 mt-5 w-full space-y-3">
        {practiceRecordId ? <input type="hidden" name="practice_record_id" value={practiceRecordId} /> : null}
        <button
          type="submit"
          disabled={isDrawing}
          className="kid-blue-button flex min-h-[58px] w-full touch-manipulation select-none items-center justify-center rounded-[26px] text-xl font-black active:scale-[0.99] disabled:opacity-60"
        >
          {isDrawing ? '打開中...' : '打開小禮物'}
        </button>
        <Link href="/collection" className="kid-yellow-button flex min-h-[54px] items-center justify-center rounded-[24px] text-lg font-black active:scale-[0.99]">
          去看圖鑑
        </Link>
      </form>
    </section>
  );
}
