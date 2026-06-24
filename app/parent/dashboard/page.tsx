import Link from 'next/link';
import type { Route } from 'next';
import { CompanionBar } from '@/components/CompanionBar';

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
  { title: '卡片管理', description: '上傳与管理單一卡池', href: '/parent/cards', accent: 'bg-[#e6f7ff] text-[#0a7bc0]' }
];

export default async function ParentDashboardPage() {
  return (
    <main className="admin-shell safe-screen">
      <CompanionBar title="家長後台" backHref="/" backLabel="小孩端" />

      <section className="kid-card p-5">
        <p className="text-sm font-black text-[#5f6f89]">Dashboard</p>
        <h1 className="mt-2 text-[30px] font-black leading-tight text-ink">家長控制台</h1>
        <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500">
          選擇下方功能卡片，快速到達對應頁面。
        </p>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        {menuCards.map((item) => (
          <Link key={item.href} href={item.href} className="kid-card flex flex-col justify-between gap-3 p-4 active:scale-[0.99]">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black ${item.accent}`}>
              ★
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
