import Image from 'next/image';
import { KidButton } from '@/components/KidButton';
import { KidBottomNav } from '@/components/KidBottomNav';
import { KidTopBar } from '@/components/KidTopBar';
import { PhoneFrame } from '@/components/PhoneFrame';
import { drawDailyReward } from '@/lib/actions/draw-reward';

const rarityLabel: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  super_rare: '超稀有',
  legendary: '傳說'
};

const rarityStyle: Record<string, string> = {
  common: 'bg-slate-100 text-slate-600',
  rare: 'bg-[#dff0ff] text-blue-700',
  super_rare: 'bg-[#f4e8ff] text-purple-700',
  legendary: 'bg-[#fff0b8] text-amber-900'
};

type RewardPageProps = {
  searchParams?: Promise<{
    draw?: string;
    practice_record_id?: string;
  }>;
};

export default async function RewardPage({ searchParams }: RewardPageProps) {
  const params = await searchParams;
  const shouldDraw = params?.draw === '1';
  const practiceRecordId = params?.practice_record_id;

  const drawForm = new FormData();
  if (practiceRecordId) drawForm.set('practice_record_id', practiceRecordId);

  const result = shouldDraw ? await drawDailyReward(drawForm) : null;
  const card = result?.card;
  const drawHref = practiceRecordId ? `/reward?draw=1&practice_record_id=${practiceRecordId}` : '/reward?draw=1';

  return (
    <PhoneFrame>
      <KidTopBar title="今日獎勵" backHref="/practice" backLabel="練習" rightLabel="🎁" />

      {!shouldDraw ? (
        <section className="kid-card flex min-h-[560px] flex-col items-center justify-center p-5 text-center">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-[42px] bg-gradient-to-br from-[#fff0b8] via-[#ffe08a] to-[#d9fae8] text-7xl shadow-[0_20px_44px_rgba(245,158,11,0.2)] animate-bounce-soft">
            🎁
            <span className="absolute -left-2 top-7 text-3xl">✨</span>
            <span className="absolute -right-2 bottom-7 text-3xl">⭐</span>
          </div>
          <p className="mt-7 rounded-full bg-[#f4f0ff] px-4 py-2 text-sm font-black text-[#5b4be8]">Reward Pack</p>
          <h1 className="mt-4 text-[34px] font-black leading-tight text-ink">今天的驚喜卡包</h1>
          <p className="mt-4 text-lg font-bold leading-relaxed text-slate-500">
            完成練習後，打開一張新的收藏卡。
          </p>
          {!practiceRecordId ? (
            <p className="mt-5 rounded-[24px] bg-[#fff8ec] px-4 py-3 text-sm font-bold leading-relaxed text-slate-500 shadow-sm">
              正式模式會檢查今日練習紀錄。先完成今日練習，就可以打開卡包。
            </p>
          ) : null}
          <div className="mt-8 w-full space-y-3">
            <KidButton href={drawHref} tone="primary">🎁 打開卡包</KidButton>
            <KidButton href="/collection" tone="white">🎒 先看收納包</KidButton>
          </div>
        </section>
      ) : (
        <section className="kid-card flex min-h-[560px] flex-col p-5 text-center">
          <p className="self-center rounded-full bg-[#f4f0ff] px-4 py-2 text-sm font-black text-[#5b4be8]">New Card</p>
          <h1 className="mt-4 text-[34px] font-black leading-tight text-ink">
            {result?.ok ? (result.is_new ? '你獲得新卡！' : '卡片數量增加！') : '還不能抽卡'}
          </h1>

          <div className="mt-6 flex flex-1 flex-col items-center justify-center">
            {result?.ok && card ? (
              <div className="relative w-full max-w-[250px] rounded-[32px] bg-white p-3 shadow-[0_20px_44px_rgba(77,68,111,0.16)]">
                <div className="absolute -left-3 top-10 rotate-[-14deg] rounded-full bg-[#fff0b8] px-3 py-2 text-xl shadow-sm">✨</div>
                <div className="absolute -right-3 top-20 rotate-[12deg] rounded-full bg-[#d9fae8] px-3 py-2 text-xl shadow-sm">⭐</div>
                <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[26px] bg-gradient-to-br from-[#dff0ff] via-[#fff8ec] to-[#fff0b8]">
                  {card.rendered_card_image_url ? (
                    <Image src={card.rendered_card_image_url} alt={card.name} fill className="object-cover" sizes="250px" />
                  ) : (
                    <div className="text-8xl">{card.name.includes('車') ? '🚗' : card.name.includes('狗') ? '🐶' : '⭐'}</div>
                  )}
                </div>
                <div className="mt-3 rounded-[24px] bg-[#fff8ec] px-4 py-3">
                  <p className="text-xs font-black text-[#5b4be8]">{card.series?.name ?? '收藏卡'}</p>
                  <h2 className="mt-1 truncate text-2xl font-black text-ink">{card.name}</h2>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {card.card_no ? <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">{card.card_no}</span> : null}
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${rarityStyle[card.rarity] ?? rarityStyle.common}`}>
                      {rarityLabel[card.rarity] ?? card.rarity}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[34px] bg-white p-8 text-6xl shadow-sm">💤</div>
            )}

            <p className="mt-5 text-lg font-black leading-relaxed text-slate-600">
              {result?.message ?? '準備打開卡包'}
            </p>
            {result?.ok && typeof result.remaining_stock === 'number' ? (
              <p className="mt-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-400">卡包剩餘 {result.remaining_stock} 張</p>
            ) : null}
          </div>

          <div className="mt-6 space-y-3">
            <KidButton href="/collection" tone="primary">🎒 放進收納包</KidButton>
            <KidButton href="/" tone="white">回首頁</KidButton>
          </div>
        </section>
      )}
      <KidBottomNav />
    </PhoneFrame>
  );
}
