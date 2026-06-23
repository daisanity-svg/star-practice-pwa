import Link from 'next/link';
import { getPracticeSettings } from '@/lib/data/settings';
import { getPracticeMode } from '@/lib/config/app-mode';
import { setPracticeMode } from '@/lib/actions/rewards';
import { AdminActionForm } from '@/components/AdminActionForm';

const rowClass = 'rounded-[28px] bg-white/75 p-4 shadow-sm';

export default async function ParentSettingsPage() {
  const settings = await getPracticeSettings();
  const practiceMode = await getPracticeMode();

  return (
    <main className="admin-shell safe-screen">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/parent/dashboard" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-slate-600 shadow-sm">
          ← 後台
        </Link>
        <Link href="/practice" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-grape shadow-sm">
          測練習
        </Link>
      </div>

      <section className="kid-card p-6">
        <p className="text-base font-bold text-grape">設定</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink">遊戲設定</h1>
        <p className="mt-3 text-base font-bold leading-relaxed text-slate-500">
          調整練習模式與每日任務規則。
        </p>
      </section>

      <section className="mt-5 grid gap-5">
        <AdminActionForm action={setPracticeMode} className={rowClass}>
          <p className="text-sm font-black text-slate-500">目前模式</p>
          <p className="mt-1 text-3xl font-black text-ink">{practiceMode === 'test' ? '測試模式' : '正式模式'}</p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            測試模式可重複產生題目與測抽卡；正式模式會保留今日進度並完成後前往打開小禮物。
          </p>
          <input type="hidden" name="practice_mode" value={practiceMode === 'test' ? 'production' : 'test'} />
          <button type="submit" className="mt-4 w-full rounded-2xl bg-purple-600 px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] text-base font-black text-white shadow-sm transition hover:bg-purple-700 active:scale-[0.99]">
            {practiceMode === 'test' ? '切換為正式模式' : '切換為測試模式'}
          </button>
        </AdminActionForm>

        <div className="grid gap-3 lg:grid-cols-2">
          <section className={rowClass}>
            <p className="text-sm font-black text-slate-500">每日題數</p>
            <p className="mt-1 text-3xl font-black text-ink">{settings.daily_total_questions} 題</p>
          </section>
          <section className={rowClass}>
            <p className="text-sm font-black text-slate-500">出題比例</p>
            <p className="mt-2 text-xl font-black text-ink">新題 {settings.new_item_ratio}%｜複習 {settings.review_item_ratio}%｜弱點 {settings.weakness_item_ratio}%</p>
          </section>
          <section className={rowClass}>
            <p className="text-sm font-black text-slate-500">每日抽卡限制</p>
            <p className="mt-1 text-3xl font-black text-ink">{settings.daily_draw_limit} 次</p>
          </section>
          <section className={rowClass}>
            <p className="text-sm font-black text-slate-500">加碼條件</p>
            <p className="mt-2 text-xl font-black text-ink">正確率 {settings.min_correct_rate_for_bonus}% 或弱點答對 {settings.weakness_bonus_required} 題</p>
          </section>
        </div>
      </section>
    </main>
  );
}
