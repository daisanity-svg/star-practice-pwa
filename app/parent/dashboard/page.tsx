import Link from 'next/link';
import type { Route } from 'next';
import { CompanionBar } from '@/components/CompanionBar';
import { getDashboardStatus } from '@/lib/data/dashboard';
import type { DashboardStatus } from '@/lib/data/dashboard';

type MenuCard = {
  title: string;
  description: string;
  href: Route;
  accent: string;
};

const menuCards: MenuCard[] = [
  { title: '學習項目', description: '管理注音、英文與記憶詞', href: '/parent/learning', accent: 'bg-[#e9f4ff] text-[#1766e6]' },
  { title: '學習進度', description: '熟練度、弱點與正確率', href: '/parent/progress', accent: 'bg-[#e8f8ef] text-[#0d7a4b]' },
  { title: '題型模板', description: '管理自動出題句型', href: '/parent/templates', accent: 'bg-[#fff4e5] text-[#b45f1a]' },
  { title: '每日規則', description: '題數、比例與抽卡條件', href: '/parent/settings', accent: 'bg-[#f3e8ff] text-[#7c3aed]' },
  { title: '卡片管理', description: '上傳與管理單張卡池', href: '/parent/cards', accent: 'bg-[#e6f7ff] text-[#0a7bc0]' },
  { title: '遊戲設定', description: '切換模式與重置遊戲進度', href: '/parent/settings', accent: 'bg-[#fce7f3] text-[#be185d]' }
];

function StatusCard({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent: string }) {
  return (
    <div className={`kid-card flex flex-col justify-between gap-2 rounded-[26px] p-4 active:scale-[0.99] ${accent}`}>
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-3xl font-black text-ink">{value}</p>
      {hint ? <p className="text-xs font-bold text-slate-500">{hint}</p> : null}
    </div>
  );
}

export default async function ParentDashboardPage() {
  const status: DashboardStatus = await getDashboardStatus();

  return (
    <main className="admin-shell safe-screen">
      <CompanionBar title="家長後台" backHref="/" backLabel="小孩端" />

      <section className="kid-card p-5">
        <p className="text-sm font-black text-[#5f6f89]">Dashboard</p>
        <h1 className="mt-2 text-[30px] font-black leading-tight text-ink">家長控制台</h1>
        <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500">
          查看今天狀況，或快速進入功能。
        </p>
      </section>

      <section className="mt-3">
        <p className="text-center font-mono text-xs text-slate-400" style={{ padding: '4px 0' }}>
          {status.isTestMode ? '測試模式' : '正式模式'} · {status.childId ? `孩子：${status.childId.slice(0, 8)}…` : '尚未建立孩子資料'}
        </p>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <StatusCard
          label="今日練習"
          value={status.todayPracticeDone ? '已完成' : '未完成'}
          hint={status.todayPracticeDone ? '快去領獎勵' : '還沒去練習'}
          accent={status.todayPracticeDone ? 'bg-[#e8f8ef] text-[#0d7a4b]' : 'bg-[#fff4e5] text-[#b45f1a]'}
        />
        <StatusCard
          label="今日抽卡"
          value={status.todayDrawn ? '已抽' : '未抽'}
          hint={status.pendingDrawCount > 0 ? `還有 ${status.pendingDrawCount} 張可抽` : '卡池已清空'}
          accent={status.todayDrawn ? 'bg-[#e8f8ef] text-[#0d7a4b]' : 'bg-[#f3e8ff] text-[#7c3aed]'}
        />
        <StatusCard
          label="收藏卡數"
          value={`${status.inventoryCount}`}
          hint={`共 ${status.totalCards} 張卡`}
          accent="bg-[#e9f4ff] text-[#1766e6]"
        />
        <StatusCard
          label="待抽卡數"
          value={`${status.pendingDrawCount}`}
          hint={status.pendingDrawCount > 0 ? '還有新卡可以抽' : '沒有新卡'}
          accent="bg-[#fff4e5] text-[#b45f1a]"
        />
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        {menuCards.map((item) => (
          <Link key={item.href} href={item.href} className="kid-card flex flex-col justify-between gap-3 p-4 active:scale-[0.99]">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black ${item.accent}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-ink">{item.title}</h2>
              <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">{item.description}</p>
            </div>
            <span className="text-right text-xs font-black text-[#9aa6b8]">前往 →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
