'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState } from 'react';
import { drawDailyRewardFromState, saveDrawnRewardFromState } from '@/lib/actions/draw-reward-state';
import { getRewardCardDisplayName } from '@/lib/cards/display';
import type { RewardDrawResult, RewardCard, SaveRewardResult } from '@/lib/types';

type RewardDrawPanelProps = {
  practiceRecordId?: string;
  initialResult?: RewardDrawResult | null;
};

function getCardImageUrl(card: RewardCard) {
  return card.rendered_card_image_url || card.source_image_url || null;
}

function getCardFallbackEmoji(card: RewardCard) {
  const text = `${getRewardCardDisplayName(card)} ${card.series?.name ?? ''}`;
  if (text.includes('車')) return '🚗';
  if (text.includes('狗') || text.includes('布麗')) return '🐶';
  if (text.includes('植物') || text.includes('皮克')) return '🌱';
  return '⭐';
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
        <div className="flex h-44 w-44 items-center justify-center rounded-[36px] bg-white/70 text-7xl shadow-inner">{getCardFallbackEmoji(card)}</div>
      )}
    </div>
  );
}

export function RewardDrawPanel({ practiceRecordId, initialResult = null }: RewardDrawPanelProps) {
  const [drawResult, drawFormAction, isDrawing] = useActionState<RewardDrawResult | null, FormData>(drawDailyRewardFromState, initialResult);
  const [saveResult, saveFormAction, isSaving] = useActionState<SaveRewardResult | null, FormData>(saveDrawnRewardFromState, null);

  const card = saveResult?.card ?? drawResult?.card;
  const drawLogId = drawResult?.draw_log_id;
  const saved = Boolean(saveResult?.ok && saveResult.saved_to_inventory);

  if (drawResult || saveResult) {
    return (
      <section className="kid-card-strong relative flex min-h-[auto] flex-col overflow-hidden p-4 pb-[calc(env(safe-area-inset-bottom)+156px)] text-center">
        <div className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-80 w-80 rounded-full bg-[#dbeafe] opacity-70 blur-3xl" />
        <div className="pointer-events-none absolute left-8 top-24 text-3xl confetti-sparkle">✨</div>
        <div className="pointer-events-none absolute right-8 top-36 text-3xl confetti-sparkle">🎉</div>
        <div className="pointer-events-none absolute left-10 bottom-32 text-3xl confetti-sparkle">⭐</div>

        <p className="relative z-10 self-center rounded-full bg-[#e9f4ff] px-4 py-2 text-sm font-black text-[#1766e6]">今日獎勵</p>
        <h1 className="relative z-10 mt-3 text-[28px] font-black leading-tight text-[#172033]">
          {saved ? '已放進收納包！' : drawResult?.ok ? '你抽到這張卡！' : '還不能抽卡'}
        </h1>

        <div className="relative z-10 mt-4 flex flex-col items-center justify-center">
          {card ? <RewardCardPreview card={card} /> : <div className="rounded-[34px] bg-white p-8 text-6xl shadow-sm">💤</div>}
          <p className="mt-5 text-base font-black leading-relaxed text-[#5f6f89]">{saveResult?.message ?? drawResult?.message}</p>
        </div>

        <div className="relative z-10 mt-4 space-y-3">
          {drawResult?.ok && drawLogId && !saved ? (
            <form action={saveFormAction}>
              <input type="hidden" name="draw_log_id" value={drawLogId} />
              <button
                type="submit"
                disabled={isSaving}
                className="kid-blue-button flex min-h-[56px] w-full items-center justify-center rounded-[24px] text-base font-black active:scale-[0.99] disabled:opacity-60"
              >
                {isSaving ? '儲存中...' : '🎒 儲存到收納包'}
              </button>
            </form>
          ) : null}
          <Link href="/collection" className="flex min-h-[54px] items-center justify-center rounded-[24px] border border-[#d8eaff] bg-white text-lg font-black text-[#172033] active:scale-[0.99]">
            {saved ? '查看收納包' : '先不儲存，回收納包'}
          </Link>
          <Link href="/" className="flex min-h-[54px] items-center justify-center rounded-[24px] bg-[#f5f9ff] text-base font-black text-[#172033] active:scale-[0.99]">回首頁</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="kid-card-strong relative flex min-h-[auto] flex-col items-center justify-center overflow-hidden p-4 pb-[calc(env(safe-area-inset-bottom)+156px)] text-center">
      <div className="pointer-events-none absolute inset-x-0 top-20 mx-auto h-72 w-72 rounded-full bg-[#dbeafe] opacity-80 blur-3xl" />
      <div className="pointer-events-none absolute left-8 top-20 text-3xl confetti-sparkle">✨</div>
      <div className="pointer-events-none absolute right-8 top-28 text-3xl confetti-sparkle">⭐</div>
      <div className="pointer-events-none absolute bottom-36 left-10 text-3xl confetti-sparkle">🎉</div>

      <div className="reward-pack-glow relative z-10 flex h-32 w-32 items-center justify-center rounded-[42px] text-7xl shadow-[0_24px_48px_rgba(37,99,235,0.16)] animate-bounce-soft">
        🎁
        <span className="absolute -right-2 bottom-10 text-3xl">✨</span>
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
          {isDrawing ? '打開中...' : '🎁 打開小禮物'}
        </button>
        <Link href="/collection" className="flex min-h-[54px] items-center justify-center rounded-[24px] border border-[#d8eaff] bg-white text-lg font-black text-[#172033] active:scale-[0.99]">🎒 看收納包</Link>
      </form>
    </section>
  );
}
