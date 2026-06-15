'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState } from 'react';
import { drawDailyRewardFromState, saveDrawnRewardFromState } from '@/lib/actions/draw-reward-state';
import { getRewardCardDisplayName } from '@/lib/cards/display';
import type { RewardDrawResult, RewardCard, SaveRewardResult } from '@/lib/types';

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
    <div className="animate-pack-open relative w-full max-w-[286px] rounded-[34px] bg-white p-3 shadow-[0_24px_52px_rgba(30,64,175,0.18)]">
      <div className="absolute -left-3 top-4 z-10 rounded-full bg-[#ffd95a] px-3 py-1 text-xs font-black text-[#193153] shadow-sm">{card.card_no ?? 'NEW'}</div>
      <div className="absolute -right-3 top-4 z-10 rounded-full bg-[#2f8cff] px-3 py-1 text-xs font-black text-white shadow-sm">今日卡片</div>
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[26px] bg-gradient-to-br from-[#e6f3ff] via-white to-[#fff5c7]">
        {cardImageUrl ? (
          <Image src={cardImageUrl} alt={displayName} fill className="object-cover" sizes="300px" unoptimized />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/70 text-7xl shadow-inner">{getCardFallbackEmoji(card)}</div>
        )}
      </div>
      <div className="mt-3 rounded-[24px] bg-[#f5f9ff] px-4 py-3">
        <p className="text-xs font-black text-[#1766e6]">{card.series?.name ?? '收藏卡'}</p>
        <h2 className="mt-1 truncate text-2xl font-black text-[#172033]">{displayName}</h2>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-black ${rarityStyle[card.rarity] ?? rarityStyle.common}`}>
            {rarityLabel[card.rarity] ?? card.rarity}
          </span>
        </div>
      </div>
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
      <section className="kid-card-strong relative flex min-h-[570px] flex-col overflow-hidden p-5 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-80 w-80 rounded-full bg-[#dbeafe] opacity-70 blur-3xl" />
        <div className="pointer-events-none absolute left-8 top-24 text-3xl confetti-sparkle">✨</div>
        <div className="pointer-events-none absolute right-8 top-36 text-3xl confetti-sparkle">🎉</div>
        <div className="pointer-events-none absolute left-10 bottom-32 text-3xl confetti-sparkle">⭐</div>

        <p className="relative z-10 self-center rounded-full bg-[#e9f4ff] px-4 py-2 text-sm font-black text-[#1766e6]">今日獎勵</p>
        <h1 className="relative z-10 mt-4 text-[33px] font-black leading-tight text-[#172033]">
          {saved ? '已放進收納包！' : drawResult?.ok ? '你抽到這張卡！' : '還不能抽卡'}
        </h1>

        <div className="relative z-10 mt-6 flex flex-1 flex-col items-center justify-center">
          {card ? <RewardCardPreview card={card} /> : <div className="rounded-[34px] bg-white p-8 text-6xl shadow-sm">💤</div>}
          <p className="mt-5 text-base font-black leading-relaxed text-[#5f6f89]">{saveResult?.message ?? drawResult?.message}</p>
        </div>

        <div className="relative z-10 mt-6 space-y-3">
          {drawResult?.ok && drawLogId && !saved ? (
            <form action={saveFormAction}>
              <input type="hidden" name="draw_log_id" value={drawLogId} />
              <button
                type="submit"
                disabled={isSaving}
                className="kid-blue-button flex min-h-[58px] w-full items-center justify-center rounded-[24px] text-lg font-black active:scale-[0.99] disabled:opacity-60"
              >
                {isSaving ? '儲存中...' : '🎒 儲存到收納包'}
              </button>
            </form>
          ) : null}
          <Link href="/collection" className="flex min-h-[58px] items-center justify-center rounded-[24px] border border-[#d8eaff] bg-white text-lg font-black text-[#172033] active:scale-[0.99]">
            {saved ? '查看收納包' : '先不儲存，回收納包'}
          </Link>
          <Link href="/" className="flex min-h-[58px] items-center justify-center rounded-[24px] bg-[#f5f9ff] text-lg font-black text-[#172033] active:scale-[0.99]">回首頁</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="kid-card-strong relative flex min-h-[570px] flex-col items-center justify-center overflow-hidden p-5 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-20 mx-auto h-72 w-72 rounded-full bg-[#dbeafe] opacity-80 blur-3xl" />
      <div className="pointer-events-none absolute left-8 top-20 text-3xl confetti-sparkle">✨</div>
      <div className="pointer-events-none absolute right-8 top-28 text-3xl confetti-sparkle">⭐</div>
      <div className="pointer-events-none absolute bottom-36 left-10 text-3xl confetti-sparkle">🎉</div>

      <div className="reward-pack-glow relative z-10 flex h-40 w-40 items-center justify-center rounded-[50px] text-8xl shadow-[0_24px_48px_rgba(37,99,235,0.16)] animate-bounce-soft">
        🎁
        <span className="absolute -right-2 bottom-10 text-3xl">✨</span>
      </div>
      <p className="relative z-10 mt-7 rounded-full bg-[#e9f4ff] px-4 py-2 text-sm font-black text-[#1766e6]">恭喜完成今天練習</p>
      <h1 className="relative z-10 mt-4 text-[34px] font-black leading-tight text-[#172033]">打開小禮物</h1>
      <p className="relative z-10 mt-4 text-lg font-bold leading-relaxed text-[#5f6f89]">按一下小禮物，翻出今天抽到的收藏卡。</p>
      {!practiceRecordId ? (
        <p className="relative z-10 mt-5 rounded-[24px] bg-[#f5f9ff] px-4 py-3 text-sm font-bold leading-relaxed text-[#7b8aa3] shadow-sm">
          測試模式可以直接抽卡；正式模式會要求先完成練習。
        </p>
      ) : null}
      <form action={drawFormAction} className="relative z-10 mt-8 w-full space-y-3">
        {practiceRecordId ? <input type="hidden" name="practice_record_id" value={practiceRecordId} /> : null}
        <button
          type="submit"
          disabled={isDrawing}
          className="kid-blue-button flex min-h-[64px] w-full touch-manipulation select-none items-center justify-center rounded-[26px] text-xl font-black active:scale-[0.99] disabled:opacity-60"
        >
          {isDrawing ? '打開中...' : '🎁 打開小禮物'}
        </button>
        <Link href="/collection" className="flex min-h-[58px] items-center justify-center rounded-[24px] border border-[#d8eaff] bg-white text-lg font-black text-[#172033] active:scale-[0.99]">🎒 看收納包</Link>
      </form>
    </section>
  );
}
