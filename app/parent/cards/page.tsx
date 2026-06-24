import Link from 'next/link';
import { createCard } from '@/lib/actions/rewards';
import { getCardSeries } from '@/lib/data/admin-rewards';
import { CompanionBar } from '@/components/CompanionBar';

const inputClass = 'mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100';
const labelClass = 'text-sm font-bold text-slate-600';

export default async function ParentCardsPage() {
  const series = await getCardSeries();

  return (
    <main className="admin-shell safe-screen">
      <CompanionBar title="卡片管理" backHref="/" backLabel="小孩端" />

      <section className="kid-card p-5">
        <p className="text-sm font-black text-[#5f6f89]">Cards</p>
        <h1 className="mt-2 text-[30px] font-black leading-tight text-ink">卡片管理</h1>
        <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500">
          上傳單張卡片圖片，系統會自動加入唯一卡池。
        </p>
      </section>

      <section className="mt-5 kid-card p-5">
        <h2 className="text-xl font-black text-ink">新增卡片</h2>
        <form action={createCard} className="mt-4 space-y-4">
          <label className="block">
            <span className={labelClass}>所屬系列</span>
            <select name="series_id" className={inputClass} defaultValue={series[0]?.id || ''}>
              {series.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>卡片名稱</span>
            <input name="name" className={inputClass} placeholder="紅色消防車" required />
          </label>

          <label className="block">
            <span className={labelClass}>卡號（可選）</span>
            <input name="card_no" className={inputClass} placeholder="CAR-001" />
          </label>

          <label className="block">
            <span className={labelClass}>上傳圖片</span>
            <input name="source_image_file" type="file" accept="image/*" className={inputClass} required />
          </label>

          <button className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-base font-black text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]">
            建立單張卡片
          </button>
        </form>
      </section>

      <section className="mt-5">
        <Link href="/parent/dashboard" className="inline-flex rounded-full bg-white/80 px-4 py-3 text-sm font-black text-slate-600 shadow-sm">
          ← 返回家長後台
        </Link>
      </section>
    </main>
  );
}
