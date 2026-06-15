import Link from 'next/link';
import { PhoneFrame } from '@/components/PhoneFrame';
import { getPracticeSettings } from '@/lib/data/settings';

const rowClass = 'rounded-[28px] bg-white/75 p-4 shadow-sm';

export default async function ParentSettingsPage() {
  const settings = await getPracticeSettings();

  return (
    <PhoneFrame variant="admin">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/parent/dashboard" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-slate-600 shadow-sm">
          ← 後台
        </Link>
        <Link href="/practice" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-grape shadow-sm">
          測練習
        </Link>
      </div>

      <section className="kid-card p-6">
        <p className="text-base font-bold text-grape">Daily Rules</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink">每日任務設定</h1>
        <p className="mt-3 text-base font-bold leading-relaxed text-slate-500">
          第一版採安全預設值：每天 10 題，新題、複習題與弱點題自動混合。
        </p>
      </section>

      <section className="mt-5 grid gap-3">
        <div className={rowClass}>
          <p className="text-sm font-black text-slate-500">每日題數</p>
          <p className="mt-1 text-3xl font-black text-ink">{settings.daily_total_questions} 題</p>
        </div>
        <div className={rowClass}>
          <p className="text-sm font-black text-slate-500">出題比例</p>
          <p className="mt-2 text-xl font-black text-ink">新題 {settings.new_item_ratio}%｜複習 {settings.review_item_ratio}%｜弱點 {settings.weakness_item_ratio}%</p>
        </div>
        <div className={rowClass}>
          <p className="text-sm font-black text-slate-500">每日抽卡限制</p>
          <p className="mt-1 text-3xl font-black text-ink">{settings.daily_draw_limit} 次</p>
        </div>
        <div className={rowClass}>
          <p className="text-sm font-black text-slate-500">加碼條件</p>
          <p className="mt-2 text-xl font-black text-ink">正確率 {settings.min_correct_rate_for_bonus}% 或弱點答對 {settings.weakness_bonus_required} 題</p>
        </div>
      </section>
    </PhoneFrame>
  );
}
