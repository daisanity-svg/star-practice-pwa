import Link from 'next/link';
import type { Route } from 'next';
import { KidTopBar } from '@/components/KidTopBar';
import { resetV5GameState } from '@/lib/actions/admin';
import { getPracticeMode } from '@/lib/config/app-mode';

const sections = [
  { title: '學習項目', description: '管理 ㄅ、ㄇ、A、B 與多記憶詞', href: '/parent/learning' },
  { title: '學習進度', description: '查看熟練度與容易忘記的項目', href: '/parent/progress' },
  { title: '卡片獎池', description: '新增卡片與補卡包', href: '/parent/cards' },
  { title: '活動卡包', description: '設定主題與前台提示', href: '/parent/events' },
  { title: '題型模板', description: '管理自動出題句型', href: '/parent/templates' },
  { title: '今日規則', description: '每日題數、抽卡條件', href: '/parent/settings' },
];

export default async function ParentDashboardPage() {
  const mode = await getPracticeMode();
  const isTest = mode === 'test';

  return (
    <div className="safe-screen">
      <KidTopBar title="家長後台" backHref="/" backLabel="小孩端" />
      <main className="kid-shell">
        <section className="kid-card">
          <p className="kid-card-label">Dashboard</p>
          <h1 className="kid-card-title">今天學習總覽</h1>
          <p className="kid-card-subtitle">從這裡快速前往各項設定</p>
        </section>

        <section className="kid-card" style={{ marginTop: 24 }}>
          <p className="kid-card-label">目前模式</p>
          <h2 className="kid-card-title">{isTest ? '測試模式' : '正式模式'}</h2>
          <p className="kid-card-subtitle">
            {isTest
              ? '測試模式可重複練習與抽卡，不會影響正式紀錄。'
              : '正式模式每日一抽，並記錄正式練習資料。'}
          </p>
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

        <section className="kid-card" style={{ marginTop: 24 }}>
          <p className="kid-card-label">管理工具</p>
          <h2 className="kid-card-title">V5 遊戲資料重置</h2>
          <p className="kid-card-subtitle">將星星幣、能量、成長、親密度、Boss 勝利、冒險進度與抽卡紀錄全部歸零。</p>
          <form action={resetV5GameState} className="mt-4">
            <button
              type="submit"
              className="kid-yellow-button flex min-h-[54px] items-center justify-center rounded-[24px] text-lg font-black active:scale-[0.99]"
            >
              重置所有遊戲進度
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
