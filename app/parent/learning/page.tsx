import Link from 'next/link';
import { createLearningItem, createMemoryHook } from '@/lib/actions/learning';
import { getLearningItems, getMemoryHooks, getLearningProgress } from '@/lib/data/learning';
import { CompanionBar } from '@/components/CompanionBar';

const itemTypes = [
  { value: 'bopomofo_initial', label: '注音聲母' },
  { value: 'bopomofo_final', label: '注音韻母' },
  { value: 'bopomofo_compound', label: '注音結合韻' },
  { value: 'bopomofo_tone', label: '注音聲調' },
  { value: 'english_uppercase', label: '英文大寫' },
  { value: 'english_lowercase', label: '英文小寫' },
  { value: 'english_word', label: '英文單字' }
];

function typeLabel(type: string) {
  const match = itemTypes.find((item) => item.value === type);
  if (match) return match.label;
  if (type.includes('english')) return '英文';
  if (type.includes('bopomofo')) return '注音';
  return '學習';
}

const inputClass = 'mt-2 w-full rounded-3xl border-0 bg-white/90 px-4 py-4 text-lg font-bold text-ink shadow-sm outline-none ring-2 ring-transparent focus:ring-grape/30';
const labelClass = 'text-sm font-black text-slate-500';

export default async function ParentLearningPage() {
  const [items, hooks] = await Promise.all([getLearningItems(), getMemoryHooks()]);

  return (
    <main className="admin-shell safe-screen">
      <CompanionBar title="學習項目" backHref="/" backLabel="小孩端" />
      <section className="kid-card p-5">
        <p className="text-sm font-black text-[#5f6f89]">Learning</p>
        <h1 className="mt-2 text-[30px] font-black leading-tight text-ink">學習項目</h1>
        <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500">
          管理兒童可學習的注音、英文與對應記憶詞。
        </p>
      </section>

      <section className="mt-5 space-y-4">
        <h2 className="text-2xl font-black text-ink">新增學習項目</h2>
        <form action={createLearningItem} className="mt-4 space-y-4">
          <label className="block">
            <span className={labelClass}>類型</span>
            <select name="type" className={inputClass} defaultValue="bopomofo_initial">
              {itemTypes.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>內容</span>
              <input name="content" className={inputClass} placeholder="ㄅ / A" required />
            </label>
            <label className="block">
              <span className={labelClass}>顯示</span>
              <input name="display_text" className={inputClass} placeholder="ㄅ / A" />
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>難度 1-5</span>
            <input name="difficulty" className={inputClass} type="number" min="1" max="5" defaultValue="1" />
          </label>

          <button className="w-full rounded-[2rem] bg-grape px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
            新增學習項目
          </button>
        </form>
      </section>

      <section className="mt-5 kid-card p-5">
        <h2 className="text-2xl font-black text-ink">新增記憶詞</h2>
        <form action={createMemoryHook} className="mt-4 space-y-4">
          <label className="block">
            <span className={labelClass}>對應學習項目</span>
            <select name="learning_item_id" className={inputClass}>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.display_text}｜{typeLabel(item.type)}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>記憶詞</span>
              <input name="keyword" className={inputClass} placeholder="爸爸" required />
            </label>
            <label className="block">
              <span className={labelClass}>階段</span>
              <select name="usage_stage" className={inputClass} defaultValue="practice">
                <option value="intro">認識</option>
                <option value="practice">練習</option>
                <option value="review">複習</option>
                <option value="challenge">挑戰</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>記憶句</span>
            <input name="sentence" className={inputClass} placeholder="爸爸的 ㄅ" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>圖片網址</span>
              <input name="image_url" className={inputClass} placeholder="可先空白" />
            </label>
            <label className="block">
              <span className={labelClass}>音檔網址</span>
              <input name="audio_url" className={inputClass} placeholder="可先空白" />
            </label>
          </div>

          <div className="flex items-center justify-between rounded-3xl bg-white/70 px-4 py-4">
            <span className="text-base font-black text-ink">設為主要記憶詞</span>
            <input name="is_primary" type="checkbox" className="h-7 w-7 accent-purple-500" />
          </div>

          <label className="block">
            <span className={labelClass}>難度 1-5</span>
            <input name="difficulty_level" className={inputClass} type="number" min="1" max="5" defaultValue="1" />
          </label>

          <button className="w-full rounded-[2rem] bg-ink px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
            新增記憶詞
          </button>
        </form>
      </section>

      <section className="mt-5 space-y-4">
        {items.map((item) => {
          const itemHooks = hooks.filter((hook) => hook.learning_item_id === item.id);

          return (
            <div key={item.id} className="kid-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-grape">{typeLabel(item.type)}</p>
                  <h2 className="mt-1 text-4xl font-black text-ink">{item.display_text}</h2>
                </div>
                <div className="rounded-3xl bg-mint px-4 py-3 text-base font-black text-emerald-900">
                  {itemHooks.length} 個記憶詞
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {itemHooks.map((hook) => (
                  <span key={hook.id} className="rounded-full bg-white/80 px-4 py-2 text-base font-black text-slate-600 shadow-sm">
                    {hook.keyword}{hook.is_primary ? '｜主要' : ''}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
