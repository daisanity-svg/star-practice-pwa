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
  rare: 'bg-[#dbeafe] text-blue-700',
  super_rare: 'bg-[#e0edff] text-[#1766e6]',
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
        <section className="kid-card flex min-h-[560px] flex-col items-center justify-center overflow-hidden p-5 text-center">
          <div className="relative flex h-36 w-36 items-center justify-center rounded-[44px] bg-gradient-to-br from-[#dbeafe] via-white to-[#fff0b8] text-7xl shadow-[0_20px_44px_rgba(37,99,235,0.16)] animate-bounce-soft">
            🎁
            <span className="absolute -left-2 top-8 text-3xl">✨</span>
            <span className="absolute -right-2 bottom-8 text-3xl">⭐</span>
          </div>
          <p className="mt-7 rounded-full bg-[#e9f4ff] px-4 py-2 text-sm font-black text-[#1766e6]">今天的卡包</p>
          <h1 className="mt-4 text-[33px] font-black leading-tight text-[#172033]">打開驚喜卡包</h1>
          <p className="mt-4 text-lg font-bold leading-relaxed text-[#5f6f89]">完成練習後，抽一張新的收藏卡，放進你的收納包。</p>
          {!practiceRecordId ? (
            <p className="mt-5 rounded-[24px] bg-[#f5f9ff] px-4 py-3 text-sm font-bold leading-relaxed text-[#7b8aa3] shadow-sm">
              先完成今日練習，就可以正式打開卡包。
            </p>
          ) : null}
          <div className="mt-8 w-full space-y-3">
            <KidButton href={drawHref} tone="primary">🎁 打開卡包</KidButton>
            <KidButton href="/collection" tone="white">🎒 先看收納包</KidButton>
          </div>
        </section>
      ) : (
        <section className="kid-card relative flex min-h-[560px] flex-col overflow-hidden p-5 text-center">
          <div className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-72 w-72 rounded-full bg-[#dbeafe] opacity-70 blur-3xl" />
          <div className="pointer-events-none absolute left-8 top-24 text-2xl">✨</div>
          <div className="pointer-events-none absolute right-8 top-36 text-2xl">🎉</div>

          <p className="relative z-10 self-center rounded-full bg-[#e9f4ff] px-4 py-2 text-sm font-black text-[#1766e6]">恭喜你！</p>
          <h1 className="relative z-10 mt-4 text-[32px] font-black leading-tight text-[#172033]">
            {result?.ok ? (result.is_new ? '你獲得新卡！' : '卡片數量增加！') : '還不能抽卡'}
          </h1>

          <div className="relative z-10 mt-6 flex flex-1 flex-col items-center justify-center">
            {result?.ok && card ? (
              <div className="relative w-full max-w-[236px] rounded-[30px] bg-white p-3 shadow-[0_22px_46px_rgba(30,64,175,0.16)] animate-float-card">
                <div className="absolute -right-3 top-4 z-10 rounded-full bg-[#2f8cff] px-3 py-1 text-xs font-black text-white shadow-sm">NEW</div>
                <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-br from-[#e6f3ff] via-white to-[#fff5c7]">
                  {card.rendered_card_image_url ? (
                    <Image src={card.rendered_card_image_url} alt={card.name} fill className="object-cover" sizes="250px" />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/70 text-7xl shadow-inner">{card.name.includes('車') ? '🚗' : card.name.includes('狗') ? '🐶' : '⭐'}</div>
                  )}
                </div>
                <div className="mt-3 rounded-[22px] bg-[#f5f9ff] px-4 py-3">
                  <p className="text-xs font-black text-[#1766e6]">{card.series?.name ?? '收藏卡'}</p>
                  <h2 className="mt-1 truncate text-2xl font-black text-[#172033]">{card.name}</h2>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {card.card_no ? <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#7b8aa3]">{card.card_no}</span> : null}
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${rarityStyle[card.rarity] ?? rarityStyle.common}`}>
                      {rarityLabel[card.rarity] ?? card.rarity}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[34px] bg-white p-8 text-6xl shadow-sm">💤</div>
            )}

            <p className="mt-5 text-base font-black leading-relaxed text-[#5f6f89]">{result?.message ?? '準備打開卡包'}</p>
            {result?.ok && typeof result.remaining_stock === 'number' ? (
              <p className="mt-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#7b8aa3]">卡包剩餘 {result.remaining_stock} 張</p>
            ) : null}
          </div>

          <div className="relative z-10 mt-6 space-y-3">
            <KidButton href="/collection" tone="primary">🎒 去收納包看看</KidButton>
            <KidButton href="/" tone="white">回首頁</KidButton>
          </div>
        </section>
      )}
      <KidBottomNav />
    </PhoneFrame>
  );
}
