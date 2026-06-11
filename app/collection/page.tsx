import Link from 'next/link';
import { PhoneFrame } from '@/components/PhoneFrame';
import { getCollectionSummary } from '@/lib/data/rewards';

export default async function CollectionPage() {
  const collections = await getCollectionSummary();

  return (
    <PhoneFrame>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-slate-600 shadow-sm">
          ← 回首頁
        </Link>
        <div className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-grape shadow-sm">
          我的收納包
        </div>
      </div>

      <section className="kid-card p-6">
        <p className="text-base font-bold text-grape">Collection</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink">星見的卡片圖鑑</h1>
        <p className="mt-3 text-lg font-bold leading-relaxed text-slate-500">
          完成每天練習，就可以把新卡片放進這裡。
        </p>
      </section>

      <section className="mt-5 space-y-4">
        {collections.map((collection) => {
          const percent = collection.total > 0 ? Math.round((collection.owned / collection.total) * 100) : 0;

          return (
            <div key={collection.id} className="kid-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-ink">{collection.name}</h2>
                  <p className="mt-1 text-base font-bold text-slate-500">
                    已收集 {collection.owned} / {collection.total}
                  </p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-butter text-3xl">
                  {collection.name.includes('車') ? '🚗' : collection.name.includes('狗') ? '🐶' : '⭐'}
                </div>
              </div>

              <div className="mt-4 h-4 overflow-hidden rounded-full bg-white/80">
                <div className="h-full rounded-full bg-grape" style={{ width: `${percent}%` }} />
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {Array.from({ length: Math.min(collection.total || 5, 10) }).map((_, index) => (
                  <div
                    key={index}
                    className={`flex aspect-[3/4] items-center justify-center rounded-2xl text-xl shadow-sm ${
                      index < collection.owned ? 'bg-mint' : 'bg-white/60 text-slate-300'
                    }`}
                  >
                    {index < collection.owned ? '✨' : '?'}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </PhoneFrame>
  );
}
