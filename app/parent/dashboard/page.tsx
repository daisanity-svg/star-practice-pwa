import Link from 'next/link';
import type { Route } from 'next';
import { PhoneFrame } from '@/components/PhoneFrame';
import { dashboardStats } from '@/lib/demo-data';
import { getActiveEvent, getRewardPackSummaries } from '@/lib/data/events';

type AdminSection = {
  title: string;
  description: string;
  icon: string;
  href: Route;
};

const adminSections: AdminSection[] = [
  { title: '學習項目', description: '管理 ㄅ、ㄇ、A、B 與多記憶詞', icon: '📚', href: '/parent/learning' },
  { title: '學習進度', description: '查看熟練度、弱點與容易忘的項目', icon: '🔁', href: '/parent/progress' },
  { title: '卡片獎池', description: '新增布麗狗、小車、節日限定卡包', icon: '🃏', href: '/parent/cards' },
  { title: '活動卡包', description: '設定主題週、限定卡包與首頁提示', icon: '🎁', href: '/parent/events' },
  { title: '題型模板', description: '管理自動出題的句型與模式', icon: '🧩', href: '/parent/templates' },
  { title: '今日規則', description: '查看每日題數、比例與抽卡條件', icon: '⚙️', href: '/parent/settings' }
];

export default async function ParentDashboardPage() {
  const [activeEvent, packs] = await Promise.all([getActiveEvent(), getRewardPackSummaries()]);
  const activePackCount = packs.filter((pack) => pack.is_active !== false).length;
  const remainingStock = packs.reduce((sum, pack) => sum + pack.remaining_stock, 0);

  return (
    <PhoneFrame variant="admin">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-slate-600 shadow-sm">
          ← 小孩端
        </Link>
        <Link href="/parent/login" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-grape shadow-sm">
          後台
        </Link>
      </div>

      <section className="kid-card p-6">
        <p className="text-base font-bold text-grape">Dashboard</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink">今日學習與卡包總覽</h1>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {dashboardStats.map((stat) => (
            <div key={stat.label} className="rounded-3xl bg-white/80 p-4 shadow-sm">
              <p className="text-sm font-bold text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-black text-grape">{stat.value}</p>
            </div>
          ))}
          <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-500">啟用卡包</p>
            <p className="mt-1 text-2xl font-black text-grape">{activePackCount}</p>
          </div>
          <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-500">剩餘庫存</p>
            <p className="mt-1 text-2xl font-black text-grape">{remainingStock}</p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[32px] bg-grape p-5 text-white shadow-sm">
        <p className="text-sm font-black opacity-80">目前活動</p>
        <h2 className="mt-2 text-2xl font-black">{activeEvent?.name ?? '尚未設定活動'}</h2>
        <p className="mt-2 text-base font-bold leading-relaxed opacity-90">
          {activeEvent?.banner_text ?? '到活動卡包頁建立主題週，讓小孩端首頁有新鮮感提示。'}
        </p>
        <Link href="/parent/events" className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-base font-black text-grape">
          管理活動卡包
        </Link>
      </section>

      <section className="mt-5 space-y-3">
        {adminSections.map((section) => (
          <Link key={section.title} href={section.href} className="kid-card flex items-center gap-4 p-4 active:scale-[0.99]">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-butter text-2xl">
              {section.icon}
            </div>
            <div>
              <h2 className="text-xl font-black text-ink">{section.title}</h2>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">{section.description}</p>
            </div>
          </Link>
        ))}
      </section>
    </PhoneFrame>
  );
}
