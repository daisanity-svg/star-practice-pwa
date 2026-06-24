import Link from 'next/link';
import { getLearningProgress } from '@/lib/data/learning';
import { CompanionBar } from '@/components/CompanionBar';

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
      <CompanionBar title="學習儀表板" backHref="/" backLabel="小孩端" />
      <section className="kid-card p-5">
        <p className="text-sm font-black text-[#5f6f89]">Progress</p>
        <h1 className="mt-2 text-[30px] font-black leading-tight text-ink">學習儀表板</h1>
        <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500">
          符號、記憶詞與錯誤次數一覽。
        </p>
      </section>

      <section className="mt-5 space-y-4">
        {progress.map((item) => {
          const wrongCount = Math.max(0, Number(item.total_attempts || 0) - Number(item.correct_attempts || 0));

          return (
            <div key={item.id} className="kid-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-grape">
                    {item.learning_item?.type?.includes('english') ? '英文' : '注音'}
                  </p>
                  <h2 className="mt-1 text-4xl font-black text-ink">{item.learning_item?.content ?? item.learning_item_id}</h2>
                </div>
                <div className="rounded-3xl bg-butter px-4 py-3 text-base font-black text-amber-900">
                  {wrongCount} 次錯誤
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">記憶詞</p>
                  <p className="mt-1 text-xl font-black text-ink">{item.learning_item?.display_text ?? '-'}</p>
                </div>
                <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">總作答</p>
                  <p className="mt-1 text-xl font-black text-ink">{item.total_attempts}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
