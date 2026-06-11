'use client';

import Image from 'next/image';
import { useActionState } from 'react';
import { drawDailyRewardFromState } from '@/lib/actions/draw-reward-state';
import type { DrawRewardResult } from '@/lib/types';

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
};

export function RewardDrawPanel({ practiceRecordId }: RewardDrawPanelProps) {
  const [result, formAction, isPending] = useActionState<DrawRewardResult | null, FormData>(drawDailyRewardFromState, null);
  const card = result?.card;

  if (result) {
    return (
      <section className="kid-card-strong relative flex min-h-[570px] flex-col overflow-hidden p-5 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-80 w-80 rounded-full bg-[#dbeafe] opacity-70 blur-3xl" />
        <div className="pointer-events-none absolute left-8 top-24 text-3xl confetti-sparkle">✨</div>
        <div className="pointer-events-none absolute right-8 top-36 text-3xl confetti-sparkle">🎉</div>
        <div className="pointer-events-none absolute left-10 bottom-32 text-3xl confetti-sparkle">⭐</div>

        <p className="relative z-10 self-center rounded-full bg-[#e9f4ff] px-4 py-2 text-sm font-black text-[#1766e6]">翻牌時間</p>
        <h1 className="relative z-10 mt-4 text-[33px] font-black leading-tight text-[#172033]">
          {result.ok ? (result.is_new ? '你獲得新卡！' : '這張卡又變多了！') : '還不能抽卡'}
        </h1>

        <div className="relative z-10 mt-6 flex flex-1 flex-col items-center justify-center">
          {result.ok && card ? (
            <div className="animate-pack-open relative w-full max-w-[252px] rounded-[34px] bg-white p-3 shadow-[0_24px_52px_rgba(30,64,175,0.18)]">
              <div className="absolute -left-3 top-4 z-10 rounded-full bg-[#ffd95a] px-3 py-1 text-xs font-black text-[#193153] shadow-sm">{card.card_no ?? 'NEW'}</div>
              <div className="absolute -right-3 top-4 z-10 rounded-full bg-[#2f8cff] px-3 py-1 text-xs font-black text-white shadow-sm">{result.is_new ? '新朋友' : '再收一張'}</div>
              <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[26px] bg-gradient-to-br from-[#e6f3ff] via-white to-[#fff5c7]">
                {card.rendered_card_image_url ? (
                  <Image src={card.rendered_card_image_url} alt={card.name} fill className="object-cover" sizes="260px" />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/70 text-7xl shadow-inner">{card.name.includes('車') ? '🚗' : card.name.includes('狗') ? '🐶' : '⭐'}</div>
                )}
              </div>
              <div className="mt-3 rounded-[24px] bg-[#f5f9ff] px-4 py-3">
                <p className="text-xs font-black text-[#1766e6]">{card.series?.name ?? '收藏卡'}</p>
                <h2 className="mt-1 truncate text-2xl font-black text-[#172033]">{card.name}</h2>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${rarityStyle[card.rarity] ?? rarityStyle.common}`}>
                    {rarityLabel[card.rarity] ?? card.rarity}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[34px] bg-white p-8 text-6xl shadow-sm">💤</div>
          )}

          <p className="mt-5 text-base font-black leading-relaxed text-[#5f6f89]">{result.message}</p>
          {result.ok && typeof result.remaining_stock === 'number' ? (
            <p className="mt-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#7b8aa3]">卡包剩餘 {result.remaining_stock} 張</p>
          ) : null}
        </div>

        <div className="relative z-10 mt-6 space-y-3">
          <a href="/collection" className="kid-blue-button flex min-h-[58px] items-center justify-center rounded-[24px] text-lg font-black active:scale-[0.99]">🎒 放進收納包</a>
          <a href="/" className="flex min-h-[58px] items-center justify-center rounded-[24px] border border-[#d8eaff] bg-white text-lg font-black text-[#172033] active:scale-[0.99]">回首頁</a>
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
      <p className="relative z-10 mt-7 rounded-full bg-[#e9f4ff] px-4 py-2 text-sm font-black text-[#1766e6]">今天的卡包</p>
      <h1 className="relative z-10 mt-4 text-[34px] font-black leading-tight text-[#172033]">準備打開驚喜</h1>
      <p className="relative z-10 mt-4 text-lg font-bold leading-relaxed text-[#5f6f89]">完成練習後，按一下卡包，翻出一張新的收藏卡。</p>
      {!practiceRecordId ? (
        <p className="relative z-10 mt-5 rounded-[24px] bg-[#f5f9ff] px-4 py-3 text-sm font-bold leading-relaxed text-[#7b8aa3] shadow-sm">
          測試模式可以直接抽卡；正式模式會要求先完成練習。
        </p>
      ) : null}
      <form action={formAction} className="relative z-10 mt-8 w-full space-y-3">
        {practiceRecordId ? <input type="hidden" name="practice_record_id" value={practiceRecordId} /> : null}
        <button
          type="submit"
          disabled={isPending}
          className="kid-blue-button flex min-h-[64px] w-full touch-manipulation select-none items-center justify-center rounded-[26px] text-xl font-black active:scale-[0.99] disabled:opacity-60"
        >
          {isPending ? '打開中...' : '🎁 打開卡包'}
        </button>
        <a href="/collection" className="flex min-h-[58px] items-center justify-center rounded-[24px] border border-[#d8eaff] bg-white text-lg font-black text-[#172033] active:scale-[0.99]">🎒 先看收納包</a>
      </form>
    </section>
  );
}
