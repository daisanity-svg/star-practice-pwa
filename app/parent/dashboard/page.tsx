import Link from 'next/link';
import type { Route } from 'next';
import { KidTopBar } from '@/components/KidTopBar';

const sections = [
  { title: '學習項目', description: '管理 ㄅ、ㄇ、A、B 與多記憶詞', href: '/parent/learning' },
  { title: '學習進度', description: '查看熟練度與容易忘記的項目', href: '/parent/progress' },
  { title: '卡片獎池', description: '新增卡片與補卡包', href: '/parent/cards' },
  { title: '活動卡包', description: '設定主題與前台提示', href: '/parent/events' },
  { title: '題型模板', description: '管理自動出題句型', href: '/parent/templates' },
  { title: '今日規則', description: '每日題數、抽卡條件', href: '/parent/settings' },
];

export default function ParentDashboardPage() {
  return (
    <div className="safe-screen">
      <KidTopBar title="家長後台" backHref="/" backLabel="小孩端" />
      <main className="kid-shell">
        <section className="kid-card">
          <p className="kid-card-label">Dashboard</p>
          <h1 className="kid-card-title">今天學習總覽</h1>
          <p className="kid-card-subtitle">從這裡快速前往各項設定</p>
        </section>

        <section className="kid-stack">
          {sections.map((item) => (
            <Link key={item.href} href={item.href as Route} className="kid-quest-link">
              <span className="kid-quest-pin">
                <span className="kid-quest-num">{item.title[0]}</span>
              </span>
              <span className="kid-quest-body">
                <span className="kid-quest-title">{item.title}</span>
                <span className="kid-quest-meta">{item.description}</span>
              </span>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
