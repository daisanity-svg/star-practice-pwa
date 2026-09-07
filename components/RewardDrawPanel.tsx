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
  onDrawStart?: () => void;
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
      <div className="relative aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-[20px] shadow-[0_18px_42px_rgba(30,64,175,0.16)] sm:max-w-[300px]">
        {cardImageUrl ? (
          <Image src={cardImageUrl} alt={displayName} fill className="object-contain" sizes="300px" unoptimized />
        ) : (
          buildCardPlaceholder(displayName)
        )}
      </div>
    </div>
  );
}

export function RewardDrawPanel({ practiceRecordId, initialResult = null, onDrawStart }: RewardDrawPanelProps) {
  const [drawResult, drawFormAction, isDrawing] = useActionState<RewardDrawResult | null, FormData>(drawDailyRewardFromState, initialResult);
  const [saveResult, saveFormAction, isSaving] = useActionState<SaveRewardResult | null, FormData>(saveDrawnRewardFromState, null);

  const combinedDrawResult = (drawResult ?? initialResult) as RewardDrawResult | null;
  const card = saveResult?.card ?? combinedDrawResult?.card;
  const drawLogId = combinedDrawResult?.draw_log_id;
  const saved = Boolean((combinedDrawResult?.saved_to_inventory || saveResult?.saved_to_inventory));
  const errorMessage = combinedDrawResult && !combinedDrawResult.ok ? combinedDrawResult.message : null;

  const isFreshDraw = Boolean(combinedDrawResult?.drawn_now && combinedDrawResult?.ok);
  const isAlreadyDrawn = Boolean(combinedDrawResult?.ok && !combinedDrawResult?.drawn_now);
  const isPending = !combinedDrawResult;
  const isDrawError = Boolean(errorMessage);

  if (isDrawError) {
    return (
      <section className="kid-reward-stage relative flex min-h-[auto] flex-col items-center justify-center overflow-hidden p-4 pb-[calc(env(safe-area-inset-bottom)+156px)] text-center">
        <div className="relative z-10 rounded-[28px] bg-white p-6 shadow-sm">
          <h1 className="text-[24px] font-black text-[#172033]">小光獸還在忙碌</h1>
          <p className="mt-3 text-base font-bold leading-relaxed text-[#5f6f89]">{errorMessage}</p>
          <Link href="/practice" className="kid-blue-button mt-5 flex min-h-[54px] items-center justify-center rounded-[24px] text-lg font-black active:scale-[0.99]">
            先去練習
          </Link>
        </div>
      </section>
    );
  }

  if (isPending) {
    return (
      <section className="kid-reward-stage relative flex min-h-[auto] flex-col items-center justify-center overflow-hidden p-4 pb-[calc(env(safe-area-inset-bottom)+156px)] text-center">
        <p className="text-base font-bold text-[#5f6f89]">載入今天的獎勵中...</p>
      </section>
    );
  }

  if (card || isAlreadyDrawn || isFreshDraw || saved) {
    return (
      <section className="kid-reward-stage relative flex min-h-[auto] flex-col overflow-hidden p-4 pb-[calc(env(safe-area-inset-bottom)+156px)] text-center">
        <div className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-80 w-80 rounded-full bg-[#dbeafe] opacity-70 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute left-8 top-24 text-3xl confetti-sparkle" aria-hidden="true" />
        <div className="pointer-events-none absolute right-8 top-36 text-3xl confetti-sparkle" aria-hidden="true" />
        <div className="pointer-events-none absolute left-10 bottom-32 text-3xl confetti-sparkle" aria-hidden="true" />

        <p className="relative z-10 self-center rounded-full bg-[#e9f4ff] px-4 py-2 text-sm font-black text-[#1766e6]">今日獎勵</p>
        <h1 className="relative z-10 mt-3 text-[28px] font-black leading-tight text-[#172033]">
          {isFreshDraw ? '你找到新朋友了' : isAlreadyDrawn ? '今天已經找到這位朋友了' : '打開小禮物'}
        </h1>

        <div className="relative z-10 mt-4 flex flex-col items-center justify-center">
          <div className="reward-compact-actions">
            {card ? (
              <div className="animate-pack-open relative flex w-full justify-center kid-pop-in">
                <div className="relative aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-[24px]">
                  {getCardImageUrl(card) ? (
                    <Image src={getCardImageUrl(card)!} alt={getRewardCardDisplayName(card)} fill className="object-contain" sizes="260px" unoptimized />
                  ) : (
                    buildCardPlaceholder(getRewardCardDisplayName(card))
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-[34px] bg-white p-8 text-6xl shadow-sm">?</div>
            )}
            <p className="mt-5 text-base font-black leading-relaxed text-[#5f6f89]">
              {saved ? '收藏成功！這是你今天找到的新朋友。' : saveResult?.message ?? combinedDrawResult?.message}
            </p>

            {isFreshDraw && card ? (
              <>
                {card.rarity && ['rare', 'super_rare', 'legendary'].includes(card.rarity.toLowerCase()) && (
                  <p className="mt-3 rounded-[24px] bg-[#ffe7a0] px-4 py-3 text-left text-base font-bold leading-relaxed text-[#7a4a08] shadow-sm">
                    小光獸說：哇！這麼厲害的朋友！快把它收進你的星星圖鑑吧！
                  </p>
                )}
                {!card.rarity || !['rare', 'super_rare', 'legendary'].includes(card.rarity.toLowerCase()) && (
                  <p className="mt-3 rounded-[24px] bg-[#fff7e6] px-4 py-3 text-left text-sm font-bold leading-relaxed text-[#8c6b1a] shadow-sm">
                    小光獸說：這張新朋友看起來好特別，快把它收進你的星星圖鑑吧！
                  </p>
                )}
              </>
            ) : null}
          </div>
        </div>

        <div className="reward-compact-actions">
          {!saved ? (
            <form action={saveFormAction} className="w-full">
              {drawLogId ? <input type="hidden" name="draw_log_id" value={drawLogId} /> : null}
              <button type="submit" disabled={isSaving} className="kid-yellow-button flex min-h-[54px] w-full items-center justify-center rounded-[24px] text-lg font-black active:scale-[0.99] disabled:opacity-60">
                {isSaving ? '收到中...' : '收到卡片'}
              </button>
            </form>
          ) : null}
          <Link href="/collection" className="reward-compact-primary">
            前往收納包
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
      <form action={drawFormAction} className="relative z-10 mt-5 w-full space-y-3" onSubmit={() => onDrawStart?.()}>
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
      {isDrawing && (
        <div className="relative z-10 mt-4 h-6 text-center text-sm font-black text-[#1766e6] kid-shimmer">
          小光獸正在翻找今天的驚喜...
        </div>
      )}
    </section>
  );
}
