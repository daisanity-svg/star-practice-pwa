import Link from 'next/link';
import { KidBottomNav } from '@/components/KidBottomNav';
import { PhoneFrame } from '@/components/PhoneFrame';
import { getCollectionSummary } from '@/lib/data/rewards';

function CollectionIcon({ name }: { name: string }) {
  if (name.includes('車')) return <span>🚗</span>;
  if (name.includes('狗') || name.includes('布麗')) return <span>🐶</span>;
  if (name.includes('龍')) return <span>🦖</span>;
  if (name.includes('皮克') || name.includes('植物')) return <span>🌱</span>;
  return <span>⭐</span>;
}

export default async function HomePage() {
  const collections = await getCollectionSummary();
  const ownedTotal = collections.reduce((sum, item) => sum + item.owned, 0);
  const cardTotal = collections.reduce((sum, item) => sum + item.total, 0) || 30;
  const topCollections = collections.slice(0, 3);

  return (
    <PhoneFrame>
      <section className="kid-hero-blue relative overflow-hidden rounded-[38px] p-5 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/25 blur-2xl" />
        <div className="pointer-events-none absolute bottom-2 right-0 text-8xl opacity-20">☁️</div>
        <div className="pointer-events-none absolute left-6 top-7 text-2xl opacity-80 confetti-sparkle">⭐</div>
        <div className="pointer-events-none absolute right-10 top-20 text-xl opacity-80 confetti-sparkle">✨</div>

        <header className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="learning-orb flex h-16 w-16 shrink-0 items-center justify-center rounded-[26px] border-4 border-white/70 text-4xl shadow-sm">👦</div>
            <div className="min-w-0">
              <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-black text-white">星見練習本</p>
              <h1 className="mt-2 truncate text-[30px] font-black leading-tight tracking-[-0.04em]">星見，出發！</h1>
            </div>
          </div>
          <Link href="/parent/login" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/22 text-xl backdrop-blur active:scale-95" aria-label="家長後台">
            ⚙️
          </Link>
        </header>

        <div className="relative z-10 mt-5 rounded-[32px] bg-white/96 p-4 text-[#172033] shadow-[0_16px_32px_rgba(30,64,175,0.14)]">
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-[#e9f4ff] text-3xl">🧭</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-black">今天找 5 個朋友</h2>
                <span className="rounded-full bg-[#fff0a8] px-3 py-1 text-sm font-black text-[#1766e6]">5 題</span>
              </div>
              <p className="mt-2 text-base font-bold leading-relaxed text-[#5f6f89]">聽一聽、看一看，找到注音和英文朋友。</p>
              <div className="mt-3 grid grid-cols-5 gap-1.5" aria-label="今日任務進度">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-3 rounded-full bg-gradient-to-r from-[#2f8cff] to-[#ffd95a] opacity-90" />
                ))}
              </div>
            </div>
          </div>
          <Link href="/practice" className="kid-blue-button mt-5 flex min-h-[64px] items-center justify-center rounded-[26px] text-xl font-black active:scale-[0.99]">
            🚀 開始今天練習
          </Link>
        </div>
      </section>

      <section className="kid-card-strong overflow-hidden p-5">
        <div className="flex items-center gap-4">
          <div className="reward-pack-glow flex h-24 w-24 shrink-0 items-center justify-center rounded-[34px] text-5xl shadow-sm animate-bounce-soft">🎁</div>
          <div className="min-w-0">
            <p className="rounded-full bg-[#e9f4ff] px-3 py-1 text-xs font-black text-[#1766e6]">今天獎勵</p>
            <h2 className="mt-2 text-[24px] font-black leading-tight text-[#172033]">完成後打開卡包</h2>
          </div>
        </div>
        <Link href="/reward" className="mt-4 flex min-h-[58px] items-center justify-center rounded-[24px] bg-[#fff7d0] text-lg font-black text-[#193153] shadow-sm active:scale-[0.99]">
          先看看今天的卡包 ✨
        </Link>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <div className="kid-card p-3 text-center">
          <div className="text-3xl">⭐</div>
          <p className="mt-2 text-xs font-black text-[#7b8aa3]">星星</p>
          <p className="text-xl font-black text-[#172033]">{ownedTotal + 8}</p>
        </div>
        <div className="kid-card p-3 text-center">
          <div className="text-3xl">🔥</div>
          <p className="mt-2 text-xs font-black text-[#7b8aa3]">連續</p>
          <p className="text-xl font-black text-[#172033]">3 天</p>
        </div>
        <Link href="/collection" className="kid-card p-3 text-center active:scale-[0.99]">
          <div className="text-3xl">🎒</div>
          <p className="mt-2 text-xs font-black text-[#7b8aa3]">卡片</p>
          <p className="text-xl font-black text-[#172033]">{ownedTotal}/{cardTotal}</p>
        </Link>
      </section>

      <section className="kid-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black text-[#2f8cff]">收藏圖鑑</p>
            <h2 className="text-2xl font-black text-[#172033]">還差哪些朋友？</h2>
          </div>
          <Link href="/collection" className="rounded-full bg-[#e9f4ff] px-3 py-2 text-sm font-black text-[#1766e6]">
            查看
          </Link>
        </div>

        <div className="space-y-3">
          {topCollections.map((collection) => {
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
                      <div className="text-xs font-bold text-[#7b8aa3]">再收 {Math.max(collection.total - collection.owned, 0)} 張就更完整</div>
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

      <KidBottomNav />
    </PhoneFrame>
  );
}
