import Link from 'next/link';
import { PhoneFrame } from '@/components/PhoneFrame';
import { dashboardStats } from '@/lib/demo-data';

const adminSections = [
  { title: '學習項目', description: '管理 ㄅ、ㄇ、A、B 等練習主項目', icon: '📚' },
  { title: '記憶詞', description: '設定爸爸ㄅ、拜拜ㄅ、Apple 的 A', icon: '🧠' },
  { title: '卡片系列', description: '新增小車、狗狗、植物朋友系列', icon: '🃏' },
  { title: '卡包庫存', description: '管理抽卡池、庫存與活動卡包', icon: '🎁' },
  { title: '弱點清單', description: '查看容易忘、常答錯的項目', icon: '🔁' },
  { title: '今日規則', description: '設定題數、比例與抽卡條件', icon: '⚙️' }
];

export default function ParentDashboardPage() {
  return (
    <PhoneFrame>
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
        </div>
      </section>

      <section className="mt-5 space-y-3">
        {adminSections.map((section) => (
          <div key={section.title} className="kid-card flex items-center gap-4 p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-butter text-2xl">
              {section.icon}
            </div>
            <div>
              <h2 className="text-xl font-black text-ink">{section.title}</h2>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">{section.description}</p>
            </div>
          </div>
        ))}
      </section>
    </PhoneFrame>
  );
}
