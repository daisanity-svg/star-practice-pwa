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
  const eventText = activeEvent?.banner_text ?? '完成今天練習，可以打開 1 個小車驚喜卡包！';
  const eventPackName = activeEvent?.reward_pack?.name ?? '今日驚喜卡包';

  return (
    <PhoneFrame>
      <section className="kid-card relative flex flex-1 flex-col overflow-hidden p-5">
        <div className="pointer-events-none absolute -right-14 -top-12 h-36 w-36 rounded-full bg-[#fff0b8] opacity-80 blur-2xl" />
        <div className="pointer-events-none absolute -left-16 top-48 h-36 w-36 rounded-full bg-[#d9fae8] opacity-80 blur-2xl" />

        <header className="relative z-10 flex items-center justify-between">
          <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-black text-[#6d5dfc] shadow-sm">
            星見練習本
          </div>
          <Link href="/parent/login" className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm active:scale-95">
            ⚙️
          </Link>
        </header>

        <section className="relative z-10 mt-5 rounded-[36px] bg-gradient-to-br from-[#6d5dfc] to-[#9888ff] p-5 text-white shadow-[0_20px_42px_rgba(109,93,252,0.28)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-bold opacity-90">今天的任務</p>
              <h1 className="mt-2 text-[36px] font-black leading-tight tracking-[-0.04em]">
                找找看，<br />字母朋友！
              </h1>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[26px] bg-white/20 text-4xl backdrop-blur">
              ⭐
            </div>
          </div>

          <div className="mt-5 rounded-[28px] bg-white/20 p-4 backdrop-blur">
            <p className="text-lg font-black">{activeEvent?.name ?? '小車週'}</p>
            <p className="mt-1 text-base font-semibold leading-relaxed text-white/90">{eventText}</p>
            <div className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-[#6d5dfc]">
              🎁 今天獎勵：{eventPackName}
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-4 grid grid-cols-3 gap-3">
          {[
            { label: '今日', value: '0/10', icon: '✏️' },
            { label: '星星', value: '0', icon: '⭐' },
            { label: '連續', value: '2天', icon: '🔥' }
          ].map((item) => (
            <div key={item.label} className="rounded-[28px] bg-white/90 p-3 text-center shadow-sm">
              <div className="text-2xl">{item.icon}</div>
              <div className="mt-1 text-xs font-black text-slate-400">{item.label}</div>
              <div className="text-xl font-black text-ink">{item.value}</div>
            </div>
          ))}
        </section>

        <section className="relative z-10 mt-5 space-y-3">
          <KidButton href="/practice" className="text-2xl">🚀 開始今天練習</KidButton>
          <div className="grid grid-cols-2 gap-3">
            <KidButton href="/collection" tone="butter" className="text-lg">🎒 收納包</KidButton>
            <KidButton href="/parent/dashboard" tone="white" className="text-lg">👨‍👦 家長</KidButton>
          </div>
        </section>

        <section className="relative z-10 mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-[-0.03em] text-ink">收藏進度</h2>
            <Link href="/collection" className="rounded-full bg-white px-3 py-2 text-sm font-black text-[#6d5dfc] shadow-sm">
              查看全部
            </Link>
          </div>

          <div className="grid gap-3">
            {collections.map((collection) => {
              const percent = collection.total > 0 ? Math.round((collection.owned / collection.total) * 100) : 0;
              return (
                <Link key={collection.id} href="/collection" className="rounded-[30px] bg-white/90 p-4 shadow-sm active:scale-[0.99]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#fff5d7] text-3xl">
                        <CollectionIcon name={collection.name} />
                      </div>
                      <div>
                        <div className="text-lg font-black text-ink">{collection.name}</div>
                        <div className="mt-1 text-sm font-bold text-slate-400">還差 {Math.max(collection.total - collection.owned, 0)} 張集滿</div>
                      </div>
                    </div>
                    <div className="text-right text-lg font-black text-[#6d5dfc]">
                      {collection.owned}/{collection.total}
                    </div>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#6d5dfc] to-[#ffd66b]" style={{ width: `${percent}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </section>
      <KidBottomNav />
    </PhoneFrame>
  );
}
