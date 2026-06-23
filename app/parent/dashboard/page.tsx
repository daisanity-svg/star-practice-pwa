import Link from 'next/link';
import type { Route } from 'next';
import { resetTodayRecord, resetCardRecord, resetGlobal } from '@/lib/actions/admin';

async function resetToday() {
  'use server';
  await resetTodayRecord();
}

async function resetCards() {
  'use server';
  await resetCardRecord();
}

async function resetAll() {
  'use server';
  await resetGlobal();
}

export default async function ParentDashboardPage() {
  const commitHash = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_COMMIT_HASH
    ? process.env.NEXT_PUBLIC_COMMIT_HASH
    : 'local';

  return (
    <main className="admin-shell safe-screen">
      <div className="space-y-5">
        <section className="rounded-[36px] border border-blue-100 bg-white p-6 shadow-[0_16px_42px_rgba(18,48,79,0.08)]">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-500">家長後台</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">小光獸學習後台</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            這裡管理孩子的每日練習、題材與小光獸成長。
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { label: '今日卡片', description: '上傳與管理每日卡包內容', href: '/parent/cards' as Route, icon: '🎴' },
            { label: '生活題材', description: '新增今天想練的題材，系統會記住', href: '/parent/templates' as Route, icon: '📝' },
            { label: '學習分析', description: '看錯誤次數與常錯題型', href: '/parent/progress' as Route, icon: '📊' },
            { label: '收藏圖鑑', description: '孩子收集到的卡片', href: '/collection' as Route, icon: '🗂️' },
            { label: '遊戲設定', description: '模式與每日任務設定', href: '/parent/settings' as Route, icon: '⚙️' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-[28px] border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <p className="text-sm font-black text-blue-500">{item.icon}</p>
              <h2 className="mt-2 text-lg font-black text-slate-950">{item.label}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
            </Link>
          ))}
        </div>

        <section className="rounded-[36px] border border-amber-100 bg-white p-5 shadow-[0_16px_42px_rgba(18,48,79,0.08)]">
          <p className="text-sm font-black text-amber-600">⚠️ 重置</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">分層重置</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            請選擇要 reset 的範圍。每層都會再確認，請務必看清楚說明。
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <form action={resetToday}>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-sm font-black text-amber-700">今日紀錄重置</p>
                <p className="mt-2 text-sm font-medium text-amber-900">
                  只歸零「今天練習了幾題」以及「今天有沒有抽卡」。星星幣、能量、小光獸成長、親密度都保留。
                </p>
                <button
                  type="submit"
                  className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-amber-700 shadow-sm transition hover:bg-amber-100"
                >
                  確認重置
                </button>
              </div>
            </form>
            <form action={resetCards}>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-sm font-black text-amber-700">卡片紀錄重置</p>
                <p className="mt-2 text-sm font-medium text-amber-900">
                  只清除本地已收藏卡片的 cache。資料庫中的孩子卡片 necesidades（child_card_inventory）與抽卡紀錄（reward_draw_logs）不會自動刪除；如要完整重置，請手動執行建議 SQL。
                </p>
                <button
                  type="submit"
                  className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-amber-700 shadow-sm transition hover:bg-amber-100"
                >
                  確認重置
                </button>
              </div>
            </form>
            <form action={resetAll}>
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="text-sm font-black text-red-700">全域重置</p>
                <p className="mt-2 text-sm font-medium text-red-900">
                  全部遊戲進度（星星、能量、成長、親密度、練習、冒險、收藏）都會歸零。
                </p>
                <button
                  type="submit"
                  className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-red-700 shadow-sm transition hover:bg-red-100"
                >
                  確認重置
                </button>
              </div>
            </form>
          </div>
        </section>

        <div style={{ textAlign: 'center', fontSize: '10px', opacity: 0.5, padding: '8px 0' }}>
          V5.1 · {commitHash}
        </div>
      </div>
    </main>
  );
}
