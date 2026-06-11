import Link from 'next/link';
import { BatchCardUploader } from '@/components/BatchCardUploader';
import { CardDesigner } from '@/components/CardDesigner';
import { PhoneFrame } from '@/components/PhoneFrame';
import { addCardToPack, createBatchCards, createCard, createCardCategory, createCardSeries, createRewardPack } from '@/lib/actions/rewards';
import { getAdminRewardData } from '@/lib/data/admin-rewards';

const inputClass = 'mt-2 w-full rounded-3xl border-0 bg-white/90 px-4 py-4 text-lg font-bold text-ink shadow-sm outline-none ring-2 ring-transparent focus:ring-blue-300';
const labelClass = 'text-sm font-black text-slate-500';

const rarityLabels: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  super_rare: '超稀有',
  legendary: '傳說'
};

function getPackStock(packId: string, packItems: Awaited<ReturnType<typeof getAdminRewardData>>['packItems']) {
  return packItems
    .filter((item) => item.reward_pack_id === packId)
    .reduce((sum, item) => sum + Number(item.stock || 0), 0);
}

export default async function ParentCardsPage() {
  const { series, categories, cards, packs, packItems } = await getAdminRewardData();

  return (
    <PhoneFrame>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/parent/dashboard" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-slate-600 shadow-sm">
          ← 後台
        </Link>
        <div className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-blue-700 shadow-sm">
          卡片管理
        </div>
      </div>

      <section className="kid-card p-6">
        <p className="text-base font-bold text-blue-600">Cards & Packs</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink">獎池補卡管理</h1>
        <p className="mt-3 text-lg font-bold leading-relaxed text-slate-500">
          你只需要建立系列與獎池。之後看到哪個獎池空了，就批次上傳圖片，系統會自動編號、套版並加入獎池。
        </p>
      </section>

      <section className="mt-5 kid-card p-5">
        <h2 className="text-2xl font-black text-ink">獎池剩餘狀態</h2>
        <div className="mt-4 space-y-3">
          {packs.map((pack) => {
            const stock = getPackStock(pack.id, packItems);
            return (
              <div key={pack.id} className={`rounded-3xl px-4 py-4 shadow-sm ${stock <= 0 ? 'bg-red-50' : 'bg-blue-50'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-xs font-black ${stock <= 0 ? 'text-red-500' : 'text-blue-500'}`}>{stock <= 0 ? '需要補卡' : '庫存正常'}</p>
                    <h3 className="mt-1 text-lg font-black text-ink">{pack.name}</h3>
                  </div>
                  <span className={`rounded-2xl px-3 py-2 text-base font-black ${stock <= 0 ? 'bg-red-100 text-red-700' : 'bg-white text-blue-700'}`}>
                    {stock} 張
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-5 kid-card p-5">
        <h2 className="text-2xl font-black text-ink">新增系列</h2>
        <form action={createCardSeries} className="mt-4 space-y-4">
          <label className="block">
            <span className={labelClass}>系列名稱</span>
            <input name="name" className={inputClass} placeholder="夢想系列" required />
          </label>
          <label className="block">
            <span className={labelClass}>封面圖片網址</span>
            <input name="cover_image_url" className={inputClass} placeholder="可先空白" />
          </label>
          <label className="block">
            <span className={labelClass}>描述</span>
            <input name="description" className={inputClass} placeholder="孩子喜歡的收藏卡系列" />
          </label>
          <button className="w-full rounded-[2rem] bg-blue-600 px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
            新增系列
          </button>
        </form>
      </section>

      <section className="mt-5 kid-card p-5">
        <h2 className="text-2xl font-black text-ink">新增獎池</h2>
        <form action={createRewardPack} className="mt-4 space-y-4">
          <label className="block">
            <span className={labelClass}>獎池名稱</span>
            <input name="name" className={inputClass} placeholder="今日驚喜卡包" required />
          </label>
          <input type="hidden" name="draw_type" value="daily" />
          <label className="block">
            <span className={labelClass}>描述</span>
            <input name="description" className={inputClass} placeholder="完成每日練習後可抽" />
          </label>
          <button className="w-full rounded-[2rem] bg-ink px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
            新增獎池
          </button>
        </form>
      </section>

      <section className="mt-5 kid-card p-5">
        <form action={createBatchCards}>
          <BatchCardUploader series={series} categories={categories} packs={packs} />
          <button className="mt-5 w-full rounded-[2rem] bg-blue-600 px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
            批次加入獎池
          </button>
        </form>
      </section>

      <section className="mt-5 kid-card p-5">
        <h2 className="text-2xl font-black text-ink">單張上傳</h2>
        <p className="mt-2 text-base font-bold leading-relaxed text-slate-500">
          需要微調單張卡片時再使用。一般補卡建議使用上方批次上傳。
        </p>
        <form action={createCard} className="mt-4 space-y-5">
          <CardDesigner series={series} categories={categories} />
          <button className="w-full rounded-[2rem] bg-blue-600 px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
            儲存單張卡片
          </button>
        </form>
      </section>

      <section className="mt-5 kid-card p-5">
        <h2 className="text-2xl font-black text-ink">進階：新增分類</h2>
        <form action={createCardCategory} className="mt-4 space-y-4">
          <label className="block">
            <span className={labelClass}>所屬系列</span>
            <select name="series_id" className={inputClass}>
              {series.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>分類名稱</span>
            <input name="name" className={inputClass} placeholder="夢想卡" required />
          </label>
          <button className="w-full rounded-[2rem] bg-white px-5 py-5 text-xl font-black text-blue-700 shadow-sm active:scale-[0.99]">
            新增分類
          </button>
        </form>
      </section>

      <section className="mt-5 kid-card p-5">
        <h2 className="text-2xl font-black text-ink">進階：手動加入卡包</h2>
        <form action={addCardToPack} className="mt-4 space-y-4">
          <label className="block">
            <span className={labelClass}>卡包</span>
            <select name="reward_pack_id" className={inputClass}>
              {packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>卡片</span>
            <select name="card_id" className={inputClass}>
              {cards.map((card) => <option key={card.id} value={card.id}>{card.card_no ? `${card.card_no}｜` : ''}{card.name}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>庫存</span>
              <input name="stock" className={inputClass} type="number" min="0" defaultValue="1" />
            </label>
            <label className="block">
              <span className={labelClass}>權重</span>
              <input name="weight" className={inputClass} type="number" min="0" defaultValue="10" />
            </label>
          </div>
          <button className="w-full rounded-[2rem] bg-white px-5 py-5 text-xl font-black text-blue-700 shadow-sm active:scale-[0.99]">
            加入卡包
          </button>
        </form>
      </section>

      <section className="mt-5 space-y-4">
        {series.map((item) => {
          const seriesCards = cards.filter((card) => card.series_id === item.id);
          return (
            <div key={item.id} className="kid-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-blue-600">系列</p>
                  <h2 className="text-2xl font-black text-ink">{item.name}</h2>
                  {item.description ? <p className="mt-1 text-sm font-bold text-slate-500">{item.description}</p> : null}
                </div>
                <span className="rounded-3xl bg-blue-50 px-4 py-3 text-base font-black text-blue-700">
                  {seriesCards.length} 張
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {seriesCards.map((card) => (
                  <div key={card.id} className="rounded-3xl bg-white/75 p-3 shadow-sm">
                    {card.rendered_card_image_url ? (
                      <img src={card.rendered_card_image_url} alt={card.name} className="aspect-[3/4] w-full rounded-2xl object-cover" />
                    ) : null}
                    <p className="mt-3 text-xs font-black text-slate-400">{card.card_no || '自動編號'}</p>
                    <h3 className="mt-1 text-lg font-black text-ink">{card.name}</h3>
                    <p className="mt-1 text-sm font-bold text-blue-600">{rarityLabels[card.rarity] || card.rarity}</p>
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
