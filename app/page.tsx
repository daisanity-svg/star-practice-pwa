import Link from 'next/link';
import { KidBottomNav } from '@/components/KidBottomNav';
import { PhoneFrame } from '@/components/PhoneFrame';
import { getActiveEvent } from '@/lib/data/events';
import { getCollectionSummary } from '@/lib/data/rewards';

function CollectionIcon({ name }: { name: string }) {
  if (name.includes('車')) return <span>🚗</span>;
  if (name.includes('狗')) return <span>🐶</span>;
  if (name.includes('龍')) return <span>🦖</span>;
  return <span>🌱</span>;
}

export default async function HomePage() {
  const [collections, activeEvent] = await Promise.all([getCollectionSummary(), getActiveEvent()]);
  const eventPackName = activeEvent?.reward_pack?.name ?? '小車驚喜卡包';
  const ownedTotal = collections.reduce((sum, item) => sum + item.owned, 0);
  const cardTotal = collections.reduce((sum, item) => sum + item.total, 0) || 30;

  return (
    <PhoneFrame>
      <section className="kid-hero-blue relative overflow-hidden rounded-[36px] p-5 text-white">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/25 blur-2xl" />
        <div className="pointer-events-none absolute bottom-1 right-2 text-8xl opacity-20">☁️</div>
        <div className="pointer-events-none absolute left-6 top-7 text-2xl opacity-70">⭐</div>

        <header className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-white/65 bg-white text-4xl shadow-sm">👦</div>
            <div className="min-w-0">
              <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-black text-white">星星練習王</p>
              <h1 className="mt-2 truncate text-[28px] font-black leading-tight tracking-[-0.04em]">Hi，星見！</h1>
            </div>
          </div>
          <Link href="/parent/login" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/24 text-xl backdrop-blur active:scale-95">
            ⚙️
          </Link>
        </header>

        <div className="relative z-10 mt-5 rounded-[30px] bg-white/95 p-4 text-[#172033] shadow-[0_16px_32px_rgba(30,64,175,0.14)]">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-[#e9f4ff] text-2xl">📋</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black">今日任務</h2>
                <span className="rounded-full bg-[#fff0a8] px-3 py-1 text-sm font-black text-[#1766e6]">1 / 4</span>
              </div>
              <p className="mt-2 text-sm font-bold leading-relaxed text-[#5f6f89]">完成 4 題練習，就可以打開今天的卡包。</p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#e6eef9]">
                <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-[#2f8cff] to-[#ffd95a]" />
              </div>
            </div>
          </div>
          <Link href="/practice" className="kid-blue-button mt-4 flex h-13 min-h-[54px] items-center justify-center rounded-[22px] text-base font-black active:scale-[0.99]">
            開始練習
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link href="/collection" className="kid-card p-4 active:scale-[0.99]">
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#dff1ff] text-3xl">🎒</div>
          <h2 className="mt-4 text-lg font-black text-[#172033]">我的收納包</h2>
          <p className="mt-1 text-sm font-bold text-[#5f6f89]">{ownedTotal}/{cardTotal} 張</p>
        </Link>
        <Link href="/reward" className="kid-card p-4 active:scale-[0.99]">
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#fff0b8] text-3xl">🎁</div>
          <h2 className="mt-4 text-lg font-black text-[#172033]">今日獎勵</h2>
          <p className="mt-1 text-sm font-bold text-[#5f6f89]">可抽卡包</p>
        </Link>
      </section>

      <section className="kid-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black text-[#2f8cff]">收藏進度</p>
            <h2 className="text-2xl font-black text-[#172033]">卡片圖鑑</h2>
          </div>
          <Link href="/collection" className="rounded-full bg-[#e9f4ff] px-3 py-2 text-sm font-black text-[#1766e6]">
            查看全部
          </Link>
        </div>

        <div className="space-y-3">
          {collections.map((collection) => {
            const percent = collection.total > 0 ? Math.round((collection.owned / collection.total) * 100) : 0;
            return (
              <Link key={collection.id} href="/collection" className="block rounded-[24px] bg-[#f8fbff] p-3 shadow-[0_8px_18px_rgba(30,64,175,0.06)] active:scale-[0.99]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-white text-2xl shadow-sm">
                      <CollectionIcon name={collection.name} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-base font-black text-[#172033]">{collection.name}</div>
                      <div className="text-xs font-bold text-[#7b8aa3]">還差 {Math.max(collection.total - collection.owned, 0)} 張</div>
                    </div>
                  </div>
                  <div className="shrink-0 text-base font-black text-[#2f8cff]">{collection.owned}/{collection.total}</div>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#e6eef9]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#2f8cff] to-[#ffd95a]" style={{ width: `${percent}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="rounded-[28px] bg-white/75 p-4 text-center text-sm font-bold text-[#5f6f89] shadow-sm">
        今天完成練習，可以抽 <span className="text-[#1766e6]">{eventPackName}</span>！
      </div>

      <KidBottomNav />
    </PhoneFrame>
  );
}
