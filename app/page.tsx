import Link from 'next/link';
import { KidBottomNav } from '@/components/KidBottomNav';
import { KidButton } from '@/components/KidButton';
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
  const cardTotal = collections.reduce((sum, item) => sum + item.total, 0);

  return (
    <PhoneFrame>
      <section className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#58b7ff] via-[#2f91f7] to-[#1675dc] p-5 text-white shadow-[0_22px_50px_rgba(35,135,247,0.28)]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/20 blur-xl" />
        <div className="pointer-events-none absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-white/16 blur-xl" />

        <header className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-[26px] bg-white/90 text-4xl shadow-sm">👦</div>
            <div>
              <p className="text-sm font-black text-white/75">星星練習本</p>
              <h1 className="text-[30px] font-black leading-tight tracking-[-0.04em]">Hi，星見！</h1>
            </div>
          </div>
          <Link href="/parent/login" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-xl backdrop-blur active:scale-95">
            ⚙️
          </Link>
        </header>

        <div className="relative z-10 mt-6 rounded-[30px] bg-white/18 p-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-white/70">今天的任務</p>
              <h2 className="mt-1 text-2xl font-black leading-tight">完成 4 題練習</h2>
            </div>
            <div className="rounded-full bg-[#ffd95a] px-4 py-2 text-base font-black text-[#12304f]">1 / 4</div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/28">
            <div className="h-full w-1/4 rounded-full bg-[#ffd95a]" />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm font-bold leading-relaxed text-white/86">完成後可以打開 {eventPackName}</p>
            <Link href="/practice" className="shrink-0 rounded-full bg-white px-4 py-3 text-sm font-black text-[#1675dc] shadow-sm active:scale-95">
              開始
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link href="/collection" className="kid-soft-panel rounded-[30px] p-4 active:scale-[0.99]">
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#dceeff] text-3xl">🎒</div>
          <h2 className="mt-4 text-xl font-black text-ink">我的收納包</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">{ownedTotal}/{cardTotal || 30} 張</p>
        </Link>
        <Link href="/reward" className="kid-soft-panel rounded-[30px] p-4 active:scale-[0.99]">
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#fff2b7] text-3xl">🎁</div>
          <h2 className="mt-4 text-xl font-black text-ink">今日獎勵</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">可抽卡包</p>
        </Link>
      </section>

      <section className="kid-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-[#2387f7]">Collection</p>
            <h2 className="text-2xl font-black text-ink">收藏進度</h2>
          </div>
          <Link href="/collection" className="rounded-full bg-[#e9f4ff] px-3 py-2 text-sm font-black text-[#1675dc]">
            查看全部
          </Link>
        </div>

        <div className="space-y-3">
          {collections.map((collection) => {
            const percent = collection.total > 0 ? Math.round((collection.owned / collection.total) * 100) : 0;
            return (
              <Link key={collection.id} href="/collection" className="block rounded-[26px] bg-white p-3 shadow-[0_8px_18px_rgba(18,48,79,0.06)] active:scale-[0.99]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#eef7ff] text-2xl">
                      <CollectionIcon name={collection.name} />
                    </div>
                    <div>
                      <div className="text-base font-black text-ink">{collection.name}</div>
                      <div className="text-xs font-bold text-slate-400">還差 {Math.max(collection.total - collection.owned, 0)} 張</div>
                    </div>
                  </div>
                  <div className="text-base font-black text-[#2387f7]">{collection.owned}/{collection.total}</div>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#2387f7] to-[#ffd95a]" style={{ width: `${percent}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <KidButton href="/practice" className="text-2xl">✏️ 開始今天練習</KidButton>
      <KidBottomNav />
    </PhoneFrame>
  );
}
