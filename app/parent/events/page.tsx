import Link from 'next/link';
import { PhoneFrame } from '@/components/PhoneFrame';
import { createEvent, createRewardPack } from '@/lib/actions/events';
import { getActiveEvent, getRewardPackSummaries } from '@/lib/data/events';

const inputClass = 'w-full rounded-3xl border border-white/80 bg-white/90 px-4 py-3 text-base font-bold text-ink outline-none ring-grape/20 focus:ring-4';
const labelClass = 'text-sm font-black text-slate-500';

export default async function ParentEventsPage() {
  const [activeEvent, packs] = await Promise.all([getActiveEvent(), getRewardPackSummaries()]);

  return (
    <PhoneFrame>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/parent/dashboard" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-slate-600 shadow-sm">
          ← 後台
        </Link>
        <Link href="/" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-grape shadow-sm">
          小孩端
        </Link>
      </div>

      <section className="kid-card p-6">
        <p className="text-base font-bold text-grape">Events</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink">活動與卡包輪替</h1>
        <p className="mt-3 text-base font-bold leading-relaxed text-slate-500">
          用主題週、限定卡包與新卡提示，讓練習每天都有新鮮感。
        </p>
      </section>

      <section className="mt-5 rounded-[32px] bg-grape p-5 text-white shadow-sm">
        <p className="text-sm font-black opacity-80">目前小孩端提示</p>
        <h2 className="mt-2 text-2xl font-black">{activeEvent?.name ?? '尚未啟用活動'}</h2>
        <p className="mt-2 text-base font-bold leading-relaxed opacity-90">
          {activeEvent?.banner_text ?? '可以新增一個活動，讓首頁顯示今天可以抽什麼卡包。'}
        </p>
        {activeEvent?.reward_pack?.name ? (
          <p className="mt-4 rounded-3xl bg-white/20 px-4 py-3 text-base font-black">
            啟用卡包：{activeEvent.reward_pack.name}
          </p>
        ) : null}
      </section>

      <section className="mt-5 kid-card p-5">
        <h2 className="text-2xl font-black text-ink">新增活動</h2>
        <form action={createEvent} className="mt-4 space-y-3">
          <div>
            <label className={labelClass}>活動名稱</label>
            <input name="name" className={inputClass} placeholder="例如：小車週" />
          </div>
          <div>
            <label className={labelClass}>首頁提示文字</label>
            <input name="banner_text" className={inputClass} placeholder="這週是小車週！完成練習可以抽小車卡包！" />
          </div>
          <div>
            <label className={labelClass}>活動說明</label>
            <textarea name="description" className={inputClass} placeholder="可選填，給家長後台辨識用。" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>開始日期</label>
              <input name="start_date" type="date" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>結束日期</label>
              <input name="end_date" type="date" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>指定卡包</label>
            <select name="reward_pack_id" className={inputClass}>
              <option value="">不指定</option>
              {packs.map((pack) => (
                <option key={pack.id} value={pack.id}>
                  {pack.name}
                </option>
              ))}
            </select>
          </div>
          <input type="hidden" name="event_type" value="theme_week" />
          <label className="flex items-center gap-3 rounded-3xl bg-white/70 px-4 py-3 text-base font-black text-ink">
            <input name="is_active" type="checkbox" defaultChecked className="h-5 w-5" />
            啟用這個活動
          </label>
          <button className="w-full rounded-3xl bg-grape px-5 py-4 text-lg font-black text-white shadow-sm active:scale-[0.99]">
            新增活動
          </button>
        </form>
      </section>

      <section className="mt-5 kid-card p-5">
        <h2 className="text-2xl font-black text-ink">新增卡包</h2>
        <form action={createRewardPack} className="mt-4 space-y-3">
          <div>
            <label className={labelClass}>卡包名稱</label>
            <input name="name" className={inputClass} placeholder="例如：週末限定卡包" />
          </div>
          <div>
            <label className={labelClass}>卡包說明</label>
            <textarea name="description" className={inputClass} placeholder="例如：連續完成練習後可抽。" rows={3} />
          </div>
          <div>
            <label className={labelClass}>卡包類型</label>
            <select name="draw_type" className={inputClass} defaultValue="daily">
              <option value="daily">每日任務</option>
              <option value="weakness">弱點挑戰</option>
              <option value="streak">連續天數</option>
              <option value="event">活動限定</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>開始日期</label>
              <input name="start_date" type="date" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>結束日期</label>
              <input name="end_date" type="date" className={inputClass} />
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-3xl bg-white/70 px-4 py-3 text-base font-black text-ink">
            <input name="is_active" type="checkbox" defaultChecked className="h-5 w-5" />
            啟用這個卡包
          </label>
          <button className="w-full rounded-3xl bg-grape px-5 py-4 text-lg font-black text-white shadow-sm active:scale-[0.99]">
            新增卡包
          </button>
        </form>
      </section>

      <section className="mt-5 space-y-3">
        <h2 className="px-1 text-2xl font-black text-ink">卡包庫存總覽</h2>
        {packs.map((pack) => (
          <div key={pack.id} className="kid-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-ink">{pack.name}</h3>
                <p className="mt-1 text-sm font-bold text-slate-500">{pack.description ?? '尚未填寫說明'}</p>
              </div>
              <span className="rounded-full bg-butter px-3 py-2 text-sm font-black text-ink">{pack.draw_type ?? 'daily'}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-white/70 p-4">
                <p className="text-sm font-bold text-slate-500">卡片數</p>
                <p className="text-2xl font-black text-grape">{pack.card_count}</p>
              </div>
              <div className="rounded-3xl bg-white/70 p-4">
                <p className="text-sm font-bold text-slate-500">剩餘庫存</p>
                <p className="text-2xl font-black text-grape">{pack.remaining_stock}</p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </PhoneFrame>
  );
}
