import Link from 'next/link';
import { BatchCardUploader } from '@/components/BatchCardUploader';
import { createBatchCards, createCardSeries, createRewardPack } from '@/lib/actions/rewards';
import { getAdminRewardData } from '@/lib/data/admin-rewards';

const inputClass = 'mt-2 w-full rounded-3xl border-0 bg-white/90 px-4 py-4 text-lg font-bold text-ink shadow-sm outline-none ring-2 ring-transparent focus:ring-blue-300';
const labelClass = 'text-sm font-black text-slate-500';

function getPackStock(packId: string, packItems: Awaited<ReturnType<typeof getAdminRewardData>>['packItems']) {
  return packItems
    .filter((item) => item.reward_pack_id === packId)
    .reduce((sum, item) => sum + Number(item.stock || 0), 0);
}

function getSeriesPack(seriesName: string, packs: Awaited<ReturnType<typeof getAdminRewardData>>['packs']) {
  return packs.find((pack) => pack.name.includes(seriesName)) || null;
}

export default async function ParentCardsPage() {
  const { series, cards, packs, packItems } = await getAdminRewardData();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 px-4 py-5 text-ink md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/parent/dashboard" className="rounded-full bg-white px-5 py-3 text-base font-black text-blue-700 shadow-sm ring-1 ring-blue-100">
            ← 回後台
          </Link>
          <div className="rounded-full bg-blue-600 px-5 py-3 text-base font-black text-white shadow-soft">
            系列池管理
          </div>
        </div>

        <section className="mt-5 rounded-[2rem] bg-white/90 p-6 shadow-soft ring-1 ring-blue-100">
          <p className="text-base font-black text-blue-600">Series Pools</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-ink md:text-4xl">只管理系列池，空了就補卡</h1>
          <p className="mt-3 max-w-3xl text-lg font-bold leading-relaxed text-slate-500">
            這個後台已簡化：你只需要建立「系列池」，例如布麗狗夢想系列、小車系列、恐龍系列。之後點選該系列池或在下方選擇系列與獎池，直接批次上傳卡片即可。
          </p>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-[2rem] bg-white/90 p-5 shadow-soft ring-1 ring-blue-100">
            <h2 className="text-2xl font-black text-ink">新增系列池</h2>
            <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500">
              只要建立大系列即可，不需要再建立分類。系列名稱會用來自動產生卡號前綴。
            </p>
            <form action={createCardSeries} className="mt-4 space-y-4">
              <label className="block">
                <span className={labelClass}>系列名稱</span>
                <input name="name" className={inputClass} placeholder="布麗狗夢想系列" required />
              </label>
              <label className="block">
                <span className={labelClass}>描述</span>
                <input name="description" className={inputClass} placeholder="星見喜歡的收藏卡系列" />
              </label>
              <button className="w-full rounded-[2rem] bg-blue-600 px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
                新增系列池
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] bg-white/90 p-5 shadow-soft ring-1 ring-blue-100">
            <h2 className="text-2xl font-black text-ink">新增獎池</h2>
            <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500">
              獎池就是孩子完成練習後抽卡的地方。建議名稱與系列一致，例如「布麗狗驚喜卡包」。
            </p>
            <form action={createRewardPack} className="mt-4 space-y-4">
              <label className="block">
                <span className={labelClass}>獎池名稱</span>
                <input name="name" className={inputClass} placeholder="布麗狗驚喜卡包" required />
              </label>
              <input type="hidden" name="draw_type" value="daily" />
              <label className="block">
                <span className={labelClass}>描述</span>
                <input name="description" className={inputClass} placeholder="完成練習後可以抽這個系列" />
              </label>
              <button className="w-full rounded-[2rem] bg-ink px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
                新增獎池
              </button>
            </form>
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white/90 p-5 shadow-soft ring-1 ring-blue-100">
          <h2 className="text-2xl font-black text-ink">系列池列表</h2>
          <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500">
            看哪個系列或獎池卡片快沒了，就往下方批次補卡。分類與手動卡號都已隱藏，系統會自動處理。
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {series.map((item) => {
              const seriesCards = cards.filter((card) => card.series_id === item.id);
              const relatedPack = getSeriesPack(item.name, packs);
              const stock = relatedPack ? getPackStock(relatedPack.id, packItems) : 0;
              return (
                <div key={item.id} className="rounded-[1.75rem] bg-blue-50/80 p-4 ring-1 ring-blue-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-blue-500">系列池</p>
                      <h3 className="mt-1 text-xl font-black text-ink">{item.name}</h3>
                      {item.description ? <p className="mt-1 text-sm font-bold text-slate-500">{item.description}</p> : null}
                    </div>
                    <span className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-blue-700 shadow-sm">
                      {seriesCards.length} 張卡
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                      <p className="text-xs font-black text-slate-400">對應獎池</p>
                      <p className="mt-1 text-sm font-black text-ink">{relatedPack?.name || '尚未建立'}</p>
                    </div>
                    <div className={`rounded-2xl p-3 shadow-sm ${stock <= 0 ? 'bg-red-50' : 'bg-white'}`}>
                      <p className={`text-xs font-black ${stock <= 0 ? 'text-red-500' : 'text-slate-400'}`}>{stock <= 0 ? '需要補卡' : '剩餘庫存'}</p>
                      <p className="mt-1 text-lg font-black text-ink">{stock} 張</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white/90 p-5 shadow-soft ring-1 ring-blue-100">
          <form action={createBatchCards}>
            <BatchCardUploader series={series} packs={packs} />
            <button className="mt-5 w-full rounded-[2rem] bg-blue-600 px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
              批次加入獎池
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
