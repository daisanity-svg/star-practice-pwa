import Link from 'next/link';
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
    <main className="admin-shell safe-screen">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/parent/dashboard" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-slate-600 shadow-sm">
          ← 後台
        </Link>
        <div className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-grape shadow-sm">
          學習進度
        </div>
      </div>

      <section className="kid-card p-6">
        <p className="text-base font-bold text-grape">Progress</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink">弱點與熟練度</h1>
        <p className="mt-3 text-lg font-bold leading-relaxed text-slate-500">
          這裡是家長看的分析，小孩端不顯示熟練度數字。
        </p>
      </section>

      <section className="mt-5 space-y-4">
        {progress.map((item) => {
          const percent = Math.max(0, Math.min(100, Number(item.accuracy_rate) || 0));

          return (
            <div key={item.id} className="kid-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-grape">{item.learning_item?.type?.includes('english') ? '英文' : '注音'}</p>
                  <h2 className="mt-1 text-4xl font-black text-ink">{item.learning_item?.display_text ?? item.learning_item_id}</h2>
                </div>
                <div className={`rounded-3xl px-4 py-3 text-base font-black ${item.is_weakness ? 'bg-butter text-amber-900' : 'bg-mint text-emerald-900'}`}>
                  {item.is_weakness ? '需加強' : masteryText(item.mastery_level)}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-3xl bg-white/80 p-3 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">練習</p>
                  <p className="text-xl font-black text-ink">{item.total_attempts}</p>
                </div>
                <div className="rounded-3xl bg-white/80 p-3 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">答對</p>
                  <p className="text-xl font-black text-ink">{item.correct_attempts}</p>
                </div>
                <div className="rounded-3xl bg-white/80 p-3 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">正確率</p>
                  <p className="text-xl font-black text-grape">{percent}%</p>
                </div>
              </div>

              <div className="mt-4 h-4 overflow-hidden rounded-full bg-white/80">
                <div className="h-full rounded-full bg-grape" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
