import Link from 'next/link';
import { BatchCardUploader } from '@/components/BatchCardUploader';
import { createBatchCards, deleteCard } from '@/lib/actions/rewards';
import { getAdminRewardData } from '@/lib/data/admin-rewards';
import { AdminActionForm } from '@/components/AdminActionForm';

const cardClass = 'rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_16px_42px_rgba(18,48,79,0.08)]';

type AdminData = Awaited<ReturnType<typeof getAdminRewardData>>;

export default async function ParentCardsPage() {
  const { cards: cardsRaw } = await getAdminRewardData();
  const cards: AdminData['cards'] = Array.isArray(cardsRaw) ? (cardsRaw as AdminData['cards']) : [];

  return (
    <main className="admin-shell safe-screen">
      <div className="space-y-5">
        <header className="flex flex-col gap-4 rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_16px_42px_rgba(18,48,79,0.08)]">
          <div>
            <Link href="/parent/dashboard" className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100">
              ← 回後台
            </Link>
            <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-blue-500">Today Reward</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">今日卡片管理</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
              今天孩子完成練習後會從單一每日卡包抽卡。這裡只管理「上傳卡片」與「卡片清單」。
            </p>
          </div>
        </header>

        <section className={cardClass}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">批次上傳卡片</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">上傳圖片並建立卡片，自動歸入今日卡包。</p>
            </div>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">單一每日卡包</span>
          </div>
          <div className="mt-5">
            <AdminActionForm action={createBatchCards} className="pb-[calc(env(safe-area-inset-bottom)+96px)]">
              <BatchCardUploader pools={[]} />
              <button type="submit" className="mt-5 w-full rounded-2xl bg-blue-600 px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] text-base font-black text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60">
                批次加入卡片／提交中會鎖定
              </button>
            </AdminActionForm>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-2xl font-black text-slate-950">卡片清單</h2>
          <p className="mt-2 text-sm text-slate-500">卡片依序號排列；多餘的測試卡可在此刪除。</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {cards.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 p-6 text-center ring-1 ring-slate-200 sm:col-span-2 xl:col-span-3">
                <h3 className="text-xl font-black text-slate-900">還沒有卡片</h3>
                <p className="mt-2 text-sm text-slate-500">請先使用上方批次上傳。</p>
              </div>
            ) : (
              cards
                .slice()
                .sort((a, b) => (a.card_no || '').localeCompare(b.card_no || ''))
                .map((card) => (
                  <div key={card.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black text-blue-500">{card.card_no || '未編號'}｜{card.rarity}</p>
                    <h3 className="mt-1 line-clamp-2 text-lg font-black text-slate-950">{card.name}</h3>
                    <AdminActionForm action={deleteCard} confirmMessage="確定要刪除這張卡片嗎？收納包與抽卡紀錄中的關聯也會移除。" className="mt-3">
                      <input type="hidden" name="card_id" value={card.id} />
                      <button className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-red-600 ring-1 ring-red-100 transition hover:bg-red-50 disabled:opacity-60">刪除卡片</button>
                    </AdminActionForm>
                  </div>
                ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
