import Link from 'next/link';
import { PhoneFrame } from '@/components/PhoneFrame';
import { createQuestionTemplate } from '@/lib/actions/learning';
import { getQuestionTemplates } from '@/lib/data/templates';

const inputClass = 'mt-2 w-full rounded-3xl border-0 bg-white/90 px-4 py-4 text-lg font-bold text-ink shadow-sm outline-none ring-2 ring-transparent focus:ring-grape/30';
const labelClass = 'text-sm font-black text-slate-500';

const modes = [
  { value: 'intro', label: '認識題' },
  { value: 'choice', label: '選擇題' },
  { value: 'listening', label: '聽音題' },
  { value: 'tracing', label: '描寫題' },
  { value: 'recall', label: '回想題' },
  { value: 'sorting', label: '分類題' }
];

export default async function ParentTemplatesPage() {
  const templates = await getQuestionTemplates();

  return (
    <PhoneFrame>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/parent/dashboard" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-slate-600 shadow-sm">
          ← 後台
        </Link>
        <div className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-grape shadow-sm">
          題型模板
        </div>
      </div>

      <section className="kid-card p-6">
        <p className="text-base font-bold text-grape">Question Templates</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink">自動出題句型</h1>
        <p className="mt-3 text-lg font-bold leading-relaxed text-slate-500">
          後台只要建立模板，系統就能把 ㄅ、爸爸、拜拜、Apple 等素材自動組成題目。
        </p>
      </section>

      <section className="mt-5 kid-card p-5">
        <h2 className="text-2xl font-black text-ink">新增題型模板</h2>
        <form action={createQuestionTemplate} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>類型</span>
              <select name="type" className={inputClass} defaultValue="bopomofo">
                <option value="bopomofo">注音</option>
                <option value="english">英文</option>
                <option value="all">通用</option>
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>題型</span>
              <select name="practice_mode" className={inputClass} defaultValue="choice">
                {modes.map((mode) => <option key={mode.value} value={mode.value}>{mode.label}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>模板文字</span>
            <input name="template_text" className={inputClass} placeholder="{keyword} 的 {content} 在哪裡？" required />
          </label>

          <label className="block">
            <span className={labelClass}>語音提示文字</span>
            <input name="instruction_audio_text" className={inputClass} placeholder="找找看，{keyword} 的 {content}" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>答案模式</span>
              <select name="answer_mode" className={inputClass} defaultValue="single_choice">
                <option value="display">顯示</option>
                <option value="single_choice">單選</option>
                <option value="multi_choice">多選</option>
                <option value="tracing">描寫</option>
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>難度</span>
              <input name="difficulty_level" className={inputClass} type="number" min="1" max="5" defaultValue="1" />
            </label>
          </div>

          <button className="w-full rounded-[2rem] bg-grape px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
            新增模板
          </button>
        </form>
      </section>

      <section className="mt-5 space-y-4">
        {templates.map((template) => (
          <div key={template.id} className="kid-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-grape">{template.type}｜{template.practice_mode}</p>
                <h2 className="mt-2 text-xl font-black leading-relaxed text-ink">{template.template_text}</h2>
              </div>
              <span className="rounded-full bg-butter px-4 py-2 text-sm font-black text-amber-900">
                Lv.{template.difficulty_level}
              </span>
            </div>
            {template.instruction_audio_text ? (
              <p className="mt-3 rounded-3xl bg-white/70 px-4 py-3 text-base font-bold text-slate-500">
                語音：{template.instruction_audio_text}
              </p>
            ) : null}
          </div>
        ))}
      </section>
    </PhoneFrame>
  );
}
