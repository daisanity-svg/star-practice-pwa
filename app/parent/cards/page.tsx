import Link from 'next/link';
import { CardDesigner } from '@/components/CardDesigner';
import { PhoneFrame } from '@/components/PhoneFrame';
import { addCardToPack, createCard, createCardCategory, createCardSeries, createRewardPack } from '@/lib/actions/rewards';
import { getAdminRewardData } from '@/lib/data/admin-rewards';

const inputClass = 'mt-2 w-full rounded-3xl border-0 bg-white/90 px-4 py-4 text-lg font-bold text-ink shadow-sm outline-none ring-2 ring-transparent focus:ring-grape/30';
const labelClass = 'text-sm font-black text-slate-500';

const rarityLabels: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  super_rare: '超稀有',
  legendary: '傳說'
};

export default async function ParentCardsPage() {
  const { series, categories, cards, packs, packItems } = await getAdminRewardData();

  return (
    <PhoneFrame>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/parent/dashboard" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-slate-600 shadow-sm">
          ← 後台
        </Link>
        <div className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-grape shadow-sm">
          卡片管理
        </div>
      </div>

      <section className="kid-card p-6">
        <p className="text-base font-bold text-grape">Cards & Packs</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink">卡片、系列與卡包</h1>
        <p className="mt-3 text-lg font-bold leading-relaxed text-slate-500">
          Phase 4 已加入圖片上傳與 Canvas 套版。你可以先上傳圖片，系統會產生 3:4 統一規格收藏卡，再存進 Supabase Storage。
        </p>
      </section>

      <section className="mt-5 kid-card p-5">
        <h2 className="text-2xl font-black text-ink">新增系列</h2>
        <form action={createCardSeries} className="mt-4 space-y-4">
          <label className="block">
            <span className={labelClass}>系列名稱</span>
            <input name="name" className={inputClass} placeholder="小車系列" required />
          </label>
          <label className="block">
            <span className={labelClass}>封面圖片網址</span>
            <input name="cover_image_url" className={inputClass} placeholder="可先空白" />
          </label>
          <label className="block">
            <span className={labelClass}>描述</span>
            <input name="description" className={inputClass} placeholder="Tomica 與交通工具收藏" />
          </label>
          <button className="w-full rounded-[2rem] bg-grape px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
            新增系列
          </button>
        </form>
      </section>

      <section className="mt-5 kid-card p-5">
        <h2 className="text-2xl font-black text-ink">新增分類</h2>
        <form action={createCardCategory} className="mt-4 space-y-4">
          <label className="block">
            <span className={labelClass}>所屬系列</span>
            <select name="series_id" className={inputClass}>
              {series.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>分類名稱</span>
            <input name="name" className={inputClass} placeholder="工程車" required />
          </label>
          <label className="block">
            <span className={labelClass}>描述</span>
            <input name="description" className={inputClass} placeholder="可先空白" />
          </label>
          <button className="w-full rounded-[2rem] bg-ink px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
            新增分類
          </button>
        </form>
      </section>

      <section className="mt-5 kid-card p-5">
        <h2 className="text-2xl font-black text-ink">上傳圖片並套版成卡片</h2>
        <p className="mt-2 text-base font-bold leading-relaxed text-slate-500">
          選一張圖，填卡名與卡號，按「重新套版預覽」確認後送出。送出時會同時儲存原圖與套版後卡圖。
        </p>
        <form action={createCard} className="mt-4 space-y-5">
          <CardDesigner series={series} categories={categories} />
          <button className="w-full rounded-[2rem] bg-grape px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
            儲存套版卡片
          </button>
        </form>
      </section>

      <section className="mt-5 kid-card p-5">
        <h2 className="text-2xl font-black text-ink">新增卡包</h2>
        <form action={createRewardPack} className="mt-4 space-y-4">
          <label className="block">
            <span className={labelClass}>卡包名稱</span>
            <input name="name" className={inputClass} placeholder="今日驚喜卡包" required />
          </label>
          <label className="block">
            <span className={labelClass}>用途</span>
            <select name="draw_type" className={inputClass} defaultValue="daily">
              <option value="daily">每日任務</option>
              <option value="weakness">弱點挑戰</option>
              <option value="streak">連續天數</option>
              <option value="event">活動限定</option>
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>描述</span>
            <input name="description" className={inputClass} placeholder="完成每日練習後可抽" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>開始日</span>
              <input name="start_date" className={inputClass} type="date" />
            </label>
            <label className="block">
              <span className={labelClass}>結束日</span>
              <input name="end_date" className={inputClass} type="date" />
            </label>
          </div>
          <button className="w-full rounded-[2rem] bg-ink px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
            新增卡包
          </button>
        </form>
      </section>

      <section className="mt-5 kid-card p-5">
        <h2 className="text-2xl font-black text-ink">把卡片放進卡包</h2>
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
          <button className="w-full rounded-[2rem] bg-grape px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
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
                  <p className="text-sm font-black text-grape">系列</p>
                  <h2 className="text-2xl font-black text-ink">{item.name}</h2>
                  {item.description ? <p className="mt-1 text-sm font-bold text-slate-500">{item.description}</p> : null}
                </div>
                <span className="rounded-3xl bg-mint px-4 py-3 text-base font-black text-emerald-900">
                  {seriesCards.length} 張
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {seriesCards.map((card) => (
                  <div key={card.id} className="rounded-3xl bg-white/75 p-3 shadow-sm">
                    {card.rendered_card_image_url ? (
                      <img src={card.rendered_card_image_url} alt={card.name} className="aspect-[3/4] w-full rounded-2xl object-cover" />
                    ) : null}
                    <p className="mt-3 text-xs font-black text-slate-400">{card.card_no || '未編號'}</p>
                    <h3 className="mt-1 text-lg font-black text-ink">{card.name}</h3>
                    <p className="mt-1 text-sm font-bold text-grape">{rarityLabels[card.rarity] || card.rarity}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-5 space-y-4">
        {packs.map((pack) => {
          const items = packItems.filter((item) => item.reward_pack_id === pack.id);
          return (
            <div key={pack.id} className="kid-card p-5">
              <p className="text-sm font-black text-grape">卡包｜{pack.draw_type}</p>
              <h2 className="mt-1 text-2xl font-black text-ink">{pack.name}</h2>
              {pack.description ? <p className="mt-2 text-base font-bold text-slate-500">{pack.description}</p> : null}
              <div className="mt-4 space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-3xl bg-white/75 px-4 py-3 shadow-sm">
                    <span className="text-base font-black text-ink">{item.card?.name || item.card_id}</span>
                    <span className="text-sm font-black text-slate-500">庫存 {item.stock}｜權重 {item.weight}</span>
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
