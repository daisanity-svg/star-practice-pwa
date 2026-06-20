import Link from 'next/link';
import type { Route } from 'next';
import { KidTopBar } from '@/components/KidTopBar';
import { getLearningProgress } from '@/lib/data/learning';

function masteryText(level: number) {
  if (level <= 0) return '未學習';
  if (level === 1) return '初學';
  if (level === 2) return '練習中';
  if (level === 3) return '基本熟悉';
  if (level === 4) return '熟練';
  return '已掌握';
}

export default async function ParentProgressPage() {
  const progress = await getLearningProgress();
  return (
    <div className="safe-screen">
      <KidTopBar title="學習進度" backHref="/parent/dashboard" />
      <main className="kid-shell">
        <section className="kid-card">
          <p className="kid-card-label">Progress</p>
          <h1 className="kid-card-title">弱點與熟練度</h1>
          <p className="kid-card-subtitle">小孩端不顯示這些數字。</p>
        </section>

        <section className="kid-stack">
          {progress.map((item) => {
            const percent = Math.max(0, Math.min(100, Number(item.accuracy_rate) || 0));
            return (
              <div key={item.id} className="kid-card">
                <div className="kid-status-row">
                  <div>
                    <p className="kid-card-label">
                      {item.learning_item?.type?.includes('english') ? '英文' : '注音'}
                    </p>
                    <h2 className="kid-card-title" style={{ marginTop: 6 }}>
                      {item.learning_item?.display_text ?? item.learning_item_id}
                    </h2>
                  </div>
                  <span className={`kid-pill ${item.is_weakness ? 'kid-pill-warn' : 'kid-pill-ok'}`}>
                    {item.is_weakness ? '需加強' : masteryText(item.mastery_level)}
                  </span>
                </div>

                <div className="kid-stats" style={{ marginTop: 14 }}>
                  <div className="kid-stat-box">
                    <span className="kid-stat-label">練習</span>
                    <span className="kid-stat-value">{item.total_attempts}</span>
                  </div>
                  <div className="kid-stat-box">
                    <span className="kid-stat-label">答對</span>
                    <span className="kid-stat-value">{item.correct_attempts}</span>
                  </div>
                  <div className="kid-stat-box">
                    <span className="kid-stat-label">正確率</span>
                    <span className="kid-stat-value">{percent}%</span>
                  </div>
                </div>

                <div className="kid-progress-track" style={{ marginTop: 14 }}>
                  <div className="kid-progress-fill" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
