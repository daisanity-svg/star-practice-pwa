import Image from 'next/image';
import Link from 'next/link';
import { KidButton } from '@/components/KidButton';
import { PhoneFrame } from '@/components/PhoneFrame';
import { drawDailyReward } from '@/lib/actions/draw-reward';

const rarityLabel: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  super_rare: '超稀有',
  legendary: '傳說'
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
      <div className="mb-4 flex items-center justify-between">
        <Link href="/practice" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-slate-600 shadow-sm">
          ← 回練習
        </Link>
        <div className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-grape shadow-sm">
          今日獎勵
        </div>
      </div>

      {!shouldDraw ? (
        <section className="kid-card flex min-h-[620px] flex-col items-center justify-center p-6 text-center">
          <div className="flex h-36 w-36 items-center justify-center rounded-[42px] bg-butter text-7xl shadow-sm animate-bounce-soft">
            🎁
          </div>
          <p className="mt-8 text-base font-bold text-grape">Reward Pack</p>
          <h1 className="mt-2 text-4xl font-black leading-tight text-ink">今天的驚喜卡包</h1>
          <p className="mt-4 text-xl font-bold leading-relaxed text-slate-500">
            完成練習後，就可以打開一張收藏卡。
          </p>
          {!practiceRecordId ? (
            <p className="mt-5 rounded-3xl bg-white px-4 py-3 text-base font-bold text-slate-500 shadow-sm">
              正式模式會檢查今日練習紀錄，請先完成今日練習再來抽卡。
            </p>
          ) : null}
          <div className="mt-10 w-full space-y-3">
            <KidButton href={drawHref} tone="butter">打開卡包</KidButton>
            <KidButton href="/collection" tone="white">先看我的收納包</KidButton>
          </div>
        </section>
      ) : (
        <section className="kid-card flex min-h-[620px] flex-col p-6 text-center">
          <p className="text-base font-bold text-grape">New Card</p>
          <h1 className="mt-2 text-4xl font-black leading-tight text-ink">
            {result?.ok ? (result.is_new ? '你獲得新卡！' : '卡片數量增加！') : '還不能抽卡'}
          </h1>

          <div className="mt-8 flex flex-1 flex-col items-center justify-center">
            {result?.ok && card ? (
              <div className="w-full max-w-[260px] rounded-[34px] bg-white p-4 shadow-sm">
                <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[26px] bg-gradient-to-br from-skysoft to-butter">
                  {card.rendered_card_image_url ? (
                    <Image src={card.rendered_card_image_url} alt={card.name} fill className="object-cover" sizes="260px" />
                  ) : (
                    <div className="text-7xl">{card.name.includes('車') ? '🚗' : card.name.includes('狗') ? '🐶' : '⭐'}</div>
                  )}
                </div>
                <div className="mt-4 rounded-3xl bg-cream px-4 py-3">
                  <p className="text-sm font-black text-grape">{card.series?.name ?? '收藏卡'}</p>
                  <h2 className="mt-1 text-2xl font-black text-ink">{card.name}</h2>
                  <p className="mt-1 text-base font-bold text-slate-500">
                    {card.card_no ? `${card.card_no}｜` : ''}{rarityLabel[card.rarity] ?? card.rarity}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-[34px] bg-white p-8 text-6xl shadow-sm">💤</div>
            )}

            <p className="mt-7 text-xl font-black leading-relaxed text-slate-600">
              {result?.message ?? '準備打開卡包'}
            </p>
            {result?.ok && typeof result.remaining_stock === 'number' ? (
              <p className="mt-2 text-base font-bold text-slate-400">這張卡在卡包剩餘 {result.remaining_stock} 張</p>
            ) : null}
          </div>

          <div className="mt-8 space-y-3">
            <KidButton href="/collection" tone="butter">放進收納包</KidButton>
            <KidButton href="/" tone="white">回首頁</KidButton>
          </div>
        </section>
      )}
    </PhoneFrame>
  );
}
